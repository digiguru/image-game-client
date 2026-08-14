import { useState, type FormEvent } from 'react';
import './MessageInput.css';

interface UserInputProps {
  onAddUser: (name: string) => void;
}

const UserInput = ({ onAddUser }: UserInputProps) => {
  const [name, setName] = useState('');

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAddUser(name);
    setName('');
  };

  return (
    <form onSubmit={submitForm}>
      <input
        autoFocus
        value={name}
        placeholder="Type your name"
        onChange={(event) => setName(event.currentTarget.value)}
      />
    </form>
  );
};

export default UserInput;
