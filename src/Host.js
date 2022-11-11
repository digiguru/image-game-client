import React, { useEffect, useState } from 'react';

const Host = ({socket}) => {
  const [gameState, setGameState] = useState("waiting for host...");
  const [users, setUsers] = useState([]);
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
  return (
    <>
        <h1>Admin - {gameState}</h1>
        <p><button onClick={() => handleClick("lobby")}>Lobby</button></p>
        <p><button onClick={() => handleClick("ideation")}>Ideation</button></p>
        <p><button onClick={() => handleClick("waiting")}>Waiting</button></p>
        <p><button onClick={() => handleClick("results")}>Results</button></p>
        <p><button onClick={() => handleClick("voting")}>Voting</button></p>
        <p><button onClick={() => handleClick("winner")}>Winner</button></p>
        <pre>{JSON.stringify(users, null, 2)}</pre>
    </>
  );
};

export default Host;