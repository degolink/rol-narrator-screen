import { useCallback, useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { dequal } from 'dequal';
import { WS_BASE_URL } from '../../config';
import { apiService } from '../../services/apiService';
import { useUser } from '../../context/UserContext';

const SOCKET_URL = `${WS_BASE_URL}/characters/all/`;

/**
 * Hook to manage and synchronize a list of characters.
 * Useful for dashboards and character listings.
 */
export function useCharacters() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  const { isDungeonMaster } = useUser();

  const { lastMessage } = useWebSocket(SOCKET_URL, {
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
  });

  const refreshCharacters = useCallback(async () => {
    setLoading(true);
    try {
      const url = isDungeonMaster ? 'characters/' : 'characters/?visible=true';
      const response = await apiService.get(url);
      setCharacters(response.data);
    } catch (err) {
      console.error('Error fetching characters:', err);
    } finally {
      setLoading(false);
    }
  }, [isDungeonMaster]);

  useEffect(() => {
    if (isDungeonMaster === undefined) {
      setLoading(true);
      return;
    }

    refreshCharacters();
  }, [refreshCharacters, isDungeonMaster]);

  useEffect(() => {
    if (!lastMessage) return;
    try {
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'character_update' && data.data) {
        const lastUpdatedChar = data.data;

        setCharacters((prev) => {
          const existingIndex = prev.findIndex(
            (c) => c.id === lastUpdatedChar.id,
          );
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
      } else if (data.type === 'character_deleted' && data.id) {
        const deletedId = data.id;
        setCharacters((prev) => prev.filter((c) => c.id !== deletedId));
      }
    } catch (e) {
      console.error('Error parsing websocket message', e);
    }
  }, [lastMessage]);

  return { loading, characters, refreshCharacters };
}
