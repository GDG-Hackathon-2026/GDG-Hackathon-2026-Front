import Link from "next/link";
import styles from "./Header.module.css";

// 기하학적 북극곰 SVG 로고 컴포넌트
const PolarBearLogo = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={styles.svgLogo}
  >
    {/* 북극곰 얼굴 윤곽 (기하학적 다각형) */}
    <polygon
      points="10,35 25,15 75,15 90,35 85,75 50,95 15,75"
      fill="#f0f9ff"
    />

    {/* 귀 (각진 형태) */}
    <polygon points="10,35 5,15 25,15" fill="#e0f2fe" />
    <polygon points="90,35 95,15 75,15" fill="#e0f2fe" />
    <polygon points="15,25 10,20 20,20" fill="#bae6fd" />
    <polygon points="85,25 90,20 80,20" fill="#bae6fd" />

    {/* 무심한 눈 */}
    <circle cx="30" cy="45" r="5" fill="#0c4a6e" />
    <circle cx="70" cy="45" r="5" fill="#0c4a6e" />

    {/* 커다란 코 */}
    <path
      d="M35,60 C35,45 65,45 65,60 C65,70 50,75 50,75 C50,75 35,70 35,60 Z"
      fill="#0c4a6e"
    />

    {/* 시니컬한 일자 입 */}
    <rect x="42" y="80" width="16" height="4" rx="2" fill="#0c4a6e" />
  </svg>
);

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.headerNav}>
        {/* 로고 영역에 SVG와 텍스트 함께 배치 */}
        <Link href="/" className={styles.logoContainer}>
          {/* <PolarBearLogo /> */}
          <span className={styles.logoText}>Polar.ai</span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
          <Link href="/project" className={styles.navLink}>
            Project
          </Link>
        </div>
      </nav>
    </header>
  );
}
