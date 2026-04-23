"use client";

import HeroSection from "./components/HeroSection";

export default function HomePage() {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <HeroSection />
    </div>
  );
}
