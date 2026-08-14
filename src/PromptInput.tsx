import { useState, type FormEvent } from 'react';
import './MessageInput.css';

interface PromptInputProps {
  onAddPrompt: (prompt: string) => void;
}

const PromptInput = ({ onAddPrompt }: PromptInputProps) => {
  const [prompt, setPrompt] = useState('');

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAddPrompt(prompt);
    setPrompt('');
  };

  return (
    <form onSubmit={submitForm}>
      <input
        autoFocus
        value={prompt}
        placeholder="Type your prompt"
        onChange={(event) => setPrompt(event.currentTarget.value)}
      />
    </form>
  );
};

export default PromptInput;
