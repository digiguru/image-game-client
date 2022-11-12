import React from 'react';
import UserInput from './UserInput';

export const Lobby = ({ userName, handleAddUser }) => {
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
};
