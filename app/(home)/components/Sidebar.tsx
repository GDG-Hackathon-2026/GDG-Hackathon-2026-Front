"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api, type Conversation } from "../../lib/api";
import { Plus, MessageSquare } from "lucide-react";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
  onTitleChange?: (title: string) => void;
}

export default function Sidebar({
  selectedId,
  onSelect,
  onTitleChange,
}: SidebarProps) {
  const { ready, user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (!ready || !user) return;

    const fetchConversations = async () => {
      try {
        const data = await api.listConversations();
        setConversations(data);
      } catch (error) {
        console.error("대화 목록 불러오기 실패:", error);
      }
    };

    fetchConversations();
  }, [ready, user]);

  useEffect(() => {
    if (onTitleChange) {
      if (!selectedId) {
        onTitleChange("새로운 대화");
      } else {
        const conv = conversations.find((c) => c.id === selectedId);
        onTitleChange(conv?.title || "새로운 대화");
      }
    }
  }, [selectedId, conversations, onTitleChange]);

  return (
    <aside className={styles.sidebar}>
      <button
        className={styles.newChatBtn}
        onClick={() => window.location.reload()}
      >
        <Plus size={18} className={styles.plusIcon} />
        <span>새로운 대화</span>
      </button>

      <div className={styles.listContainer}>
        <h3 className={styles.listTitle}>최근 대화</h3>
        <ul className={styles.chatList}>
          {conversations.map((conv, index) => (
            <li
              key={conv.id}
              className={`${styles.chatItem} ${
                selectedId === conv.id ? styles.active : ""
              }`}
              onClick={() => onSelect(conv.id)}
              // 🔥 순차적 등장 애니메이션을 위한 인덱스 기반 딜레이 주입
              style={
                {
                  "--animation-delay": `${index * 0.05}s`,
                } as React.CSSProperties
              }
            >
              <MessageSquare size={16} className={styles.chatIcon} />
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
