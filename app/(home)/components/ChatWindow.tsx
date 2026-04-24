"use client";

import { useEffect, useRef } from "react";
import { Message } from "../page";
import styles from "./ChatWindow.module.css";

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className={styles.windowContainer}>
      <div className={styles.messageList}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>무엇을 도와드릴까요?</h2>
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
              <img src="/polar.png" alt="AI Polar Bear" />
            </div>
            <div
              className={`${styles.messageBubble} ${styles.loadingIndicator}`}
            >
              답변을 작성하는 중...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
