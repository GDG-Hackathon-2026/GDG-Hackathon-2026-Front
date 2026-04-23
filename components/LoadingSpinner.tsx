// components/LoadingSpinner.tsx
import React from "react";
import styles from "./LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  fullScreen?: boolean; // 화면 전체를 덮는 로딩 화면으로 사용할지 여부
  text?: string; // 로딩 중 표시할 텍스트
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "medium",
  fullScreen = false,
  text,
}) => {
  const spinnerContainerClasses = [
    styles.spinnerContainer,
    fullScreen ? styles.fullScreen : "",
  ].join(" ");

  const spinnerClasses = [styles.spinner, styles[size]].join(" ");

  const spinnerContent = (
    <div className={spinnerContainerClasses}>
      <div className={styles.spinnerWrapper}>
        <div className={spinnerClasses}></div>
        {text && <p className={styles.loadingText}>{text}</p>}
      </div>
    </div>
  );

  if (fullScreen) {
    return <div className={styles.fullScreenOverlay}>{spinnerContent}</div>;
  }

  return spinnerContent;
};

export default LoadingSpinner;
