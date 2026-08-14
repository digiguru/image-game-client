import UserInput from './UserInput';
import Loader from './Loader';

interface LobbyProps {
  userName: string;
  handleAddUser: (name: string) => void;
}

export const Lobby = ({ userName, handleAddUser }: LobbyProps) => (
  <>
    {userName ? (
      <>
        <h1>Thank you, {userName}</h1>
        <p>Waiting for the host to start the game</p>
        <Loader />
      </>
    ) : (
      <>
        <p>To get started, please enter your name.</p>
        <UserInput onAddUser={handleAddUser} />
      </>
    )}
  </>
);
