import { ReadyState } from 'react-use-websocket';

export function formatTime(totalSeconds) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');

  if (hrs > 0) return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  return `${pad(mins)}:${pad(secs)}`;
}

export const CONNECTION_LABELS = {
  [ReadyState.CONNECTING]: { label: 'Conectando…', color: 'bg-yellow-500' },
  [ReadyState.OPEN]: { label: 'Conectado', color: 'bg-emerald-500' },
  [ReadyState.CLOSING]: { label: 'Desconectando…', color: 'bg-yellow-500' },
  [ReadyState.CLOSED]: { label: 'Desconectado', color: 'bg-red-500' },
  [ReadyState.UNINSTANTIATED]: { label: 'Sin conexión', color: 'bg-gray-500' },
};
