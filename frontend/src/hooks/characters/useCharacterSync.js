import { useEffect, useState, useMemo } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { dequal } from 'dequal';
import { WS_BASE_URL } from '../../config';

const CONNECTION_STATUSES = {
  [ReadyState.CONNECTING]: 'Connecting',
  [ReadyState.OPEN]: 'Open',
  [ReadyState.CLOSING]: 'Closing',
  [ReadyState.CLOSED]: 'Closed',
  [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
};

export function useCharacterSync(characterId) {
  if (!characterId) {
    throw new Error('useCharacterSync requires a specific characterId. Use useCharactersListSync for a global pool.');
  }

  const [characterData, setCharacterData] = useState(null);

  const socketUrl = useMemo(() => {
    return `${WS_BASE_URL}/characters/${characterId}/`;
  }, [characterId]);

  const { lastMessage, readyState, sendJsonMessage } = useWebSocket(socketUrl, {
    shouldReconnect: (closeEvent) => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
  });

  useEffect(() => {
    if (!lastMessage) return;
    try {
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'character_update' && data.data) {
        if (!dequal(data.data, characterData)) {
          setCharacterData(data.data);
        }
      }
    } catch (e) {
      console.error('Error parsing websocket message', e);
    }
  }, [lastMessage, characterData]);

  const connectionStatus = CONNECTION_STATUSES[readyState];

  return {
    characterData,
    connectionStatus,
    readyState,
    sendJsonMessage,
    lastMessage,
  };
}

