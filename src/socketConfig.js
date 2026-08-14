export const PRODUCTION_SERVER_URL = 'https://image-game-server.vercel.app';

export function resolveSocketConfig({
  serverHostname,
  socketPath,
  browserHostname,
} = {}) {
  const hostname = browserHostname || 'localhost';
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

  const serverUrl = serverHostname || (
    isLocal ? `http://${hostname}:3000` : PRODUCTION_SERVER_URL
  );

  const path = socketPath || (
    isLocal ? '/socket.io' : '/api/socket-io/socket.io'
  );

  return {
    serverUrl,
    options: {
      path,
      transports: ['websocket'],
    },
  };
}

export function getSocketConfig() {
  return resolveSocketConfig({
    serverHostname: import.meta.env.VITE_SERVER_HOSTNAME,
    socketPath: import.meta.env.VITE_SOCKET_PATH,
    browserHostname: window.location.hostname,
  });
}
