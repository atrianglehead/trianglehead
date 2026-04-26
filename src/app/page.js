import Image from "next/image";
import YouTubeEmbed from "./components/YouTubeEmbed";
import MelodyMatch from "./components/MelodyMatch";


export default function Home() {
  return (
    <>
      {/* Hero */}
      <div id="music" style={{ borderBottom: "3px solid #111" }}>
        {/* Text above video */}
        <div style={{ padding: "20px 24px 16px", textAlign: "center", background: "#E8473F" }}>
          <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 28, letterSpacing: 3, color: "#EEE8D0", lineHeight: 1.1 }}>
            Hi! I'm Anirudh,{" "}
            <span style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 14, letterSpacing: 2, fontWeight: 700 }}>aka</span>
            {" "}Trianglehead
          </div>
        </div>

        {/* Full-width video */}
        <div style={{ aspectRatio: "16/9", overflow: "hidden", position: "relative" }}>
          <YouTubeEmbed
            videoId="4wEZdI7zthU"
            title="Anirudh Venkatesh"
            thumbnail="/bach_thumbnail.png"
          />
        </div>

        {/* Text + buttons below video */}
        <div style={{ padding: "16px 24px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, background: "#E8473F" }}>
          <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 28, letterSpacing: 3, color: "#EEE8D0", lineHeight: 1.1 }}>
            ... and I'm on a quest for greater musical fluency.
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <a href="/bio" className="btn" style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 10, padding: "9px 16px", textDecoration: "none", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", background: "#F5C842", color: "#111", border: "2px solid #111", display: "inline-block" }}>
              My Story →
            </a>
            <a href="https://www.youtube.com/@trianglehead" target="_blank" rel="noopener noreferrer" className="btn" style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 10, padding: "9px 16px", textDecoration: "none", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", background: "#F5C842", color: "#111", border: "2px solid #111", display: "inline-block" }}>
              My Videos →
            </a>
          </div>
        </div>
      </div>

      {/* MelodyMatch intro + component */}
      <div style={{ borderBottom: "3px solid #111", background: "#F5C842" }}>
        <div style={{ padding: "24px 28px 16px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 28, letterSpacing: 3, color: "#111", lineHeight: 1.1 }}>
            I design interactive music explorations for music learners.
          </div>
        </div>
        <MelodyMatch />
        <div style={{ padding: "16px 28px 24px", textAlign: "center" }}>
          <a href="/explorations" className="btn" style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 10, padding: "9px 16px", textDecoration: "none", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", background: "#F5C842", color: "#111", border: "2px solid #111", display: "inline-block" }}>
            More Explorations →
          </a>
        </div>
      </div>

      {/* Sound Insight */}
      <div id="sound-insight" style={{ borderBottom: "3px solid #111", background: "#EDEAE0", padding: "28px" }}>
          <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 28, letterSpacing: 3, color: "#111", lineHeight: 1.1, marginBottom: 20, textAlign: "center" }}>
            I publish weekly articles on musical concepts.
          </div>
          <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 13, letterSpacing: 3, color: "#111", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            Sound Insight: The Music Guide
            <span style={{ flex: 1, height: 2, background: "#111", display: "block" }} />
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#888", marginBottom: 12 }}>Top Articles</div>

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

          <div style={{ textAlign: "center" }}>
            <a href="https://soundinsight.substack.com/" target="_blank" rel="noopener noreferrer" className="btn" style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#111", textDecoration: "none", border: "2px solid #111", padding: "9px 16px", display: "inline-block", background: "#F5C842" }}>
              All articles →
            </a>
          </div>

          {/* Subscribe — inline after articles */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1.5px solid #CCC8BC" }}>
            <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 13, letterSpacing: 3, color: "#111", marginBottom: 6 }}>
              Stay in the loop
            </div>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#555", lineHeight: 1.6, margin: "0 0 14px" }}>
              Weekly articles exploring music — delivered to your inbox.
            </p>
            <form
              action="https://soundinsight.substack.com/subscribe"
              method="get"
              target="_blank"
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                <input
                  type="text"
                  name="first_name"
                  placeholder="Your name"
                  style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 11, padding: "9px 14px", border: "2px solid #CCC8BC", background: "#fff", color: "#111", outline: "none", flex: "1 1 130px", minWidth: 0 }}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  required
                  style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 11, padding: "9px 14px", border: "2px solid #CCC8BC", background: "#fff", color: "#111", outline: "none", flex: "2 1 180px", minWidth: 0 }}
                />
              </div>
              <div style={{ textAlign: "center" }}>
                <button
                  type="submit"
                  className="btn"
                  style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 11, padding: "9px 18px", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", background: "#F5C842", color: "#111", border: "2px solid #111", cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
      </div>

      {/* Lessons */}
      <div id="learn" style={{ borderBottom: "3px solid #111", background: "#E8473F", padding: "28px" }}>
          <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 28, letterSpacing: 3, color: "#fff", lineHeight: 1.1, marginBottom: 20, textAlign: "center" }}>
            And I absolutely love helping others through one-on-one coaching.
          </div>
          <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 13, letterSpacing: 3, color: "#fff", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            Lessons
            <span style={{ flex: 1, height: 2, background: "#fff", display: "block" }} />
          </div>
          {[
            { title: "Free Your Voice", desc: "Use your voice like it was meant to be used - an extension of you in the world.", link: "https://www.superprof.co.in/learn-from-professional-musician-how-sing-with-your-free-natural-voice.html", label: "Book a session →" },
            { title: "Guitar & Composition", desc: "Learn music like a language.", link: "https://www.superprof.co.in/learn-how-use-music-like-language-from-full-time-musician.html", label: "Book a session →" },
          ].map((item) => (
            <div key={item.title} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1.5px solid rgba(255,255,255,0.35)" }}>
              <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 20, letterSpacing: 1, color: "#fff", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#EEE8D0", margin: "0 0 8px", lineHeight: 1.5 }}>{item.desc}</p>
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn" style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#111", textDecoration: "none", border: "2px solid #111", padding: "9px 16px", display: "inline-block", background: "#F5C842" }}>{item.label}</a>
            </div>
          ))}
      </div>

</>
  );
}
