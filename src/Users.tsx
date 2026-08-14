import type { GameUser } from './types';
import './Users.css';

interface UsersProps {
  users: GameUser[];
}

function Users({ users }: UsersProps) {
  if (users.length === 0) return null;

  return (
    <section aria-labelledby="players-title">
      <h2 id="players-title" className="section-title">Players</h2>
      <ul className="user-list" aria-label={`${users.length} players in this room`}>
        {[...users]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((user) => (
            <li
              key={user.userID}
              className="user-container"
              title={`Joined at ${new Date(user.time).toLocaleTimeString()}`}
            >
              <span className="user">{user.name}</span>
            </li>
          ))}
      </ul>
    </section>
  );
}

export default Users;
