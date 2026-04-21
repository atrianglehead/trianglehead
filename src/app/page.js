import Link from "next/link";
import Image from "next/image";

const socialLinks = [
  {
    label: "Trianglehead",
    href: "https://www.youtube.com/@trianglehead",
    group: "youtube",
  },
  {
    label: "Anirudh Venkatesh",
    href: "https://www.youtube.com/@anirudh.venkatesh",
    group: "youtube",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/a.trianglehead/",
    group: "social",
  },
  {
    label: "Vocal lessons",
    href: "https://www.superprof.co.in/learn-from-professional-musician-how-sing-with-your-free-natural-voice.html",
    group: "superprof",
  },
  {
    label: "Guitar & musicianship",
    href: "https://www.superprof.co.in/learn-how-use-music-like-language-from-full-time-musician.html",
    group: "superprof",
  },
];

const navLinks = [
  { label: "Music", href: "#music" },
  { label: "Sound Insight", href: "#sound-insight" },
  { label: "Learn", href: "#learn" },
  { label: "Contact", href: "#contact" },
];

export default function Home() {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", background: "#F5F2EB", fontFamily: "var(--font-space-mono), monospace", border: "3px solid #111" }}>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", background: "#111" }}>
        <span style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 32, letterSpacing: 2, lineHeight: 1 }}>
          <span style={{ color: "#F5C842" }}>TRIANGLE</span>
          <span style={{ color: "#E8F0FF" }}>HEAD</span>
        </span>
        <div style={{ display: "flex", gap: 20 }}>
          {navLinks.map((item) => (
            <a key={item.label} href={item.href} style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 10, color: "#aaa", textDecoration: "none", letterSpacing: 1.5, textTransform: "uppercase" }}>
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Issue bar */}
      <div style={{ background: "#F5C842", padding: "5px 24px", display: "flex", alignItems: "center", gap: 16, borderBottom: "2px solid #111" }}>
        {["One musical day at a time", "Est. 2015", "trianglehead.in"].map((text, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {i > 0 && <span style={{ width: 4, height: 4, background: "#111", borderRadius: "50%", display: "inline-block" }} />}
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#111" }}>{text}</span>
          </span>
        ))}
      </div>

      {/* Hero */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "3px solid #111" }}>
        <div style={{ padding: "32px 28px 28px", borderRight: "3px solid #111", background: "#F5F2EB" }}>
          <h1 style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 80, lineHeight: 0.9, letterSpacing: 2, margin: 0 }}>
            <span style={{ color: "#111", display: "block" }}>TRIANGLE</span>
            <span style={{ color: "#E8473F", display: "block" }}>HEAD</span>
          </h1>
        </div>
        <div style={{ padding: "32px 28px 28px", background: "#111" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#F5C842", marginBottom: 10 }}>Intention</div>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 16, fontStyle: "italic", color: "#EEE8D0", lineHeight: 1.6, margin: "0 0 28px" }}>
            Discovering music through people, and people through music.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <a href="https://soundinsight.substack.com/" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 11, padding: "10px 18px", textDecoration: "none", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", background: "#F5C842", color: "#111", display: "block" }}>
              Sound Insight: The Music Guide
            </a>
            <a href="https://www.superprof.co.in/learn-from-professional-musician-how-sing-with-your-free-natural-voice.html" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 11, padding: "10px 18px", textDecoration: "none", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", background: "transparent", color: "#EEE8D0", border: "2px solid #EEE8D0", display: "block" }}>
              Book a lesson
            </a>
            <a href="https://www.youtube.com/@trianglehead" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 11, padding: "10px 18px", textDecoration: "none", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", background: "transparent", color: "#888", border: "2px solid #444", display: "block" }}>
              Browse music
            </a>
          </div>
        </div>
      </div>

      {/* Music */}
      <div id="music" style={{ borderBottom: "3px solid #111", padding: "22px 28px", background: "#111" }}>
        <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 28, letterSpacing: 2, marginBottom: 6, color: "#F5C842" }}>Music</div>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 12, lineHeight: 1.6, color: "#aaa", margin: "0 0 20px" }}>Videos, audio and live recordings across musical traditions. Watch, listen, explore.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <iframe
            src="https://www.youtube.com/embed/4wEZdI7zthU"
            title="Anirudh Venkatesh"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: "100%", aspectRatio: "16/9", border: "none" }}
          />
          <iframe
            src="https://www.youtube.com/embed/h7yzzWFrJK0"
            title="Trianglehead"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: "100%", aspectRatio: "16/9", border: "none" }}
          />
        </div>
        <a href="https://www.youtube.com/@trianglehead" target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#F5C842", textDecoration: "none", borderBottom: "2px solid #F5C842", paddingBottom: 1 }}>
          Listen to more →
        </a>
      </div>

      {/* Main: Sound Insight + Learn */}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", borderBottom: "3px solid #111" }}>
        <div id="sound-insight" style={{ padding: "28px", borderRight: "3px solid #111" }}>
          <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 13, letterSpacing: 3, color: "#E8473F", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            Sound Insight
            <span style={{ flex: 1, height: 2, background: "#111", display: "block" }} />
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#E8473F", marginBottom: 12 }}>Top Articles</div>

          {/* Decoding Melody */}
          <a href="https://soundinsight.substack.com/p/decoding-melody" target="_blank" rel="noopener noreferrer" style={{ display: "flex", gap: 16, textDecoration: "none", border: "2px solid #111", background: "#fff", padding: 14, marginBottom: 18 }}>
            <div style={{ flexShrink: 0, width: 90, height: 90, overflow: "hidden", border: "1.5px solid #E0DDD4", background: "#F5F2EB" }}>
              <Image src="/MelodyTriangle.png" alt="Decoding Melody" width={90} height={90} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
              <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 22 }}>Decoding Melody</div>
              <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#555", margin: 0 }}>
                A deep dive into how rhythm, pitch, and loudness come together to create melody.
              </p>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#E8473F" }}>Read on Substack →</div>
            </div>
          </a>

          {/* Scale Primer */}
          <a href="https://soundinsight.substack.com/p/scale-framework-primer" target="_blank" rel="noopener noreferrer" style={{ display: "flex", gap: 16, textDecoration: "none", border: "2px solid #111", background: "#fff", padding: 14, marginBottom: 18 }}>
            <div style={{ width: 90, height: 90 }}>
              <Image src="/ScaleDog.png" alt="Scale Primer" width={90} height={90} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 22 }}>Scale Primer</div>
              <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#555", margin: 0 }}>
                An introduction to how pitches combine into scales.
              </p>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#E8473F" }}>Read on Substack →</div>
            </div>
          </a>

          {/* Gati Primer */}
          <a href="https://soundinsight.substack.com/p/gati-primer" target="_blank" rel="noopener noreferrer" style={{ display: "flex", gap: 16, textDecoration: "none", border: "2px solid #111", background: "#fff", padding: 14, marginBottom: 18 }}>
            <div style={{ width: 90, height: 90 }}>
              <Image src="/GatiPuja.png" alt="Gati Primer" width={90} height={90} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 22 }}>Gati Primer</div>
              <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#555", margin: 0 }}>
                An introduction to how beats combine to become gatis.
              </p>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#E8473F" }}>Read on Substack →</div>
            </div>
          </a>

          <a href="https://soundinsight.substack.com/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#E8473F", textDecoration: "none", borderBottom: "2px solid #E8473F", paddingBottom: 1 }}>
            All articles →
          </a>
        </div>

        <div id="learn" style={{ padding: "28px 24px", background: "#EDEAE0" }}>
          <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 13, letterSpacing: 3, color: "#111", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            Learn
            <span style={{ flex: 1, height: 2, background: "#111", display: "block" }} />
          </div>
          {[
            { title: "Free Your Voice", desc: "Learn to sing freely.", link: "https://www.superprof.co.in/learn-from-professional-musician-how-sing-with-your-free-natural-voice.html", label: "Book a session →" },
            { title: "Guitar & Composition", desc: "Learn music like a language.", link: "https://www.superprof.co.in/learn-how-use-music-like-language-from-full-time-musician.html", label: "Book a session →" },
          ].map((item) => (
            <div key={item.title} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1.5px solid #CCC8BC" }}>
              <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 20, letterSpacing: 1, color: "#111", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#666", margin: "0 0 8px", lineHeight: 1.5 }}>{item.desc}</p>
              <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#111", textDecoration: "none", borderBottom: "1.5px solid #111", paddingBottom: 1 }}>{item.label}</a>
            </div>
          ))}
        </div>
      </div>

      {/* Founder */}
      <div id="contact" style={{ display: "grid", gridTemplateColumns: "auto 1fr", borderBottom: "3px solid #111" }}>
        <div style={{ background: "#E8473F", padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, borderRight: "3px solid #111", minWidth: 80 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#F5F2EB", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 20, color: "#E8473F", border: "2px solid #111" }}>AV</div>
          <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 11, letterSpacing: 2, color: "#fff", textAlign: "center", lineHeight: 1.2 }}>Anirudh<br />Venkatesh</div>
        </div>
        <div style={{ padding: "22px 28px", background: "#F5F2EB" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#444", lineHeight: 1.6, margin: "0 0 14px" }}>
            Music learner, educator, and creator — exploring connections in the vast network of musical traditions.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {socialLinks.map((s) => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "4px 10px", border: "1.5px solid #111", color: "#111", background: "transparent", textDecoration: "none" }}>
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: "#111", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 14, letterSpacing: 2, color: "#555" }}>TRIANGLEHEAD</span>
        <span style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "#444" }}>© 2026 · Built with intention</span>
      </div>

    </div>
  );
}
