import React, { useEffect, useMemo, useState } from 'react';
import { getPlayerShareUrl } from './gameRoom';
import './Host.css';

const Host = ({ socket, roomID }) => {
  const [gameState, setGameState] = useState('lobby');
  const [users, setUsers] = useState([]);
  const [generator, setGenerator] = useState('Dall-e');
  const [seeReset, setSeeReset] = useState(false);
  const shareUrl = useMemo(() => getPlayerShareUrl(roomID), [roomID]);

  useEffect(() => {
    const gameStateListener = setGameState;
    const usersListener = setUsers;
    socket.on('gameState', gameStateListener);
    socket.on('users', usersListener);
    socket.emit('getGameState');
    socket.emit('getUsers');
    return () => {
      socket.off('gameState', gameStateListener);
      socket.off('users', usersListener);
    };
  }, [socket]);

  const handleSetGenerator = (event) => {
    const nextGenerator = event.target.value;
    setGenerator(nextGenerator);
    socket.emit('setGenerator', nextGenerator);
  };

  return (
    <div className="admin">
      <div className="admin-menu">
        <h1>Admin - {gameState}</h1>
        <p><strong>Room:</strong> {roomID}</p>
        <p><a href={shareUrl}>Player join link</a></p>
        <ul>
          {['lobby', 'ideation', 'voting', 'results'].map((state) => (
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
            <RadioGenerator label="Stable Horde" onChange={handleSetGenerator} generator={generator} />
            <RadioGenerator label="Mock" onChange={handleSetGenerator} generator={generator} />
            <RadioGenerator label="Dall-e" onChange={handleSetGenerator} generator={generator} />
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

const SelectGameState = ({ label, currentGameState, handleClick }) => (
  <button
    className={currentGameState === label ? 'selected' : undefined}
    onClick={() => handleClick(label)}
  >
    {label.toUpperCase()}
  </button>
);

const RadioGenerator = ({ label, onChange, generator }) => (
  <>
    <input id={label} type="radio" name="generator" onChange={onChange} value={label} checked={generator === label} />
    <label htmlFor={label}>{label}</label>
  </>
);

export default Host;
