import React from 'react';
import './Users.css';

function Users({ users }) {
  

  return (
    <div className="user-list">
      {[...Object.values(users)]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((user) => (
          <div
            key={user.userID}
            className="user-container"
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