import { useState, useEffect } from 'react';
import { useCharacterSync } from './useCharacterSync';

export function useChat() {
  const [messages, setMessages] = useState([
    { text: 'Welcome to the Narrator Screen chat!', sender: 'system' },
  ]);
  const [clientId] = useState(() => Math.random().toString(36).substring(7));
  const { sendJsonMessage, lastMessage } = useCharacterSync('all');

  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const data = JSON.parse(lastMessage.data);
        if (data.type === 'chat_message') {
          // Only add messages from other clients
          if (data.clientId !== clientId) {
            setMessages((prev) => [
              ...prev,
              { text: data.message, sender: 'other' },
            ]);
          }
        }
      } catch (e) {
        console.error('Error parsing websocket message', e);
      }
    }
  }, [lastMessage, clientId]);

  const handleNewUserMessage = (newMessage) => {
    console.log(`Sending message: ${newMessage}`);
    sendJsonMessage({
      type: 'chat_message',
      message: newMessage,
      clientId: clientId,
    });
    setMessages((prev) => [...prev, { text: newMessage, sender: 'user' }]);
  };

  return {
    messages,
    handleNewUserMessage,
  };
}
