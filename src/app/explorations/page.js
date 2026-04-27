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
        <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#555", lineHeight: 1.65, margin: "0 0 28px" }}>
          Develop musical fluency by directly engaging with musical concepts like pitch, time and volume. More coming soon.
        </p>
      </div>

      {/* MelodyMatch */}
      <div style={{ borderBottom: "3px solid #111" }}>
        <MelodyMatch />
      </div>
    </>
  );
}
