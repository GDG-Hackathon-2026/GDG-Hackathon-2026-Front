// app/(admin)/layout.tsx
import React from "react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          {/* 관리자 사이드바 */}
          <nav
            style={{
              width: "250px",
              backgroundColor: "var(--color-bg-secondary)",
              padding: "30px",
              borderRight: "1px solid var(--color-border)",
            }}
          >
            <Link
              href="/"
              style={{
                display: "block",
                fontWeight: 800,
                fontSize: "20px",
                marginBottom: "40px",
                color: "var(--color-primary)",
              }}
            >
              메인으로
            </Link>
            <Link
              href="/admin"
              style={{
                display: "block",
                padding: "10px 0",
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              관리자 홈
            </Link>
          </nav>

          {/* 관리자 페이지 콘텐츠 */}
          <main style={{ flex: 1, backgroundColor: "var(--color-bg-primary)" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
