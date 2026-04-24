"use client";

import { useEffect, useRef, Dispatch, SetStateAction } from "react";
import { Message } from "../page";
import { api } from "../../lib/api";
import styles from "./ChatWindow.module.css";

interface ChatWindowProps {
  selectedId: number | null;
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  isLoading: boolean;
}

export default function ChatWindow({
  selectedId,
  messages,
  setMessages,
  isLoading,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. 방이 바뀌면 메시지 목록 새로고침
  useEffect(() => {
    if (!selectedId) {
      setMessages([]); // 선택된 방이 없으면 비우기
      return;
    }

    const fetchMessages = async () => {
      try {
        const data = await api.getConversation(selectedId);
        // API의 Message 형식을 우리 UI 형식으로 매핑
        const mappedMessages: Message[] = data.messages.map((m) => ({
          id: m.id,
          sender: m.role === "USER" ? "user" : "gemini",
          text: m.content,
        }));
        setMessages(mappedMessages);
      } catch (error) {
        console.error("메시지 로드 실패:", error);
      }
    };

    fetchMessages();
  }, [selectedId, setMessages]);

  // 2. 스크롤 하단 고정
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className={styles.windowContainer}>
      <div className={styles.messageList}>
        {!selectedId && messages.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>Polar.ai에 오신 것을 환영합니다</h2>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.messageWrapper} ${styles[msg.sender]}`}
            >
              {msg.sender === "gemini" && (
                <div className={styles.profilePic}>
                  <img src="/polar.png" alt="AI Polar Bear" />
                </div>
              )}
              <div className={styles.messageBubble}>{msg.text}</div>
            </div>
          ))
        )}
        {isLoading && (
          <div className={`${styles.messageWrapper} ${styles.gemini}`}>
            <div className={styles.profilePic}>
              <img src="/polar.png" alt="AI" />
            </div>
            <div
              className={`${styles.messageBubble} ${styles.loadingIndicator}`}
            >
              답변 중...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
