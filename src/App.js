import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Messages from './Messages';
import MessageInput from './MessageInput';

import './App.css';

function App() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    
    const location = process.env.REACT_APP_SERVER_HOSTNAME || `http://${window.location.hostname}:3000`

    console.log(`Locations ${location}`);
    const newSocket = io(location);
    setSocket(newSocket);
    return () => newSocket.close();
  }, [setSocket]);

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
        <div>Not Connected</div>
      )}
    </div>
  );
}

export default App;