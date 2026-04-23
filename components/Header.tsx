import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="header">
      <nav className="header-nav">
        <Link
          href="/"
          style={{ fontWeight: 800, fontSize: "20px", letterSpacing: "-0.5px" }}
        >
          HACKATHON
        </Link>
        <div className="nav-links" style={{ alignItems: "center" }}>
          <Link href="/" className="nav-link">
            Home
          </Link>
          <Link href="/project" className="nav-link">
            Project
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
