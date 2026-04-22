import Image from "next/image";
import YouTubeEmbed from "./components/YouTubeEmbed";
import MelodyMatch from "./components/MelodyMatch";

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

export default function Home() {
  return (
    <>
      {/* Hero: thumbnail 2/3 + bio 1/3 */}
      <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", borderBottom: "3px solid #111", alignItems: "start" }}>
        <div id="music" className="hero-left" style={{ borderRight: "3px solid #F5C842", aspectRatio: "16/9", overflow: "hidden", position: "relative" }}>
          <YouTubeEmbed
            videoId="4wEZdI7zthU"
            title="Anirudh Venkatesh"
            thumbnail="/bach_thumbnail.png"
          />
        </div>
        <div className="hero-right" style={{ padding: "28px", background: "#1C1C1C", display: "flex", flexDirection: "column", justifyContent: "center", aspectRatio: "8/9", overflow: "hidden", boxSizing: "border-box" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 20, color: "#EEE8D0", lineHeight: 1.5, margin: "0 0 24px", fontStyle: "italic" }}>
            Trianglehead, aka Anirudh Venkatesh, is an explorer of musical traditions...
          </p>
          <a href="/bio" style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 10, padding: "9px 16px", textDecoration: "none", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", background: "transparent", color: "#F5C842", border: "2px solid #F5C842", display: "inline-block", alignSelf: "flex-start" }}>
            Read full bio →
          </a>
        </div>
      </div>

      {/* Music background video section */}
      <div className="music-video-section" style={{ position: "relative", borderBottom: "3px solid #111", overflow: "hidden", background: "#111", minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.45 }}
        >
          <source src="/instruments_bg.mp4" type="video/mp4" />
        </video>
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "40px 28px" }}>
          <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 52, letterSpacing: 4, color: "#EEE8D0", lineHeight: 1, marginBottom: 18, textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}>
            and instruments...
          </div>
          <a href="https://www.youtube.com/@trianglehead" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#F5C842", textDecoration: "none", borderBottom: "2px solid #F5C842", paddingBottom: 2 }}>
            Trianglehead on YouTube →
          </a>
        </div>
      </div>

      {/* MelodyMatch intro + component */}
      <div style={{ borderBottom: "3px solid #111", background: "#F5F2EB" }}>
        <div style={{ padding: "24px 28px 0", borderBottom: "1px solid #DDD9CE" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#555", lineHeight: 1.65, margin: 0 }}>
            ... who teaches how to develop <strong>musical fluency</strong> through interactive tools — like this one:
          </p>
        </div>
        <MelodyMatch />
      </div>

      {/* Main: Sound Insight + Lessons */}
      <div className="main-grid" style={{ display: "grid", gridTemplateColumns: "3fr 2fr", borderBottom: "3px solid #111" }}>
        <div id="sound-insight" className="main-left" style={{ padding: "28px", borderRight: "3px solid #111" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#555", lineHeight: 1.65, margin: "0 0 20px", borderBottom: "1.5px solid #DDD9CE", paddingBottom: 16 }}>
            ... and writes <strong>articles</strong> about music theory, practice, and the spaces between traditions.
          </p>
          <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 13, letterSpacing: 3, color: "#E8473F", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            Sound Insight: The Music Guide
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

        <div id="learn" className="main-right" style={{ padding: "28px 24px", background: "#EDEAE0" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#666", lineHeight: 1.65, margin: "0 0 20px", borderBottom: "1.5px solid #CCC8BC", paddingBottom: 16 }}>
            ... and offers <strong>one-on-one coaching</strong> for those who want to go deeper.
          </p>
          <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 13, letterSpacing: 3, color: "#111", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            Lessons
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

      {/* Mailing list */}
      <div className="mailing-section" style={{ borderBottom: "3px solid #111", background: "#1C1C1C", padding: "32px 28px" }}>
        <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 13, letterSpacing: 3, color: "#F5C842", marginBottom: 8 }}>
          Stay in the loop
        </div>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#C8B99A", lineHeight: 1.6, margin: "0 0 20px" }}>
          New articles, tools, and music — delivered to your inbox.
        </p>
        <form
          action="https://soundinsight.substack.com/subscribe"
          method="get"
          target="_blank"
          style={{ display: "flex", flexWrap: "wrap", gap: 10 }}
        >
          <input
            type="text"
            name="first_name"
            placeholder="Your name"
            style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 11, padding: "9px 14px", border: "2px solid #555", background: "#111", color: "#EEE8D0", outline: "none", flex: "1 1 160px", minWidth: 0 }}
          />
          <input
            type="email"
            name="email"
            placeholder="your@email.com"
            required
            style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 11, padding: "9px 14px", border: "2px solid #555", background: "#111", color: "#EEE8D0", outline: "none", flex: "2 1 200px", minWidth: 0 }}
          />
          <button
            type="submit"
            style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 11, padding: "9px 18px", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", background: "#F5C842", color: "#111", border: "2px solid #F5C842", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            Subscribe
          </button>
        </form>
      </div>

      {/* Founder */}
      <div id="contact" className="founder-grid" style={{ display: "grid", gridTemplateColumns: "auto 1fr", borderBottom: "3px solid #111" }}>
        <div className="founder-left" style={{ background: "#E8473F", padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, borderRight: "3px solid #111", minWidth: 80 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#F5F2EB", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 20, color: "#E8473F", border: "2px solid #111" }}>AV</div>
          <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 11, letterSpacing: 2, color: "#fff", textAlign: "center", lineHeight: 1.2 }}>Anirudh<br />Venkatesh</div>
        </div>
        <div className="founder-right" style={{ padding: "22px 28px", background: "#F5F2EB" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#444", lineHeight: 1.6, margin: "0 0 14px" }}>
            Music learner and educator — exploring connections in the vast network of musical traditions.
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
    </>
  );
}
