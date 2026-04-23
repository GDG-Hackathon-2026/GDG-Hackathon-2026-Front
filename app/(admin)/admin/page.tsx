// app/(admin)/admin/page.tsx
"use client"; // 클라이언트 컴포넌트

import React, { useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";

const AdminPage = () => {
  const [showFullScreenLoading, setShowFullScreenLoading] = useState(false);

  const triggerFullScreenLoading = () => {
    setShowFullScreenLoading(true);
    // 3초 후 자동으로 로딩 화면 닫기
    setTimeout(() => {
      setShowFullScreenLoading(false);
    }, 3000);
  };
  const handleToastSuccess = () => {
    toast.success("토스트 테스트 완료");
  };
  const handleToastError = () => {
    toast.error("에러 발생");
  };
  //   const handleToastPromise = () => {
  //     toast.promise(fetchData, {
  //       loading: "불러오는 중...",
  //       success: "완료",
  //       error: "실패",
  //     });
  //   };

  return (
    <div style={{ padding: "40px" }}>
      <h1
        style={{
          fontSize: "32px",
          fontWeight: 800,
          marginBottom: "24px",
          color: "var(--color-primary)",
        }}
      >
        관리자 대시보드 (임시)
      </h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "40px" }}>
        이 페이지는 `/super-secret-admin` 경로로만 접근할 수 있습니다. 해커톤
        당일 관리자 기능(예: 사용자 관리, 데이터 통계)을 이곳에 구현하세요.
      </p>

      {/* 로딩 스피너 테스트 섹션 */}
      <section style={{ marginBottom: "60px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px" }}>
          로딩 스피너 컴포넌트 테스트
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          {/* 다양한 크기 */}
          <div>
            <h3 style={{ marginBottom: "10px" }}>크기별 스피너</h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                border: "1px solid var(--color-border)",
                padding: "20px",
                borderRadius: "8px",
              }}
            >
              <LoadingSpinner size="small" />
              <LoadingSpinner size="medium" />
              <LoadingSpinner size="large" />
            </div>
          </div>

          {/* 텍스트 포함 */}
          <div>
            <h3 style={{ marginBottom: "10px" }}>텍스트 포함 스피너</h3>
            <div
              style={{
                border: "1px solid var(--color-border)",
                padding: "20px",
                borderRadius: "8px",
                minHeight: "150px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <LoadingSpinner text="AI가 답변을 생성하고 있습니다..." />
            </div>
          </div>

          {/* 풀스크린 테스트 */}
          <div>
            <h3 style={{ marginBottom: "10px" }}>풀스크린 로딩 오버레이</h3>
            <button
              onClick={triggerFullScreenLoading}
              className="primary-button" /* 이전에 globals.css에 정의한 스타일 */
              style={{ width: "auto" }}
            >
              3초간 풀스크린 로딩 표시
            </button>
            {showFullScreenLoading && (
              <LoadingSpinner fullScreen text="데이터를 불러오는 중입니다..." />
            )}
          </div>
        </div>
        <button
          onClick={handleToastSuccess}
          className="primary-button"
          style={{ marginTop: "20px" }}
        >
          토스트 알림 (성공)
        </button>
        <button
          onClick={handleToastError}
          className="primary-button"
          style={{ marginTop: "20px" }}
        >
          토스트 알림 (실패)
        </button>
      </section>
    </div>
  );
};

export default AdminPage;
