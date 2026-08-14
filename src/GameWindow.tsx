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

const STATE_TRANSITIONS: Record<GameState, { title: string; subtitle: string }> = {
  lobby: {
    title: 'Welcome to the lobby',
    subtitle: 'Gather the players',
  },
  ideation: {
    title: 'Time to imagine',
    subtitle: 'Create something brilliant',
  },
  voting: {
    title: 'Voting is open',
    subtitle: 'Choose your favourites',
  },
  results: {
    title: 'The results are in',
    subtitle: 'Time to celebrate',
  },
};

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

  const knownGameState = gameState && gameState in screens
    ? gameState as GameState
    : null;
  const activeScreen = knownGameState ? screens[knownGameState] : null;
  const transition = knownGameState ? STATE_TRANSITIONS[knownGameState] : null;

  return (
    <section
      className="game"
      data-room={roomID}
      data-game-state={knownGameState ?? undefined}
      aria-label={`Game room ${roomID}`}
    >
      {protocolError && <p className="alert" role="alert">{protocolError}</p>}
      {!gameState && <p role="status">Connecting to the game server…</p>}
      {knownGameState && transition && (
        <div key={knownGameState} className={`game-stage game-stage-${knownGameState}`}>
          <div className="game-stage-transition" aria-hidden="true">
            <div className="game-stage-orbit">
              <span className="game-stage-orb" />
              <span className="game-stage-ring game-stage-ring-one" />
              <span className="game-stage-ring game-stage-ring-two" />
            </div>
            <div className="game-stage-transition-copy">
              <span className="game-stage-kicker">{knownGameState}</span>
              <strong>{transition.title}</strong>
              <span>{transition.subtitle}</span>
            </div>
            {knownGameState === 'results' && (
              <div className="game-stage-sparkles">
                {Array.from({ length: 12 }, (_, index) => (
                  <span key={index} style={{ '--spark-index': index } as React.CSSProperties} />
                ))}
              </div>
            )}
          </div>
          <div className="game-stage-content">{activeScreen}</div>
          <p className="game-stage-live" role="status" aria-live="polite">
            Game phase: {transition.title}
          </p>
        </div>
      )}
      {gameState && !knownGameState && <p role="status">Unknown game state: {gameState}</p>}
    </section>
  );
};

export default GameWindow;
