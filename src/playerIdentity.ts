const STORAGE_KEY = 'image-game-player-id';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export function getPlayerID(storage: StorageLike | undefined = globalThis.sessionStorage): string {
  const existing = storage?.getItem(STORAGE_KEY);
  if (existing) return existing;

  const playerID = globalThis.crypto.randomUUID();
  storage?.setItem(STORAGE_KEY, playerID);
  return playerID;
}
