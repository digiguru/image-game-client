import React, { useEffect, useState } from 'react';
import './Messages.css';

function Users({ users }) {
  

  return (
    <div className="message-list">
      {[...Object.values(users)]
        .sort((a, b) => a.time - b.time)
        .map((user) => (
          <div
            key={user.userID}
            className="message-container"
            title={`Added at ${new Date(user.time).toLocaleTimeString()}`}
          >
            <span className="user">{user.name}</span>
          </div>
        ))
      }
    </div>
  );
}

export default Users;