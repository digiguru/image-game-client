import { useEffect, useState } from 'react';
import { Image } from './Image';
import type { GameSocket, GameUser } from './types';
import './Voting.css';

interface VotingUser extends GameUser {
  selected: boolean;
}

interface VotingProps {
  initialUsers: GameUser[];
  currentUserID: string;
  socket: GameSocket;
}

export const Voting = ({ initialUsers, currentUserID, socket }: VotingProps) => {
  const maxVotes = 3;
  const [users, setUsers] = useState<VotingUser[]>(() =>
    initialUsers.map((user) => ({
      ...user,
      selected: user.votes.includes(currentUserID),
    })),
  );
  const [votes, setVotes] = useState(() => users.filter((user) => user.selected).length);

  const handleImageVote = (userID: string) => {
    if (userID === currentUserID) return;

    setUsers((currentUsers) => currentUsers.map((user) => {
      if (user.userID !== userID) return user;

      if (!user.selected && votes < maxVotes) {
        socket.emit('vote', { votedBy: currentUserID, votedFor: userID });
        return { ...user, selected: true };
      }

      if (user.selected) {
        socket.emit('unvote', { votedBy: currentUserID, votedFor: userID });
        return { ...user, selected: false };
      }

      return user;
    }));
  };

  useEffect(() => {
    setVotes(users.filter((user) => user.selected).length);
  }, [users]);

  return (
    <>
      <h2>Choose up to {maxVotes} to vote for. {votes} / {maxVotes}</h2>
      <p>Note - you can't vote for your own image</p>
      {votes === maxVotes && (
        <p>You have used all your votes. Either unvote one or wait for the host to load the results.</p>
      )}
      <ul className="voting">
        {[...users]
          .sort((a, b) => a.time - b.time)
          .filter((user) => user.image)
          .map(({ userID, image, time, selected, prompt }) => (
            <li key={userID} className="message-container" title={`Added at ${new Date(time).toLocaleTimeString()}`}>
              <div className={selected ? 'selected' : undefined}>
                <Image
                  alt={prompt}
                  image={image}
                  onClick={() => handleImageVote(userID)}
                  clickable={currentUserID !== userID}
                />
                <p>{prompt}</p>
              </div>
            </li>
          ))}
      </ul>
    </>
  );
};
