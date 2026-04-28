import Image from "next/image";
import YouTubeEmbed from "./components/YouTubeEmbed";
import MelodyMatch from "./components/MelodyMatch";
import { CATEGORIES } from "./lessons/data";
import { colors, fonts, styles } from "./styles";


export default function Home() {
  return (
    <>
      {/* Hero */}
      <div id="music" style={styles.section}>
        {/* Text above video */}
        <div style={{ padding: "20px 24px 16px", textAlign: "center", background: colors.red }}>
          <div style={{ ...styles.sectionTitle, fontFamily: fonts.display, color: colors.cream }}>
            Hi! I&apos;m Anirudh,{" "}
            <span style={{ fontFamily: fonts.mono, fontSize: 14, letterSpacing: 2, fontWeight: 700 }}>aka</span>
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
        <div style={{ padding: "16px 24px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, background: colors.red }}>
          <div style={{ ...styles.sectionTitle, color: colors.cream }}>
            ... and I&apos;m on a quest for greater musical fluency.
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <a href="/bio" className="btn" style={styles.btn}>
              My Story →
            </a>
            <a href="https://www.youtube.com/@trianglehead" target="_blank" rel="noopener noreferrer" className="btn" style={styles.btn}>
              My Videos →
            </a>
          </div>
        </div>
      </div>

      {/* MelodyMatch intro + component */}
      <div style={{ ...styles.section, background: colors.yellow }}>
        <div style={{ padding: "24px 28px 16px", textAlign: "center" }}>
          <div style={{ ...styles.sectionTitle, color: colors.black }}>
            I design interactive explorations for music learners.
          </div>
        </div>
        <MelodyMatch />
        <div style={{ padding: "16px 28px 24px", textAlign: "center" }}>
          <a href="/explorations" className="btn" style={styles.btn}>
            More Explorations →
          </a>
        </div>
      </div>

      {/* Sound Insight */}
      <div id="sound-insight" style={{ ...styles.section, background: '#EDEAE0', padding: "28px" }}>
          <div style={{ ...styles.sectionTitle, color: colors.black, marginBottom: 20, textAlign: "center" }}>
            I publish weekly articles on musical concepts.
          </div>
          <div style={{ fontFamily: fonts.display, fontSize: 13, letterSpacing: 3, color: colors.black, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            Sound Insight: The Music Guide
            <span style={styles.dividerLine} />
          </div>
          <div style={{ ...styles.label, marginBottom: 12 }}>Top Articles</div>

          {/* Decoding Melody */}
          <a href="https://soundinsight.substack.com/p/decoding-melody" target="_blank" rel="noopener noreferrer" style={{ display: "flex", gap: 16, textDecoration: "none", ...styles.card, padding: 14, marginBottom: 18 }}>
            <div style={{ flexShrink: 0, width: 90, height: 90, overflow: "hidden", border: `1.5px solid ${colors.divider}`, background: colors.bg }}>
              <Image src="/MelodyTriangle.png" alt="Decoding Melody" width={90} height={90} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
              <div style={styles.cardTitle}>Decoding Melody</div>
              <p style={{ ...styles.bodyText, margin: 0 }}>
                A deep dive into how rhythm, pitch, and loudness come together to create melody.
              </p>
              <div style={styles.readLink}>Read on Substack →</div>
            </div>
          </a>

          {/* Scale Primer */}
          <a href="https://soundinsight.substack.com/p/scale-framework-primer" target="_blank" rel="noopener noreferrer" style={{ display: "flex", gap: 16, textDecoration: "none", ...styles.card, padding: 14, marginBottom: 18 }}>
            <div style={{ width: 90, height: 90 }}>
              <Image src="/ScaleDog.png" alt="Scale Primer" width={90} height={90} />
            </div>
            <div>
              <div style={styles.cardTitle}>Scale Primer</div>
              <p style={{ ...styles.bodyText, margin: 0 }}>
                An introduction to how pitches combine into scales.
              </p>
              <div style={styles.readLink}>Read on Substack →</div>
            </div>
          </a>

          {/* Gati Primer */}
          <a href="https://soundinsight.substack.com/p/gati-primer" target="_blank" rel="noopener noreferrer" style={{ display: "flex", gap: 16, textDecoration: "none", ...styles.card, padding: 14, marginBottom: 18 }}>
            <div style={{ width: 90, height: 90 }}>
              <Image src="/GatiPuja.png" alt="Gati Primer" width={90} height={90} />
            </div>
            <div>
              <div style={styles.cardTitle}>Gati Primer</div>
              <p style={{ ...styles.bodyText, margin: 0 }}>
                An introduction to how beats combine to become gatis.
              </p>
              <div style={styles.readLink}>Read on Substack →</div>
            </div>
          </a>

          <div style={{ textAlign: "center" }}>
            <a href="https://soundinsight.substack.com/" target="_blank" rel="noopener noreferrer" className="btn" style={styles.btn}>
              All articles →
            </a>
          </div>

          {/* Subscribe — inline after articles */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1.5px solid ${colors.divider}` }}>
            <div style={{ fontFamily: fonts.display, fontSize: 13, letterSpacing: 3, color: colors.black, marginBottom: 6 }}>
              Stay in the loop
            </div>
            <p style={{ ...styles.bodyText, margin: "0 0 14px" }}>
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
                  style={{ ...styles.formInput, width: 'auto', flex: "1 1 130px", minWidth: 0, fontSize: 11, padding: "9px 14px", border: `2px solid ${colors.divider}` }}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  required
                  style={{ ...styles.formInput, width: 'auto', flex: "2 1 180px", minWidth: 0, fontSize: 11, padding: "9px 14px", border: `2px solid ${colors.divider}` }}
                />
              </div>
              <div style={{ textAlign: "center" }}>
                <button
                  type="submit"
                  className="btn"
                  style={{ ...styles.btn, fontSize: 11, padding: "9px 18px", cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
      </div>

      {/* Lessons */}
      <div id="learn" style={{ ...styles.section, background: colors.red, padding: "28px" }}>
        <div style={{ ...styles.sectionTitle, color: '#fff', marginBottom: 8, textAlign: "center" }}>
          And I absolutely love helping others through one-on-one coaching.
        </div>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <a href="https://www.superprof.co.in/learn-from-professional-musician-how-sing-with-your-free-natural-voice.html" target="_blank" rel="noopener noreferrer" className="btn" style={{ ...styles.btn, background: '#fff' }}>Read Reviews →</a>
        </div>
        <div style={{ fontFamily: fonts.display, fontSize: 13, letterSpacing: 3, color: colors.cream, marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
          Private lessons
          <span style={{ flex: 1, height: 2, background: "rgba(238,232,208,0.35)", display: "block" }} />
        </div>
        <div className="lessons-grid">
          {CATEGORIES.map(cat => (
            <div key={cat.id} style={{ background: '#fff', border: `2px solid ${colors.black}`, padding: "20px", display: "flex", flexDirection: "column" }}>
              <a href={`/lessons?category=${cat.id}`} style={{ fontFamily: fonts.display, fontSize: 20, letterSpacing: 1, color: colors.red, lineHeight: 1.1, marginBottom: 8, textDecoration: "none", display: "inline-block", borderBottom: `2px solid ${colors.red}`, paddingBottom: 1 }}>
                {cat.title}
              </a>
              <p style={{ ...styles.bodyText, margin: "0 0 16px", flex: 1 }}>
                {cat.shortDesc}
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a href={`/lessons?category=${cat.id}`} className="btn" style={{ ...styles.btn, background: '#fff', padding: "9px 14px" }}>Learn more →</a>
                <a href={`/contact?category=${cat.id}`} className="btn" style={{ ...styles.btn, padding: "9px 14px", ...styles.btnShadow }}>Book a session →</a>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <a href="/lessons" className="btn" style={styles.btn}>See all lessons →</a>
        </div>
      </div>

</>
  );
}
