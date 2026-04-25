"use client";

import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import styles from "./page.module.css";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export interface Message {
  id: number;
  sender: "user" | "gemini";
  text: string;
}

export default function HomePage() {
  const { ready, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [sidebarKey, setSidebarKey] = useState(0);

  // 🔥 탄소 및 UI 상태 관리
  const [carbonState, setCarbonState] = useState({
    totalCarbonG: 0,
    stage: 0,
    meltingPercent: 0,
    maxInputTokens: 8192,
  });

  // 초기 접속 시 내 탄소 상태 가져오기
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
    // 🧊 style 속성에 CSS 변수를 주입하여 녹아내림 효과 연동 준비
    <div
      className={styles.container}
      style={
        {
          "--melting-intensity": `${carbonState.stage * 20 + carbonState.meltingPercent * 0.2}%`,
          "--blur-amount": `${carbonState.stage * 0.5}px`,
        } as React.CSSProperties
      }
    >
      <Sidebar
        key={sidebarKey}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <main className={styles.main}>
        <ChatWindow
          selectedId={selectedId}
          messages={messages}
          setMessages={setMessages}
          isLoading={isLoading}
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
