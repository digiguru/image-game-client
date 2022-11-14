import React, { useEffect, useState } from 'react';
import { Image } from './Image';
import './Voting.css';
export const Voting = ({initialUsers, currentUserID, socket}) => {
  const maxVotes = 3;
  console.log(initialUsers);
  const [users, setUsers] = useState(initialUsers.map(x => {
    console.log("Selectable", x.votes.includes(currentUserID), x)
    return {...x, ...{selected: x.votes.includes(currentUserID)}}
  }));
  const [votes, setVotes] = useState(0)
  
  const handleImageVote = (userID) => {
    console.log(`Vote for ${userID}`);
    setUsers(users.map(user => {
      if(user.userID === userID) {
        if(!user.selected && votes < maxVotes) {
          user.selected = true;
          socket.emit('vote', {votedBy:currentUserID,votedFor:userID});
        } else {
          user.selected = false;
          socket.emit('unvote', {votedBy:currentUserID,votedFor:userID});
        }
      }
      return user;
    }));
  
  }
  useEffect(() => {
    setVotes(users.filter(u => u.selected).length)
  }, [users])
  return <>
    <h2>Choose up to {maxVotes} to vote for. {votes} / {maxVotes}</h2>
    <p>Note - you can't vote for your image</p>
    <ul className="voting">
      {[...Object.values(users)]
        .sort((a, b) => a.time - b.time)
        .filter(x => x.image)
        .map(({ userID, image, time, selected, prompt }) => (
          <li
            key={userID}
            className="message-container"
            title={`Added at ${new Date(time).toLocaleTimeString()}`}
          >
            <div className={selected && "selected"}>
              <Image image={image} onClick={() => handleImageVote(userID)} clickable={currentUserID !== userID} />
              <p>{prompt}</p>
            </div>
          </li>
        ))}
    </ul>
  </>;
};
