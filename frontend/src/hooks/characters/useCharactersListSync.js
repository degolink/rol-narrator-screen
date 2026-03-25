import { useEffect, useState, useMemo } from 'react';
import useWebSocket from 'react-use-websocket';
import { dequal } from 'dequal';
import { WS_BASE_URL } from '../../config';

/**
 * Hook to manage and synchronize a list of characters.
 * Useful for dashboards and character listings.
 */
export function useCharactersListSync(
  initialCharacters = [],
  options = { onlyVisible: false },
) {
  const [characters, setCharacters] = useState(initialCharacters);

  const socketUrl = useMemo(() => {
    return `${WS_BASE_URL}/characters/`;
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

          // Visibility filter logic
          if (options.onlyVisible && !lastUpdatedChar.visible) {
            if (exists) {
              return prev.filter((c) => c.id !== lastUpdatedChar.id);
            }
            return prev;
          }

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
            // Add new character if it's visible (or if we show everything)
            if (!options.onlyVisible || lastUpdatedChar.visible) {
              return [lastUpdatedChar, ...prev];
            }
            return prev;
          }
        });
      }
    } catch (e) {
      console.error('Error parsing websocket message', e);
    }
  }, [lastMessage, options.onlyVisible]);

  return { characters, setCharacters };
}

