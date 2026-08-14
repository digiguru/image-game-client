import type { GameState } from './types';

export const DEFAULT_ROOM_ID = 'default';
const GAME_STATES: GameState[] = ['lobby', 'ideation', 'voting', 'results'];

export function normaliseRoomID(value: unknown): string {
  if (typeof value !== 'string') return DEFAULT_ROOM_ID;
  const roomID = value.trim();
  return /^[a-zA-Z0-9_-]{1,40}$/.test(roomID) ? roomID : DEFAULT_ROOM_ID;
}

export function getRoomID(search = globalThis.window.location.search): string {
  const params = new globalThis.URLSearchParams(search);
  return normaliseRoomID(params.get('room'));
}

export function getRequestedHostState(
  search = globalThis.window.location.search,
  pathname = globalThis.window.location.pathname,
): GameState | null {
  if (pathname !== '/host') return null;
  const state = new globalThis.URLSearchParams(search).get('state');
  return GAME_STATES.includes(state as GameState) ? state as GameState : null;
}

export function clearRequestedHostState(location = globalThis.window.location): void {
  const url = new globalThis.URL(location.href);
  url.searchParams.delete('state');
  globalThis.window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export function getPlayerShareUrl(
  roomID: string,
  location: Pick<Location, 'origin'> = globalThis.window.location,
): string {
  const url = new globalThis.URL(location.origin);
  url.searchParams.set('room', normaliseRoomID(roomID));
  return url.toString();
}
