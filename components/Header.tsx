import Link from "next/link";

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
        <div className="nav-links">
          <Link href="/" className="nav-link">
            Home
          </Link>
          <Link href="/project" className="nav-link">
            Project
          </Link>
        </div>
      </nav>
    </header>
  );
}
