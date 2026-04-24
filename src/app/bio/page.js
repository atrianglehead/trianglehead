import BioProse from '@/content/bio.mdx'

export const metadata = {
  title: "Bio · Trianglehead",
  description: "About Anirudh Venkatesh — musician, educator, and explorer of musical traditions.",
};

export default function Bio() {
  return (
    <div style={{ padding: "40px 48px", maxWidth: 680 }}>
      <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 48, letterSpacing: 2, color: "#111", lineHeight: 1, marginBottom: 8 }}>
        Anirudh Venkatesh
      </div>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "#E8473F", marginBottom: 32 }}>
        Musician · Explorer · Educator
      </div>

      <BioProse />

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
  );
}
