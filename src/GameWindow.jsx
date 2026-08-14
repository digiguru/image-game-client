import React, { useEffect, useState } from 'react';
import './GameWindow.css';
import Users from './Users';
import { Lobby } from './Lobby';
import { Ideation } from './Ideation';
import { Voting } from './Voting';
import { Results } from './Results';

const id = globalThis.crypto.randomUUID();

const GameWindow = ({ socket }) => {
  const [gameState, setGameState] = useState(null);
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState('');
  const [userID, setUserID] = useState('');
  const [prompt, addPrompt] = useState('');
  const [image, setImage] = useState('');

  const handleAddUser = (name) => {
    setUserName(name);
    setUserID(id);
    socket.emit('addUser', { name, userID: id });
  };

  const handleAddPrompt = (nextPrompt) => {
    addPrompt(nextPrompt);
    socket.emit('addPrompt', { prompt: nextPrompt, userID });
  };

  useEffect(() => {
    const gameStateListener = (nextGameState) => {
      setGameState(nextGameState);
    };

    const usersListener = (nextUsers) => {
      setUsers(nextUsers);
      const currentUser = nextUsers.find((user) => user.userID === userID);
      if (currentUser?.image) {
        setImage(currentUser.image);
      }
    };

    const resetListener = () => {
      setUsers([]);
      setUserName('');
      setUserID('');
      addPrompt('');
      setImage('');
    };

    socket.on('gameState', gameStateListener);
    socket.on('users', usersListener);
    socket.on('reset-clients', resetListener);

    return () => {
      socket.off('gameState', gameStateListener);
      socket.off('users', usersListener);
      socket.off('reset-clients', resetListener);
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
    <div className="game">
      {gameState ? (
        screens[gameState] || <p role="status">Unknown game state: {gameState}</p>
      ) : (
        <p role="status">Connecting to the game server…</p>
      )}
    </div>
  );
};

export default GameWindow;
