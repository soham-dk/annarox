"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --forest:   #0c2118;
          --forest-mid: #1a3a29;
          --sage:     #4e7d62;
          --sage-lt:  #7aaa8e;
          --gold:     #c9a94e;
          --cream:    #f5f0e6;
          --cream-dk: #e8e2d5;
          --ink:      #1a1a18;
          --muted:    #6b7870;
        }

        html { scroll-behavior: smooth; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: var(--cream);
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ─── NAV ─────────────────────────────── */
        .nav-wrap {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          transition: background 0.35s ease, box-shadow 0.35s ease, padding 0.35s ease;
        }

        .nav-wrap.scrolled {
          background: rgba(12, 33, 24, 0.96);
          box-shadow: 0 1px 0 rgba(255,255,255,0.06);
          backdrop-filter: blur(12px);
        }

        .nav {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 28px;
          height: 72px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .nav-logo-mark {
          width: 34px;
          height: 34px;
          border: 1.5px solid rgba(201, 169, 78, 0.7);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .nav-logo-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 500;
          letter-spacing: 0.03em;
          color: #fff;
        }

        .nav-logo-text span {
          color: var(--gold);
        }

        .nav-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .btn-ghost {
          padding: 9px 18px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.04em;
          color: rgba(255,255,255,0.8);
          background: transparent;
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-ghost:hover {
          background: rgba(255,255,255,0.08);
          color: #fff;
          border-color: rgba(255,255,255,0.35);
        }

        .btn-solid {
          padding: 9px 20px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: var(--forest);
          background: var(--gold);
          border: 1px solid var(--gold);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-solid:hover {
          background: #dbbe67;
          border-color: #dbbe67;
        }

        /* ─── HERO ─────────────────────────────── */
        .hero {
          position: relative;
          height: 100dvh;
          min-height: 680px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          overflow: hidden;
        }

        .hero-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 40%;
          animation: fadeIn 1.4s ease;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(8, 22, 14, 0.28) 0%,
            rgba(8, 22, 14, 0.10) 35%,
            rgba(8, 22, 14, 0.55) 75%,
            rgba(8, 22, 14, 0.82) 100%
          );
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 28px 80px;
          animation: fadeUp 0.8s 0.3s ease both;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 20px;
        }

        .hero-eyebrow::before {
          content: '';
          display: block;
          width: 28px;
          height: 1px;
          background: var(--gold);
        }

        .hero-h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(44px, 7vw, 88px);
          font-weight: 500;
          line-height: 1.04;
          color: #fff;
          max-width: 720px;
          margin-bottom: 24px;
          letter-spacing: -0.01em;
        }

        .hero-h1 em {
          font-style: italic;
          color: var(--gold);
        }

        .hero-sub {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.7;
          color: rgba(255,255,255,0.72);
          max-width: 480px;
          margin-bottom: 36px;
        }

        .hero-cta {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn-hero-primary {
          padding: 14px 30px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: var(--forest);
          background: var(--gold);
          border: none;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.22s;
        }

        .btn-hero-primary:hover {
          background: #e0cc72;
          transform: translateY(-1px);
        }

        .btn-hero-outline {
          padding: 14px 30px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 400;
          letter-spacing: 0.05em;
          color: #fff;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.4);
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.22s;
        }

        .btn-hero-outline:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.7);
        }

        /* scroll indicator */
        .scroll-hint {
          position: absolute;
          bottom: 32px;
          right: 44px;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          animation: fadeIn 1.5s 1s both;
        }

        /* ─── STATS BAR ──────────────────────── */
        .stats-bar {
          background: var(--forest);
          padding: 0 28px;
        }

        .stats-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-left: 1px solid rgba(255,255,255,0.07);
        }

        .stat-item {
          padding: 32px 40px;
          border-right: 1px solid rgba(255,255,255,0.07);
        }

        .stat-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 42px;
          font-weight: 500;
          color: var(--gold);
          line-height: 1;
          margin-bottom: 6px;
        }

        .stat-label {
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase;
        }

        /* ─── ABOUT SECTION ──────────────────── */
        .section {
          padding: 100px 28px;
        }

        .section-inner {
          max-width: 1200px;
          margin: 0 auto;
        }

        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .section-label {
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--sage);
          margin-bottom: 20px;
        }

        .section-h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(34px, 4vw, 52px);
          font-weight: 500;
          line-height: 1.12;
          color: var(--forest);
          margin-bottom: 24px;
          letter-spacing: -0.01em;
        }

        .section-h2 em {
          font-style: italic;
          color: var(--sage);
        }

        .section-body {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.8;
          color: var(--muted);
          margin-bottom: 16px;
        }

        .section-body + .section-body {
          margin-top: -6px;
        }

        .about-img-wrap {
          position: relative;
        }

        .about-img {
          width: 100%;
          aspect-ratio: 4/5;
          object-fit: cover;
          border-radius: 2px;
          display: block;
        }

        .about-img-caption {
          position: absolute;
          bottom: -20px;
          right: -20px;
          background: var(--forest);
          color: rgba(255,255,255,0.7);
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.08em;
          padding: 10px 16px;
          border-radius: 2px;
        }

        .about-img-caption strong {
          display: block;
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 500;
          color: var(--gold);
          margin-bottom: 2px;
          letter-spacing: 0;
        }

        /* ─── PILLARS ────────────────────────── */
        .pillars-section {
          background: var(--forest-mid);
          padding: 100px 28px;
        }

        .pillars-header {
          max-width: 1200px;
          margin: 0 auto 60px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 40px;
        }

        .pillars-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 2px;
          overflow: hidden;
        }

        .pillar {
          background: var(--forest-mid);
          padding: 40px 36px;
          transition: background 0.25s;
        }

        .pillar:hover { background: #1e4431; }

        .pillar-icon {
          width: 40px;
          height: 40px;
          border: 1px solid rgba(201,169,78,0.3);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .pillar-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 500;
          color: #fff;
          margin-bottom: 12px;
        }

        .pillar-body {
          font-size: 13.5px;
          font-weight: 300;
          line-height: 1.75;
          color: rgba(255,255,255,0.48);
        }

        /* ─── CTA BANNER ─────────────────────── */
        .cta-section {
          padding: 120px 28px;
          text-align: center;
          background: var(--cream);
        }

        .cta-inner {
          max-width: 640px;
          margin: 0 auto;
        }

        .cta-h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 5vw, 60px);
          font-weight: 500;
          line-height: 1.1;
          color: var(--forest);
          margin-bottom: 20px;
        }

        .cta-body {
          font-size: 15px;
          font-weight: 300;
          color: var(--muted);
          line-height: 1.7;
          margin-bottom: 40px;
        }

        .cta-btns {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-dark {
          padding: 14px 32px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: #fff;
          background: var(--forest);
          border: none;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-dark:hover {
          background: var(--forest-mid);
          transform: translateY(-1px);
        }

        .btn-outline-dark {
          padding: 14px 32px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 400;
          letter-spacing: 0.04em;
          color: var(--forest);
          background: transparent;
          border: 1px solid rgba(12,33,24,0.3);
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-outline-dark:hover {
          border-color: var(--forest);
          background: rgba(12,33,24,0.04);
        }

        /* ─── FOOTER ─────────────────────────── */
        .footer {
          background: var(--forest);
          padding: 48px 28px;
        }

        .footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .footer-copy {
          font-size: 12.5px;
          font-weight: 300;
          color: rgba(255,255,255,0.38);
        }

        .footer-links {
          display: flex;
          gap: 24px;
        }

        .footer-links a {
          font-size: 12.5px;
          font-weight: 300;
          color: rgba(255,255,255,0.38);
          text-decoration: none;
          letter-spacing: 0.04em;
          transition: color 0.18s;
        }

        .footer-links a:hover { color: rgba(255,255,255,0.75); }

        /* ─── RESPONSIVE ─────────────────────── */
        @media (max-width: 900px) {
          .about-grid { grid-template-columns: 1fr; gap: 48px; }
          .about-img-wrap { order: -1; }
          .about-img { aspect-ratio: 16/9; }
          .about-img-caption { right: 0; bottom: -14px; }
          .stats-inner { grid-template-columns: 1fr; }
          .pillars-grid { grid-template-columns: 1fr; }
          .pillars-header { flex-direction: column; align-items: flex-start; }
          .section { padding: 72px 20px; }
          .pillars-section { padding: 72px 20px; }
        }

        @media (max-width: 600px) {
          .nav { padding: 0 16px; height: 64px; }
          .hero-content { padding: 0 16px 64px; }
          .scroll-hint { display: none; }
          .stat-item { padding: 28px 24px; }
          .pillar { padding: 32px 24px; }
          .section { padding: 60px 16px; }
          .pillars-section { padding: 60px 16px; }
        }
      `}</style>

      {/* ─── NAV ────────────────────────────────────────────── */}
      <div className={`nav-wrap${scrolled ? " scrolled" : ""}`}>
        <div className="nav">

          {/* Logo */}
          <a className="nav-logo" href="/">
            <div className="nav-logo-mark">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8 8 4 10 4 15a8 8 0 0016 0c0-5-4-7-8-13z" fill={scrolled ? "#c9a94e" : "#c9a94e"} />
                <path d="M12 10v12" stroke="#c9a94e" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
              </svg>
            </div>
            <span className="nav-logo-text">Canopy<span>Global</span></span>
          </a>

          {/* Actions */}
          <div className="nav-actions">
            {!isLoggedIn ? (
              <>
                <Link href="/login">
                  <button className="btn-ghost">Sign in</button>
                </Link>
                <Link href="/register">
                  <button className="btn-solid">Join Us</button>
                </Link>
              </>
            ) : (
              <>
                <button className="btn-ghost" onClick={() => router.push("/dashboard")}>
                  Dashboard
                </button>
                <button className="btn-solid" onClick={handleLogout}>
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── HERO ────────────────────────────────────────────── */}
      <section className="hero">
        <img
          className="hero-img"
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1800&q=85&auto=format&fit=crop"
          alt="Aerial view of ancient forest canopy"
        />
        <div className="hero-overlay" />

        <div className="hero-content">
          <p className="hero-eyebrow">Est. 2014 </p>

          <h1 className="hero-h1">
            The Earth doesn't<br />
            need saving.<br />
            <em>We do.</em>
          </h1>

          <p className="hero-sub">
            Canopy Global is an international coalition of scientists, conservationists,
            and communities working to restore the ecosystems that sustain all life on Earth.
          </p>

          <div className="hero-cta">
            {!isLoggedIn ? (
              <>
                <Link href="/register">
                  <button className="btn-hero-primary">Join the Coalition</button>
                </Link>
                <Link href="/login">
                  <button className="btn-hero-outline">Sign In</button>
                </Link>
              </>
            ) : (
              <button className="btn-hero-primary" onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </button>
            )}
          </div>
        </div>

        <div className="scroll-hint">
          <svg width="12" height="12" viewBox="0 0 12 20" fill="none">
            <rect x="1" y="1" width="10" height="18" rx="5" stroke="currentColor" strokeWidth="1" />
            <circle cx="6" cy="5" r="1.5" fill="currentColor" opacity="0.6" />
          </svg>
          Scroll
        </div>
      </section>

      {/* ─── ABOUT ───────────────────────────────────────────── */}
      <section className="section">
        <div className="section-inner">
          <div className="about-grid">

            <div>
              <p className="section-label">Our Mission</p>
              <h2 className="section-h2">
                Ecology is not a cause.<br />
                It's a <em>condition</em> of survival.
              </h2>
              <p className="section-body">
                Since 2014, Canopy Global has partnered with indigenous communities,
                governments, and researchers across six continents to protect and regenerate
                the world's most critical ecosystems — from the Amazon basin to the
                Borneo highlands.
              </p>
              <p className="section-body">
                We believe systemic change begins with informed, committed people.
                Every action on our platform is tied directly to measurable, verified
                impact on the ground.
              </p>
            </div>

            <div className="about-img-wrap">
              <img
                className="about-img"
                src="https://images.unsplash.com/photo-1547234935-80c7145ec969?w=900&q=85&auto=format&fit=crop"
                alt="Conservationist documenting forest biodiversity"
              />
              <div className="about-img-caption">
                <strong>+12.7%</strong>
                Forest cover regained since 2018
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── PILLARS ─────────────────────────────────────────── */}
      <div className="pillars-section">
        <div className="pillars-header">
          <div>
            <p className="section-label" style={{ color: "rgba(201,169,78,0.75)" }}>
              How We Work
            </p>
            <h2 className="section-h2" style={{ color: "#fff", marginBottom: 0 }}>
              Three pillars.<br />
              <em style={{ color: "rgba(255,255,255,0.45)", fontStyle: "italic" }}>One planet.</em>
            </h2>
          </div>
        </div>

        <div className="pillars-grid">
          {[
            {
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#c9a94e" strokeWidth="1.3" />
                  <path d="M12 3C12 3 8 8 8 12s4 9 4 9" stroke="#c9a94e" strokeWidth="1.3" />
                  <path d="M3 12h18" stroke="#c9a94e" strokeWidth="1.3" />
                </svg>
              ),
              title: "Global Advocacy",
              body: "We engage governments and institutions at the highest level, translating scientific findings into enforceable policy. Our teams have contributed to 14 international environmental accords."
            },
            {
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8 8 4 10 4 15a8 8 0 0016 0c0-5-4-7-8-13z" stroke="#c9a94e" strokeWidth="1.3" fill="none" />
                  <path d="M12 10v10" stroke="#c9a94e" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              ),
              title: "Ecosystem Restoration",
              body: "From reforestation to coral reef rehabilitation, our on-the-ground teams work directly with local communities, honouring indigenous stewardship of the land."
            },
            {
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#c9a94e" strokeWidth="1.3" />
                  <circle cx="9" cy="7" r="4" stroke="#c9a94e" strokeWidth="1.3" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#c9a94e" strokeWidth="1.3" />
                </svg>
              ),
              title: "Community Action",
              body: "Meaningful change is local first. We equip 830,000+ members with the tools, knowledge, and networks to drive sustainable choices in their homes, cities, and industries."
            }
          ].map((p, i) => (
            <div className="pillar" key={i}>
              <div className="pillar-icon">{p.icon}</div>
              <div className="pillar-title">{p.title}</div>
              <div className="pillar-body">{p.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── FOOTER ──────────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="nav-logo-mark" style={{ opacity: 0.6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8 8 4 10 4 15a8 8 0 0016 0c0-5-4-7-8-13z" fill="#c9a94e" />
              </svg>
            </div>
            <span className="footer-copy" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Cormorant Garamond', serif", fontSize: 15 }}>
              Canopy<span style={{ color: "#c9a94e" }}>Global</span>
            </span>
          </div>

          <span className="footer-copy">
            © {new Date().getFullYear()} Canopy Global Foundation. All rights reserved.
          </span>

          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">Impact Reports</a>
          </div>
        </div>
      </footer>
    </>
  );
}