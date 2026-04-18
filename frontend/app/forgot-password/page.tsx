// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { authService } from "@/lib/services/authService";
// import { useToast, Toast } from "@/hooks/useToast";

// // ─── Toast UI ────────────────────────────────────────────────────────────────

// function Toasts({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
//     if (!toasts.length) return null;
//     return (
//         <div style={{ position: "fixed", top: 20, right: 20, zIndex: 50, display: "flex", flexDirection: "column", gap: 8 }}>
//             {toasts.map((t) => (
//                 <div
//                     key={t.id}
//                     onClick={() => onRemove(t.id)}
//                     style={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: 10,
//                         padding: "12px 16px",
//                         borderRadius: 10,
//                         background: t.type === "success" ? "#f0fdf4" : "#fef2f2",
//                         border: `1px solid ${t.type === "success" ? "#bbf7d0" : "#fecaca"}`,
//                         color: t.type === "success" ? "#166534" : "#991b1b",
//                         fontSize: 13.5,
//                         fontFamily: "'Figtree', sans-serif",
//                         fontWeight: 500,
//                         cursor: "pointer",
//                         boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
//                         animation: "slideIn 0.25s ease",
//                         maxWidth: 320,
//                         minWidth: 220,
//                     }}
//                 >
//                     <span style={{ fontSize: 15 }}>{t.type === "success" ? "✓" : "✕"}</span>
//                     {t.message}
//                 </div>
//             ))}
//         </div>
//     );
// }

// // ─── Forgot Password Page ─────────────────────────────────────────────────────

// export default function ForgotPasswordPage() {
//     const router = useRouter();
//     const { toasts, show, remove } = useToast();

//     const [form, setForm] = useState({
//         phoneNumber: "",
//         newPassword: "",
//         confirmPassword: "",
//     });
//     const [loading, setLoading] = useState(false);
//     const [showNew, setShowNew] = useState(false);
//     const [showConfirm, setShowConfirm] = useState(false);

//     const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

//     const handleSubmit = async () => {
//         if (!form.phoneNumber || !form.newPassword || !form.confirmPassword) {
//             show("Please fill in all fields.", "error");
//             return;
//         }
//         if (form.newPassword.length < 6) {
//             show("New password must be at least 6 characters.", "error");
//             return;
//         }
//         if (form.newPassword !== form.confirmPassword) {
//             show("New passwords do not match.", "error");
//             return;
//         }
//         // if (form.oldPassword === form.newPassword) {
//         //     show("New password must differ from current password.", "error");
//         //     return;
//         // }
//         try {
//             setLoading(true);
//             // TODO: replace with your real API call
//             await authService.resetPassword({ phoneNumber: form.phoneNumber, newPassword: form.newPassword });
//             await new Promise(r => setTimeout(r, 800));
//             show("Password changed successfully!", "success");
//             setTimeout(() => router.push("/login"), 1200);
//         } catch (err: any) {
//             show(err?.response?.data?.message || "Failed to change password. Try again.", "error");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleKeyDown = (e: React.KeyboardEvent) => {
//         if (e.key === "Enter") handleSubmit();
//     };

//     const EyeToggle = ({ show: visible, onToggle }: { show: boolean; onToggle: () => void }) => (
//         <button
//             type="button"
//             onClick={onToggle}
//             style={{
//                 position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
//                 background: "none", border: "none", cursor: "pointer", color: "#a1a1aa",
//                 display: "flex", alignItems: "center", padding: 2,
//                 transition: "color 0.15s",
//             }}
//             onMouseOver={e => (e.currentTarget.style.color = "#18181b")}
//             onMouseOut={e => (e.currentTarget.style.color = "#a1a1aa")}
//         >
//             {visible ? (
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
//                     <line x1="1" y1="1" x2="23" y2="23" />
//                 </svg>
//             ) : (
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
//                     <circle cx="12" cy="12" r="3" />
//                 </svg>
//             )}
//         </button>
//     );

//     const strength = (() => {
//         const p = form.newPassword;
//         if (!p) return null;
//         let score = 0;
//         if (p.length >= 8) score++;
//         if (/[A-Z]/.test(p)) score++;
//         if (/[0-9]/.test(p)) score++;
//         if (/[^A-Za-z0-9]/.test(p)) score++;
//         return score;
//     })();
//     const strengthLabel = strength === null ? null : strength <= 1 ? "Weak" : strength === 2 ? "Fair" : strength === 3 ? "Good" : "Strong";
//     const strengthColor = strength === null ? null : strength <= 1 ? "#ef4444" : strength === 2 ? "#f59e0b" : strength === 3 ? "#3b82f6" : "#22c55e";

//     return (
//         <>
//             <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap');
//         *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
//         body { font-family: 'Figtree', sans-serif; }

//         @keyframes slideIn {
//           from { opacity: 0; transform: translateY(-8px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }
//         @keyframes fadeUp {
//           from { opacity: 0; transform: translateY(12px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }

//         .auth-input {
//           width: 100%;
//           padding: 11px 14px;
//           border: 1.5px solid #e4e4e7;
//           border-radius: 10px;
//           font-size: 14.5px;
//           font-family: 'Figtree', sans-serif;
//           color: #18181b;
//           background: #fff;
//           outline: none;
//           transition: border-color 0.18s, box-shadow 0.18s;
//         }
//         .auth-input::placeholder { color: #a1a1aa; }
//         .auth-input:focus {
//           border-color: #18181b;
//           box-shadow: 0 0 0 3px rgba(24,24,27,0.07);
//         }

//         .auth-btn {
//           width: 100%;
//           padding: 12px;
//           background: #18181b;
//           color: #fff;
//           border: none;
//           border-radius: 10px;
//           font-size: 14.5px;
//           font-weight: 600;
//           font-family: 'Figtree', sans-serif;
//           cursor: pointer;
//           transition: background 0.18s, transform 0.15s;
//           letter-spacing: 0.01em;
//         }
//         .auth-btn:hover:not(:disabled) { background: #27272a; }
//         .auth-btn:active:not(:disabled) { transform: scale(0.99); }
//         .auth-btn:disabled { opacity: 0.55; cursor: not-allowed; }
//       `}</style>

//             <Toasts toasts={toasts} onRemove={remove} />

//             <div style={{
//                 minHeight: "100dvh",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 background: "#fafaf9",
//                 padding: "24px 16px",
//             }}>
//                 <div style={{
//                     width: "100%",
//                     maxWidth: 400,
//                     animation: "fadeUp 0.35s ease both",
//                 }}>

//                     {/* Logo mark */}
//                     <div style={{
//                         width: 40,
//                         height: 40,
//                         background: "#18181b",
//                         borderRadius: 10,
//                         marginBottom: 28,
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                     }}>
//                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                             <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" strokeLinejoin="round" />
//                         </svg>
//                     </div>

//                     {/* Heading */}
//                     <h1 style={{ fontSize: 24, fontWeight: 700, color: "#18181b", marginBottom: 6 }}>
//                         Change password
//                     </h1>
//                     <p style={{ fontSize: 14, color: "#71717a", marginBottom: 28 }}>
//                         Verify your account and set a new password.
//                     </p>

//                     {/* Fields */}
//                     <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>

//                         {/* Phone number */}
//                         <div>
//                             <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#3f3f46", marginBottom: 6 }}>
//                                 Phone number
//                             </label>
//                             <input
//                                 name="phoneNumber"
//                                 type="tel"
//                                 placeholder="Enter your phone number"
//                                 className="auth-input"
//                                 value={form.phoneNumber}
//                                 onChange={handleChange}
//                                 onKeyDown={handleKeyDown}
//                             />
//                         </div>

//                         {/* Divider */}
//                         <div style={{ height: 1, background: "#f4f4f5", margin: "2px 0" }} />

//                         {/* New password */}
//                         <div>
//                             <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#3f3f46", marginBottom: 6 }}>
//                                 New password
//                             </label>
//                             <div style={{ position: "relative" }}>
//                                 <input
//                                     name="newPassword"
//                                     type={showNew ? "text" : "password"}
//                                     placeholder="Enter a new password"
//                                     className="auth-input"
//                                     style={{ paddingRight: 42 }}
//                                     value={form.newPassword}
//                                     onChange={handleChange}
//                                     onKeyDown={handleKeyDown}
//                                 />
//                                 <EyeToggle show={showNew} onToggle={() => setShowNew(v => !v)} />
//                             </div>
//                             {strength !== null && (
//                                 <div style={{ marginTop: 8 }}>
//                                     <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
//                                         {[0, 1, 2, 3].map(i => (
//                                             <div key={i} style={{
//                                                 flex: 1, height: 3, borderRadius: 99,
//                                                 background: i < strength! ? strengthColor! : "#e4e4e7",
//                                                 transition: "background 0.2s",
//                                             }} />
//                                         ))}
//                                     </div>
//                                     <p style={{ fontSize: 11.5, color: strengthColor!, fontWeight: 500 }}>{strengthLabel}</p>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Confirm password */}
//                         <div>
//                             <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#3f3f46", marginBottom: 6 }}>
//                                 Confirm new password
//                             </label>
//                             <div style={{ position: "relative" }}>
//                                 <input
//                                     name="confirmPassword"
//                                     type={showConfirm ? "text" : "password"}
//                                     placeholder="Re-enter your new password"
//                                     className="auth-input"
//                                     style={{
//                                         paddingRight: 42,
//                                         borderColor: form.confirmPassword && form.confirmPassword !== form.newPassword ? "#fca5a5" : undefined,
//                                     }}
//                                     value={form.confirmPassword}
//                                     onChange={handleChange}
//                                     onKeyDown={handleKeyDown}
//                                 />
//                                 <EyeToggle show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
//                             </div>
//                             {form.confirmPassword && form.confirmPassword !== form.newPassword && (
//                                 <p style={{ fontSize: 12, color: "#ef4444", marginTop: 5, fontWeight: 500 }}>
//                                     Passwords do not match.
//                                 </p>
//                             )}
//                             {form.confirmPassword && form.confirmPassword === form.newPassword && (
//                                 <p style={{ fontSize: 12, color: "#22c55e", marginTop: 5, fontWeight: 500 }}>
//                                     ✓ Passwords match.
//                                 </p>
//                             )}
//                         </div>
//                     </div>

//                     {/* Submit */}
//                     <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
//                         {loading ? "Updating password…" : "Update password"}
//                     </button>

//                     {/* Back link */}
//                     <p style={{ marginTop: 20, fontSize: 13.5, color: "#71717a", textAlign: "center" }}>
//                         Remember it?{" "}
//                         <a
//                             href="/login"
//                             style={{ color: "#18181b", fontWeight: 600, textDecoration: "none" }}
//                             onMouseOver={e => (e.currentTarget.style.textDecoration = "underline")}
//                             onMouseOut={e => (e.currentTarget.style.textDecoration = "none")}
//                         >
//                             Back to sign in
//                         </a>
//                     </p>

//                 </div>
//             </div>
//         </>
//     );
// }