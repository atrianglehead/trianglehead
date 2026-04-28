import { Space_Mono, Bebas_Neue } from "next/font/google";
import "./globals.css";
import "./responsive.css";
import Link from "next/link";
import StickyNav from "./components/StickyNav";

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
});

export const metadata = {
  title: "Trianglehead",
  description: "Exploring musical fluency.",
  openGraph: {
    title: "Trianglehead - Exploring musical fluency.",
    description: "Discover music, interactive learning tools, articles and private lessons with Anirudh Venkatesh.",
    url: "https://trianglehead.in",
    type: "website",
    images: [
      {
        url: "https://trianglehead.in/MelodyTriangle.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trianglehead - Exploring musical fluency.",
    description: "Discover music, interactive learning tools, articles and private lessons with Anirudh Venkatesh.",
    images: ["https://trianglehead.in/MelodyTriangle.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${bebasNeue.variable}`}>
      <body>
        <div
          className="site-wrapper"
          style={{
            maxWidth: 860,
            margin: "0 auto",
            background: "#F5F2EB",
            fontFamily: "var(--font-space-mono), monospace",
            border: "3px solid #111",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Sticky nav bar with logo */}
          <StickyNav />

          {/* Page content */}
          <div style={{ flex: 1 }}>{children}</div>

          {/* Footer */}
          <div
            className="footer-bar"
            style={{
              background: "#111",
              padding: "12px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-bebas-neue), sans-serif",
                fontSize: 14,
                letterSpacing: 2,
              }}
            >
              <span style={{ color: "#555" }}>TRI</span>
              <span style={{ color: "#444" }}>ANGLE</span>
              <span style={{ color: "#555" }}>HEAD</span>
            </span>
            <span
              style={{
                fontSize: 9,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: "#444",
              }}
            >
              © 2026 · Built to serve
            </span>
          </div>
        </div>
      </body>
    </html>
  );
}
