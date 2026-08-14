import { useState, type FormEvent } from 'react';
import './MessageInput.css';

interface UserInputProps {
  onAddUser: (name: string) => void;
}

const UserInput = ({ onAddUser }: UserInputProps) => {
  const [name, setName] = useState('');

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onAddUser(trimmedName);
    setName('');
  };

  return (
    <form className="message-form" onSubmit={submitForm}>
      <label htmlFor="player-name">Your name</label>
      <div className="message-form-row">
        <input
          id="player-name"
          autoComplete="nickname"
          autoFocus
          maxLength={60}
          required
          value={name}
          placeholder="Type your name"
          onChange={(event) => setName(event.currentTarget.value)}
        />
        <button type="submit">Join game</button>
      </div>
    </form>
  );
};

export default UserInput;
