"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import s from "@/app/page.module.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

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

  const pillars = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#c9a94e" strokeWidth="1.3" />
          <path d="M12 3C12 3 8 8 8 12s4 9 4 9" stroke="#c9a94e" strokeWidth="1.3" />
          <path d="M3 12h18" stroke="#c9a94e" strokeWidth="1.3" />
        </svg>
      ),
      title: "Global Advocacy",
      body: "We engage governments and institutions at the highest level, translating scientific findings into enforceable policy. Our teams have contributed to 14 international environmental accords.",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8 8 4 10 4 15a8 8 0 0016 0c0-5-4-7-8-13z" stroke="#c9a94e" strokeWidth="1.3" fill="none" />
          <path d="M12 10v10" stroke="#c9a94e" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      ),
      title: "Ecosystem Restoration",
      body: "From reforestation to coral reef rehabilitation, our on-the-ground teams work directly with local communities, honouring indigenous stewardship of the land.",
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
      body: "Meaningful change is local first. We equip 830,000+ members with the tools, knowledge, and networks to drive sustainable choices in their homes, cities, and industries.",
    },
  ];

  return (
    <main
      className={`${cormorant.variable} ${dmSans.variable}`}
      style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        minHeight: "100dvh",
        background: "#f5f0e6",
      }}
    >
      {/* ─── NAV ─── */}
      <div className={`${s.navWrap} ${scrolled ? s.scrolled : ""}`}>
        <div className={s.nav}>
          <a className={s.navLogo} href="/">
            <div className={s.navLogoMark}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8 8 4 10 4 15a8 8 0 0016 0c0-5-4-7-8-13z" fill="#c9a94e" />
                <path d="M12 10v12" stroke="#c9a94e" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
              </svg>
            </div>
            <span className={s.navLogoText} style={{ fontFamily: "var(--font-cormorant), serif" }}>
              Canopy<span>Global</span>
            </span>
          </a>

          <div className={s.navActions}>
            {!isLoggedIn ? (
              <>
                <Link href="/login">
                  <button className={s.btnGhost}>Sign in</button>
                </Link>
                <Link href="/register">
                  <button className={s.btnSolid}>Register</button>
                </Link>
              </>
            ) : (
              <>
                <button className={s.btnGhost} onClick={() => router.push("/dashboard")}>
                  Dashboard
                </button>
                <button className={s.btnSolid} onClick={handleLogout}>
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── HERO ─── */}
      <section className={s.hero}>
        <img
          className={s.heroImg}
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1800&q=85&auto=format&fit=crop"
          alt="Aerial view of ancient forest canopy"
        />
        <div className={s.heroOverlay} />

        <div className={s.heroContent}>
          <p className={s.heroEyebrow}>Est. 2014</p>

          <h1
            className={s.heroH1}
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            The Earth doesn&apos;t<br />
            need saving.<br />
            <em>We do.</em>
          </h1>

          <p className={s.heroSub}>
            Canopy Global is an international coalition of scientists, conservationists,
            and communities working to restore the ecosystems that sustain all life on Earth.
          </p>
        </div>

        <div className={s.scrollHint}>
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
            <rect x="1" y="1" width="10" height="18" rx="5" stroke="currentColor" strokeWidth="1" />
            <circle cx="6" cy="5" r="1.5" fill="currentColor" opacity="0.6" />
          </svg>
          Scroll
        </div>
      </section>
      {/* ─── ABOUT ─── */}
      <section className={s.section}>
        <div className={s.sectionInner}>
          <div className={s.aboutGrid}>
            <div>
              <p className={s.sectionLabel}>Our Mission</p>
              <h2
                className={s.sectionH2}
                style={{ fontFamily: "var(--font-cormorant), serif" }}
              >
                Ecology is not a cause.<br />
                It&apos;s a <em>condition</em> of survival.
              </h2>
              <p className={s.sectionBody}>
                Since 2014, Canopy Global has partnered with indigenous communities,
                governments, and researchers across six continents to protect and regenerate
                the world&apos;s most critical ecosystems — from the Amazon basin to the
                Borneo highlands.
              </p>
              <p className={s.sectionBody}>
                We believe systemic change begins with informed, committed people.
                Every action on our platform is tied directly to measurable, verified
                impact on the ground.
              </p>
            </div>

            <div className={s.aboutImgWrap}>
              <img
                className={s.aboutImg}
                src="https://images.unsplash.com/photo-1547234935-80c7145ec969?w=900&q=85&auto=format&fit=crop"
                alt="Conservationist documenting forest biodiversity"
              />
              <div className={s.aboutImgCaption}>
                <strong>+12.7%</strong>
                Forest cover regained since 2018
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PILLARS ─── */}
      <div className={s.pillarsSection}>
        <div className={s.pillarsHeader}>
          <div>
            <p className={s.sectionLabel} style={{ color: "rgba(201,169,78,0.75)" }}>
              How We Work
            </p>
            <h2
              className={s.sectionH2}
              style={{
                fontFamily: "var(--font-cormorant), serif",
                color: "#fff",
                marginBottom: 0,
              }}
            >
              Three pillars.<br />
              <em style={{ color: "rgba(255,255,255,0.45)" }}>One planet.</em>
            </h2>
          </div>
        </div>

        <div className={s.pillarsGrid}>
          {pillars.map((p) => (
            <div className={s.pillar} key={p.title}>
              <div className={s.pillarIcon}>{p.icon}</div>
              <div
                className={s.pillarTitle}
                style={{ fontFamily: "var(--font-cormorant), serif" }}
              >
                {p.title}
              </div>
              <div className={s.pillarBody}>{p.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <div className={s.footerBrand}>
            <div className={s.navLogoMark} style={{ opacity: 0.6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8 8 4 10 4 15a8 8 0 0016 0c0-5-4-7-8-13z" fill="#c9a94e" />
              </svg>
            </div>
            <span
              className={s.footerCopy}
              style={{
                fontFamily: "var(--font-cormorant), serif",
                fontSize: 15,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              Canopy<span style={{ color: "#c9a94e" }}>Global</span>
            </span>
          </div>

          <span className={s.footerCopy}>
            © {new Date().getFullYear()} Canopy Global Foundation. All rights reserved.
          </span>

          <div className={s.footerLinks}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">Impact Reports</a>
          </div>
        </div>
      </footer>
    </main>
  );
}