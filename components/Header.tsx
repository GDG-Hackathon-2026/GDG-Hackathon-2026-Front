"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Snowflake } from "lucide-react"; // 🔥 차가운 느낌의 아이콘 추가
import styles from "./Header.module.css";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <nav className={styles.headerNav}>
        <Link href="/" className={styles.logoContainer}>
          <div className={styles.iconCircle}>
            <Snowflake size={20} className={styles.snowflakeIcon} />
          </div>
          <span className={styles.logoText}>Polar.ai</span>
        </Link>

        <div className={styles.navLinks}>
          <Link
            href="/"
            className={`${styles.navLink} ${pathname === "/" ? styles.active : ""}`}
          >
            Home
          </Link>
          <Link
            href="/impact"
            className={`${styles.navLink} ${pathname === "/impact" ? styles.active : ""}`}
          >
            Impact
          </Link>
        </div>
      </nav>
    </header>
  );
}
