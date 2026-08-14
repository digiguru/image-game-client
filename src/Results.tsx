import { Image } from './Image';
import type { GameUser } from './types';
import './Results.css';

interface ResultsProps {
  users: GameUser[];
}

export const Results = ({ users }: ResultsProps) => (
  <div className="results">
    <h1>Results</h1>
    <p>Starting in last place and working up to the winner.</p>
    <ul>
      {[...users]
        .sort((a, b) => a.votes.length - b.votes.length)
        .map(({ userID, name, prompt, image, time, votes }, index) => (
          <li
            key={userID}
            className="message-container"
            title={`Added at ${new Date(time).toLocaleTimeString()}`}
          >
            <div>
              <p><strong>{users.length - index}. {name}</strong></p>
              <p>{prompt} <em>{votes.length} votes</em></p>
              <Image image={image} alt={prompt} />
            </div>
          </li>
        ))}
    </ul>
  </div>
);
