import React, { useEffect, useState } from 'react';
import PromptInput from './PromptInput';

export const Ideation = ({ userName, prompt, users, handleAddPrompt }) => {

  const [readyPlayers, setReadyPlayers] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);

  useEffect(() => {
    setReadyPlayers(users.filter(x => x.prompt).length);
    setTotalPlayers(users.length);
  }, [users]);

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
};
