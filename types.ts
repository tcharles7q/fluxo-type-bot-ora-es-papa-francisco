
export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  OPTIONS = 'OPTIONS',
  USER_RESPONSE = 'USER_RESPONSE',
  CTA = 'CTA',
  REDIRECT = 'REDIRECT',
}

export interface Message {
  id: number;
  type: MessageType;
  content?: string | string[];
  imageUrl?: string;
  audioUrl?: string;
  from: 'bot' | 'user';
}

export interface FunnelStep {
  type: MessageType;
  delay: number; // in seconds
  content?: string;
  imageUrl?: string;
  audioUrl?: string;
}
