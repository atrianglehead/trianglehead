export const metadata = {
  title: "Contact · Trianglehead",
  description: "Get in touch with Anirudh Venkatesh.",
};

export default function Contact() {
  return (
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
  );
}
