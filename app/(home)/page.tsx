"use client";

import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import styles from "./page.module.css";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Menu } from "lucide-react";

export interface Message {
  id: number;
  sender: "user" | "gemini";
  text: string;
}

export default function HomePage() {
  const { ready, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [sidebarKey, setSidebarKey] = useState(0);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // 🔥 현재 선택된 채팅방 이름을 관리하는 상태 (기본값: 새로운 대화)
  const [activeTitle, setActiveTitle] = useState("새로운 대화");

  const [carbonState, setCarbonState] = useState({
    totalCarbonG: 0,
    stage: 0,
    meltingPercent: 0,
    maxInputTokens: 8192,
  });

  useEffect(() => {
    if (ready && user) {
      api.me().then((me) => {
        setCarbonState({
          totalCarbonG: me.carbonUsedG,
          stage: me.stage,
          meltingPercent: me.meltingPercent,
          maxInputTokens: me.maxInputTokens,
        });
      });
    }
  }, [ready, user]);

  const handleConversationCreated = (id: number) => {
    setSelectedId(id);
    setSidebarKey((prev) => prev + 1);
  };

  return (
    <div
      className={styles.container}
      style={
        {
          "--melting-intensity": `${carbonState.stage * 20 + carbonState.meltingPercent * 0.2}%`,
          "--blur-amount": `${carbonState.stage * 0.5}px`,
        } as React.CSSProperties
      }
    >
      <div className={styles.mobileHeader}>
        <button
          className={styles.menuButton}
          onClick={() => setIsMobileSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
        {/* 🔥 하드코딩된 텍스트 대신 동적 제목 렌더링 */}
        <span className={styles.mobileTitle}>{activeTitle}</span>
      </div>

      {isMobileSidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div
        className={`${styles.sidebarWrapper} ${
          isMobileSidebarOpen ? styles.open : ""
        }`}
      >
        <Sidebar
          key={sidebarKey}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id);
            setIsMobileSidebarOpen(false);
          }}
          onTitleChange={setActiveTitle} /* 🔥 Sidebar로부터 제목 받아오기 */
        />
      </div>

      <main className={styles.main}>
        <ChatWindow
          selectedId={selectedId}
          messages={messages}
          setMessages={setMessages}
          isLoading={isLoading}
          totalCarbonG={carbonState.totalCarbonG}
        />
        <ChatInput
          selectedId={selectedId}
          onConversationCreated={handleConversationCreated}
          setMessages={setMessages}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          onCarbonUpdate={setCarbonState}
        />
      </main>
    </div>
  );
}
