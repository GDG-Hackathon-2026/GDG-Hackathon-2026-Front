"use client";

import { useState, Dispatch, SetStateAction } from "react";
import { Message } from "../page";
import styles from "./ChatInput.module.css";

interface ChatInputProps {
  setMessages: Dispatch<SetStateAction<Message[]>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

export default function ChatInput({
  setMessages,
  isLoading,
  setIsLoading,
}: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // 1. 유저 메시지 화면에 즉시 렌더링
    const currentInput = input;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: currentInput },
    ]);

    setIsLoading(true);

    // 2. 서버 응답 대기 (임시 1초 딜레이)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 3. AI 답변 화면에 렌더링
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
      <div className={styles.inputBox}>
        <textarea
          className={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="여기에 메시지를 입력하세요..."
          disabled={isLoading}
          rows={1}
        />
        <button
          className={styles.sendButton}
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
        >
          전송
        </button>
      </div>
      <div className={styles.footerText}>
        AI는 실수를 할 수 있습니다. 중요한 정보는 확인하세요.
      </div>
    </div>
  );
}
