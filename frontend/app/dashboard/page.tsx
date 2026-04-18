"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { walletService } from "@/lib/services/walletService";
import { betService } from "@/lib/services/betService";
import { roundService } from "@/lib/services/roundService";
import { Toast, useToast } from "@/hooks/useToast";
import { authService } from "@/lib/services/authService";

// ─── Types ────────────────────────────────────────────────────────────────────

type RoundStatus = "open" | "closed" | "drawn";

interface Round {
    id: string;
    name: string;
    status: RoundStatus;
    closesAt: Date | null;
    winningNumber: number | null;
}

interface Bet {
    number: number;
    tokens: number;
    roundId: string;
}

export function Toasts({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
    if (!toasts.length) return null;
    const bg = (t: Toast["type"]) => t === "success" ? "#f0fdf4" : t === "error" ? "#fef2f2" : "#f8fafc";
    const border = (t: Toast["type"]) => t === "success" ? "#bbf7d0" : t === "error" ? "#fecaca" : "#e2e8f0";
    const color = (t: Toast["type"]) => t === "success" ? "#166534" : t === "error" ? "#991b1b" : "#334155";
    const icon = (t: Toast["type"]) => t === "success" ? "✓" : t === "error" ? "✕" : "i";
    return (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 100, display: "flex", flexDirection: "column", gap: 8 }}>
            {toasts.map(t => (
                <div key={t.id} onClick={() => onRemove(t.id)} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                    borderRadius: 10, background: bg(t.type), border: `1px solid ${border(t.type)}`,
                    color: color(t.type), fontSize: 13.5, fontFamily: "'Figtree', sans-serif",
                    fontWeight: 500, cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    animation: "slideIn 0.25s ease", maxWidth: 320, minWidth: 220,
                }}>
                    <span style={{ fontSize: 15 }}>{icon(t.type)}</span>
                    {t.message}
                </div>
            ))}
        </div>
    );
}

// ─── Countdown ────────────────────────────────────────────────────────────────

export function useCountdown(target: Date | null) {
    const [remaining, setRemaining] = useState("");
    useEffect(() => {
        if (!target) { setRemaining(""); return; }
        const tick = () => {
            const diff = target.getTime() - Date.now();
            if (diff <= 0) { setRemaining("00:00"); return; }
            const m = Math.floor(diff / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setRemaining(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [target]);
    return remaining;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RoundStatus }) {
    const cfg = {
        open: { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0", dot: "#22c55e", label: "Open" },
        closed: { bg: "#fffbeb", color: "#92400e", border: "#fde68a", dot: "#f59e0b", label: "Closed" },
        drawn: { bg: "#f8fafc", color: "#334155", border: "#e2e8f0", dot: "#94a3b8", label: "Drawn" },
    }[status];
    return (
        <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 20,
            background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
            fontSize: 12, fontWeight: 600, letterSpacing: "0.02em",
        }}>
            <span style={{
                width: 6, height: 6, borderRadius: "50%", background: cfg.dot,
                boxShadow: status === "open" ? `0 0 0 2px ${cfg.dot}40` : "none",
            }} />
            {cfg.label}
        </div>
    );
}

// ─── Number Tile ──────────────────────────────────────────────────────────────

function NumberTile({
    num, selected, winning, betPlaced, disabled, onSelect,
}: {
    num: number; selected: boolean; winning: boolean | null; betPlaced: boolean;
    disabled: boolean; onSelect: (n: number) => void;
}) {
    const isWinner = winning === true;
    const isLoser = winning === false;
    let bg = "#fff", border = "#e4e4e7", color = "#18181b", shadow = "none";
    if (selected && !betPlaced) { bg = "#18181b"; border = "#18181b"; color = "#fff"; }
    if (betPlaced) { bg = "#f4f4f5"; border = "#d4d4d8"; color = "#71717a"; }
    if (isWinner) { bg = "#f0fdf4"; border = "#22c55e"; color = "#166534"; shadow = "0 0 0 2px #bbf7d020"; }
    if (isLoser && selected) { bg = "#fef2f2"; border = "#fca5a5"; color = "#991b1b"; }
    return (
        <button
            onClick={() => !disabled && onSelect(num)}
            style={{
                width: "100%", aspectRatio: "1", border: `1.5px solid ${border}`,
                borderRadius: 10, background: bg, color, fontFamily: "'Figtree', sans-serif",
                fontSize: 18, fontWeight: 700, cursor: disabled ? "default" : "pointer",
                transition: "all 0.15s", boxShadow: shadow,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
            }}
        >
            {num}
            {betPlaced && selected && (
                <span style={{
                    position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)",
                    width: 4, height: 4, borderRadius: "50%", background: "#a1a1aa",
                }} />
            )}
        </button>
    );
}

// ─── Mock data helpers ────────────────────────────────────────────────────────

const MOCK_ROUND: Round = {
    id: "round-1",
    name: "Evening draw",
    status: "open",
    closesAt: new Date(Date.now() + 8 * 60 * 1000),
    winningNumber: null,
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const router = useRouter();
    const { toasts, show, remove } = useToast();

    // User & wallet state
    const [walletBalance, setWalletBalance] = useState(500);
    const [withdrawing, setWithdrawing] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [withdrawAmt, setWithdrawAmt] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Round state
    const [round, setRound] = useState<Round>(MOCK_ROUND);
    const countdown = useCountdown(round.status === "open" ? round.closesAt : null);

    // Bet state
    const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
    const [tokenInput, setTokenInput] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [placedBet, setPlacedBet] = useState<Bet | null>(null);
    const [loading, setLoading] = useState<boolean>(true);


    // Result state
    const [resultVisible, setResultVisible] = useState(false);

    const isOpen = round.status === "open";
    const isDrawn = round.status === "drawn";
    const userWon = isDrawn && placedBet !== null && placedBet.number === round.winningNumber;
    const userLost = isDrawn && placedBet !== null && placedBet.number !== round.winningNumber;

    // Show result banner when drawn
    const fetchData = async () => {
        try {
            const res = await roundService.getCurrent();
            const round = res.data.data;
            setRound(round ? { ...round, status: round.status.toLowerCase() } : null);
        } catch {
            show("Failed to load round data.", "error");
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.replace("/login");
        } else {
            setIsLoading(false);
        }
        if (isDrawn && placedBet) { setResultVisible(true); }
        const fetchBalance = async () => {
            try {
                setLoading(true);
                const res = await walletService.getWallet();
                setWalletBalance(res.data.balance);
            } catch (error) {
                console.error("Failed to fetch balance:", error);
                authService.logout();
                router.replace("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchBalance();
        fetchData();
    }, [isDrawn, placedBet]);

    if (isLoading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-black">
                {/* The Spinner */}
                <div className="relative">
                    {/* Outer Ring */}
                    <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                    {/* Spinning Ring */}
                    <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-black dark:border-white border-t-transparent animate-spin"></div>
                </div>

                {/* Optional Loading Text */}
                <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
                    Verifying session...
                </p>
            </div>
        );
    }


    const handleSelectNumber = (n: number) => {
        if (!isOpen || placedBet) return;
        setSelectedNumber(prev => prev === n ? null : n);
    };


    const handleSubmitBet = async () => {
        const tokens = parseInt(tokenInput, 10);
        if (selectedNumber === null) { show("Pick a number first.", "error"); return; }
        // if (!tokens || tokens < 1) { show("Enter a valid token amount.", "error"); return; }
        if (tokens > walletBalance) { show("Insufficient tokens in wallet.", "error"); return; }
        try {
            setSubmitting(true);
            // TODO: replace with real API call
            await betService.placeBet({ number: selectedNumber, tokens });
            await new Promise(r => setTimeout(r, 700));
            setWalletBalance(b => b - tokens);
            setPlacedBet({ number: selectedNumber, tokens, roundId: round.id });
            show(`Order placed on ${selectedNumber} for ${tokens} tokens!`, "success");
            setTokenInput("");
        } catch {
            show("Failed to place order. Try again.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleWithdraw = async () => {
        const amt = parseInt(withdrawAmt, 10);
        if (!amt || amt < 1) { show("Enter a valid amount.", "error"); return; }
        if (amt > walletBalance) { show("Amount exceeds balance.", "error"); return; }
        try {
            setWithdrawing(true);
            await walletService.withdraw({ amount: amt });
            await new Promise(r => setTimeout(r, 0));
            setWalletBalance(b => b - amt);
            setShowWithdraw(false);
            setWithdrawAmt("");
            show(`${amt} tokens withdrawn successfully.`, "success");
        } catch {
            show("Withdrawal failed. Try again.", "error");
        } finally {
            setWithdrawing(false);
        }
    };

    // Demo: simulate admin drawing (for testing — remove in production)
    const simulateDraw = () => {
        const winning = Math.floor(Math.random() * 10);
        setRound(r => ({ ...r, status: "drawn", winningNumber: winning, closesAt: null }));
    };

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
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.92); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.35); }
          70%  { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        @keyframes confetti-drop {
          0%   { opacity: 0; transform: translateY(-10px) rotate(0deg); }
          60%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(30px) rotate(20deg); }
        }

        .token-input {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #e4e4e7;
          border-radius: 10px;
          font-size: 14.5px;
          font-family: 'Figtree', sans-serif;
          color: #18181b;
          background: #fff;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .token-input::placeholder { color: #a1a1aa; }
        .token-input:focus {
          border-color: #18181b;
          box-shadow: 0 0 0 3px rgba(24,24,27,0.07);
        }
        .token-input:disabled { background: #f4f4f5; color: #a1a1aa; cursor: not-allowed; }

        .primary-btn {
          width: 100%;
          padding: 12px;
          background: #18181b;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 14.5px;
          font-weight: 600;
          font-family: 'Figtree', sans-serif;
          cursor: pointer;
          transition: background 0.18s, transform 0.15s, opacity 0.18s;
          letter-spacing: 0.01em;
        }
        .primary-btn:hover:not(:disabled) { background: #27272a; }
        .primary-btn:active:not(:disabled) { transform: scale(0.99); }
        .primary-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .ghost-btn {
          padding: 9px 16px;
          background: transparent;
          color: #18181b;
          border: 1.5px solid #e4e4e7;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 600;
          font-family: 'Figtree', sans-serif;
          cursor: pointer;
          transition: border-color 0.18s, background 0.18s;
        }
        .ghost-btn:hover { border-color: #a1a1aa; background: #f4f4f5; }

        .num-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
        }

        .result-banner {
          animation: popIn 0.3s ease both;
        }
        .win-number {
          animation: pulse-ring 1.2s ease-out 2;
        }
      `}</style>

            <Toasts toasts={toasts} onRemove={remove} />

            {/* Withdraw overlay */}
            {showWithdraw && (
                <div
                    onClick={e => { if (e.target === e.currentTarget) setShowWithdraw(false); }}
                    style={{
                        position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)",
                        zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
                    }}
                >
                    <div style={{
                        background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 360,
                        animation: "popIn 0.2s ease both",
                    }}>
                        <h3 style={{ fontSize: 17, fontWeight: 700, color: "#18181b", marginBottom: 4 }}>Withdraw tokens</h3>
                        <p style={{ fontSize: 13, color: "#71717a", marginBottom: 18 }}>
                            Available: <strong style={{ color: "#18181b" }}>{walletBalance} tokens</strong>
                        </p>
                        <input
                            className="token-input"
                            type="number"
                            placeholder="Amount to withdraw"
                            value={withdrawAmt}
                            onChange={e => setWithdrawAmt(e.target.value)}
                            style={{ marginBottom: 12 }}
                            autoFocus
                        />
                        <div style={{ display: "flex", gap: 8 }}>
                            <button className="ghost-btn" style={{ flex: 1 }} onClick={() => setShowWithdraw(false)}>
                                Cancel
                            </button>
                            <button className="primary-btn" style={{ flex: 1 }} onClick={handleWithdraw} disabled={withdrawing}>
                                {withdrawing ? "Processing…" : "Withdraw"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ minHeight: "100dvh", background: "#fafaf9", padding: "0 0 40px" }}>

                {/* ── Top nav ─────────────────────────────────────────── */}
                <header style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "16px 20px", borderBottom: "1px solid #e4e4e7",
                    background: "#fff", position: "sticky", top: 0, zIndex: 10,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 32, height: 32, background: "#18181b", borderRadius: 8,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "#18181b" }}></span>
                    </div>
                    <button
                        className="ghost-btn"
                        style={{ padding: "7px 14px", fontSize: 13 }}
                        onClick={() => { authService.logout(); router.push("/login"); }}
                    >
                        Sign out
                    </button>
                </header>

                <div style={{ maxWidth: 440, margin: "0 auto", padding: "24px 16px", animation: "fadeUp 0.35s ease both" }}>

                    {/* ── Wallet card ──────────────────────────────────── */}
                    <div style={{
                        background: "#18181b", borderRadius: 16, padding: "20px 20px 18px",
                        marginBottom: 20, position: "relative", overflow: "hidden",
                    }}>
                        {/* decorative ring */}
                        <div style={{
                            position: "absolute", right: -30, top: -30,
                            width: 120, height: 120, borderRadius: "50%",
                            border: "1px solid rgba(255,255,255,0.07)",
                        }} />
                        <div style={{
                            position: "absolute", right: -10, top: -10,
                            width: 70, height: 70, borderRadius: "50%",
                            border: "1px solid rgba(255,255,255,0.05)",
                        }} />

                        <p style={{ fontSize: 12, color: "#f0f0f4", fontWeight: 900, marginBottom: 6, letterSpacing: "0.04em" }}>
                            Basket
                        </p>
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 18 }}>
                            <span style={{ fontSize: 36, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                                {walletBalance.toLocaleString()}
                            </span>
                            <span style={{ fontSize: 14, color: "#71717a", marginBottom: 4 }}></span>
                        </div>
                        <button
                            className="ghost-btn"
                            style={{ border: "1.5px solid rgba(246, 241, 241, 0.81)", color: "#aba6a6", fontSize: 13 }}
                            onClick={() => setShowWithdraw(true)}
                        >
                            ↑ Withdraw
                        </button>
                    </div>

                    {/* ── Game card ───────────────────────────────────── */}
                    <div style={{
                        background: "#fff", border: "1px solid #e4e4e7", borderRadius: 16,
                        overflow: "hidden",
                    }}>
                        {/* Card header */}
                        <div style={{
                            padding: "16px 18px", borderBottom: "1px solid #f4f4f5",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                        }}>
                            <div>
                                <p style={{ fontSize: 11, color: "#a1a1aa", fontWeight: 600, letterSpacing: "0.04em" }}>
                                    CURRENT ROUND
                                </p>
                                <p style={{ fontSize: 15, fontWeight: 700, color: "#18181b", marginTop: 1 }}>{round.name}</p>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                                <StatusBadge status={round.status} />
                                {isOpen && countdown && (
                                    <p style={{ fontSize: 11, color: "#71717a", fontWeight: 500 }}>
                                        Closes in <strong style={{ color: "#18181b", fontVariantNumeric: "tabular-nums" }}>{countdown}</strong>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Result banner */}
                        {resultVisible && isDrawn && (
                            <div className="result-banner" style={{
                                margin: "16px 18px 0",
                                padding: "16px",
                                borderRadius: 12,
                                background: userWon ? "#f0fdf4" : "#fef2f2",
                                border: `1px solid ${userWon ? "#bbf7d0" : "#fecaca"}`,
                                display: "flex", alignItems: "center", gap: 14,
                            }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 10,
                                    background: userWon ? "#22c55e" : "#ef4444",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 22, flexShrink: 0,
                                }} className={userWon ? "win-number" : ""}>
                                    {round.winningNumber}
                                </div>
                                <div>
                                    <p style={{
                                        fontSize: 14, fontWeight: 700,
                                        color: userWon ? "#166534" : "#991b1b",
                                        marginBottom: 2,
                                    }}>
                                        {userWon ? "You won! 🎉" : placedBet ? "Better luck next time." : "Draw complete."}
                                    </p>
                                    <p style={{ fontSize: 12.5, color: userWon ? "#15803d" : "#b91c1c" }}>
                                        {userWon
                                            ? `+${(placedBet!.tokens * 2).toLocaleString()} tokens credited to wallet`
                                            : placedBet
                                                ? `You picked ${placedBet.number}. Winning number was ${round.winningNumber}.`
                                                : `Winning number was ${round.winningNumber}.`}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Number grid */}
                        <div style={{ padding: "16px 18px" }}>
                            <p style={{ fontSize: 12, color: "#71717a", fontWeight: 500, marginBottom: 10 }}>
                                {isOpen && !placedBet
                                    ? "Pick your number"
                                    : placedBet && !isDrawn
                                        ? `Your order: ${placedBet.number} · ${placedBet.tokens} tokens`
                                        : isDrawn
                                            ? "Round result"
                                            : "Ordering is closed"}
                            </p>
                            <div className="num-grid">
                                {Array.from({ length: 10 }, (_, i) => (
                                    <NumberTile
                                        key={i}
                                        num={i}
                                        selected={selectedNumber === i || placedBet?.number === i}
                                        winning={
                                            isDrawn && round.winningNumber !== null
                                                ? i === round.winningNumber
                                                : null
                                        }
                                        betPlaced={!!placedBet && placedBet.number !== i}
                                        disabled={!isOpen || !!placedBet}
                                        onSelect={handleSelectNumber}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Bet form — only show if round is open and no order placed yet */}
                        {isOpen && !placedBet && (
                            <div style={{ padding: "0 18px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                                <div style={{ position: "relative" }}>
                                    <input
                                        className="token-input"
                                        type="number"
                                        placeholder="Tokens"
                                        value={tokenInput}
                                        onChange={e => setTokenInput(e.target.value)}
                                        min={1}
                                        max={walletBalance}
                                    />
                                    {/* Quick amounts */}
                                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                                        {[100, 200, 300, 400, 500].map(amt => (
                                            <button
                                                key={amt}
                                                onClick={() => setTokenInput(String(Math.min(amt, walletBalance)))}
                                                style={{
                                                    flex: 1, padding: "5px 0", background: "#f4f4f5",
                                                    border: "1px solid #e4e4e7", borderRadius: 7,
                                                    fontSize: 12, fontWeight: 600, fontFamily: "'Figtree', sans-serif",
                                                    color: "#3f3f46", cursor: "pointer",
                                                    transition: "background 0.12s",
                                                }}
                                                onMouseOver={e => (e.currentTarget.style.background = "#e4e4e7")}
                                                onMouseOut={e => (e.currentTarget.style.background = "#f4f4f5")}
                                            >
                                                {amt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    className="primary-btn"
                                    onClick={handleSubmitBet}
                                    disabled={submitting || selectedNumber === null || !tokenInput}
                                >
                                    {submitting
                                        ? "Placing order…"
                                        : selectedNumber !== null && tokenInput
                                            ? `Place order · ${tokenInput} tokens on ${selectedNumber}`
                                            : "Place order"}
                                </button>
                            </div>
                        )}

                        {/* Closed state nudge */}
                        {round.status === "closed" && !placedBet && (
                            <div style={{ padding: "0 18px 18px" }}>
                                <div style={{
                                    padding: "12px 14px", borderRadius: 10,
                                    background: "#fffbeb", border: "1px solid #fde68a",
                                    fontSize: 13, color: "#92400e", fontWeight: 500,
                                }}>
                                    Ordering is closed for this round. Wait for the draw.
                                </div>
                            </div>
                        )}

                        {/* Order placed — waiting */}
                        {placedBet && !isDrawn && (
                            <div style={{ padding: "0 18px 18px" }}>
                                <div style={{
                                    padding: "12px 14px", borderRadius: 10,
                                    background: "#f8fafc", border: "1px solid #e2e8f0",
                                    fontSize: 13, color: "#334155", fontWeight: 500,
                                    display: "flex", alignItems: "center", gap: 8,
                                }}>
                                    <span style={{
                                        display: "inline-block", width: 8, height: 8, borderRadius: "50%",
                                        background: "#94a3b8",
                                        animation: "pulse-ring 1.5s ease-out infinite",
                                    }} />
                                    Order confirmed. Waiting for admin to draw…
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}