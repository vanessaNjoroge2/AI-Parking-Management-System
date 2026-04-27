import { apiFetch } from './apiClient';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatResponse {
  reply: string;
  model?: string;
  usage?: unknown;
}

export async function sendChatMessage(message: string, history: ChatMessage[] = []) {
  return apiFetch<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  });
}
