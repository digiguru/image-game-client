import React, { useEffect, useState } from 'react';
import './Host.css'
const Host = ({socket}) => {
  const [gameState, setGameState] = useState("waiting for host...");
  const [users, setUsers] = useState([]);
  const [generator, setGenerator] = useState("Stable Horde");
  useEffect(() => {
    const gameStateListener = (gameState) => {
      setGameState(gameState);
    };
    const usersListener = (users) => {
        setUsers(users);
    };
    
    socket.on('gameState', gameStateListener);
    socket.on('users', usersListener);

    socket.emit('getGameState');
    return () => {
      socket.off('gameState', gameStateListener);
      socket.off('users', usersListener);
    };
  }, [socket]);
  
  const handleClick = (area) => {
    socket.emit('setGameState', area);
  };
  const handleUpdateImages = () => {
    socket.emit('updateImages');
  };
  const handleSetGenerator = (e) => {
    const gen = e.target.value; 
    setGenerator(gen)
    socket.emit('setGenerator', gen);
  };
  return (
    <div className="admin">
      <div className="admin-menu">
          <h1>Admin - {gameState}</h1>
          <ul>

              <li><SelectGameState label={"lobby"} currentGameState={gameState} handleClick={handleClick} /></li>
              <li><SelectGameState label={"ideation"} currentGameState={gameState} handleClick={handleClick} /></li>
              <li><SelectGameState label={"voting"} currentGameState={gameState} handleClick={handleClick} /></li>
              <li><SelectGameState label={"results"} currentGameState={gameState} handleClick={handleClick} /></li>

          </ul>
      </div>
      <div className="admin-debug">
          <div>
            <h1>Debug window</h1>
            <pre>{JSON.stringify(users, null, 2)}</pre>
          </div>

          <div>
            <h1>Image generators</h1>
            <div className="admin-generators">
                <RadioGenerator label="Stable Horde" onChange={handleSetGenerator} generator={generator} />
                <RadioGenerator label="Mock" onChange={handleSetGenerator} generator={generator} />
                <RadioGenerator label="Dream Studio" onChange={handleSetGenerator} generator={generator} />
                <RadioGenerator label="Dall-e" onChange={handleSetGenerator} generator={generator} />
            </div>
          </div>
          <h1>Update images</h1>
          <button onClick={() => handleUpdateImages()}>Update Images</button>
      </div>
    </div>
  );
};
const SelectGameState = ({label, currentGameState, handleClick}) => {
  const isSelected = currentGameState === label;
  return <button className={isSelected ? "selected" : undefined} onClick={() => handleClick(label)}>{label.toUpperCase()}</button>
}
const RadioGenerator = ({label, onChange, generator}) => {
  const checked = generator === label
  return <>
    <input id={label} type="radio" name="generator"  onChange={onChange} value={label}         checked={checked}        /> 
    <label htmlFor={label}>{label}</label>
    </>;
                
}
export default Host;

