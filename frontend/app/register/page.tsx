"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/authService";
import { useToast, Toast } from "@/hooks/useToast";
import { Toasts } from "../dashboard/page";
import Link from "next/link";

// ─── Register Page ───────────────────────────────────────────────────────────

export default function RegisterPage() {
    const router = useRouter();
    const { toasts, show, remove } = useToast();

    const [form, setForm] = useState({ phoneNumber: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleRegister = async () => {
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
            show("Enter valid mobile number (10 digits, starts with 7-9).", "error");
            return;
        }

        // Password validation
        if (!passwordRegex.test(form.password)) {
            show("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.", "error");
            return;
        }
        try {
            setLoading(true);
            await authService.register(form);
            show("Account created successfully!", "success");
            setTimeout(() => router.push("/login"), 1000);
        } catch (err: any) {
            show(err?.response?.data?.message || "Registration failed. Try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleRegister();
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
                        Create an account
                    </h1>

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
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#3f3f46", marginBottom: 6 }}>
                                Password
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    name="password"
                                    type={showPass ? "text" : "password"}
                                    placeholder="Enter a password(e.g.Pass@123)"
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
                            <p style={{ marginTop: 6, fontSize: 12, color: "#a1a1aa" }}>
                                Use 8 or more characters.
                            </p>
                        </div>

                    </div>

                    {/* Submit */}
                    <button className="auth-btn" onClick={handleRegister} disabled={loading}>
                        {loading ? "Creating account…" : "Create account"}
                    </button>

                    {/* Footer link */}
                    <p style={{ marginTop: 20, fontSize: 13.5, color: "#71717a", textAlign: "center" }}>
                        Already have an account?{" "}
                        <Link href="/login">Log In</Link>
                    </p>

                </div>
            </div>
        </>
    );
}