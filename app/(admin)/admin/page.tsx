"use client";

import React, { useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";
import styles from "./Admin.module.css";

const AdminPage = () => {
  const [showFullScreenLoading, setShowFullScreenLoading] = useState(false);

  const triggerFullScreenLoading = () => {
    setShowFullScreenLoading(true);
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

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>관리자 대시보드 (임시)</h1>
      <p className={styles.description}>
        이 페이지는 `/super-secret-admin` 경로로만 접근할 수 있습니다. 해커톤
        당일 관리자 기능(예: 사용자 관리, 데이터 통계)을 이곳에 구현하세요.
      </p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>로딩 스피너 컴포넌트 테스트</h2>

        <div className={styles.testGroup}>
          <div>
            <h3 className={styles.testItemTitle}>크기별 스피너</h3>
            <div className={styles.spinnerBox}>
              <LoadingSpinner size="small" />
              <LoadingSpinner size="medium" />
              <LoadingSpinner size="large" />
            </div>
          </div>

          <div>
            <h3 className={styles.testItemTitle}>텍스트 포함 스피너</h3>
            <div className={styles.spinnerBoxCenter}>
              <LoadingSpinner text="AI가 답변을 생성하고 있습니다..." />
            </div>
          </div>

          <div>
            <h3 className={styles.testItemTitle}>풀스크린 로딩 오버레이</h3>
            <button
              onClick={triggerFullScreenLoading}
              className="primary-button"
            >
              3초간 풀스크린 로딩 표시
            </button>
            {showFullScreenLoading && (
              <LoadingSpinner fullScreen text="데이터를 불러오는 중입니다..." />
            )}
          </div>
        </div>

        <div className={styles.toastButtons}>
          <button onClick={handleToastSuccess} className="primary-button">
            토스트 알림 (성공)
          </button>
          <button onClick={handleToastError} className="primary-button">
            토스트 알림 (실패)
          </button>
        </div>
      </section>
    </div>
  );
};

export default AdminPage;
