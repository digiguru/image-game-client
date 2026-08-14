import type { Socket } from 'socket.io-client';

export type GameState = 'lobby' | 'ideation' | 'voting' | 'results';
export type GeneratorName = 'Mock' | 'Stable Horde' | 'Dall-e';

export interface GameUser {
  userID: string;
  name: string;
  time: number;
  votes: string[];
  prompt?: string;
  image?: string;
  imageid?: string;
}

export interface ProtocolError {
  message?: string;
}

export interface ServerToClientEvents {
  gameState: (state: GameState) => void;
  users: (users: GameUser[]) => void;
  joinedGame: (payload: { roomID: string }) => void;
  'reset-clients': () => void;
  protocolError: (error: ProtocolError) => void;
}

export interface ClientToServerEvents {
  joinGame: (payload: { roomID: string }) => void;
  reset: () => void;
  getGameState: () => void;
  setGameState: (state: GameState) => void;
  setGenerator: (generator: GeneratorName) => void;
  getUsers: () => void;
  addUser: (payload: { name: string; userID: string }) => void;
  addPrompt: (payload: { prompt: string; userID: string }) => void;
  updateImages: () => void;
  vote: (payload: { votedBy: string; votedFor: string }) => void;
  unvote: (payload: { votedBy: string; votedFor: string }) => void;
}

export type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
