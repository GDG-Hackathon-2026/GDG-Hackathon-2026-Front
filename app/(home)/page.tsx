"use client";

import HeroSection from "./components/HeroSection";
import { toast } from "sonner";

export default function HomePage() {
  const handleTestToast = () => {
    toast.success("토스트 테스트 완료");
    // toast.error('에러 발생');
    // toast.promise(fetchData, { loading: '불러오는 중...', success: '완료', error: '실패' });
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <HeroSection />
      <button
        onClick={handleTestToast}
        className="primary-button"
        style={{ marginTop: "20px" }}
      >
        토스트 알림 띄우기
      </button>
    </div>
  );
}
