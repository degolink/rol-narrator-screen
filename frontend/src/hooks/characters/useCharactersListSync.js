import { useEffect, useState, useMemo } from 'react';
import useWebSocket from 'react-use-websocket';
import { dequal } from 'dequal';
import { WS_BASE_URL } from '../../config';

/**
 * Hook to manage and synchronize a list of characters.
 * Useful for dashboards and character listings.
 */
export function useCharactersListSync(initialCharacters = []) {
  const [characters, setCharacters] = useState(initialCharacters);

  const socketUrl = useMemo(() => {
    return `${WS_BASE_URL}/characters/all/`;
  }, []);

  const { lastMessage } = useWebSocket(socketUrl, {
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
  });

  // Keep internal state in sync with initial value if it changes
  useEffect(() => {
    if (initialCharacters.length > 0 && characters.length === 0) {
      setCharacters(initialCharacters);
    }
  }, [initialCharacters]);

  useEffect(() => {
    if (!lastMessage) return;
    try {
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'character_update' && data.data) {
        const lastUpdatedChar = data.data;

        setCharacters((prev) => {
          const existingIndex = prev.findIndex((c) => c.id === lastUpdatedChar.id);
          const exists = existingIndex !== -1;

          if (exists) {
            // Prevent redundant updates / loops by deep-comparing the actual object properties
            if (dequal(prev[existingIndex], lastUpdatedChar)) {
              return prev;
            }
            // Update existing character
            return prev.map((c) =>
              c.id === lastUpdatedChar.id ? lastUpdatedChar : c,
            );
          } else {
            // Backend already filtered visibility, so we can just add it
            return [lastUpdatedChar, ...prev];
          }
        });
      }
    } catch (e) {
      console.error('Error parsing websocket message', e);
    }
  }, [lastMessage]);


  return { characters, setCharacters };
}

