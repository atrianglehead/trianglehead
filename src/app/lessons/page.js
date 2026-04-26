const LESSONS = [
  {
    title: "Free Your Voice",
    lessonParam: "voice",
    tagline: "Singing & Voice",
    desc: "Use your voice like it was meant to be used — an extension of you in the world. Most of us have been conditioned out of singing, told we're \"not singers\", or simply never given the tools to explore our own voice. These sessions are about undoing that, and reconnecting with one of the most expressive instruments you already own.",
    covers: [
      "Natural voice production and breath support",
      "Pitch accuracy and ear training",
      "Scales, ragas and melodic vocabulary",
      "Improvisation and finding your own sound",
      "Song learning and musical expression",
    ],
    reviewsLink: "https://www.superprof.co.in/learn-from-professional-musician-how-sing-with-your-free-natural-voice.html",
  },
  {
    title: "Connect With Your Instrument",
    lessonParam: "instrument",
    tagline: "Guitar · Cello · Flute",
    desc: "Make your instrument an inalienable part of you — like another voice. Whether you're picking up guitar, cello or flute for the first time, or looking to deepen an existing relationship with your instrument, the goal is the same: fluency. Not just technique, but the ability to express musical thought through the instrument naturally and spontaneously.",
    covers: [
      "Technique and posture tailored to the instrument",
      "Reading and internalising music",
      "Scales, modes and melodic vocabulary",
      "Improvisation and creative exploration",
      "Repertoire building across styles",
    ],
    reviewsLink: "https://www.superprof.co.in/learn-how-use-music-like-language-from-full-time-musician.html",
  },
  {
    title: "Understand Music",
    lessonParam: "musicianship",
    tagline: "Theory · Ear Training · Improvisation",
    desc: "Understand and respond to musical thoughts like you're speaking a language. Music theory, ear training and improvisation are often taught in isolation — but they're really the same skill: hearing what's happening and knowing how to respond. These sessions build the inner musical mind, so that music stops being something you decode and starts being something you speak.",
    covers: [
      "Intervals, scales, chords and harmony",
      "Rhythmic understanding and time feel",
      "Ear training: singing, transcribing, dictation",
      "Improvisation across styles and contexts",
      "Composition and musical structure",
    ],
    reviewsLink: "https://www.superprof.co.in/learn-how-use-music-like-language-from-full-time-musician.html",
  },
];

export default function LessonsPage() {
  return (
    <div style={{ padding: "40px 32px", maxWidth: 620 }}>

      {/* Page title */}
      <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 48, letterSpacing: 2, color: "#111", lineHeight: 1, marginBottom: 8 }}>
        Lessons
      </div>
      <p style={{ fontFamily: "Georgia, serif", fontSize: 14, color: "#555", lineHeight: 1.7, fontStyle: "italic", marginBottom: 40, marginTop: 0 }}>
        One-on-one coaching tailored to where you are and where you want to go.
      </p>

      {/* Lesson cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {LESSONS.map((lesson) => (
          <div key={lesson.title} style={{ border: "2px solid #111", background: "#fff" }}>

            {/* Card header */}
            <div style={{ background: "#E8473F", padding: "16px 20px", borderBottom: "2px solid #111" }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>
                {lesson.tagline}
              </div>
              <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 28, letterSpacing: 1.5, color: "#fff", lineHeight: 1 }}>
                {lesson.title}
              </div>
            </div>

            {/* Card body */}
            <div style={{ padding: "20px 20px 24px" }}>
              <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#333", lineHeight: 1.75, margin: "0 0 20px" }}>
                {lesson.desc}
              </p>

              {/* What's covered */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#888", marginBottom: 10 }}>
                  What we work on
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                  {lesson.covers.map((item) => (
                    <li key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ color: "#E8473F", fontWeight: 700, flexShrink: 0, fontSize: 12, lineHeight: "18px" }}>—</span>
                      <span style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#444", lineHeight: 1.6 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a
                  href={lesson.reviewsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#111", textDecoration: "none", border: "2px solid #111", padding: "10px 18px", display: "inline-block", background: "#F5F2EB" }}
                >
                  Read Reviews →
                </a>
                <a
                  href={`/contact?lesson=${lesson.lessonParam}`}
                  className="btn"
                  style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#111", textDecoration: "none", border: "2px solid #111", padding: "10px 18px", display: "inline-block", background: "#F5C842", color: "#111", boxShadow: "3px 3px 0 #111" }}
                >
                  Book a session →
                </a>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Bottom note */}
      <div style={{ marginTop: 40, paddingTop: 28, borderTop: "2px solid #CCC8BC" }}>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#555", lineHeight: 1.75, margin: "0 0 16px", fontStyle: "italic" }}>
          All lessons happen online, from the comfort of your home. Reach out with any questions — you don't need to be ready, just curious.
        </p>
        <a
          href="/contact"
          className="btn"
          style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#111", textDecoration: "none", border: "2px solid #111", padding: "10px 18px", display: "inline-block", background: "#F5C842" }}
        >
          Get in touch →
        </a>
      </div>

    </div>
  );
}
