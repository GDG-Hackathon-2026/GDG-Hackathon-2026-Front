"use client";

import React, { useState, useEffect } from "react";
import styles from "./Impact.module.css";

// 과학적 근거 기반 상수
const ACTIVE_AI_USERS = 200_000_000; // 글로벌 AI 사용자 (2억명)
const DAYS_IN_YEAR = 365;
const ICE_MELT_PER_TON_M2 = 3; // CO2 1톤당 3m^2 융해 (Science, 2016)
const SOCCER_FIELD_M2 = 7140; // 축구장 1개 면적 (m^2)

export default function ImpactPage() {
  const [carbonData, setCarbonData] = useState({
    totalCarbonG: 0,
    meltingPercent: 0, // 이제 시각화 UI용 보조 수치로만 사용
  });

  useEffect(() => {
    const loadCarbonData = () => {
      const saved = localStorage.getItem("carbonState");
      if (saved) {
        try {
          setCarbonData(JSON.parse(saved));
        } catch (e) {
          console.error("데이터 로드 실패:", e);
        }
      }
    };
    loadCarbonData();
    window.addEventListener("storage", loadCarbonData);
    return () => window.removeEventListener("storage", loadCarbonData);
  }, []);

  const { totalCarbonG } = carbonData;

  // 🌍 팩트 기반 계산 로직
  // 1. 당신의 배출량을 하루 배출량으로 가정하여 전 세계가 1년 동안 쓴다면?
  const annualGlobalCarbonTons =
    (totalCarbonG * ACTIVE_AI_USERS * DAYS_IN_YEAR) / 1_000_000;

  // 2. 실제로 녹아내리는 빙하의 면적 (m^2)
  const meltedIceM2 = annualGlobalCarbonTons * ICE_MELT_PER_TON_M2;

  // 3. 축구장 개수로 환산
  const meltedSoccerFields = Math.floor(meltedIceM2 / SOCCER_FIELD_M2);

  // 시각화용 높이 계산 (축구장 200개를 최대치로 설정하여 애니메이션 조절)
  const visualScale = Math.min((meltedSoccerFields / 200) * 100, 100);
  const glacierHeight = 300 - visualScale * 2.4;
  const waterHeight = 40 + visualScale * 1.6;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>The Real Impact</h1>
        <p className={styles.description}>
          전 세계 2억 명의 사용자가 당신처럼 AI를 1년간 사용한다면 발생하는{" "}
          <strong>실제 물리적 변화</strong>입니다.
        </p>
      </div>

      <div className={styles.scene}>
        {/* 빙하 */}
        <div
          className={styles.glacier}
          style={{ height: `${glacierHeight}px` }}
        >
          {visualScale < 100 && (
            <span
              style={{
                position: "absolute",
                top: "-30px",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "32px",
                opacity: 1 - visualScale / 100,
              }}
            >
              🐻‍❄️
            </span>
          )}
        </div>
        {/* 해수면 */}
        <div className={styles.water} style={{ height: `${waterHeight}px` }} />
      </div>

      <div className={styles.statsCard}>
        <div className={styles.statItem}>
          <span className={styles.label}>나의 1회 사용 탄소량</span>
          <span className={styles.value}>{totalCarbonG.toFixed(3)}g</span>
        </div>
        <div
          className={styles.statItem}
          style={{
            borderTop: "1px solid var(--color-border)",
            paddingTop: "12px",
            marginTop: "12px",
          }}
        >
          <span className={styles.label}>지구 연간 빙하 손실 면적</span>
          <span className={styles.value}>
            {meltedIceM2.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}{" "}
            m²
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.label}>환산 크기</span>
          <span className={styles.value} style={{ color: "#ef4444" }}>
            축구장 {meltedSoccerFields.toLocaleString()}개
          </span>
        </div>

        <div className={styles.infoText}>
          ※ Science (Notz & Stroeve, 2016) 연구 기반: 이산화탄소 1톤당 3m²의
          해빙 융해
        </div>
      </div>
    </div>
  );
}
