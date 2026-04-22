import Link from "next/link";

export const metadata = {
  title: "Contact · Trianglehead",
  description: "Get in touch with Anirudh Venkatesh.",
};

export default function Contact() {
  return (
    <div className="site-wrapper" style={{ maxWidth: 860, margin: "0 auto", background: "#F5F2EB", fontFamily: "var(--font-space-mono), monospace", border: "3px solid #111", minHeight: "100vh" }}>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", background: "#111" }}>
        <Link href="/" style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 32, letterSpacing: 2, lineHeight: 1, textDecoration: "none" }}>
          <span style={{ color: "#F5C842" }}>TRI</span>
          <span style={{ color: "#E8F0FF" }}>ANGLE</span>
          <span style={{ color: "#F5C842" }}>HEAD</span>
        </Link>
        <span style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 10, color: "#aaa", letterSpacing: 1.5 }}>
          aka Anirudh Venkatesh
        </span>
      </nav>

      {/* Yellow sub-bar */}
      <div style={{ background: "#F5C842", padding: "5px 24px", borderBottom: "2px solid #111", display: "flex", alignItems: "center", gap: 8 }}>
        <Link href="/" style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#111", textDecoration: "none" }}>← Home</Link>
        <span style={{ width: 4, height: 4, background: "#111", borderRadius: "50%", display: "inline-block" }} />
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#111" }}>Contact</span>
      </div>

      {/* Contact content */}
      <div style={{ padding: "40px 48px", maxWidth: 520 }}>
        <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 48, letterSpacing: 2, color: "#111", lineHeight: 1, marginBottom: 32 }}>
          Get in touch
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Email */}
          <div style={{ border: "2px solid #111", padding: "20px 24px", background: "#fff" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "#E8473F", marginBottom: 8 }}>Email</div>
            <a href="mailto:anirudh@trianglehead.in" style={{ fontFamily: "Georgia, serif", fontSize: 16, color: "#111", textDecoration: "none", borderBottom: "1.5px solid #111", paddingBottom: 1 }}>
              anirudh@trianglehead.in
            </a>
          </div>

          {/* Instagram */}
          <div style={{ border: "2px solid #111", padding: "20px 24px", background: "#fff" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "#E8473F", marginBottom: 8 }}>Instagram</div>
            <a href="https://www.instagram.com/a.trianglehead/" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "Georgia, serif", fontSize: 16, color: "#111", textDecoration: "none", borderBottom: "1.5px solid #111", paddingBottom: 1 }}>
              @a.trianglehead
            </a>
          </div>

          {/* Lessons */}
          <div style={{ border: "2px solid #111", padding: "20px 24px", background: "#fff" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "#E8473F", marginBottom: 8 }}>Book a lesson</div>
            <a href="https://www.superprof.co.in/learn-from-professional-musician-how-sing-with-your-free-natural-voice.html" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "Georgia, serif", fontSize: 14, color: "#111", textDecoration: "none", borderBottom: "1.5px solid #111", paddingBottom: 1 }}>
              Superprof — Vocal lessons →
            </a>
            <br /><br />
            <a href="https://www.superprof.co.in/learn-how-use-music-like-language-from-full-time-musician.html" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "Georgia, serif", fontSize: 14, color: "#111", textDecoration: "none", borderBottom: "1.5px solid #111", paddingBottom: 1 }}>
              Superprof — Guitar & musicianship →
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: "#111", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 14, letterSpacing: 2 }}>
          <span style={{ color: "#555" }}>TRI</span>
          <span style={{ color: "#444" }}>ANGLE</span>
          <span style={{ color: "#555" }}>HEAD</span>
        </span>
        <span style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "#444" }}>© 2026 · Built with intention</span>
      </div>
    </div>
  );
}
