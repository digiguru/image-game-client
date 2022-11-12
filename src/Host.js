import React, { useEffect, useState } from 'react';

const Host = ({socket}) => {
  const [gameState, setGameState] = useState("waiting for host...");
  const [users, setUsers] = useState([]);
  const [generator, setGenerator] = useState("Mock");
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
    <>
        <h1>Admin - {gameState}</h1>
        <ul>
            <li><button onClick={() => handleClick("lobby")}>Lobby</button></li>
            <li><button onClick={() => handleClick("ideation")}>Ideation</button></li>
            <li><button onClick={() => handleClick("waiting")}>Waiting</button></li>
            <li><button onClick={() => handleClick("results")}>Results</button></li>
            <li><button onClick={() => handleClick("voting")}>Voting</button></li>
            <li><button onClick={() => handleClick("winner")}>Winner</button></li>
        </ul>
        <pre>{JSON.stringify(users, null, 2)}</pre>
        <h1>Image generators</h1>
        <div>
            <input type="radio" name="generator"  onChange={handleSetGenerator} value="Mock"         checked={generator === "Mock"}        /> Mock
            <input type="radio" name="generator"  onChange={handleSetGenerator} value="Stable Horde" checked={generator === "Stable Horde"}/> Stable Horde
            <input type="radio" name="generator"  onChange={handleSetGenerator} value="Dream Studio" checked={generator === "Dream Studio"}/> Dream Studio
            <input type="radio" name="generator"  onChange={handleSetGenerator} value="Dall-e"       checked={generator === "Dall-e"}      /> Dall-e
        </div>

        <h1>Update images</h1>
        <button onClick={() => handleUpdateImages()}>Update Images</button>
    </>
  );
};

export default Host;