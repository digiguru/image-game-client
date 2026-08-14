import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import GameWindow from './GameWindow';
import Host from './Host';
import { getSocketConfig } from './socketConfig';
import { getRoomID } from './gameRoom';
import './App.css';

function App() {
  const [socket, setSocket] = useState(null);
  const [connectionState, setConnectionState] = useState('connecting');
  const roomID = getRoomID();

  useEffect(() => {
    const { serverUrl, options } = getSocketConfig();
    const newSocket = io(serverUrl, options);

    const syncRoom = () => {
      setConnectionState('connected');
      newSocket.emit('joinGame', { roomID });
      newSocket.emit('getGameState');
      newSocket.emit('getUsers');
    };

    newSocket.on('connect', syncRoom);
    newSocket.on('disconnect', () => setConnectionState('disconnected'));
    newSocket.on('connect_error', () => setConnectionState('error'));
    setSocket(newSocket);

    return () => {
      newSocket.off('connect', syncRoom);
      newSocket.close();
    };
  }, [roomID]);

  return (
    <div className="App">
      <header className="app-header">
        AI Image Game
      </header>
      {connectionState !== 'connected' && (
        <p role="status">Game server: {connectionState}</p>
      )}
      {socket ? (
        <>
          <Router>
            <Routes>
              <Route path="/host" element={<Host socket={socket} roomID={roomID} />} />
            </Routes>
          </Router>
          <GameWindow socket={socket} roomID={roomID} />
        </>
      ) : (
        <div>Connecting…</div>
      )}
    </div>
  );
}

export default App;
