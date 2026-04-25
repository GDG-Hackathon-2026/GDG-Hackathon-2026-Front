"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import styles from "./ChatInput.module.css";

const MAX_LENGTH = 500;

interface ChatInputProps {
  selectedId: number | null;
  onConversationCreated: (id: number) => void;
  setMessages: any;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  // 🔥 탄소 상태 업데이트를 위한 함수 추가
  onCarbonUpdate: (state: any) => void;
}

export default function ChatInput({
  selectedId,
  onConversationCreated,
  setMessages,
  isLoading,
  setIsLoading,
  onCarbonUpdate,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const { ready, user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !ready || !user) return;

    const currentInput = input;
    setInput("");
    setIsLoading(true);

    // 1. 유저 메시지 즉시 렌더링
    setMessages((prev: any) => [
      ...prev,
      { id: Date.now(), sender: "user", text: currentInput },
    ]);

    try {
      let activeId = selectedId;

      // 2. 방이 없다면 생성부터 (POST /api/conversations)
      if (!activeId) {
        const newConv = await api.createConversation(
          currentInput.substring(0, 15),
        );
        activeId = newConv.id;
        onConversationCreated(activeId);
      }

      // 3. 메시지 전송 및 Gemini 호출 (POST /api/conversations/{id}/messages)
      const result = await api.sendMessage(activeId, currentInput);

      // 4. AI 답변 렌더링
      setMessages((prev: any) => [
        ...prev,
        {
          id: result.assistantMessage.id,
          sender: "gemini",
          text: result.assistantMessage.content,
        },
      ]);

      // 5. 🧊 중요: 탄소 상태 업데이트 (UI 녹아내림 강도 조절용)
      onCarbonUpdate(result.carbonState);

      if (result.truncated) {
        console.warn("입력 토큰 제한으로 인해 컨텍스트가 일부 잘렸습니다.");
      }
    } catch (error: any) {
      console.error("전송 에러:", error);
      if (error.message.includes("402")) {
        alert(
          "🚨 탄소 배출량이 한계치에 도달하여 북극곰의 터전이 모두 녹았습니다. 더 이상 메시지를 보낼 수 없습니다.",
        );
      } else {
        alert("메시지 전송에 실패했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
            maxLength={MAX_LENGTH}
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
        <div className={styles.inputFooter}>
          <div className={styles.footerText}>AI는 실수를 할 수 있습니다.</div>
          <div className={styles.charCount}>
            {input.length} / {MAX_LENGTH}
          </div>
        </div>
      </div>
    </div>
  );
}
