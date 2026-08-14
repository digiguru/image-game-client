export const DEFAULT_ROOM_ID = 'default';

export function normaliseRoomID(value: unknown): string {
  if (typeof value !== 'string') return DEFAULT_ROOM_ID;
  const roomID = value.trim();
  return /^[a-zA-Z0-9_-]{1,40}$/.test(roomID) ? roomID : DEFAULT_ROOM_ID;
}

export function getRoomID(search = globalThis.window.location.search): string {
  const params = new globalThis.URLSearchParams(search);
  return normaliseRoomID(params.get('room'));
}

export function getPlayerShareUrl(
  roomID: string,
  location: Pick<Location, 'origin'> = globalThis.window.location,
): string {
  const url = new globalThis.URL(location.origin);
  url.searchParams.set('room', normaliseRoomID(roomID));
  return url.toString();
}

export function createRoomID(): string {
  return globalThis.crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase();
}
