import { useState, type FormEvent } from 'react';
import './MessageInput.css';

interface PromptInputProps {
  onAddPrompt: (prompt: string) => void;
}

const PromptInput = ({ onAddPrompt }: PromptInputProps) => {
  const [prompt, setPrompt] = useState('');

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;
    onAddPrompt(trimmedPrompt);
    setPrompt('');
  };

  return (
    <form className="message-form" onSubmit={submitForm}>
      <label htmlFor="image-prompt">Image prompt</label>
      <div className="message-form-row">
        <input
          id="image-prompt"
          autoFocus
          maxLength={1000}
          required
          value={prompt}
          placeholder="Type your prompt"
          onChange={(event) => setPrompt(event.currentTarget.value)}
        />
        <button type="submit">Create image</button>
      </div>
    </form>
  );
};

export default PromptInput;
