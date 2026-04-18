"use client";

import { useEffect, useRef, useState } from "react";
import { roundService } from "@/lib/services/roundService";
import { useRouter } from "next/navigation";
import { Toasts } from "@/app/dashboard/page"
import { Toast, useToast } from "@/hooks/useToast"
import { authService } from "@/lib/services/authService";

// ─── Types ────────────────────────────────────────────────────────────────────

type RoundStatus = "open" | "closed" | "drawn";

interface Round {
    id: string;
    name: string;
    status: RoundStatus;
}

function StatusBadge({ status }: { status: RoundStatus | "none" }) {
    const cfg = {
        open: { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0", dot: "#22c55e", label: "Open" },
        closed: { bg: "#fffbeb", color: "#92400e", border: "#fde68a", dot: "#f59e0b", label: "Closed" },
        drawn: { bg: "#f8fafc", color: "#334155", border: "#e2e8f0", dot: "#94a3b8", label: "Drawn" },
        none: { bg: "#f4f4f5", color: "#71717a", border: "#e4e4e7", dot: "#d4d4d8", label: "No Round" },
    }[status];
    return (
        <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 20,
            background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
            fontSize: 12, fontWeight: 600, letterSpacing: "0.02em", whiteSpace: "nowrap",
        }}>
            <span style={{
                width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0,
                boxShadow: status === "open" ? `0 0 0 2px ${cfg.dot}40` : "none",
            }} />
            {cfg.label}
        </div>
    );
}

// ─── Number Tile (for stats grid) ────────────────────────────────────────────

function StatTile({
    num, count, totalAmount, selected, onSelect,
}: {
    num: number; count: number; totalAmount: number; selected: boolean; onSelect: (n: number) => void;
}) {
    return (
        <button
            onClick={() => onSelect(num)}
            style={{
                width: "100%", aspectRatio: "1", border: `1.5px solid ${selected ? "#18181b" : "#e4e4e7"}`,
                borderRadius: 10, background: selected ? "#18181b" : "#fff",
                color: selected ? "#fff" : "#18181b",
                fontFamily: "'Figtree', sans-serif",
                cursor: "pointer", transition: "all 0.15s",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 2,
                boxShadow: selected ? "0 0 0 3px rgba(24,24,27,0.08)" : "none",
                minHeight: 52,           // touch-friendly floor
                WebkitTapHighlightColor: "transparent",
            }}
        >
            <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>{num}</span>
            <span style={{
                fontSize: 10, fontWeight: 600,
                color: selected ? "rgba(255,255,255,0.6)" : "#a1a1aa",
                letterSpacing: "0.02em",
            }}>
                {count}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1 }}> {totalAmount}</span>
        </button>
    );
}

// ─── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p style={{ fontSize: 11, color: "#a1a1aa", fontWeight: 600, letterSpacing: "0.04em", marginBottom: 10 }}>
            {children}
        </p>
    );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

function Divider() {
    return <div style={{ height: 1, background: "#f4f4f5", margin: "0 -18px" }} />;
}

interface RoundStats {
    roundId: number;
    totalBets: number;
    numberStats: { number: number; count: number; totalAmount: number }[]; // Adjust based on what's in the array
}

// ─── Admin Page ───────────────────────────────────────────────────────────────

export default function AdminPage() {
    const { toasts, show, remove } = useToast();
    const router = useRouter();
    const [round, setRound] = useState<Round | null>(null);
    const [stats, setStats] = useState<RoundStats | null>(null);
    const [name, setName] = useState("");
    const [winningNumber, setWinningNumber] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // ─── Data fetching ────────────────────────────────

    const fetchData = async () => {
        try {
            const res = await roundService.getCurrent();
            const round = res.data.data;
            setRound(round ? { ...round, status: round.status.toLowerCase() } : null);
            if (res.data.data?.id) {
                const statsRes = await roundService.getStats(res.data.data.id);
                setStats(statsRes.data.data ?? {});
            } else {
                setStats(null);
            }
        } catch {
            show("Failed to load round data.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // ─── Actions ─────────────────────────────────────

    const handleOpen = async () => {
        if (!name.trim()) { show("Enter a round name first.", "error"); return; }
        try {
            setActionLoading(true);
            await roundService.open(name.trim());
            setName("");
            setWinningNumber(null);
            show("Round opened successfully.", "success");
            fetchData();
        } catch {
            show("Failed to open round.", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleClose = async () => {
        if (!round) return;
        try {
            setActionLoading(true);
            await roundService.close(Number(round.id));
            show("Round closed.", "info");
            fetchData();
        } catch {
            show("Failed to close round.", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDraw = async () => {
        if (!round) return;
        if (winningNumber === null) { show("Select a winning number first.", "error"); return; }
        try {
            setActionLoading(true);
            await roundService.draw(Number(round.id), winningNumber);
            show(`Draw complete — winning number: ${winningNumber}`, "success");
            fetchData();
        } catch {
            show("Failed to draw round.", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const status: RoundStatus | "none" = round ? round.status : "none";

    // ─── Render ───────────────────────────────────────

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Figtree', sans-serif; background: #fafaf9; }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ── Toast container: full-width on mobile, anchored top-right on sm+ ── */
        .toast-container {
          position: fixed;
          top: 12px;
          left: 12px;
          right: 12px;
          z-index: 100;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        @media (min-width: 480px) {
          .toast-container {
            left: auto;
            right: 20px;
            max-width: 340px;
          }
        }

        .text-input {
          width: 100%;
          padding: 13px 14px;          /* taller touch target on mobile */
          border: 1.5px solid #e4e4e7;
          border-radius: 10px;
          font-size: 16px;             /* prevents iOS auto-zoom */
          font-family: 'Figtree', sans-serif;
          color: #18181b;
          background: #fff;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          -webkit-appearance: none;
        }
        @media (min-width: 640px) {
          .text-input { font-size: 14.5px; padding: 11px 14px; }
        }
        .text-input::placeholder { color: #a1a1aa; }
        .text-input:focus {
          border-color: #18181b;
          box-shadow: 0 0 0 3px rgba(24,24,27,0.07);
        }
        .text-input:disabled { background: #f4f4f5; color: #a1a1aa; cursor: not-allowed; }

        .primary-btn {
          width: 100%;
          padding: 14px;               /* taller on mobile */
          background: #18181b;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Figtree', sans-serif;
          cursor: pointer;
          transition: background 0.18s, transform 0.15s, opacity 0.18s;
          letter-spacing: 0.01em;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        @media (min-width: 640px) {
          .primary-btn { padding: 12px; font-size: 14.5px; }
        }
        .primary-btn:hover:not(:disabled) { background: #27272a; }
        .primary-btn:active:not(:disabled) { transform: scale(0.99); }
        .primary-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .ghost-btn {
          padding: 11px 16px;          /* taller on mobile */
          background: transparent;
          color: #18181b;
          border: 1.5px solid #e4e4e7;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Figtree', sans-serif;
          cursor: pointer;
          transition: border-color 0.18s, background 0.18s;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        @media (min-width: 640px) {
          .ghost-btn { padding: 9px 16px; font-size: 13.5px; }
        }
        .ghost-btn:hover:not(:disabled) { border-color: #a1a1aa; background: #818186; }
        .ghost-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .danger-btn {
          padding: 11px 16px;
          background: transparent;
          color: #991b1b;
          border: 1.5px solid #fca5a5;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Figtree', sans-serif;
          cursor: pointer;
          transition: border-color 0.18s, background 0.18s;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        @media (min-width: 640px) {
          .danger-btn { padding: 9px 16px; font-size: 13.5px; }
        }
        .danger-btn:hover:not(:disabled) { background: #fef2f2; border-color: #f87171; }
        .danger-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        /* Number grid — 5 cols on all sizes; tiles are naturally fluid */
        .num-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 6px;
        }
        @media (min-width: 400px) {
          .num-grid { gap: 8px; }
        }

        /* ── Page content container ── */
        .page-content {
          max-width: 440px;
          margin: 0 auto;
          padding: 16px 12px;
          animation: fadeUp 0.35s ease both;
        }
        @media (min-width: 480px) {
          .page-content { padding: 24px 16px; }
        }

        /* ── Header brand row ── */
        .header-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }
        .brand-label {
          font-size: 14px;
          font-weight: 700;
          color: #18181b;
          white-space: nowrap;
        }
        @media (min-width: 360px) {
          .brand-label { font-size: 15px; }
          .header-brand { gap: 10px; }
        }

        /* ── Dark round card ── */
        .round-card {
          background: #18181b;
          border-radius: 16px;
          padding: 18px 16px 16px;
          margin-bottom: 16px;
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 480px) {
          .round-card { padding: 20px 20px 18px; margin-bottom: 20px; }
        }

        .round-card-title {
          font-size: 22px;
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          margin-bottom: 6px;
          word-break: break-word;
        }
        @media (min-width: 480px) {
          .round-card-title { font-size: 26px; }
        }

        /* ── Stats/draw card ── */
        .stats-card {
          background: #fff;
          border: 1px solid #e4e4e7;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 16px;
        }
        @media (min-width: 480px) {
          .stats-card { margin-bottom: 20px; }
        }

        .card-inner {
          padding: 14px 14px 12px;
        }
        @media (min-width: 480px) {
          .card-inner { padding: 16px 18px 14px; }
        }

        /* ── Open round card ── */
        .open-round-card {
          background: #fff;
          border: 1px solid #e4e4e7;
          border-radius: 16px;
          overflow: hidden;
        }
        .open-round-inner {
          padding: 14px 14px;
        }
        @media (min-width: 480px) {
          .open-round-inner { padding: 16px 18px; }
        }

        /* ── Draw confirm section ── */
        .draw-confirm-inner {
          padding: 12px 14px;
        }
        @media (min-width: 480px) {
          .draw-confirm-inner { padding: 14px 18px; }
        }

        /* ── Draw complete banner ── */
        .drawn-banner {
          padding: 0 14px 14px;
        }
        @media (min-width: 480px) {
          .drawn-banner { padding: 0 18px 18px; }
        }
      `}</style>

            <Toasts toasts={toasts} onRemove={remove} />

            <div style={{ minHeight: "100dvh", background: "#fafaf9", paddingBottom: 40 }}>

                {/* ── Top nav ─────────────────────────────────────────── */}
                <header style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 14px", borderBottom: "1px solid #e4e4e7",
                    background: "#fff", position: "sticky", top: 0, zIndex: 10,
                    gap: 8,
                }}>
                    <div className="header-brand">
                        <div style={{
                            width: 32, height: 32, background: "#18181b", borderRadius: 8,
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="brand-label"></span>
                        <div style={{
                            padding: "3px 8px", background: "#f4f4f5", border: "1px solid #e4e4e7",
                            borderRadius: 6, fontSize: 11, fontWeight: 600, color: "#71717a",
                            letterSpacing: "0.04em", whiteSpace: "nowrap",
                        }}>
                            ADMIN
                        </div>
                    </div>
                    <StatusBadge status={status} />
                    <button
                        className="ghost-btn"
                        style={{ padding: "7px 14px", fontSize: 13 }}
                        onClick={() => { authService.logout(); router.push("/login"); }}
                    >
                        Sign out
                    </button>
                </header>

                {loading ? (
                    <div style={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        justifyContent: "center", height: "60vh", gap: 12,
                    }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: "50%",
                            border: "3px solid #e4e4e7", borderTopColor: "#18181b",
                            animation: "spin 0.7s linear infinite",
                        }} />
                        <p style={{ fontSize: 13, color: "#a1a1aa", fontFamily: "'Figtree', sans-serif" }}>
                            Loading round data…
                        </p>
                    </div>
                ) : (
                    <div className="page-content">

                        {/* ── Round info card ──────────────────────────── */}
                        <div className="round-card">
                            {/* Decorative rings */}
                            <div style={{
                                position: "absolute", right: -30, top: -30, width: 120, height: 120,
                                borderRadius: "50%", border: "1px solid rgba(255,255,255,0.07)",
                            }} />
                            <div style={{
                                position: "absolute", right: -10, top: -10, width: 70, height: 70,
                                borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)",
                            }} />

                            <p style={{ fontSize: 12, color: "#e0e0e4", fontWeight: 500, marginBottom: 6, letterSpacing: "0.04em" }}>
                                CURRENT ROUND
                            </p>
                            <p className="round-card-title">
                                {round ? round.name : "No active round"}
                            </p>
                            {round && (
                                <p style={{ fontSize: 13, color: "#d1d1d5", marginBottom: 18 }}>
                                    {stats?.totalBets} total order{stats?.totalBets !== 1 ? "s" : ""} placed
                                </p>
                            )}
                            {!round && (
                                <p style={{ fontSize: 13, color: "#52525b", marginBottom: 18 }}>
                                    Open a new round to start accepting bets.
                                </p>
                            )}

                            {/* Action buttons inside dark card */}
                            {round?.status === "open" && (
                                <button
                                    className="ghost-btn"
                                    style={{ border: "1.5px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 13 }}
                                    onClick={handleClose}
                                    disabled={actionLoading}
                                >
                                    ✕ Close Round
                                </button>
                            )}
                            {round?.status === "closed" && (
                                <div style={{ display: "flex", gap: 8 }}>
                                    <span style={{
                                        display: "inline-flex", alignItems: "center", gap: 6,
                                        padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                                        background: "rgba(251,191,36,0.15)", color: "#fbbf24",
                                        border: "1px solid rgba(251,191,36,0.2)",
                                    }}>
                                        ● Awaiting draw
                                    </span>
                                </div>
                            )}
                            {round?.status === "drawn" && (
                                <span style={{
                                    display: "inline-flex", alignItems: "center", gap: 6,
                                    padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                                    background: "rgba(148,163,184,0.15)", color: "#94a3b8",
                                    border: "1px solid rgba(148,163,184,0.2)",
                                }}>
                                    ✓ Round complete
                                </span>
                            )}
                        </div>

                        {/* ── Bet stats + draw grid ─────────────────────── */}
                        {round && (
                            <div className="stats-card">
                                <div className="card-inner">
                                    <SectionLabel>
                                        {round.status === "closed"
                                            ? "SELECT WINNING NUMBER"
                                            : "BET DISTRIBUTION"}
                                    </SectionLabel>
                                    <div className="num-grid">
                                        {Array.from({ length: 10 }, (_, i) => (
                                            <StatTile
                                                key={i}
                                                num={i}
                                                count={stats?.numberStats.find(s => s.number === i)?.count ?? 0}
                                                totalAmount={stats?.numberStats.find(s => s.number === i)?.totalAmount ?? 0}
                                                selected={winningNumber === i}
                                                onSelect={n => {
                                                    if (round.status === "closed") setWinningNumber(prev => prev === n ? null : n);
                                                }}
                                            />
                                        ))}
                                    </div>
                                    {round.status === "open" && (
                                        <p style={{ fontSize: 12, color: "#a1a1aa", marginTop: 10 }}>
                                            Numbers refresh as bets come in. Close betting to draw a winner.
                                        </p>
                                    )}
                                    {round.status === "closed" && (
                                        <p style={{ fontSize: 12, color: "#a1a1aa", marginTop: 10 }}>
                                            Tap a number to select it as the winner, then confirm below.
                                        </p>
                                    )}
                                </div>

                                {round.status === "closed" && (
                                    <>
                                        <Divider />
                                        <div className="draw-confirm-inner">
                                            <button
                                                className="primary-btn"
                                                onClick={handleDraw}
                                                disabled={winningNumber === null || actionLoading}
                                            >
                                                {actionLoading
                                                    ? "Processing draw…"
                                                    : winningNumber !== null
                                                        ? `Confirm draw · Winning number ${winningNumber}`
                                                        : "Select a winning number"}
                                            </button>
                                        </div>
                                    </>
                                )}

                                {round.status === "drawn" && round && (
                                    <div className="drawn-banner">
                                        <div style={{
                                            padding: "12px 14px", borderRadius: 10,
                                            background: "#f0fdf4", border: "1px solid #bbf7d0",
                                            fontSize: 13, color: "#166534", fontWeight: 500,
                                            display: "flex", alignItems: "center", gap: 8,
                                        }}>
                                            ✓ Draw complete. Open a new round to continue.
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Open new round ─────────────────────────────── */}
                        <div className="open-round-card">
                            <div className="open-round-inner">
                                <SectionLabel>OPEN NEW ROUND</SectionLabel>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    <input
                                        className="text-input"
                                        // placeholder="Round name (e.g. Evening Draw)"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && handleOpen()}
                                        disabled={actionLoading || (!!round && round.status !== "drawn")}
                                    />
                                    <button
                                        className="primary-btn"
                                        onClick={handleOpen}
                                        disabled={actionLoading || !name.trim() || (!!round && round.status !== "drawn")}
                                    >
                                        {actionLoading ? "Opening…" : "Open round"}
                                    </button>
                                    {round && round.status !== "drawn" && (
                                        <p style={{ fontSize: 12, color: "#a1a1aa", textAlign: "center" }}>
                                            Close and draw the current round before opening a new one.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </>
    );
}