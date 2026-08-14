import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { createRoomID, getPlayerShareUrl } from './gameRoom';
import type { GameSocket, GameState, GameUser, GeneratorName } from './types';
import './Host.css';

interface HostProps {
  socket: GameSocket;
  roomID: string;
}

const GAME_STATES: GameState[] = ['lobby', 'ideation', 'voting', 'results'];
const GENERATORS: GeneratorName[] = ['Stable Horde', 'Mock', 'Dall-e'];

const Host = ({ socket, roomID }: HostProps) => {
  const [gameState, setGameState] = useState<GameState>('lobby');
  const [users, setUsers] = useState<GameUser[]>([]);
  const [generator, setGenerator] = useState<GeneratorName>('Dall-e');
  const [seeReset, setSeeReset] = useState(false);
  const shareUrl = useMemo(() => getPlayerShareUrl(roomID), [roomID]);

  useEffect(() => {
    const gameStateListener = (state: GameState) => setGameState(state);
    const usersListener = (nextUsers: GameUser[]) => setUsers(nextUsers);
    socket.on('gameState', gameStateListener);
    socket.on('users', usersListener);
    socket.emit('getGameState');
    socket.emit('getUsers');
    return () => {
      socket.off('gameState', gameStateListener);
      socket.off('users', usersListener);
    };
  }, [socket]);

  const handleSetGenerator = (event: ChangeEvent<HTMLInputElement>) => {
    const nextGenerator = event.target.value as GeneratorName;
    setGenerator(nextGenerator);
    socket.emit('setGenerator', nextGenerator);
  };

  const createNewRoom = () => {
    const nextRoom = createRoomID();
    globalThis.window.location.assign(`/host?room=${nextRoom}`);
  };

  return (
    <div className="admin">
      <div className="admin-menu">
        <h1>Admin - {gameState}</h1>
        <p><strong>Room:</strong> {roomID}</p>
        <p><a href={shareUrl}>Player join link</a></p>
        <button onClick={createNewRoom}>Create new room</button>
        <ul>
          {GAME_STATES.map((state) => (
            <li key={state}>
              <SelectGameState
                label={state}
                currentGameState={gameState}
                handleClick={(next) => socket.emit('setGameState', next)}
              />
            </li>
          ))}
        </ul>
      </div>
      <div className="admin-debug">
        <div>
          <h1>Players</h1>
          <pre>{JSON.stringify(users, null, 2)}</pre>
        </div>
        <div>
          <h1>Image generators</h1>
          <div className="admin-generators">
            {GENERATORS.map((name) => (
              <RadioGenerator
                key={name}
                label={name}
                onChange={handleSetGenerator}
                generator={generator}
              />
            ))}
          </div>
        </div>
        <h1>Update images</h1>
        <button onClick={() => socket.emit('updateImages')}>Update Images</button>
        <button className={!seeReset ? 'red' : 'hidden'} onClick={() => setSeeReset(true)}>Reset Game</button>
        <button className={seeReset ? 'red' : 'hidden'} onClick={() => socket.emit('reset')}>Really Reset This Game?</button>
      </div>
    </div>
  );
};

interface SelectGameStateProps {
  label: GameState;
  currentGameState: GameState;
  handleClick: (state: GameState) => void;
}

const SelectGameState = ({ label, currentGameState, handleClick }: SelectGameStateProps) => (
  <button
    className={currentGameState === label ? 'selected' : undefined}
    onClick={() => handleClick(label)}
  >
    {label.toUpperCase()}
  </button>
);

interface RadioGeneratorProps {
  label: GeneratorName;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  generator: GeneratorName;
}

const RadioGenerator = ({ label, onChange, generator }: RadioGeneratorProps) => (
  <>
    <input id={label} type="radio" name="generator" onChange={onChange} value={label} checked={generator === label} />
    <label htmlFor={label}>{label}</label>
  </>
);

export default Host;
