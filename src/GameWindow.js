import React, { useEffect, useState } from 'react';
import './MessageInput.css';
import Messages from './Messages';
import MessageInput from './MessageInput';
import UserInput from './UserInput';
import PromptInput from './PromptInput';
import Users from './Users';

const GameWindow = ({socket}) => {
  const [gameState, setGameState] = useState("waiting for host...");
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState("");
  const [prompt, addPrompt] = useState("");
 
  const handleAddUser = function (name) {
    setUserName(name);
    socket.emit('addUser', name);
  }
  const handleAddPrompt = function (prompt) {
    addPrompt(prompt);
    socket.emit('addPrompt', prompt);
  }
  useEffect(() => {
    
    const gameStateListener = (gameState) => {
      setGameState(gameState);
    };
    const usersListener = (users) => {
      setUsers(users);
    };

    socket.on('gameState', gameStateListener);
    socket.on('users', usersListener);
    return () => {
      socket.off('gameState', gameStateListener);
      socket.off('users', usersListener);
    };
  }, [socket]);
  

  return (
    <>
        <h1>{gameState}</h1>
        {userName && <p>Welcome, {userName}</p>}
        {prompt && <p>Your prompt is {prompt}</p>}
        Users:
        <Users users={users} />
        {
          {
            'lobby': 
              <Lobby userName={userName} handleAddUser={handleAddUser} />,
            'ideation':
              <Ideation userName={userName} prompt={prompt} users={users} handleAddPrompt={handleAddPrompt} />,
            'other':
              <>
                <p>Not sure how you got here</p>
              </>
          }[gameState || 'other']
        }

       
       

    </>
  );
};
const Lobby = ({userName, handleAddUser}) => {
  return (<>
    <p>Welcome to the lobby</p>
    {userName ?
      <>
        <h1>{userName}</h1>
        <p>waiting for the host to start the game</p>
      </>
      :
      <>
        <p>Enter your name</p>
        <UserInput onAddUser={(name) => handleAddUser(name)} />
      </>}
  </>);
}
const Ideation = ({userName, prompt, users, handleAddPrompt}) => {
  
  const [readyPlayers, setReadyPlayers] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);

  useEffect(() => {
    setReadyPlayers(users.filter(x => x.prompt).length);
    setTotalPlayers(users.length);
  }, [users])

  return (<>
    {!userName ?
      <>
        <h1>You cannot play as you havn't got a name</h1>
        <p>Please ask the host to activate the lobby again</p>
      </> :
      prompt ?
        <>
          <h1>Your prompt is {prompt}</h1>
          <p>Waiting for other players</p>
          <p>Playes ready: {readyPlayers} / {totalPlayers}</p>
          {totalPlayers === readyPlayers && <p>Waiting for host to go to the results</p>}
        </> :
        <>
          <p>Ideation round</p>
          <p>Please enter a prompt</p>
          <PromptInput onAddPrompt={(prompt) => handleAddPrompt(prompt)} />
        </>}
  </>);
}
export default GameWindow;



