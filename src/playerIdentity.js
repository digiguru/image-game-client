const STORAGE_KEY = 'image-game-player-id';

export function getPlayerID(storage = globalThis.sessionStorage) {
  const existing = storage?.getItem?.(STORAGE_KEY);
  if (existing) return existing;

  const playerID = globalThis.crypto.randomUUID();
  storage?.setItem?.(STORAGE_KEY, playerID);
  return playerID;
}
