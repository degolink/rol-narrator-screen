/**
 * Global Configuration Variables
 */

/**
 * The base WebSocket URL derived from the current window location.
 */
export const WS_BASE_URL = (() => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return `${protocol}//${host}/ws`;
})();
