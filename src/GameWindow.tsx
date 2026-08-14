import { useEffect, useState, type ReactNode } from 'react';
import './GameWindow.css';
import Users from './Users';
import { Lobby } from './Lobby';
import { Ideation } from './Ideation';
import { Voting } from './Voting';
import { Results } from './Results';
import { getPlayerID } from './playerIdentity';
import type { GameSocket, GameState, GameUser, ProtocolError } from './types';

interface GameWindowProps {
  socket: GameSocket;
  roomID: string;
}

const GameWindow = ({ socket, roomID }: GameWindowProps) => {
  const [gameState, setGameState] = useState<string | null>(null);
  const [users, setUsers] = useState<GameUser[]>([]);
  const [userName, setUserName] = useState('');
  const [userID] = useState(() => getPlayerID());
  const [prompt, addPrompt] = useState('');
  const [image, setImage] = useState('');
  const [protocolError, setProtocolError] = useState('');

  const handleAddUser = (name: string) => {
    setUserName(name);
    socket.emit('addUser', { name, userID });
  };

  const handleAddPrompt = (nextPrompt: string) => {
    addPrompt(nextPrompt);
    socket.emit('addPrompt', { prompt: nextPrompt, userID });
  };

  useEffect(() => {
    const gameStateListener = (state: GameState) => setGameState(state);
    const usersListener = (nextUsers: GameUser[]) => {
      setUsers(nextUsers);
      const currentUser = nextUsers.find((user) => user.userID === userID);
      if (currentUser?.name) setUserName(currentUser.name);
      if (currentUser?.image) setImage(currentUser.image);
    };
    const resetListener = () => {
      setUsers([]);
      setUserName('');
      addPrompt('');
      setImage('');
      setProtocolError('');
    };
    const errorListener = ({ message }: ProtocolError = {}) => {
      setProtocolError(message || 'The game server rejected that action');
    };

    socket.on('gameState', gameStateListener);
    socket.on('users', usersListener);
    socket.on('reset-clients', resetListener);
    socket.on('protocolError', errorListener);

    return () => {
      socket.off('gameState', gameStateListener);
      socket.off('users', usersListener);
      socket.off('reset-clients', resetListener);
      socket.off('protocolError', errorListener);
    };
  }, [socket, userID]);

  const screens: Record<GameState, ReactNode> = {
    lobby: (
      <>
        <Lobby userName={userName} handleAddUser={handleAddUser} />
        <Users users={users} />
      </>
    ),
    ideation: (
      <Ideation
        userName={userName}
        prompt={prompt}
        users={users}
        handleAddPrompt={handleAddPrompt}
        image={image}
      />
    ),
    voting: <Voting initialUsers={users} currentUserID={userID} socket={socket} />,
    results: <Results users={users} />,
  };

  const activeScreen = gameState && gameState in screens
    ? screens[gameState as GameState]
    : null;

  return (
    <div className="game" data-room={roomID}>
      {protocolError && <p role="alert">{protocolError}</p>}
      {!gameState && <p role="status">Connecting to the game server…</p>}
      {gameState && (activeScreen || <p role="status">Unknown game state: {gameState}</p>)}
    </div>
  );
};

export default GameWindow;
