import React, { useEffect, useState } from 'react';
import './GameWindow.css';
import Users from './Users';
import { Lobby } from './Lobby';
import { Ideation } from './Ideation';
import { Voting } from './Voting';
import { Results } from './Results';

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
    const reset = () => {
      setUsers([]);
      setUserName("");
      setUserID("");
      addPrompt("");
      setImage("");
    }

    socket.on('gameState', gameStateListener);

    socket.on('users', usersListener);
    socket.on('reset-clients', gameStateListener);

    return () => {
      socket.off('gameState', gameStateListener);
      socket.off('users', usersListener);
    };
  }, [socket, userName, image]);
  
  

  return (
    <div className="game">
        
        {
          {
            'lobby': 
              <>
              <Lobby userName={userName} handleAddUser={handleAddUser} />
              <Users users={users} />
              </>,
            'ideation':
              <Ideation userName={userName} prompt={prompt} users={users} handleAddPrompt={handleAddPrompt} image={image} />,
            'voting':
              <Voting initialUsers={users} currentUserID={userID} socket={socket} />,
            'results':
              <Results users={users} currentUserID={userID} socket={socket} />,
            'other':
              <>
                <p>Not sure how you got here</p>
              </>
          }[gameState || 'other']
        }

       
       

    </div>
  );
};
export default GameWindow;





