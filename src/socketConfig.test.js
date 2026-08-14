import { describe, expect, test } from 'vitest';
import { PRODUCTION_SERVER_URL, resolveSocketConfig } from './socketConfig';

describe('resolveSocketConfig', () => {
  test('uses the local Socket.IO endpoint during local development', () => {
    expect(resolveSocketConfig({ browserHostname: 'localhost' })).toEqual({
      serverUrl: 'http://localhost:3000',
      options: {
        path: '/socket.io',
        transports: ['websocket'],
      },
    });
  });

  test('uses the exact Vercel Socket.IO function route in production', () => {
    expect(resolveSocketConfig({ browserHostname: 'image-game-client.vercel.app' })).toEqual({
      serverUrl: PRODUCTION_SERVER_URL,
      options: {
        path: '/api/socket-io',
        transports: ['websocket'],
      },
    });
  });

  test('allows explicit preview or custom endpoint overrides', () => {
    expect(resolveSocketConfig({
      browserHostname: 'preview.example',
      serverHostname: 'https://server-preview.example',
      socketPath: '/custom/socket.io',
    })).toEqual({
      serverUrl: 'https://server-preview.example',
      options: {
        path: '/custom/socket.io',
        transports: ['websocket'],
      },
    });
  });
});
