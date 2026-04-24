"use client";

import { useState } from "react";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import styles from "./page.module.css";
import mockData from "../data/mockMessages.json";

export interface Message {
  id: number;
  sender: "user" | "gemini";
  text: string;
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>(mockData as Message[]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {/* 대화 내역이 뜨는 창 */}
        <ChatWindow messages={messages} isLoading={isLoading} />

        {/* 채팅을 입력하는 창 */}
        <ChatInput
          setMessages={setMessages}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </main>
    </div>
  );
}
