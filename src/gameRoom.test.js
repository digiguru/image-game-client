import { describe, expect, test } from 'vitest';
import { DEFAULT_ROOM_ID, getRoomID, getPlayerShareUrl, normaliseRoomID } from './gameRoom';

describe('game room helpers', () => {
  test('reads a valid room from the URL', () => {
    expect(getRoomID('?room=ABCD1234')).toBe('ABCD1234');
  });

  test('falls back for malformed room identifiers', () => {
    expect(normaliseRoomID('bad room!')).toBe(DEFAULT_ROOM_ID);
    expect(getRoomID('?room=')).toBe(DEFAULT_ROOM_ID);
  });

  test('creates a player link for the same room', () => {
    expect(getPlayerShareUrl('ROOM1', { origin: 'https://game.example' })).toBe('https://game.example/?room=ROOM1');
  });
});
