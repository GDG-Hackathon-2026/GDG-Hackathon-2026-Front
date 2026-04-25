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
  const [modelType, setModelType] = useState("활발한 북극곰");
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const { ready, user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);

  const models = ["할아버지 북극곰", "활발한 북극곰", "수줍은 북극곰"];

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

    const handleClickOutside = (e: MouseEvent) => {
      if (
        modelMenuRef.current &&
        !modelMenuRef.current.contains(e.target as Node)
      ) {
        setIsModelMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const calculatedMax = localCarbon
    ? Math.max(0, Math.floor(BASE_MAX_LENGTH * (1 - localCarbon.totalCarbonG)))
    : BASE_MAX_LENGTH;

  const currentMaxLength = isNaN(calculatedMax)
    ? BASE_MAX_LENGTH
    : calculatedMax;
  const meltRatio = localCarbon
    ? Math.min(1, Math.max(0, localCarbon.totalCarbonG))
    : 0;

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const currentScrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(currentScrollHeight, 150)}px`;
      textareaRef.current.style.overflowY =
        currentScrollHeight >= 150 ? "auto" : "hidden";
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart || 0;

    if (val.length > currentMaxLength) return;

    if (val.length > input.length && Math.random() < 0.2) {
      const before = val.slice(0, cursor - 1);
      const after = val.slice(cursor);
      const newText = before + "🐻‍❄️" + after;
      if (newText.length <= currentMaxLength) {
        setInput(newText);
        return;
      }
    }
    setInput(val);
  };

  const handleSend = async (forcedText?: unknown) => {
    const textToSend = typeof forcedText === "string" ? forcedText : input;
    if (!textToSend.trim() || isLoading || !ready || !user) return;

    setInput("");
    setIsLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

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
      alert("메시지 전송에 실패했습니다.");
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

  const handleSendRef = useRef(handleSend);
  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [handleSend]);

  useEffect(() => {
    const handleGlobalSuggestion = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      handleSendRef.current(customEvent.detail);
    };
    window.addEventListener("suggestionClicked", handleGlobalSuggestion);
    return () =>
      window.removeEventListener("suggestionClicked", handleGlobalSuggestion);
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
                ? "빙하가 모두 녹았습니다..."
                : "메시지를 입력하세요..."
            }
            disabled={isLoading || currentMaxLength <= 0}
            maxLength={currentMaxLength}
            rows={1}
          />
          <button
            className={styles.sendButton}
            onClick={() => handleSend()}
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
          <div className={styles.footerLeft} ref={modelMenuRef}>
            <div
              className={`${styles.modelSelector} ${isModelMenuOpen ? styles.active : ""}`}
              onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
            >
              <span className={styles.modelDot}></span>
              <span className={styles.currentModel}>{modelType}</span>
              <svg
                className={styles.chevronIcon}
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
            {isModelMenuOpen && (
              <div className={styles.modelMenu}>
                {models.map((model) => (
                  <div
                    key={model}
                    className={`${styles.modelOption} ${model === modelType ? styles.selected : ""}`}
                    onClick={() => {
                      setModelType(model);
                      setIsModelMenuOpen(false);
                    }}
                  >
                    {model}
                  </div>
                ))}
              </div>
            )}
          </div>

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
