import type { Message } from './message';

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  modelId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ConversationMetadata = Omit<Conversation, 'messages'> & {
  messageCount: number;
};
