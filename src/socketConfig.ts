import type { ManagerOptions, SocketOptions } from 'socket.io-client';

export const PRODUCTION_SERVER_URL = 'https://image-game-server.vercel.app';

interface SocketConfigInput {
  serverHostname?: string;
  socketPath?: string;
  browserHostname?: string;
}

export interface ResolvedSocketConfig {
  serverUrl: string;
  options: Partial<ManagerOptions & SocketOptions>;
}

export function resolveSocketConfig({
  serverHostname,
  socketPath,
  browserHostname,
}: SocketConfigInput = {}): ResolvedSocketConfig {
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

export function getSocketConfig(): ResolvedSocketConfig {
  return resolveSocketConfig({
    serverHostname: import.meta.env.VITE_SERVER_HOSTNAME,
    socketPath: import.meta.env.VITE_SOCKET_PATH,
    browserHostname: globalThis.window.location.hostname,
  });
}
