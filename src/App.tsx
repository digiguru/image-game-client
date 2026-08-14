import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import GameWindow from './GameWindow';
import Host from './Host';
import { getSocketConfig } from './socketConfig';
import { getRoomID } from './gameRoom';
import type { GameSocket } from './types';
import './App.css';

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

function App() {
  const [socket, setSocket] = useState<GameSocket | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
  const roomID = getRoomID();

  useEffect(() => {
    const { serverUrl, options } = getSocketConfig();
    const newSocket = io(serverUrl, options) as GameSocket;

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
      <header className="app-header">AI Image Game</header>
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
