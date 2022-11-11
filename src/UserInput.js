import React, { useState } from 'react';
import './MessageInput.css';

const UserInput = ({onAddUser}) => {
  const [name, setName] = useState('');
  const submitForm = (e) => {
    e.preventDefault();
    onAddUser(name);
    setName('');
  };

  return (
    <form onSubmit={submitForm}>
      <input
        autoFocus
        value={name}
        placeholder="Type your message"
        onChange={(e) => {
          setName(e.currentTarget.value);
        }}
      />
    </form>
  );
};

export default UserInput;