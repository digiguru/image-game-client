import PromptInput from './PromptInput';
import Loader from './Loader';
import { Image } from './Image';
import type { GameUser } from './types';

interface IdeationProps {
  userName: string;
  prompt: string;
  users: GameUser[];
  handleAddPrompt: (prompt: string) => void;
  image: string;
}

export const Ideation = ({
  userName,
  prompt,
  users,
  handleAddPrompt,
  image,
}: IdeationProps) => {
  const readyPlayers = users.filter((user) => user.prompt).length;
  const totalPlayers = users.length;

  if (!userName) {
    return (
      <>
        <h1>You cannot play as you haven't got a name</h1>
        <p>Please ask the host to activate the lobby again</p>
      </>
    );
  }

  if (prompt) {
    return (
      <>
        <h1>Here you go, {userName}</h1>
        {image ? (
          <div>
            <Image image={image} alt={prompt} />
            <h2>{prompt}</h2>
            <p>Waiting for other players to dream up their creation</p>
          </div>
        ) : (
          <>
            <p>Loading your picture...</p>
            <Loader />
          </>
        )}
        <p>Players ready: {readyPlayers} / {totalPlayers}</p>
        {totalPlayers === readyPlayers && (
          <>
            <p>Waiting for host to go to the voting page</p>
            <Loader />
          </>
        )}
      </>
    );
  }

  return (
    <>
      <p>Welcome, {userName}</p>
      <h1>Okay, {userName}</h1>
      <p>Time to dream up a unique image</p>
      <p>Please describe what you would like to see</p>
      <PromptInput onAddPrompt={handleAddPrompt} />
    </>
  );
};
