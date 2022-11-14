import React, { useEffect, useState } from 'react';
import PromptInput from './PromptInput';
import Loader from './Loader';
import { Image } from './Image';
export const Ideation = ({ userName, prompt, users, handleAddPrompt, image}) => {

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
          <h1>Here you go, {userName}</h1>
          {image ? <div>
            <Image image={image} />
            <h2> {prompt}</h2>
            <p>Waiting for other players to dream up their creation</p>
          </div> : <><p>Loading your picture...</p><Loader /></>}
          
          <p>Playes ready: {readyPlayers} / {totalPlayers}</p>
          {totalPlayers === readyPlayers && <>
          <p>Waiting for host to go to the results</p>
          <Loader />
          </>
          }
        </> :
        <>
        {userName && <p>Welcome, {userName}</p>}
        {prompt && <p>Your prompt is {prompt}</p>}
        
       
          <h1>Okay, {userName}</h1>
          <p>Time to dream up a unique image</p>
          <p>Please describe what you would like to see</p>
          <PromptInput onAddPrompt={(prompt) => handleAddPrompt(prompt)} />
        </>}
  </>);
};
