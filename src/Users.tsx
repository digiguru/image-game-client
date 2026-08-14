import type { GameUser } from './types';
import './Users.css';

interface UsersProps {
  users: GameUser[];
}

function Users({ users }: UsersProps) {
  return (
    <div className="user-list">
      {[...users]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((user) => (
          <div
            key={user.userID}
            className="user-container"
            title={`Added at ${new Date(user.time).toLocaleTimeString()}`}
          >
            <span className="user">{user.name}</span>
          </div>
        ))}
    </div>
  );
}

export default Users;
