import { useState } from 'react';
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
  const votes = users.filter((user) => user.selected).length;

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

  return (
    <section aria-labelledby="voting-title">
      <h2 id="voting-title">Choose up to {maxVotes} images to vote for</h2>
      <p aria-live="polite">Votes selected: {votes} / {maxVotes}</p>
      <p>You can't vote for your own image.</p>
      {votes === maxVotes && (
        <p role="status">You have used all your votes. Remove a vote or wait for the host to show the results.</p>
      )}
      <ul className="voting">
        {[...users]
          .sort((a, b) => a.time - b.time)
          .filter((user) => user.image)
          .map(({ userID, image, time, selected, prompt = 'Generated image' }) => {
            const isOwnImage = currentUserID === userID;
            const disabled = isOwnImage || (!selected && votes >= maxVotes);
            const actionLabel = isOwnImage
              ? `Your image: ${prompt}`
              : selected
                ? `Remove vote for ${prompt}`
                : `Vote for ${prompt}`;

            return (
              <li key={userID} className="message-container" title={`Added at ${new Date(time).toLocaleTimeString()}`}>
                <button
                  type="button"
                  className={`vote-button${selected ? ' selected' : ''}`}
                  aria-label={actionLabel}
                  aria-pressed={selected}
                  disabled={disabled}
                  onClick={() => handleImageVote(userID)}
                >
                  <Image alt={prompt} image={image} />
                  <span className="vote-prompt">{prompt}</span>
                  {isOwnImage && <span className="vote-note">Your image</span>}
                </button>
              </li>
            );
          })}
      </ul>
    </section>
  );
};
