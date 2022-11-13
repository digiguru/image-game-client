import React from 'react';

import { Image } from './Image';

export const Voting = ({initialUsers, currentUserID, socket}) => {
  const maxVotes = 3;
  const [users, setUsers] = React.useState(initialUsers);
  const [votes, setVotes] = React.useState(initialUsers.filter(u => u.selected).length)
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
    setVotes(initialUsers.filter(u => u.selected).length)
    //
  }
  /*useEffect(() => {
    
  }, [socket])*/
  return <>
    <h2>Choose an images to vote for. {votes} / {maxVotes}</h2>
    <ul>
      {[...Object.values(users)]
        .sort((a, b) => a.time - b.time)
        .map(({ userID, image, time, selected }) => (
          <div
            key={userID}
            className="message-container"
            title={`Added at ${new Date(time).toLocaleTimeString()}`}
          >
            <li><div>
              {selected && "SELECTED"}
              <Image image={image} onClick={() => handleImageVote(userID)} clickable={currentUserID !== userID} />
            </div></li>
          </div>
        ))}
    </ul>
  </>;
};
