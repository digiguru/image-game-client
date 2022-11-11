import React, { useState } from 'react';
import './MessageInput.css';

const PromptInput = ({onAddPrompt}) => {
  const [prompt, setPrompt] = useState('');
  const submitForm = (e) => {
    e.preventDefault();
    onAddPrompt(prompt);
    setPrompt('');
  };

  return (
    <form onSubmit={submitForm}>
      <input
        autoFocus
        value={prompt}
        placeholder="Type your message"
        onChange={(e) => {
          setPrompt(e.currentTarget.value);
        }}
      />
    </form>
  );
};

export default PromptInput;