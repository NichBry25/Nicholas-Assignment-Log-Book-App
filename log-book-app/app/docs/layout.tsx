import type { ReactNode } from "react";

import styles from "./docs.module.css";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return <div className={styles.docsRoot}>{children}</div>;
}
