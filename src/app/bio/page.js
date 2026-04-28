import BioProse from '@/content/bio.mdx'
import { colors, fonts, styles } from '../styles';

export const metadata = {
  title: "Bio · Trianglehead",
  description: "About Anirudh Venkatesh — musician, educator, and explorer of musical traditions.",
};

export default function Bio() {
  return (
    <div style={{ padding: "40px 48px", maxWidth: 680 }}>
      <div style={{ ...styles.pageTitle, marginBottom: 8 }}>
        Anirudh Venkatesh
      </div>
      <div style={{ ...styles.label, letterSpacing: 2.5, color: colors.red, marginBottom: 32 }}>
        Musician · Explorer · Educator
      </div>

      <BioProse />

      {/* Links */}
      <div style={{ marginTop: 36, display: "flex", flexWrap: "wrap", gap: 10 }}>
        {[
          { label: "Sound Insight →", href: "https://soundinsight.substack.com/" },
          { label: "YouTube →", href: "https://www.youtube.com/@trianglehead" },
          { label: "Lessons →", href: "/lessons" },
          { label: "Contact →", href: "/contact" },
        ].map((item) => {
          const isExternal = item.href.startsWith("http");
          return (
            <a
              key={item.href}
              href={item.href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              style={{ ...styles.btn, background: 'transparent' }}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
