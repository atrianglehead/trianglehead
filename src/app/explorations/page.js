import MelodyMatch from "../components/MelodyMatch";

export const metadata = {
  title: "Explorations · Trianglehead",
  description: "Interactive music explorations for developing musical fluency.",
};

export default function Explorations() {
  return (
    <>
      {/* Page header */}
      <div style={{ padding: "28px 28px 0" }}>
        <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 48, letterSpacing: 2, color: "#111", lineHeight: 1, marginBottom: 6 }}>
          Explorations
        </div>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#555", lineHeight: 1.65, margin: "0 0 28px", borderBottom: "1.5px solid #DDD9CE", paddingBottom: 20 }}>
          Interactive experiences for developing musical fluency — pitch, rhythm, and everything in between. More coming soon.
        </p>
      </div>

      {/* MelodyMatch */}
      <div style={{ borderBottom: "3px solid #111" }}>
        <div style={{ padding: "0 28px 12px" }}>
          <div style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 13, letterSpacing: 3, color: "#E8473F", display: "flex", alignItems: "center", gap: 10 }}>
            MelodyMatch
            <span style={{ flex: 1, height: 2, background: "#111", display: "block" }} />
          </div>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#777", margin: "8px 0 0", lineHeight: 1.5 }}>
            Listen to a melody and reconstruct it — by pitch or by rhythm.
          </p>
        </div>
        <MelodyMatch />
      </div>
    </>
  );
}
