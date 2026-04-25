"use client";

import { useEffect, useRef, Dispatch, SetStateAction } from "react";
import Image from "next/image";
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

  // 🔥 추천 질문 클릭 시 커스텀 이벤트 발송
  const handleSuggestionClick = (text: string) => {
    const event = new CustomEvent("suggestionClicked", { detail: text });
    window.dispatchEvent(event);
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
              {/* 🔥 onClick 이벤트 연결 */}
              <div
                className={styles.suggestionCard}
                onClick={() => handleSuggestionClick("빙수와 빙하의 공통점")}
              >
                <span className={styles.cardIcon}>🌍</span>
                <p>빙수와 빙하의 공통점</p>
              </div>
              <div
                className={styles.suggestionCard}
                onClick={() =>
                  handleSuggestionClick("북극곰의 생태계와 빙하의 관계")
                }
              >
                <span className={styles.cardIcon}>🧊</span>
                <p>북극곰의 생태계와 빙하의 관계</p>
              </div>
              <div
                className={styles.suggestionCard}
                onClick={() =>
                  handleSuggestionClick("효율적인 코드 작성으로 전력 아끼기")
                }
              >
                <span className={styles.cardIcon}>💻</span>
                <p>효율적인 코드 작성으로 전력 아끼기</p>
              </div>
              <div
                className={styles.suggestionCard}
                onClick={() =>
                  handleSuggestionClick("지속 가능한 IT 기술 트렌드 5가지")
                }
              >
                <span className={styles.cardIcon}>🌱</span>
                <p>지속 가능한 IT 기술 트렌드 5가지</p>
              </div>
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
