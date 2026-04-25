"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import styles from "./ChatInput.module.css";
import { Message } from "../page";

const BASE_MAX_LENGTH = 500;

interface ChatInputProps {
  selectedId: number | null;
  onConversationCreated: (id: number) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onCarbonUpdate: (state: {
    totalCarbonG: number;
    stage: number;
    meltingPercent: number;
    maxInputTokens: number;
  }) => void;
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

  // 🔥 로컬에서 관리할 탄소 상태 추가
  const [localCarbon, setLocalCarbon] = useState<{
    meltingPercent: number;
  } | null>(null);

  // 1. 초기 로드 시 로컬 스토리지에서 상태 가져오기
  useEffect(() => {
    const savedCarbon = localStorage.getItem("carbonState");
    if (savedCarbon) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalCarbon(JSON.parse(savedCarbon));
      } catch (e) {
        console.error("탄소 상태 파싱 실패:", e);
      }
    }
  }, []);

  // 2. 동적 글자수 계산 (0% = 500자, 100% = 0자)
  const currentMaxLength = localCarbon
    ? Math.max(
        0,
        Math.floor(BASE_MAX_LENGTH * (1 - localCarbon.meltingPercent / 100)),
      )
    : BASE_MAX_LENGTH;

  // 🐻‍❄️ 북극곰 변이 로직
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart;

    if (val.length > input.length) {
      if (Math.random() < 0.2) {
        const before = val.slice(0, cursor - 1);
        const after = val.slice(cursor);
        setInput(before + "🐻‍❄️" + after);
        return;
      }
    }
    setInput(val);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !ready || !user) return;

    const currentInput = input;
    setInput("");
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: currentInput },
    ]);

    try {
      let activeId = selectedId;

      if (!activeId) {
        const newConv = await api.createConversation(
          currentInput.substring(0, 15),
        );
        activeId = newConv.id;
        onConversationCreated(activeId);
      }

      const result = await api.sendMessage(activeId, currentInput);

      setMessages((prev) => [
        ...prev,
        {
          id: result.assistantMessage.id,
          sender: "gemini",
          text: result.assistantMessage.content,
        },
      ]);

      // 🔥 3. 로컬 스토리지 저장 및 상태 업데이트
      localStorage.setItem("carbonState", JSON.stringify(result.carbonState));
      setLocalCarbon(result.carbonState);
      onCarbonUpdate(result.carbonState);

      if (result.truncated) {
        console.warn("입력 토큰 제한으로 인해 컨텍스트가 일부 잘렸습니다.");
      }
    } catch (error) {
      console.error("전송 에러:", error);
      if (error instanceof Error && error.message.includes("402")) {
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
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            // 🔥 4. 동적 글자수 제한 적용 및 0자일 때 입력창 비활성화
            placeholder={
              currentMaxLength <= 0
                ? "빙하가 모두 녹아 더 이상 입력할 수 없습니다..."
                : "메시지를 입력하세요..."
            }
            disabled={isLoading || currentMaxLength <= 0}
            maxLength={currentMaxLength}
            rows={1}
          />
          <button
            className={styles.sendButton}
            onClick={handleSend}
            disabled={isLoading || !input.trim() || currentMaxLength <= 0}
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
            {/* 🔥 5. 변화하는 최대 글자수 UI 반영 */}
            {input.length} / {currentMaxLength}
          </div>
        </div>
      </div>
    </div>
  );
}
