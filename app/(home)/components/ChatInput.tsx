"use client";

import { useState, useRef } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import styles from "./ChatInput.module.css";

interface ChatInputProps {
  selectedId: number | null;
  onConversationCreated: (id: number) => void;
  setMessages: any;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function ChatInput({
  selectedId,
  onConversationCreated,
  setMessages,
  isLoading,
  setIsLoading,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const { ready, user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !ready || !user) return;

    const currentInput = input;
    setInput("");
    setIsLoading(true);

    // 유저 메시지 선 반영
    setMessages((prev: any) => [
      ...prev,
      { id: Date.now(), sender: "user", text: currentInput },
    ]);

    try {
      let activeId = selectedId;

      // 1. 선택된 방이 없으면 새 방 생성
      if (!activeId) {
        // 첫 메시지의 앞부분을 제목으로 사용
        const newConv = await api.createConversation(
          currentInput.substring(0, 15),
        );
        activeId = newConv.id;
        onConversationCreated(activeId);
      }

      // 2. 메시지 전송 및 Gemini 호출
      const result = await api.sendMessage(activeId, currentInput);

      // 3. 답변 반영
      setMessages((prev: any) => [
        ...prev,
        {
          id: result.assistantMessage.id,
          sender: "gemini",
          text: result.assistantMessage.content,
        },
      ]);

      // 탄소 데이터는 추후 UI 연동 시 사용 (result.carbonState)
    } catch (error) {
      console.error("전송 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.inputContainer}>
      <div className={styles.inputWrapper}>
        <div className={styles.inputBox}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            disabled={isLoading}
            rows={1}
          />
          <button
            className={styles.sendButton}
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
