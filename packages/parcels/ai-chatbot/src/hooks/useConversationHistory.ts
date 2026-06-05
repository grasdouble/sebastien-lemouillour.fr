import { useCallback, useEffect, useState } from 'react';

import type { Conversation } from '../types/conversation';
import type { Message } from '../types/message';

const STORAGE_KEY = 'ai-chatbot-conversations';
const DEFAULT_TITLE_FR = 'Nouvelle conversation';
const DEFAULT_TITLE_EN = 'New conversation';

// Helper to parse dates from localStorage
const parseConversation = (conv: unknown): Conversation | null => {
  // Validate structure
  if (!conv || typeof conv !== 'object') return null;

  const c = conv as Record<string, unknown>;

  // Validate required fields
  if (typeof c.id !== 'string') return null;
  if (typeof c.title !== 'string') return null;
  if (!Array.isArray(c.messages)) return null;
  if (typeof c.createdAt !== 'string') return null;
  if (typeof c.updatedAt !== 'string') return null;

  // Validate messages array
  const validMessages = c.messages.every((msg: unknown) => {
    if (!msg || typeof msg !== 'object') return false;
    const m = msg as Record<string, unknown>;
    return (
      typeof m.id === 'string' &&
      (m.role === 'user' || m.role === 'assistant') &&
      typeof m.content === 'string' &&
      typeof m.timestamp === 'string'
    );
  });

  if (!validMessages) return null;

  // Parse dates
  try {
    return {
      id: c.id,
      title: c.title,
      messages: (c.messages as { id: string; role: 'user' | 'assistant'; content: string; timestamp: string }[]).map(
        (msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
        })
      ),
      modelId: typeof c.modelId === 'string' ? c.modelId : undefined,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
    };
  } catch {
    return null;
  }
};

// Helper to load conversations from localStorage
const loadConversationsFromStorage = (): Conversation[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.map(parseConversation).filter((conv): conv is Conversation => conv !== null);
  } catch {
    return [];
  }
};

// Helper to save conversations to localStorage
const saveConversationsToStorage = (conversations: Conversation[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('[ConversationHistory] Failed to save conversations:', error);

    // Notify user about storage issue
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('[ConversationHistory] localStorage quota exceeded. Consider deleting old conversations.');
      // In production, this should trigger a toast notification to the user
    }
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
