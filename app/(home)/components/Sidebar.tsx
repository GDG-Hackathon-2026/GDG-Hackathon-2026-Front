"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api, type Conversation } from "../../lib/api";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export default function Sidebar({ selectedId, onSelect }: SidebarProps) {
  const { ready, user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 로그인이 안 되었거나 준비가 안 됐으면 중단
    if (!ready || !user) return;

    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        // 백엔드에서 내 대화 목록 최신순으로 가져오기
        const data = await api.listConversations();
        setConversations(data);
      } catch (error) {
        console.error("대화 목록 불러오기 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [ready, user]);
  return (
    <aside className={styles.sidebar}>
      {/* 새로운 대화 버튼 클릭 시 selectedId를 null로 만들거나 초기화 로직 추가 가능 */}
      <button
        className={styles.newChatBtn}
        onClick={() => window.location.reload()}
      >
        + 새로운 대화 시작
      </button>

      <div className={styles.listContainer}>
        <h3 className={styles.listTitle}>최근 대화</h3>
        {/* ... 로딩/비어있음 처리 ... */}
        <ul className={styles.chatList}>
          {conversations.map((conv) => (
            <li
              key={conv.id}
              className={`${styles.chatItem} ${selectedId === conv.id ? styles.active : ""}`}
              onClick={() => onSelect(conv.id)} // 🔥 클릭 시 ID 전달
            >
              <span className={styles.chatIcon}>💬</span>
              <span className={styles.chatTitle}>
                {conv.title || "새로운 대화"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
