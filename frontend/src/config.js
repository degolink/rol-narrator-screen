/**
 * Global Configuration Variables
 */

/**
 * The base WebSocket URL derived from the current window location.
 * Assumes the Django backend is on port 8000 if the frontend is on 5173.
 */
export const WS_BASE_URL = (() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = window.location.port === '5173' ? '8000' : window.location.port;
    const hostWithPort = port ? `${host}:${port}` : host;
    return `${protocol}//${hostWithPort}/ws`;
})();
