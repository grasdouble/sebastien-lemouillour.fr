import { useCallback, useEffect, useState } from 'react';

import type { Message } from '../components/MessageList';
import type { Conversation } from '../types/conversation';

const STORAGE_KEY = 'ai-chatbot-conversations';
const DEFAULT_TITLE_FR = 'Nouvelle conversation';
const DEFAULT_TITLE_EN = 'New conversation';

// Define type for stored conversation data
type StoredConversation = {
  id: string;
  title: string;
  messages: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }[];
  modelId?: string;
  createdAt: string;
  updatedAt: string;
};

// Helper to parse dates from localStorage
const parseConversation = (conv: StoredConversation): Conversation => ({
  ...conv,
  createdAt: new Date(conv.createdAt),
  updatedAt: new Date(conv.updatedAt),
  messages: conv.messages.map((msg) => ({
    ...msg,
    timestamp: new Date(msg.timestamp),
  })),
});

// Helper to load conversations from localStorage
const loadConversationsFromStorage = (): Conversation[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((conv) => parseConversation(conv as StoredConversation));
  } catch {
    return [];
  }
};

// Helper to save conversations to localStorage
const saveConversationsToStorage = (conversations: Conversation[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // Silently fail if localStorage is not available
  }
};

// Helper to generate title from first user message
const generateTitle = (messages: Message[]): string | null => {
  const firstUserMessage = messages.find((msg) => msg.role === 'user');
  if (!firstUserMessage) return null;

  const content = firstUserMessage.content.trim();
  if (content.length > 50) {
    return `${content.slice(0, 50)}...`;
  }
  return content;
};

export const useConversationHistory = () => {
  // Initialize conversations from localStorage on mount
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversationsFromStorage());
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);

  // Save to localStorage whenever conversations change
  useEffect(() => {
    if (conversations.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      saveConversationsToStorage(conversations);
    }
  }, [conversations]);

  const createConversation = useCallback((title: string, modelId?: string) => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      title,
      messages: [],
      modelId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setConversations((prev) => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
  }, []);

  const loadConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const conversation = prev.find((conv) => conv.id === id);
      if (conversation) {
        setCurrentConversation(conversation);
      }
      return prev;
    });
  }, []);

  const updateConversation = useCallback(
    (id: string, messages: Message[]) => {
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv.id !== id) return conv;

          const updatedConv: Conversation = {
            ...conv,
            messages,
            updatedAt: new Date(),
          };

          // Auto-generate title from first user message if title is still default
          if (messages.length > 0 && (conv.title === DEFAULT_TITLE_FR || conv.title === DEFAULT_TITLE_EN)) {
            const generatedTitle = generateTitle(messages);
            if (generatedTitle) {
              updatedConv.title = generatedTitle;
            }
          }

          return updatedConv;
        });

        // Update current conversation if it's the one being updated
        const updatedCurrent = updated.find((conv) => conv.id === id);
        if (updatedCurrent && currentConversation?.id === id) {
          setCurrentConversation(updatedCurrent);
        }

        return updated;
      });
    },
    [currentConversation?.id]
  );

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((conv) => conv.id !== id));

      // Clear current conversation if it's the one being deleted
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
      }
    },
    [currentConversation?.id]
  );

  return {
    conversations,
    currentConversation,
    createConversation,
    loadConversation,
    updateConversation,
    deleteConversation,
  };
};
