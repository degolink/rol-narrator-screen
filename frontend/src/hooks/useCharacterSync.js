import { useEffect, useState, useMemo } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

const CONNECTION_STATUSES = {
  [ReadyState.CONNECTING]: 'Connecting',
  [ReadyState.OPEN]: 'Open',
  [ReadyState.CLOSING]: 'Closing',
  [ReadyState.CLOSED]: 'Closed',
  [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
};

export function useCharacterSync(characterId) {
  const [characterData, setCharacterData] = useState(null);

  // If no characterId is provided, we might connect to a general pool or just not connect.
  const socketUrl = useMemo(() => {
    return characterId
      ? `ws://127.0.0.1:8000/ws/characters/${characterId}/`
      : `ws://127.0.0.1:8000/ws/characters/`;
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
      if (data.type === 'character_update') {
        setCharacterData(data.data);
      }
    } catch (e) {
      console.error('Error parsing websocket message', e);
    }
  }, [lastMessage]);

  const connectionStatus = CONNECTION_STATUSES[readyState];

  return {
    characterData,
    connectionStatus,
    readyState,
    sendJsonMessage,
    lastMessage,
  };
}
