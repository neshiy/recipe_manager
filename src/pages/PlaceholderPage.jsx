import { Link } from "react-router-dom";
import styles from "../styles/ui.module.css";

export default function PlaceholderPage({ title }) {
  return (
    <div className={styles.card}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.h1}>{title}</h1>
          <p className={styles.muted}>This section is UI-only for now.</p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.buttonSecondary} to="/">
            Back
          </Link>
        </div>
      </div>
    </div>
  );
}
