import React from 'react';

import { Image } from './Image';
import "./Results.css";
export const Results = ({users}) => {
  
  return <div className="results">
   <h1>Results</h1>
   <p>Starting last place and going up to the winner at the end.</p>
    <ul>
      {[...Object.values(users)]
        .sort((a, b) => a.votes.length - b.votes.length)
        .map(({ userID, name, prompt, image, time, votes }, index) => (
          <div
            key={userID}
            className="message-container"
            title={`Added at ${new Date(time).toLocaleTimeString()}`}
          >
            <li>
              <div>
                <p><strong>{users.length - index}. {name}</strong></p>
                <p>{prompt} <em>{votes.length} votes</em></p>
                <Image image={image} />
            </div></li>
          </div>
        ))}
    </ul>
  </div>;
};
