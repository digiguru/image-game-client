import React from 'react';
import UserInput from './UserInput';
import Loader from './Loader';
export const Lobby = ({ userName, handleAddUser }) => {
  return (<>
    {userName ?
      <>
        <h1>Thank you, {userName}</h1>
        <p>Waiting for the host to start the game</p>
        <Loader />
      </>
      :
      <>
        <p>To get started, please enter your name.</p>
        <UserInput onAddUser={(name) => handleAddUser(name)} />
      </>}
  </>);
};
