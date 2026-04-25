// app/lib/api.ts
import { auth } from "./firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

async function fetchWithAuth(path: string, init?: RequestInit) {
  const u = auth.currentUser;
  if (!u) throw new Error("not authenticated yet");
  const token = await u.getIdToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// 우리가 쓸 API 함수들 모음
export const api = {
  ping: async () => {
    const res = await fetch(`${API_URL}/api/ping`);
    if (!res.ok) throw new Error("Ping 실패!");
    return res.json();
  },
  me: (): Promise<MeResponse> => fetchWithAuth("/api/me"),

  createConversation: (title?: string): Promise<Conversation> =>
    fetchWithAuth("/api/conversations", {
      method: "POST",
      body: JSON.stringify({ title: title || "New conversation" }),
    }),

  // 방금 사이드바에서 썼던 대화 목록 불러오기 함수 추가!
  listConversations: (): Promise<Conversation[]> =>
    fetchWithAuth("/api/conversations"),

  sendMessage: (id: number, content: string): Promise<SendResult> =>
    fetchWithAuth(`/api/conversations/${id}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  getConversation: (id: number): Promise<ConversationView> =>
    fetchWithAuth(`/api/conversations/${id}`),
};

// ---- 아래는 백엔드 응답에 맞춘 타입스크립트 인터페이스들 ----

export interface MeResponse {
  uid: string;
  carbonUsedG: number;
  stage: number;
  maxInputTokens: number;
  meltingPercent: number;
}

export interface Conversation {
  id: number;
  userUid: string;
  title: string;
  createdAt: string;
}

export interface Message {
  id: number;
  conversationId: number;
  role: "USER" | "ASSISTANT";
  content: string;
  promptTokens: number | null;
  completionTokens: number | null;
  carbonG: number | null;
  createdAt: string;
}

export interface SendResult {
  assistantMessage: {
    id: number;
    content: string;
    promptTokens: number;
    completionTokens: number;
    carbonG: number;
  };
  carbonState: {
    totalCarbonG: number;
    stage: number;
    maxInputTokens: number;
    meltingPercent: number;
  };
  truncated: boolean;
}

export interface ConversationView {
  conversation: Conversation;
  messages: Message[];
}
