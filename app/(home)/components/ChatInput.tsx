"use client";

import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { Message } from "../page";
import styles from "./ChatInput.module.css";

interface ChatInputProps {
  setMessages: Dispatch<SetStateAction<Message[]>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

const MAX_LENGTH = 500; // 최대 글자 수 설정

export default function ChatInput({
  setMessages,
  isLoading,
  setIsLoading,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 텍스트 길이에 맞춰 입력창 높이 자동 조절
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  // 전송 후 입력창 높이 초기화
  useEffect(() => {
    if (input === "" && textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const currentInput = input;
    setInput("");

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: currentInput },
    ]);

    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        sender: "gemini",
        text: `"${currentInput}"에 대한 답변입니다.`,
      },
    ]);

    setIsLoading(false);
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
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="북극곰에게 메시지를 남겨보세요."
            disabled={isLoading}
            maxLength={MAX_LENGTH}
            rows={1}
          />
          <button
            className={styles.sendButton}
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            aria-label="전송"
          >
            {/* 전송 아이콘 (SVG) */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>

        {/* 하단 텍스트 및 글자 수 카운터 */}
        <div className={styles.inputFooter}>
          <div className={styles.footerText}>
            AI는 실수를 할 수 있습니다. 중요한 정보는 확인하세요.
          </div>
          <div
            className={`${styles.charCount} ${input.length >= MAX_LENGTH ? styles.charMax : ""}`}
          >
            {input.length} / {MAX_LENGTH}
          </div>
        </div>
      </div>
    </div>
  );
}
