import type { Message } from '../components/MessageList';

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
