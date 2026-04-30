import SvaraRising from "../../components/SvaraRising";
import { styles } from "../../styles";

export const metadata = {
  title: "Svara Rising · Trianglehead",
  description: "A pitch recognition game.",
};

export default function SvaraRisingPage() {
  return (
    <div style={styles.section}>
      <SvaraRising />
    </div>
  );
}
