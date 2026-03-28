import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';
import { dequal } from 'dequal';
import { toast } from 'sonner';
import { WS_BASE_URL } from '../../config';
import { apiService } from '../../services/apiService';

export function useCharacter(characterId) {
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);

  const socketUrl = useMemo(() => {
    return `${WS_BASE_URL}/characters/${characterId}/`;
  }, [characterId]);

  const { lastMessage } = useWebSocket(socketUrl, {
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
  });

  useEffect(() => {
    if (!characterId) {
      navigate('/', { replace: true });
    }

    const fetchCharacter = async () => {
      try {
        const response = await apiService.get(`characters/${characterId}/`);
        setCharacter(response.data);
      } catch (err) {
        console.error('Error fetching character:', err);
        toast.error('Personaje no encontrado');
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchCharacter();
  }, [characterId, navigate]);

  useEffect(() => {
    if (!lastMessage) return;
    try {
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'character_update' && data.data) {
        if (!dequal(data.data, character)) {
          setCharacter(data.data);
        }
      } else if (data.type === 'character_deleted') {
        // If the current character is deleted, redirect to the list
        navigate('/personajes', { replace: true });
      }
    } catch (e) {
      console.error('Error parsing websocket message', e);
    }
  }, [lastMessage, character, navigate]);

  return { loading, character };
}
