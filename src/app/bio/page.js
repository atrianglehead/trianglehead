import Link from "next/link";

export const metadata = {
  title: "Bio · Trianglehead",
  description: "About Anirudh Venkatesh — musician, educator, and explorer of musical traditions.",
};

export default function Bio() {
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
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#111" }}>About</span>
      </div>

      {/* Bio content */}
      <div style={{ padding: "40px 48px", maxWidth: 680 }}>
        <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 48, letterSpacing: 2, color: "#111", lineHeight: 1, marginBottom: 8 }}>
          Anirudh Venkatesh
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "#E8473F", marginBottom: 32 }}>
          Musician · Educator · Explorer
        </div>

        <div style={{ fontFamily: "Georgia, serif", fontSize: 14, color: "#444", lineHeight: 1.75 }}>
          <p>
            I go by <strong>Trianglehead</strong> online — a name that stuck from an early impulse to look for the triangle hidden in every musical shape. I&apos;m a full-time musician based in India, working at the intersection of Carnatic music, Western harmony, and whatever falls between.
          </p>
          <p>
            My musical education began with Carnatic vocal training and later expanded into guitar, composition, and music theory. Over the years I&apos;ve come to see music less as a collection of styles and more as a single vast network — where a rhythm from South India echoes in a West African groove, and a Western harmonic progression finds its mirror in a raga.
          </p>
          <p>
            I write about this network in <a href="https://soundinsight.substack.com/" target="_blank" rel="noopener noreferrer" style={{ color: "#E8473F", textDecoration: "none", borderBottom: "1.5px solid #E8473F" }}>Sound Insight</a>, a newsletter that breaks down music theory, practice, and the connections between traditions in plain language.
          </p>
          <p>
            I also teach — vocal technique, guitar, and a broader approach to musicianship that I call <em>music as language</em>. The goal is always the same: help you hear more, play more freely, and understand what you&apos;re doing when you make music.
          </p>
          <p>
            My music lives on <a href="https://www.youtube.com/@trianglehead" target="_blank" rel="noopener noreferrer" style={{ color: "#E8473F", textDecoration: "none", borderBottom: "1.5px solid #E8473F" }}>YouTube</a> and <a href="https://www.youtube.com/@anirudh.venkatesh" target="_blank" rel="noopener noreferrer" style={{ color: "#E8473F", textDecoration: "none", borderBottom: "1.5px solid #E8473F" }}>YouTube (personal channel)</a>.
          </p>
        </div>

        {/* Links */}
        <div style={{ marginTop: 36, display: "flex", flexWrap: "wrap", gap: 10 }}>
          {[
            { label: "Sound Insight →", href: "https://soundinsight.substack.com/" },
            { label: "YouTube →", href: "https://www.youtube.com/@trianglehead" },
            { label: "Lessons →", href: "https://www.superprof.co.in/learn-from-professional-musician-how-sing-with-your-free-natural-voice.html" },
            { label: "Contact →", href: "/contact" },
          ].map((item) => {
            const isExternal = item.href.startsWith("http");
            return (
              <a
                key={item.href}
                href={item.href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "8px 16px", border: "2px solid #111", color: "#111", textDecoration: "none", background: "transparent" }}
              >
                {item.label}
              </a>
            );
          })}
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
