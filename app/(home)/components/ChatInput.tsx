"use client";

import { useState, useRef, useEffect } from "react";
import { api, Persona } from "../../lib/api";
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
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);

  const { ready, user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);

  const [localCarbon, setLocalCarbon] = useState<{
    totalCarbonG: number;
    meltingPercent: number;
  } | null>(null);

  const [isMounted, setIsMounted] = useState(false);

  // 🔥 1. 마운트 전용 useEffect (Lint 에러 방지용 주석 추가)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // 데이터 로드 로직 useEffect
  useEffect(() => {
    const initData = async () => {
      // 1. 페르소나 로드
      try {
        const data = await api.getPersonas();
        if (data && data.length > 0) {
          setPersonas(data);
          setSelectedPersona(data[0]);
        }
      } catch (e) {
        console.error("페르소나 로드 실패:", e);
      }

      // 2. 서버에서 내 최신 탄소 상태 로드 및 프론트엔드 형식으로 매핑
      try {
        const meData = await api.me();
        const mappedCarbonState = {
          totalCarbonG: meData.carbonUsedG ?? 0,
          stage: meData.stage ?? 0,
          meltingPercent: meData.meltingPercent ?? 0,
          maxInputTokens: meData.maxInputTokens ?? 8192,
        };

        setLocalCarbon(mappedCarbonState);
        localStorage.setItem("carbonState", JSON.stringify(mappedCarbonState));
        onCarbonUpdate(mappedCarbonState);
      } catch (e) {
        console.error("탄소 상태 서버 동기화 실패, 로컬스토리지 확인:", e);
        const savedCarbon = localStorage.getItem("carbonState");
        if (savedCarbon) {
          setLocalCarbon(JSON.parse(savedCarbon));
        }
      }
    };

    if (ready && user) {
      initData();
    }
  }, [ready, user, onCarbonUpdate]);

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
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

  // 글자수 및 탄소 계산 로직
  const safeCarbonG =
    localCarbon?.totalCarbonG != null ? Number(localCarbon.totalCarbonG) : 0;

  const calculatedMax = Math.max(
    0,
    Math.floor(BASE_MAX_LENGTH * (1 - safeCarbonG)),
  );

  const currentMaxLength = isNaN(calculatedMax)
    ? BASE_MAX_LENGTH
    : calculatedMax;
  const meltRatio = Math.min(1, Math.max(0, safeCarbonG));

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

      const result = await api.sendMessage(
        activeId,
        textToSend,
        selectedPersona?.key || "POLAR_BEAR_GRANDPA",
      );

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

  // 🔥 3. 최신 함수를 담아두는 ref (Lint의 exhaustive-deps 에러 해결!)
  const handleSendRef = useRef(handleSend);
  useEffect(() => {
    handleSendRef.current = handleSend;
  }); // 👈 의존성 배열을 아예 비우면 렌더링될 때마다 에러 없이 조용히 업데이트됩니다.

  useEffect(() => {
    const handleGlobalSuggestion = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      handleSendRef.current(customEvent.detail);
    };
    window.addEventListener("suggestionClicked", handleGlobalSuggestion);
    return () =>
      window.removeEventListener("suggestionClicked", handleGlobalSuggestion);
  }, []);

  const isSyncing = localCarbon === null;

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
              isSyncing
                ? "탄소 배출량 동기화 중..."
                : currentMaxLength <= 0
                  ? "빙하가 모두 녹았습니다..."
                  : "메시지를 입력하세요..."
            }
            disabled={isLoading || isSyncing || currentMaxLength <= 0}
            maxLength={currentMaxLength}
            rows={1}
          />
          <button
            className={styles.sendButton}
            onClick={() => handleSend()}
            disabled={
              isLoading || isSyncing || !input.trim() || currentMaxLength <= 0
            }
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
              <span className={styles.currentModel}>
                {selectedPersona
                  ? selectedPersona.displayName
                  : "불러오는 중..."}
              </span>
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
                {personas.map((p) => (
                  <div
                    key={p.key}
                    className={`${styles.modelOption} ${p.key === selectedPersona?.key ? styles.selected : ""}`}
                    title={p.description}
                    onClick={() => {
                      setSelectedPersona(p);
                      setIsModelMenuOpen(false);
                    }}
                  >
                    {p.displayName}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={styles.footerText}>
            이 AI는 자주 많은 실수를 합니다.
          </div>
          <div className={styles.charCount}>
            {!isMounted || isSyncing
              ? "- / -"
              : `${input.length} / ${currentMaxLength}`}
          </div>
        </div>
      </div>
    </div>
  );
}
