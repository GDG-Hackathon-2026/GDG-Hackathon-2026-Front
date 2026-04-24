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
  me: () => fetchWithAuth("/api/me"),
  createConversation: (title?: string) =>
    fetchWithAuth("/api/conversations", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),
  sendMessage: (id: number, content: string) =>
    fetchWithAuth(`/api/conversations/${id}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
};
