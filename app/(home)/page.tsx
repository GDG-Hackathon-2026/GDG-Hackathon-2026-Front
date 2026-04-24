"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import styles from "./page.module.css";

export interface Message {
  id: number;
  sender: "user" | "gemini";
  text: string;
}

export default function HomePage() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [sidebarKey, setSidebarKey] = useState(0); // 사이드바 새로고침용 키

  const handleConversationCreated = (id: number) => {
    setSelectedId(id);
    setSidebarKey((prev) => prev + 1); // 방 목록 다시 불러오기
  };

  return (
    <div className={styles.container}>
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
        />
      </main>
    </div>
  );
}
