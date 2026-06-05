import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Message } from '../../components/MessageList';
import type { Conversation } from '../../types/conversation';
import { useConversationHistory } from '../useConversationHistory';

describe('useConversationHistory', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should initialize with empty conversations list', () => {
      const { result } = renderHook(() => useConversationHistory());

      expect(result.current.conversations).toEqual([]);
      expect(result.current.currentConversation).toBeNull();
    });

    it('should load conversations from localStorage on mount', () => {
      const mockConversations: Conversation[] = [
        {
          id: 'conv-1',
          title: 'Test conversation',
          messages: [
            {
              id: 'msg-1',
              role: 'user',
              content: 'Hello',
              timestamp: new Date('2024-01-01T10:00:00Z'),
            },
          ],
          createdAt: new Date('2024-01-01T10:00:00Z'),
          updatedAt: new Date('2024-01-01T10:00:00Z'),
        },
      ];

      localStorage.setItem('ai-chatbot-conversations', JSON.stringify(mockConversations));

      const { result } = renderHook(() => useConversationHistory());

      expect(result.current.conversations).toHaveLength(1);
      expect(result.current.conversations[0].id).toBe('conv-1');
      expect(result.current.conversations[0].title).toBe('Test conversation');
    });

    it('should handle invalid localStorage data gracefully', () => {
      localStorage.setItem('ai-chatbot-conversations', 'invalid json');

      const { result } = renderHook(() => useConversationHistory());

      expect(result.current.conversations).toEqual([]);
    });
  });

  describe('createConversation', () => {
    it('should create a new conversation', () => {
      const { result } = renderHook(() => useConversationHistory());

      act(() => {
        result.current.createConversation('New chat');
      });

      expect(result.current.conversations).toHaveLength(1);
      expect(result.current.conversations[0].title).toBe('New chat');
      expect(result.current.conversations[0].messages).toEqual([]);
      expect(result.current.currentConversation?.id).toBe(result.current.conversations[0].id);
    });

    it('should create conversation with model ID when provided', () => {
      const { result } = renderHook(() => useConversationHistory());

      act(() => {
        result.current.createConversation('New chat', 'phi-4');
      });

      expect(result.current.conversations[0].modelId).toBe('phi-4');
    });

    it('should set new conversation as current', () => {
      const { result } = renderHook(() => useConversationHistory());

      act(() => {
        result.current.createConversation('Test');
      });

      expect(result.current.currentConversation).not.toBeNull();
      expect(result.current.currentConversation?.title).toBe('Test');
    });
  });

  describe('loadConversation', () => {
    it('should load an existing conversation', () => {
      const { result } = renderHook(() => useConversationHistory());

      act(() => {
        result.current.createConversation('First');
      });

      const conversationId = result.current.currentConversation!.id;

      act(() => {
        result.current.createConversation('Second');
      });

      expect(result.current.currentConversation?.title).toBe('Second');

      act(() => {
        result.current.loadConversation(conversationId);
      });

      expect(result.current.currentConversation?.title).toBe('First');
    });

    it('should do nothing if conversation does not exist', () => {
      const { result } = renderHook(() => useConversationHistory());

      act(() => {
        result.current.createConversation('Test');
      });

      const currentId = result.current.currentConversation!.id;

      act(() => {
        result.current.loadConversation('non-existent-id');
      });

      expect(result.current.currentConversation?.id).toBe(currentId);
    });
  });

  describe('updateConversation', () => {
    it('should update conversation messages', () => {
      const { result } = renderHook(() => useConversationHistory());

      act(() => {
        result.current.createConversation('Test');
      });

      const newMessages: Message[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Hello',
          timestamp: new Date(),
        },
      ];

      act(() => {
        result.current.updateConversation(result.current.currentConversation!.id, newMessages);
      });

      expect(result.current.currentConversation?.messages).toHaveLength(1);
      expect(result.current.currentConversation?.messages[0].content).toBe('Hello');
    });

    it('should update updatedAt timestamp', () => {
      const { result } = renderHook(() => useConversationHistory());

      act(() => {
        result.current.createConversation('Test');
      });

      const initialUpdatedAt = result.current.currentConversation!.updatedAt;

      // Wait a bit to ensure timestamp changes
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);

      act(() => {
        result.current.updateConversation(result.current.currentConversation!.id, [
          {
            id: 'msg-1',
            role: 'user',
            content: 'Hello',
            timestamp: new Date(),
          },
        ]);
      });

      vi.useRealTimers();

      expect(result.current.currentConversation!.updatedAt.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
    });

    it('should auto-generate title from first user message if title is default', () => {
      const { result } = renderHook(() => useConversationHistory());

      act(() => {
        result.current.createConversation('Nouvelle conversation');
      });

      const newMessages: Message[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'What is the weather today?',
          timestamp: new Date(),
        },
      ];

      act(() => {
        result.current.updateConversation(result.current.currentConversation!.id, newMessages);
      });

      expect(result.current.currentConversation?.title).toBe('What is the weather today?');
    });

    it('should truncate long titles to 50 characters', () => {
      const { result } = renderHook(() => useConversationHistory());

      act(() => {
        result.current.createConversation('Nouvelle conversation');
      });

      const longMessage = 'This is a very long message that should be truncated to fifty characters maximum';
      const newMessages: Message[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: longMessage,
          timestamp: new Date(),
        },
      ];

      act(() => {
        result.current.updateConversation(result.current.currentConversation!.id, newMessages);
      });

      expect(result.current.currentConversation?.title).toHaveLength(53); // 50 + "..."
      expect(result.current.currentConversation?.title).toMatch(/\.\.\.$/);
    });
  });

  describe('deleteConversation', () => {
    it('should delete a conversation', () => {
      const { result } = renderHook(() => useConversationHistory());

      act(() => {
        result.current.createConversation('To delete');
      });

      const conversationId = result.current.currentConversation!.id;

      expect(result.current.conversations).toHaveLength(1);

      act(() => {
        result.current.deleteConversation(conversationId);
      });

      expect(result.current.conversations).toHaveLength(0);
    });

    it('should clear current conversation if it was deleted', () => {
      const { result } = renderHook(() => useConversationHistory());

      act(() => {
        result.current.createConversation('Test');
      });

      const conversationId = result.current.currentConversation!.id;

      act(() => {
        result.current.deleteConversation(conversationId);
      });

      expect(result.current.currentConversation).toBeNull();
    });

    it('should not clear current conversation if a different one was deleted', () => {
      const { result } = renderHook(() => useConversationHistory());

      act(() => {
        result.current.createConversation('First');
      });

      const firstId = result.current.currentConversation!.id;

      act(() => {
        result.current.createConversation('Second');
      });

      act(() => {
        result.current.deleteConversation(firstId);
      });

      expect(result.current.currentConversation?.title).toBe('Second');
    });
  });

  describe('persistence', () => {
    it('should save conversations to localStorage when created', () => {
      // Ensure clean state
      localStorage.clear();

      const { result } = renderHook(() => useConversationHistory());

      act(() => {
        result.current.createConversation('Test');
      });

      const stored = localStorage.getItem('ai-chatbot-conversations');
      expect(stored).not.toBeNull();

      const parsed: unknown = JSON.parse(stored!);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
      expect((parsed as { title: string }[])[0].title).toBe('Test');
    });

    it('should save conversations to localStorage when updated', () => {
      const { result } = renderHook(() => useConversationHistory());

      act(() => {
        result.current.createConversation('Test');
      });

      act(() => {
        result.current.updateConversation(result.current.currentConversation!.id, [
          {
            id: 'msg-1',
            role: 'user',
            content: 'Hello',
            timestamp: new Date(),
          },
        ]);
      });

      const stored = localStorage.getItem('ai-chatbot-conversations');
      const parsed: unknown = JSON.parse(stored!);
      expect(Array.isArray(parsed)).toBe(true);
      expect((parsed as { messages: unknown[] }[])[0].messages).toHaveLength(1);
    });

    it('should save conversations to localStorage when deleted', () => {
      const { result } = renderHook(() => useConversationHistory());

      act(() => {
        result.current.createConversation('Test 1');
        result.current.createConversation('Test 2');
      });

      const firstId = result.current.conversations[0].id;

      act(() => {
        result.current.deleteConversation(firstId);
      });

      const stored = localStorage.getItem('ai-chatbot-conversations');
      const parsed: unknown = JSON.parse(stored!);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
    });
  });
});
