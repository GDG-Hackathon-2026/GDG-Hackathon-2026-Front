import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.headerNav}>
        <Link href="/" className={styles.logo}>
          HACKATHON
        </Link>
        <div className={styles.navLinks}>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
          <Link href="/project" className={styles.navLink}>
            Project
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
