import React, { useEffect, useState } from 'react';
import './GameWindow.css';
import Users from './Users';
import { Lobby } from './Lobby';
import { Ideation } from './Ideation';
import { Voting } from './Voting';
import { Results } from './Results';
import { getPlayerID } from './playerIdentity';

const GameWindow = ({ socket, roomID }) => {
  const [gameState, setGameState] = useState(null);
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState('');
  const [userID] = useState(() => getPlayerID());
  const [prompt, addPrompt] = useState('');
  const [image, setImage] = useState('');
  const [protocolError, setProtocolError] = useState('');

  const handleAddUser = (name) => {
    setUserName(name);
    socket.emit('addUser', { name, userID });
  };

  const handleAddPrompt = (nextPrompt) => {
    addPrompt(nextPrompt);
    socket.emit('addPrompt', { prompt: nextPrompt, userID });
  };

  useEffect(() => {
    const gameStateListener = setGameState;
    const usersListener = (nextUsers) => {
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
    const errorListener = ({ message } = {}) => {
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

  const screens = {
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
    results: <Results users={users} currentUserID={userID} socket={socket} />,
  };

  return (
    <div className="game" data-room={roomID}>
      {protocolError && <p role="alert">{protocolError}</p>}
      {gameState ? (
        screens[gameState] || <p role="status">Unknown game state: {gameState}</p>
      ) : (
        <p role="status">Connecting to the game server…</p>
      )}
    </div>
  );
};

export default GameWindow;
