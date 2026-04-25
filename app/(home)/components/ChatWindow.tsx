"use client";

import { useEffect, useRef, Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { Message } from "../page";
import { api } from "../../lib/api";
import styles from "./ChatWindow.module.css";

const BASE_MAX_LENGTH = 500; // 🔥 ChatInput과 동일한 기준

interface ChatWindowProps {
  selectedId: number | null;
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  isLoading: boolean;
  totalCarbonG: number; // 🔥 부모로부터 전달받음
}

export default function ChatWindow({
  selectedId,
  messages,
  setMessages,
  isLoading,
  totalCarbonG,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🔥 현재 허용된 최대 글자 수 계산
  const currentMaxLength = Math.max(
    0,
    Math.floor(BASE_MAX_LENGTH * (1 - totalCarbonG)),
  );

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const data = await api.getConversation(selectedId);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSuggestionClick = (text: string) => {
    // 🔥 혹시라도 클릭됐을 때 방어 로직
    if (text.length > currentMaxLength) return;
    const event = new CustomEvent("suggestionClicked", { detail: text });
    window.dispatchEvent(event);
  };

  // 🔥 템플릿 렌더링을 깔끔하게 해주는 헬퍼 함수
  const renderSuggestion = (icon: string, text: string) => {
    const isDisabled = text.length > currentMaxLength;
    return (
      <div
        className={`${styles.suggestionCard} ${
          isDisabled ? styles.disabledCard : ""
        }`}
        onClick={() => !isDisabled && handleSuggestionClick(text)}
      >
        <span className={styles.cardIcon}>{icon}</span>
        <p>{text}</p>
      </div>
    );
  };

  return (
    <div className={styles.windowContainer}>
      <div className={styles.messageList}>
        {!selectedId && messages.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.logoWrapper}>
              <Image
                src="/polar.png"
                alt="Polar.ai"
                width={80}
                height={80}
                className={styles.emptyLogo}
              />
            </div>
            <h2 className={styles.emptyTitle}>어떤 도움이 필요하신가요?</h2>
            <p className={styles.emptySubtitle}>
              아! 근데 도움을 드리진 않습니다!
            </p>

            <div className={styles.suggestionGrid}>
              {/* 🔥 헬퍼 함수로 깔끔하게 렌더링 */}
              {renderSuggestion("🌍", "빙수와 빙하의 공통점")}
              {renderSuggestion("🧊", "북극곰의 생태계와 빙하의 관계")}
              {renderSuggestion("💻", "효율적인 코드 작성으로 전력 아끼기")}
              {renderSuggestion("🌱", "지속 가능한 IT 기술 트렌드 5가지")}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.messageWrapper} ${styles[msg.sender]}`}
            >
              {msg.sender === "gemini" && (
                <div className={styles.profilePic}>
                  <Image
                    src="/polar.png"
                    alt="AI Polar Bear"
                    width={40}
                    height={40}
                  />
                </div>
              )}
              <div className={styles.messageBubble}>{msg.text}</div>
            </div>
          ))
        )}

        {isLoading && (
          <div className={`${styles.messageWrapper} ${styles.gemini}`}>
            <div className={styles.profilePic}>
              <Image src="/polar.png" alt="AI" width={40} height={40} />
            </div>
            <div className={`${styles.messageBubble} ${styles.loadingBubble}`}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
