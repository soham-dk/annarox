"use client";

import { useEffect, useRef, useState } from "react";
import { managerService } from "@/lib/services/managerService";
import { useRouter } from "next/navigation";
import { Toasts } from "@/app/dashboard/page";
import { authService } from "@/lib/services/authService";
import { useToast } from "@/hooks/useToast";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserStatus = "active" | "inactive" | "blocked";

interface User {
  id: string;
  phoneNumber: string;
  status: UserStatus;
  balance: number;
}

type ModalType = "add" | "status" | "withdraw" | null;

interface ModalState {
  type: ModalType;
  user: User | null;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function UserStatusBadge({ status }: { status: UserStatus }) {
  const cfg = {
    active: { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0", dot: "#22c55e", label: "Active" },
    inactive: { bg: "#f8fafc", color: "#334155", border: "#e2e8f0", dot: "#94a3b8", label: "Inactive" },
    blocked: { bg: "#fef2f2", color: "#991b1b", border: "#fecaca", dot: "#ef4444", label: "Suspended" },
  }[status?.toLowerCase()] || { bg: "#eee", color: "#666", border: "#ddd", dot: "#aaa", label: "Unknown" };;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 8px", borderRadius: 20,
      background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </div>
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
  return <div style={{ height: 1, background: "#f4f4f5" }} />;
}

// ─── Modal Overlay ────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: {
  title: string; onClose: () => void; children: React.ReactNode;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        padding: "0 0 0 0",
        animation: "fadeIn 0.18s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480,
          background: "#fff", borderRadius: "18px 18px 0 0",
          overflow: "hidden",
          animation: "slideUp 0.25s ease",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.14)",
        }}
      >
        {/* Modal handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e4e4e7" }} />
        </div>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 18px 10px",
        }}>
          <p style={{
            fontSize: 15, fontWeight: 700, color: "#18181b",
            fontFamily: "'Figtree', sans-serif",
          }}>{title}</p>
          <button onClick={onClose} style={{
            background: "#f4f4f5", border: "none", borderRadius: 8,
            width: 28, height: 28, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 14, color: "#71717a",
          }}>✕</button>
        </div>
        <Divider />
        <div style={{ padding: "16px 18px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Manager Page ─────────────────────────────────────────────────────────────

export default function ManagerPage() {
  const { toasts, show, remove } = useToast();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState>({ type: null, user: null });
  const [activeTab, setActiveTab] = useState<"users" | "withdrawals">("users");
  const [withdrawRequests, setWithdrawRequests] = useState<any[]>([]);
  // per-modal input states
  const [amount, setAmount] = useState("");
  const [newStatus, setNewStatus] = useState<UserStatus>("active");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // ─── Fetch users ──────────────────────────────────

  const fetchUsers = async () => {
    const token = authService.getToken();
    if (!token) {
      router.replace("/login");
      return;
    } else {
      setLoading(false);
    }
    try {
      const res = await managerService.getUsers();
      setUsers(res.data.data ?? []);
    } catch {
      show("Failed to load users.", "error");
    } finally {
      setLoading(false);
    }
  };
  const fetchWithdrawRequests = async () => {
    const token = authService.getToken();
    if (!token) {
      router.replace("/login");
      return;
    } else {
      setLoading(false);
    }
    try {
      const res: any = await managerService.getWithdrawalRequests();
      if (res.data && res.data.success) {
        setWithdrawRequests(res.data.data ?? []);
      } else {
        show(res.data?.message || "Failed to load requests", "error");
      }
    } catch {
      show("Failed to load withdrawal requests.", "error");
    }
  };

  useEffect(() => { fetchUsers(); fetchWithdrawRequests() }, []);

  // ─── Open modal helpers ───────────────────────────

  const openModal = (type: ModalType, user: User) => {
    setModal({ type, user });
    setAmount("");
    setWithdrawAmount("");
    setNewStatus(user.status);
    setActionLoading(false);
  };
  const closeModal = () => {
    if (actionLoading) return;
    setModal({ type: null, user: null });
  };

  // ─── Actions ──────────────────────────────────────

  const handleAddMoney = async () => {
    if (!modal.user) return;
    const val = parseFloat(amount);
    if (!amount || isNaN(val) || val <= 0) { show("Enter a valid amount.", "error"); return; }
    try {
      setActionLoading(true);
      const res = await managerService.addMoney({
        userId: Number(modal.user.id),
        amount: val
      });

      show(`₹${val.toLocaleString()} added to ${modal.user.phoneNumber}.`, "success");
      closeModal();
      fetchUsers();
    } catch {
      show("Failed to add money.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (statusOverride?: UserStatus) => {
    if (!modal.user) return;
    const statusToUpdate = statusOverride || newStatus;

    setActionLoading(true);
    try {
      await managerService.updateStatus({ phoneNumber: modal.user.phoneNumber, status: statusToUpdate });
      fetchUsers();
      closeModal();
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleProcessWithdrawal = async (id: number, status: "APPROVED" | "REJECTED") => {
    try {
      await managerService.processWithdrawal(id, status);

      show(
        status === "APPROVED" ? "Marked as paid" : "Request rejected",
        "success"
      );

      fetchWithdrawRequests();
    } catch {
      show("Action failed", "error");
    }
  };

  const handleWithdraw = async () => {
    if (!modal.user) return;
    const val = parseFloat(withdrawAmount);
    if (!withdrawAmount || isNaN(val) || val <= 0) { show("Enter a valid amount.", "error"); return; }
    try {
      setActionLoading(true);
      await managerService.withdrawAmountPaid({
        userId: Number(modal.user.id),
        amount: val
      });
      show(`₹${val.toLocaleString()} withdrawn from ${modal.user.phoneNumber}.`, "success");
      closeModal();
      fetchUsers();
    } catch {
      show("Failed to withdraw amount.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Filtered users ───────────────────────────────

  const filtered = users.filter(u =>
    u.phoneNumber.toLowerCase().includes(search.toLowerCase())
  );

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status.toLowerCase() === 'active').length;

  // ─── Render ───────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Figtree', sans-serif; background: #fafaf9; }

        @keyframes slideIn  { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeUp   { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
        @keyframes slideUp  { from { transform:translateY(100%); } to { transform:translateY(0); } }
        @keyframes spin     { to { transform:rotate(360deg); } }

        .toast-container {
          position: fixed; top: 12px; left: 12px; right: 12px; z-index: 100;
          display: flex; flex-direction: column; gap: 8px;
        }
        @media (min-width: 480px) { .toast-container { left: auto; right: 20px; max-width: 340px; } }

        .text-input {
          width: 100%; padding: 13px 14px;
          border: 1.5px solid #e4e4e7; border-radius: 10px;
          font-size: 16px; font-family: 'Figtree', sans-serif;
          color: #18181b; background: #fff; outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          -webkit-appearance: none;
        }
        @media (min-width: 640px) { .text-input { font-size: 14.5px; padding: 11px 14px; } }
        .text-input::placeholder { color: #a1a1aa; }
        .text-input:focus { border-color: #18181b; box-shadow: 0 0 0 3px rgba(24,24,27,0.07); }
        .text-input:disabled { background: #f4f4f5; color: #a1a1aa; cursor: not-allowed; }

        .primary-btn {
          width: 100%; padding: 14px; background: #18181b; color: #fff;
          border: none; border-radius: 10px; font-size: 15px; font-weight: 600;
          font-family: 'Figtree', sans-serif; cursor: pointer;
          transition: background 0.18s, transform 0.15s, opacity 0.18s;
          -webkit-tap-highlight-color: transparent; touch-action: manipulation;
        }
        @media (min-width: 640px) { .primary-btn { padding: 12px; font-size: 14.5px; } }
        .primary-btn:hover:not(:disabled) { background: #27272a; }
        .primary-btn:active:not(:disabled) { transform: scale(0.99); }
        .primary-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .ghost-btn {
          padding: 11px 16px; background: transparent; color: #18181b;
          border: 1.5px solid #e4e4e7; border-radius: 10px; font-size: 14px; font-weight: 600;
          font-family: 'Figtree', sans-serif; cursor: pointer;
          transition: border-color 0.18s, background 0.18s;
          -webkit-tap-highlight-color: transparent; touch-action: manipulation;
        }
        @media (min-width: 640px) { .ghost-btn { padding: 9px 16px; font-size: 13.5px; } }
        .ghost-btn:hover:not(:disabled) { border-color: #a1a1aa; }
        .ghost-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .action-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 7px 11px; border-radius: 8px;
          font-size: 12px; font-weight: 600; font-family: 'Figtree', sans-serif;
          cursor: pointer; border: 1.5px solid; white-space: nowrap;
          transition: background 0.15s, border-color 0.15s;
          -webkit-tap-highlight-color: transparent; touch-action: manipulation;
          background: transparent;
        }
        .action-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .action-btn.add    { color: #166534; border-color: #bbf7d0; }
        .action-btn.add:hover:not(:disabled)    { background: #f0fdf4; }
        .action-btn.status { color: #1e40af; border-color: #bfdbfe; }
        .action-btn.status:hover:not(:disabled) { background: #eff6ff; }
        .action-btn.withdraw { color: #991b1b; border-color: #fca5a5; }
        .action-btn.withdraw:hover:not(:disabled) { background: #fef2f2; }

        .select-input {
          width: 100%; padding: 12px 14px;
          border: 1.5px solid #e4e4e7; border-radius: 10px;
          font-size: 15px; font-family: 'Figtree', sans-serif;
          color: #18181b; background: #fff; outline: none;
          cursor: pointer; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C%2Fsvg%3E");
          background-repeat: no-repeat; background-position: right 14px center;
          padding-right: 36px;
          transition: border-color 0.18s;
        }
        .select-input:focus { border-color: #18181b; box-shadow: 0 0 0 3px rgba(24,24,27,0.07); }

        .user-row {
          display: flex; flex-direction: column; gap: 8px;
          padding: 12px 14px; transition: background 0.12s;
        }
        @media (min-width: 480px) {
          .user-row { flex-direction: row; align-items: center; padding: 12px 18px; }
        }
        .user-row:hover { background: #fafaf9; }

        .page-content {
          max-width: 600px; margin: 0 auto; padding: 16px 12px;
          animation: fadeUp 0.35s ease both;
        }
        @media (min-width: 480px) { .page-content { padding: 24px 16px; } }

        .stats-strip {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;
        }
        @media (min-width: 480px) { .stats-strip { gap: 12px; margin-bottom: 20px; } }

        .stat-card {
          background: #fff; border: 1px solid #e4e4e7; border-radius: 14px;
          padding: 14px 16px;
        }

        .users-card {
          background: #fff; border: 1px solid #e4e4e7; border-radius: 16px; overflow: hidden;
        }
        .users-card-header {
          padding: 14px 14px 12px;
        }
        @media (min-width: 480px) { .users-card-header { padding: 16px 18px 12px; } }

        .action-group {
          display: flex; gap: 6px; flex-wrap: wrap;
        }

        .status-action-btn {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #e4e4e7;
          background: white;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .status-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #f4f4f5;
        }

        .status-action-btn.active { color: #16a34a; }
        .status-action-btn.inactive { color: #71717a; }
        .status-action-btn.suspended { color: #dc2626; }

        .status-action-btn:active:not(:disabled) {
          background: #f1f5f9;
          transform: scale(0.98);
        }

        /* ── Header layout ── */
        .header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px 10px;
          border-bottom: 1px solid #f4f4f5;
        }

        .header-tabs {
          display: flex;
          gap: 8px;
          padding: 10px 14px 12px;
        }

        .header-tabs .ghost-btn {
          flex: 1;
          text-align: center;
          padding: 10px 8px;
        }

        @media (min-width: 480px) {
          .header-tabs .ghost-btn { flex: none; padding: 9px 16px; }
        }
      `}</style>

      <Toasts toasts={toasts} onRemove={remove} />

      {/* ── Modals ──────────────────────────────────────────────── */}

      {/* Add Money */}
      {modal.type === "add" && modal.user && (
        <Modal title="Add Money" onClose={closeModal}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{
              padding: "10px 14px", borderRadius: 10, background: "#f8fafc",
              border: "1px solid #e4e4e7", fontSize: 13, color: "#52525b",
              fontFamily: "'Figtree', sans-serif",
            }}>
              <span style={{ fontWeight: 600, color: "#18181b" }}>{modal.user.phoneNumber}</span>
            </div>
            <input
              className="text-input"
              type="number"
              min="1"
              placeholder="Amount to add (₹)"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddMoney()}
              autoFocus
            />
            <button className="primary-btn" onClick={handleAddMoney} disabled={actionLoading || !amount}>
              {actionLoading ? "Adding…" : `Add ₹${parseFloat(amount) > 0 ? parseFloat(amount).toLocaleString() : "—"}`}
            </button>
          </div>
        </Modal>
      )}

      {/* Update Status */}
      {modal.type === "status" && modal.user && (
        <Modal title="Update User Status" onClose={closeModal}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{
              padding: "10px 14px", borderRadius: 10, background: "#f8fafc",
              border: "1px solid #e4e4e7", fontSize: 13, color: "#52525b",
              fontFamily: "'Figtree', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontWeight: 600, color: "#18181b" }}>{modal.user.phoneNumber}</span>
              <UserStatusBadge status={modal.user.status} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
              <button
                className="status-action-btn active"
                onClick={() => handleUpdateStatus("active")}
                disabled={actionLoading || modal.user.status.toLowerCase() === "active"}
              >
                {actionLoading ? "Processing..." : "Set to ACTIVE"}
              </button>

              <button
                className="status-action-btn inactive"
                onClick={() => handleUpdateStatus("inactive")}
                disabled={actionLoading || modal.user.status.toLowerCase() === "inactive"}
              >
                {actionLoading ? "Processing..." : "Set to INACTIVE"}
              </button>

              <button
                className="status-action-btn suspended"
                onClick={() => handleUpdateStatus("blocked")}
                disabled={actionLoading || modal.user.status.toLowerCase() === "blocked"}
              >
                {actionLoading ? "Processing..." : "Set to BLOCKED"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Page ────────────────────────────────────────────────── */}
      <div style={{ minHeight: "100dvh", background: "#fafaf9", paddingBottom: 40 }}>

        {/* ── Top nav ───────────────────────────────────────── */}
        <header style={{
          background: "#fff",
          borderBottom: "1px solid #e4e4e7",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          {/* Row 1: Logo + Sign out */}
          <div className="header-top">
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <div style={{
                width: 32, height: 32, background: "#18181b", borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div style={{
                padding: "3px 8px", background: "#f4f4f5", border: "1px solid #e4e4e7",
                borderRadius: 6, fontSize: 11, fontWeight: 600, color: "#71717a",
                letterSpacing: "0.04em", whiteSpace: "nowrap",
              }}>
                MANAGER
              </div>
            </div>

            <button
              className="ghost-btn"
              style={{ padding: "7px 14px", fontSize: 13, flexShrink: 0 }}
              onClick={() => { authService.logout(); router.push("/login"); }}
            >
              Sign out
            </button>
          </div>

          {/* Row 2: Tabs */}
          <div className="header-tabs">
            <button
              className="ghost-btn"
              onClick={() => setActiveTab("users")}
              style={{
                background: activeTab === "users" ? "#18181b" : "",
                color: activeTab === "users" ? "#fff" : "",
              }}
            >
              Users
            </button>
            <button
              className="ghost-btn"
              onClick={() => {
                setActiveTab("withdrawals");
                fetchWithdrawRequests();
              }}
              style={{
                background: activeTab === "withdrawals" ? "#18181b" : "",
                color: activeTab === "withdrawals" ? "#fff" : "",
              }}
            >
              Withdrawals
            </button>
          </div>
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
              Loading users…
            </p>
          </div>
        ) : (
          <div className="page-content">

            {/* ── Summary strip ──────────────────────────── */}
            <div className="stats-strip">
              <div className="stat-card">
                <p style={{ fontSize: 11, color: "#a1a1aa", fontWeight: 600, letterSpacing: "0.04em", marginBottom: 6 }}>
                  TOTAL USERS
                </p>
                <p style={{ fontSize: 26, fontWeight: 800, color: "#18181b", lineHeight: 1 }}>
                  {totalUsers}
                </p>
              </div>
              <div className="stat-card">
                <p style={{ fontSize: 11, color: "#a1a1aa", fontWeight: 600, letterSpacing: "0.04em", marginBottom: 6 }}>
                  ACTIVE
                </p>
                <p style={{ fontSize: 26, fontWeight: 800, color: "#18181b", lineHeight: 1 }}>
                  {activeUsers}
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#a1a1aa", marginLeft: 4 }}>
                    / {totalUsers}
                  </span>
                </p>
              </div>
            </div>

            {/* ── Users / Withdrawals card ───────────────── */}

            {activeTab === "users" ? (
              <div className="users-card">
                <div className="users-card-header">
                  <SectionLabel>ALL USERS</SectionLabel>
                  <input
                    className="text-input"
                    placeholder="Search by phone number"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                {filtered.length === 0 ? (
                  <div style={{
                    padding: "32px 18px", textAlign: "center",
                    color: "#a1a1aa", fontSize: 13,
                    fontFamily: "'Figtree', sans-serif",
                  }}>
                    {search ? `No users matching "${search}"` : "No users found."}
                  </div>
                ) : (
                  filtered.map((user, idx) => (
                    <div key={user.id}>
                      {idx > 0 && <Divider />}
                      <div className="user-row">
                        <span style={{
                          fontSize: 14, fontWeight: 700,
                          color: user.status.toLowerCase() === "active" ? "#16a34a" : "#18181b",
                          fontFamily: "'Figtree', sans-serif", letterSpacing: "0.01em",
                          flex: 1,
                        }}>
                          {user.phoneNumber}
                        </span>
                        <span style={{
                          fontSize: 12, fontWeight: 500, color: "#ed5c30",
                          fontFamily: "'Figtree', sans-serif",
                        }}>
                          ₹{Number(user.balance).toLocaleString("en-IN")}
                        </span>

                        <div className="action-group">
                          <button
                            className="action-btn add"
                            onClick={() => openModal("add", user)}
                            title="Add money"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <path d="M12 5v14M5 12h14" />
                            </svg>
                            Add
                          </button>
                          <button
                            className="action-btn status"
                            onClick={() => openModal("status", user)}
                            title="Update status"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <path d="M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z" />
                              <path d="M8 12l3 3 5-5" />
                            </svg>
                            Status
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="users-card">
                <div className="users-card-header">
                  <SectionLabel>WITHDRAWAL REQUESTS</SectionLabel>
                </div>

                {withdrawRequests.length === 0 ? (
                  <div style={{ padding: 20, textAlign: "center", color: "#a1a1aa" }}>
                    No pending withdrawals
                  </div>
                ) : (
                  withdrawRequests.map((req, idx) => (
                    <div key={req.id}>
                      {idx > 0 && <Divider />}

                      <div className="user-row">
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 900 }}>{req.phoneNumber}</div>
                          <div style={{ fontSize: 12, color: "#1b1b1d" }}>
                            ₹{req.amount}
                          </div>
                        </div>

                        <div className="action-group">
                          <button
                            className="action-btn add"
                            onClick={() => handleProcessWithdrawal(req.id, "APPROVED")}
                          >
                            Mark Paid
                          </button>

                          <button
                            className="action-btn withdraw"
                            onClick={() => handleProcessWithdrawal(req.id, "REJECTED")}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </>
  );
}