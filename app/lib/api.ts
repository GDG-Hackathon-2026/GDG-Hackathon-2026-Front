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

  listConversations: (): Promise<Conversation[]> =>
    fetchWithAuth("/api/conversations"),

  sendMessage: (id: number, content: string): Promise<SendResult> =>
    fetchWithAuth(`/api/conversations/${id}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  getConversation: (id: number): Promise<ConversationView> =>
    fetchWithAuth(`/api/conversations/${id}`),

  resetCarbon: (): Promise<MeResponse> =>
    fetchWithAuth("/api/me/carbon/reset", { method: "POST" }),

  getGlobalStats: (): Promise<GlobalStatsResponse> =>
    fetchWithAuth("/api/stats/carbon"),
};

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

export interface GlobalStatsResponse {
  userCount: number;
  activeUserCount: number;
  totalCarbonG: number;
  averageCarbonG: number;
  averageActiveCarbonG: number;
  equivalents: {
    seaIceLossM2: number;
    carKm: number;
    phoneCharges: number;
  };
}
