import { api } from './api';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export const sendChatMessage = async (
  farmId: string,
  question: string,
  history: ChatMessage[]
) => {
  const response = await api.post(`/farms/${farmId}/chat`, { question, history });
  return response.data;
};

export const sendVoiceQuery = async (
  farmId: string,
  transcript: string,
  language: string = 'en'
) => {
  const response = await api.post(`/farms/${farmId}/voice`, { transcript, language });
  return response.data;
};
