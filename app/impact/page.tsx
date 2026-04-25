"use client";

import React, { useState, useEffect } from "react";
import { api, MeResponse, GlobalStatsResponse } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Globe, User, RefreshCw, AlertTriangle } from "lucide-react";
import styles from "./Impact.module.css";

export default function ImpactPage() {
  const { ready, user } = useAuth();
  const [myStats, setMyStats] = useState<MeResponse | null>(null);
  const [globalStats, setGlobalStats] = useState<GlobalStatsResponse | null>(
    null,
  );
  const [isResetting, setIsResetting] = useState(false);

  const loadData = async () => {
    if (!ready || !user) return;
    try {
      const [meRes, statsRes] = await Promise.all([
        api.me(),
        api.getGlobalStats(),
      ]);
      setMyStats(meRes);
      setGlobalStats(statsRes);
      localStorage.setItem("carbonState", JSON.stringify(meRes));
    } catch (e) {
      console.error("데이터 로드 실패:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, [ready, user]);

  const handleReset = async () => {
    if (!window.confirm("정말로 탄소 배출량을 초기화하시겠습니까?")) return;
    setIsResetting(true);
    try {
      const res = await api.resetCarbon();
      setMyStats(res);
      localStorage.setItem("carbonState", JSON.stringify(res));
      await loadData(); // 글로벌 통계 갱신
      alert("탄소 배출량이 성공적으로 초기화되었습니다.");
    } catch (e) {
      console.error("초기화 실패:", e);
      alert("초기화에 실패했습니다.");
    } finally {
      setIsResetting(false);
    }
  };

  if (!myStats || !globalStats) {
    return <div className={styles.loading}>데이터를 불러오는 중입니다...</div>;
  }

  const meltRatio = Math.min(1, Math.max(0, myStats.carbonUsedG));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>The Real Impact</h1>
        <p className={styles.description}>
          AI 모델 사용이 지구에 미치는 물리적 영향을 실시간으로 확인하세요.
        </p>
      </div>

      <div
        className={styles.scene}
        style={{ "--melt-ratio": meltRatio } as React.CSSProperties}
      >
        <div className={styles.glacier} />
        <div className={styles.water} />
        <div className={styles.bear}>{meltRatio < 1 ? "🐻‍❄️" : "💦"}</div>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <User size={20} className={styles.iconBlue} />
            <h2>내 탄소 발자국</h2>
          </div>
          <div className={styles.statList}>
            <div className={styles.statItem}>
              <span className={styles.label}>누적 배출량</span>
              <span className={styles.value}>
                {myStats.carbonUsedG.toFixed(3)} g
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.label}>빙하 융해율</span>
              <span className={styles.value}>{myStats.meltingPercent}%</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.label}>현재 단계</span>
              <span className={styles.value}>Stage {myStats.stage}</span>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Globe size={20} className={styles.iconGreen} />
            <h2>글로벌 통합 통계</h2>
          </div>
          <div className={styles.statList}>
            <div className={styles.statItem}>
              <span className={styles.label}>전체 누적 배출량</span>
              <span className={styles.value}>
                {globalStats.totalCarbonG.toFixed(2)} g
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.label}>손실된 해빙 면적</span>
              <span className={styles.valueDanger}>
                {globalStats.equivalents.seaIceLossM2.toFixed(4)} m²
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.label}>참여 중인 유저</span>
              <span className={styles.value}>
                {globalStats.activeUserCount} 명
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.resetSection}>
        <div className={styles.resetInfo}>
          <AlertTriangle size={20} className={styles.iconWarning} />
          <span>
            초기화 시 대화 내역은 유지되지만, 탄소 누적치만 0으로 돌아갑니다.
          </span>
        </div>
        <button
          className={styles.resetButton}
          onClick={handleReset}
          disabled={isResetting || myStats.carbonUsedG === 0}
        >
          {isResetting ? (
            "초기화 중..."
          ) : (
            <>
              <RefreshCw size={16} />
              탄소 배출량 초기화
            </>
          )}
        </button>
      </div>
    </div>
  );
}
