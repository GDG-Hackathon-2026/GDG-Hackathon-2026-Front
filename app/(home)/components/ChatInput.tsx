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

  const [localCarbon, setLocalCarbon] = useState<{
    totalCarbonG: number;
    meltingPercent: number;
  } | null>(null);

  useEffect(() => {
    const savedCarbon = localStorage.getItem("carbonState");
    if (savedCarbon) {
      try {
        setLocalCarbon(JSON.parse(savedCarbon));
      } catch (e) {
        console.error("탄소 상태 파싱 실패:", e);
      }
    }
  }, []);

  const currentMaxLength = localCarbon
    ? Math.max(0, Math.floor(BASE_MAX_LENGTH * (1 - localCarbon.totalCarbonG)))
    : BASE_MAX_LENGTH;

  const meltRatio = localCarbon
    ? Math.min(1, Math.max(0, localCarbon.totalCarbonG))
    : 0;

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const currentScrollHeight = textareaRef.current.scrollHeight;

      textareaRef.current.style.height = `${Math.min(currentScrollHeight, 150)}px`;

      if (currentScrollHeight >= 150) {
        textareaRef.current.style.overflowY = "auto";
      } else {
        textareaRef.current.style.overflowY = "hidden";
      }
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart;

    if (val.length > currentMaxLength) return;

    if (val.length > input.length) {
      if (Math.random() < 0.2) {
        const before = val.slice(0, cursor - 1);
        const after = val.slice(cursor);
        const newText = before + "🐻‍❄️" + after;

        if (newText.length <= currentMaxLength) {
          setInput(newText);
          return;
        }
      }
    }
    setInput(val);
  };

  // 🔥 forcedText를 인자로 받을 수 있도록 변경 (버튼 클릭 이벤트 대비 any 타입 처리)
  const handleSend = async (forcedText?: string | any) => {
    // 문자열이 강제로 넘어왔으면 그걸 쓰고, 아니면 input 상태 사용
    const textToSend = typeof forcedText === "string" ? forcedText : input;

    if (!textToSend.trim() || isLoading || !ready || !user) return;

    setInput("");
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: textToSend },
    ]);

    try {
      let activeId = selectedId;

      if (!activeId) {
        const newConv = await api.createConversation(
          textToSend.substring(0, 15),
        );
        activeId = newConv.id;
        onConversationCreated(activeId);
      }

      const result = await api.sendMessage(activeId, textToSend);

      setMessages((prev) => [
        ...prev,
        {
          id: result.assistantMessage.id,
          sender: "gemini",
          text: result.assistantMessage.content,
        },
      ]);

      localStorage.setItem("carbonState", JSON.stringify(result.carbonState));
      setLocalCarbon(result.carbonState);
      onCarbonUpdate(result.carbonState);
    } catch (error) {
      console.error("전송 에러:", error);
      if (error instanceof Error && error.message.includes("402")) {
        alert(
          "🚨 탄소 배출량이 1g 한계치에 도달하여 북극곰의 터전이 모두 녹았습니다. 더 이상 메시지를 보낼 수 없습니다.",
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
      handleSend(); // 파라미터 없이 호출하면 기본 input 값을 사용함
    }
  };

  // 🔥 최신 handleSend 함수를 담아둘 ref (클로저 상태 꼬임 방지)
  const handleSendRef = useRef(handleSend);
  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [handleSend]);

  // 🔥 ChatWindow에서 쏜 이벤트 낚아채기
  useEffect(() => {
    const handleGlobalSuggestion = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      // 이벤트에 실려온 추천 질문 텍스트를 바로 전송
      handleSendRef.current(customEvent.detail);
    };

    window.addEventListener("suggestionClicked", handleGlobalSuggestion);
    return () => {
      window.removeEventListener("suggestionClicked", handleGlobalSuggestion);
    };
  }, []);

  return (
    <div
      className={styles.inputContainer}
      style={{ "--melt-ratio": meltRatio } as React.CSSProperties}
    >
      <div className={styles.inputWrapper}>
        <div className={styles.inputBox}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={
              currentMaxLength <= 0
                ? "탄소 배출량 1g 도달. 빙하가 모두 녹아 더 이상 입력할 수 없습니다..."
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
          <div className={styles.footerText}>
            이 AI는 자주 많은 실수를 합니다.
          </div>
          <div className={styles.charCount}>
            {input.length} / {currentMaxLength}
          </div>
        </div>
      </div>
    </div>
  );
}
