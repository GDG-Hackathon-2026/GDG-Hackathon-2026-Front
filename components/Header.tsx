import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.headerNav}>
        {/* 로고 영역에 SVG와 텍스트 함께 배치 */}
        <Link href="/" className={styles.logoContainer}>
          <span className={styles.logoText}>Polar.ai</span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
          <Link href="/impact" className={styles.navLink}>
            Impact
          </Link>
        </div>
      </nav>
    </header>
  );
}
