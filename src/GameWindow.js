import React, { useEffect, useState } from 'react';
import './MessageInput.css';
import Users from './Users';
import { Lobby } from './Lobby';
import { Ideation } from './Ideation';
import { Image } from './Image';
import { Voting } from './Voting';
const uuidv4 = require('uuid').v4;

const GameWindow = ({socket}) => {
  const [gameState, setGameState] = useState("waiting for host...");
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState("");
  const [userID, setUserID] = useState("");
  const [prompt, addPrompt] = useState("");
  const [image, setImage] = useState("");
 
  const handleAddUser = function (name) {
    let id = uuidv4();
    setUserName(name);
    setUserID(id);

    socket.emit('addUser', {name,userID:id});
  }
  const handleAddPrompt = function (prompt) {
    addPrompt(prompt);
    socket.emit('addPrompt', {prompt, userID});
  }
  useEffect(() => {
    
    const gameStateListener = (gameState) => {
      setGameState(gameState);
    };
    const usersListener = (users) => {
      //TODO: This needs to use a session variable - duplicate usernames are possible
      setUsers(users);
      const selectUser = users.find(x => x.name === userName)
      console.log("GET users", userName, users, selectUser)
      if(selectUser && selectUser.image) {
        console.log("Update", image)
        setImage(selectUser.image)
      }
    };

    socket.on('gameState', gameStateListener);
    socket.on('users', usersListener);
   
    return () => {
      socket.off('gameState', gameStateListener);
      socket.off('users', usersListener);
    };
  }, [socket, userName, image]);
  
  

  return (
    <>
        <h1>{gameState}</h1>
        {userName && <p>Welcome, {userName}</p>}
        {prompt && <p>Your prompt is {prompt}</p>}
        {image && <p><Image image={image} /></p>}
        Users:
        <Users users={users} />
        {
          {
            'lobby': 
              <Lobby userName={userName} handleAddUser={handleAddUser} />,
            'ideation':
              <Ideation userName={userName} prompt={prompt} users={users} handleAddPrompt={handleAddPrompt} />,
            'voting':
              <Voting initialUsers={users} currentUserID={userID} socket={socket} />,
            'results':
               <>
               <h1>Show the results</h1>
               <p>Starting from lowest, pan up the leaderboard until you reach the top (3 should be visible on the screen)</p>
               </>,
            'other':
              <>
                <p>Not sure how you got here</p>
              </>
          }[gameState || 'other']
        }

       
       

    </>
  );
};
export default GameWindow;





