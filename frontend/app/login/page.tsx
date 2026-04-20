"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/authService";
import { useToast, Toast } from "@/hooks/useToast";
import Link from "next/link";

// ─── Toast UI ────────────────────────────────────────────────────────────────

function Toasts({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
    if (!toasts.length) return null;
    return (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 50, display: "flex", flexDirection: "column", gap: 8 }}>
            {toasts.map((t) => (
                <div
                    key={t.id}
                    onClick={() => onRemove(t.id)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "12px 16px",
                        borderRadius: 10,
                        background: t.type === "success" ? "#f0fdf4" : "#fef2f2",
                        border: `1px solid ${t.type === "success" ? "#bbf7d0" : "#fecaca"}`,
                        color: t.type === "success" ? "#166534" : "#991b1b",
                        fontSize: 13.5,
                        fontFamily: "'Figtree', sans-serif",
                        fontWeight: 500,
                        cursor: "pointer",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                        animation: "slideIn 0.25s ease",
                        maxWidth: 320,
                        minWidth: 220,
                    }}
                >
                    <span style={{ fontSize: 15 }}>{t.type === "success" ? "✓" : "✕"}</span>
                    {t.message}
                </div>
            ))}
        </div>
    );
}

const roleRoutes: Record<string, string> = {
    ADMIN: "/admin",
    MANAGER: "/manager",
    USER: "/dashboard",
};

// ─── Login Page ──────────────────────────────────────────────────────────────

export default function LoginPage() {
    const router = useRouter();
    const { toasts, show, remove } = useToast();

    const [form, setForm] = useState({ phoneNumber: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleLogin = async () => {
        // Mobile number regex: starts with 7-9 and exactly 10 digits
        const phoneRegex = /^[7-9]\d{9}$/;

        // Password regex:
        // Minimum 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=]).{8,}$/;

        if (!form.phoneNumber || !form.password) {
            show("Please fill in all fields.", "error");
            return;
        }

        // Mobile validation
        if (!phoneRegex.test(form.phoneNumber)) {
            show("Enter valid mobile number.", "error");
            return;
        }

        // Password validation
        if (!passwordRegex.test(form.password)) {
            show("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.", "error");
            return;

        }
        try {
            setLoading(true);
            const res = await authService.login(form);
            const token = res.data.token;
            localStorage.setItem("token", token);
            show("Logged in successfully!", "success");
            // setTimeout(() => router.push("/dashboard"), 1000);
            const route = roleRoutes[res.data.user.role] || "/dashboard";
            router.replace(route);
        } catch (err: any) {
            show(err?.response?.data?.message || "Login failed. Try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleLogin();
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Figtree', sans-serif; }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .auth-input {
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
        .auth-input::placeholder { color: #a1a1aa; }
        .auth-input:focus {
          border-color: #18181b;
          box-shadow: 0 0 0 3px rgba(24,24,27,0.07);
        }

        .auth-btn {
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
          transition: background 0.18s, transform 0.15s;
          letter-spacing: 0.01em;
        }
        .auth-btn:hover:not(:disabled) { background: #27272a; }
        .auth-btn:active:not(:disabled) { transform: scale(0.99); }
        .auth-btn:disabled { opacity: 0.55; cursor: not-allowed; }
      `}</style>

            <Toasts toasts={toasts} onRemove={remove} />

            <div style={{
                minHeight: "100dvh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fafaf9",
                padding: "24px 16px",
            }}>
                <div style={{
                    width: "100%",
                    maxWidth: 400,
                    animation: "fadeUp 0.35s ease both",
                }}>

                    {/* Logo mark */}
                    <div style={{
                        width: 40,
                        height: 40,
                        background: "#18181b",
                        borderRadius: 10,
                        marginBottom: 28,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" strokeLinejoin="round" />
                        </svg>
                    </div>

                    {/* Heading */}
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: "#18181b", marginBottom: 6 }}>
                        Welcome back
                    </h1>
                    <p style={{ fontSize: 14, color: "#71717a", marginBottom: 28 }}>
                        Sign in to your account to continue.
                    </p>

                    {/* Fields */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>

                        <div>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#3f3f46", marginBottom: 6 }}>
                                Phone number
                            </label>
                            <input
                                name="phoneNumber"
                                placeholder="Enter your phone number"
                                className="auth-input"
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                            />
                        </div>

                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "#3f3f46" }}>
                                    Password
                                </label>
                                {/* <a href="/forgot-password" style={{ fontSize: 12.5, color: "#71717a", textDecoration: "none", fontWeight: 500 }}
                                    onMouseOver={e => (e.currentTarget.style.color = "#18181b")}
                                    onMouseOut={e => (e.currentTarget.style.color = "#71717a")}
                                >
                                    Forgot password?
                                </a> */}
                            </div>
                            <div style={{ position: "relative" }}>
                                <input
                                    name="password"
                                    type={showPass ? "text" : "password"}
                                    placeholder="Enter your password(e.g.Pass@123)"
                                    className="auth-input"
                                    style={{ paddingRight: 42 }}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    style={{
                                        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                                        background: "none", border: "none", cursor: "pointer", color: "#a1a1aa",
                                        display: "flex", alignItems: "center", padding: 2,
                                        transition: "color 0.15s",
                                    }}
                                    onMouseOver={e => (e.currentTarget.style.color = "#18181b")}
                                    onMouseOut={e => (e.currentTarget.style.color = "#a1a1aa")}
                                >
                                    {showPass ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <button className="auth-btn" onClick={handleLogin} disabled={loading}>
                        {loading ? "Signing in…" : "Sign in"}
                    </button>

                    {/* Footer link */}
                    <p style={{ marginTop: 20, fontSize: 13.5, color: "#71717a", textAlign: "center" }}>
                        Don't have an account?{" "}
                        <Link href="/register">Create Account</Link>
                    </p>

                </div>
            </div>
        </>
    );
}