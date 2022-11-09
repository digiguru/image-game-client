import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';


function User({socket}) {

  return (
    <div className="App">
      <header className="app-header">
        React Chat
      </header>
      { socket ? (
        <div className="chat-container">
          <Messages socket={socket} />
          <MessageInput socket={socket} />
        </div>
      ) : (
        <div>App is offline</div>
      )}
    </div>
  );
}

export default App;