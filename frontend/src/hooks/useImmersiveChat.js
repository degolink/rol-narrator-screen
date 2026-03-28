import { useState, useEffect, useCallback, useMemo } from 'react';
import useWebSocket from 'react-use-websocket';
import { WS_BASE_URL } from '../config';
import { api } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';

export function useImmersiveChat() {
  const { character } = useAuth();
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [nextCursor, setNextCursor] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const socketUrl = useMemo(() => {
    return `${WS_BASE_URL}/chat/`;
  }, []);

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    socketUrl,
    {
      shouldReconnect: () => true,
      reconnectAttempts: 10,
      reconnectInterval: 3000,
    },
  );

  const fetchHistory = useCallback(async (cursor = null) => {
    try {
      const url = cursor ? `/chat/?cursor=${cursor}` : '/chat/';
      const response = await api.get(url);
      const newMessages = response.data.results;

      setMessages((prev) => (cursor ? [...prev, ...newMessages] : newMessages));
      setNextCursor(
        response.data.next
          ? new URL(response.data.next).searchParams.get('cursor')
          : null,
      );
      setIsInitialLoad(false);
    } catch (e) {
      console.error('Failed to fetch chat history', e);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.type === 'chat_message_event') {
        const msg = lastJsonMessage.message;
        setMessages((prev) => [msg, ...prev]);
        // Remove typing indicator if any for this user
        setTypingUsers((prev) => {
          const next = { ...prev };
          delete next[msg.sender_user_id];
          return next;
        });
      } else if (lastJsonMessage.type === 'typing_event') {
        setTypingUsers((prev) => ({
          ...prev,
          [lastJsonMessage.user_id]: {
            name: lastJsonMessage.character_name,
            is_typing: lastJsonMessage.is_typing,
          },
        }));
      } else if (lastJsonMessage.type === 'user_update_event') {
        const { user_id, username, is_dungeon_master } = lastJsonMessage;
        setMessages((prev) =>
          prev.map((msg) => {
            // If message is from this user and NO character was used, update the name
            if (msg.sender_user_id === user_id && !msg.sender_character) {
              return {
                ...msg,
                sender_name: is_dungeon_master
                  ? 'Dungeon Master'
                  : username || msg.sender_name,
              };
            }
            return msg;
          }),
        );
      }
    }
  }, [lastJsonMessage]);

  const sendMessage = (content, options = {}) => {
    const { recipient_id, ooc = false } = options;
    sendJsonMessage({
      type: 'chat_message',
      content,
      character_id: character?.id,
      recipient_id,
      ooc,
    });
  };

  const sendTypingStatus = (is_typing) => {
    sendJsonMessage({
      type: 'typing_indicator',
      character_name: character?.name || 'Dungeon Master',
      is_typing,
    });
  };

  return {
    messages,
    typingUsers,
    sendMessage,
    sendTypingStatus,
    fetchMore: () => nextCursor && fetchHistory(nextCursor),
    hasMore: !!nextCursor,
    readyState,
    isInitialLoad,
  };
}
