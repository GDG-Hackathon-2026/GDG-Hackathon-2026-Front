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
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [sidebarKey, setSidebarKey] = useState(0);

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
      {/* 🔥 Sidebar를 sidebarWrapper로 감싸서 반응형 적용 */}
      <div className={styles.sidebarWrapper}>
        <Sidebar
          key={sidebarKey}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

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
