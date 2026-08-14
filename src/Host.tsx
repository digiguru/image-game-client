import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { getPlayerShareUrl } from './gameRoom';
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

  return (
    <section className="admin" aria-label="Host controls">
      <div className="admin-menu">
        <div>
          <h1>Admin - {gameState}</h1>
          <p><strong>Game slug:</strong> <code>{roomID}</code></p>
          <p><a href={shareUrl}>Player join link</a></p>
          <p className="host-note">Create and switch games from the Image Game Server dashboard.</p>
        </div>
        <nav aria-label="Game phase">
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
        </nav>
      </div>

      <div className="admin-debug">
        <section>
          <h2>Players</h2>
          <details open>
            <summary>Player data ({users.length})</summary>
            <pre>{JSON.stringify(users, null, 2)}</pre>
          </details>
        </section>

        <fieldset>
          <legend>Image generator</legend>
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
        </fieldset>

        <section className="admin-actions" aria-label="Image and reset actions">
          <h2>Game actions</h2>
          <button type="button" onClick={() => socket.emit('updateImages')}>Update Images</button>
          {!seeReset ? (
            <button type="button" className="danger" onClick={() => setSeeReset(true)}>Reset Game</button>
          ) : (
            <div className="reset-confirmation" role="group" aria-label="Confirm game reset">
              <button type="button" className="danger" onClick={() => socket.emit('reset')}>Really Reset This Game?</button>
              <button type="button" className="secondary" onClick={() => setSeeReset(false)}>Cancel reset</button>
            </div>
          )}
        </section>
      </div>
    </section>
  );
};

interface SelectGameStateProps {
  label: GameState;
  currentGameState: GameState;
  handleClick: (state: GameState) => void;
}

const SelectGameState = ({ label, currentGameState, handleClick }: SelectGameStateProps) => (
  <button
    type="button"
    aria-pressed={currentGameState === label}
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

const RadioGenerator = ({ label, onChange, generator }: RadioGeneratorProps) => {
  const inputID = `generator-${label.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`;
  return (
    <label className="generator-option" htmlFor={inputID}>
      <input id={inputID} type="radio" name="generator" onChange={onChange} value={label} checked={generator === label} />
      <span>{label}</span>
    </label>
  );
};

export default Host;
