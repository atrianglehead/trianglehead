import MelodyMatch from "../components/MelodyMatch";
import { styles } from "../styles";

export const metadata = {
  title: "Explorations · Trianglehead",
  description: "Interactive music explorations for developing musical fluency.",
};

export default function Explorations() {
  return (
    <>
      {/* Page header */}
      <div style={{ padding: "28px 28px 0" }}>
        <div style={{ ...styles.pageTitle, marginBottom: 6 }}>
          Explorations
        </div>
        <p style={{ ...styles.bodyText, margin: "0 0 28px" }}>
          Develop musical fluency by directly engaging with musical concepts like pitch, time and volume. More coming soon.
        </p>
      </div>

      {/* MelodyMatch */}
      <div style={styles.section}>
        <MelodyMatch />
      </div>
    </>
  );
}
