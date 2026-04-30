import MelodyMatch from "../../components/MelodyMatch";
import { styles } from "../../styles";

export const metadata = {
  title: "Melody Match · Trianglehead",
  description: "An interactive melody-matching exploration.",
};

export default function MelodyMatchPage() {
  return (
    <div style={styles.section}>
      <MelodyMatch />
    </div>
  );
}
