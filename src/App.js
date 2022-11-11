import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
import GameWindow from './GameWindow';
import Host from './Host'
import './App.css';


function Home() {
  return <h2>Home</h2>;
}

function About() {
  return <h2>About</h2>;
}

function Users() {
  return <h2>Users</h2>;
}

function App() {
  const [socket, setSocket] = useState(null);
  
  useEffect(() => {
    
    const location = process.env.REACT_APP_SERVER_HOSTNAME || `http://${window.location.hostname}:3000`

    console.log(`Locations ${location}`);
    const newSocket = io(location);
    setSocket(newSocket);
    newSocket.emit('getGameState');
    newSocket.emit('getUsers');

    return () => newSocket.close();
    
  }, [setSocket]);

  

  return (
    <div className="App">
      <header className="app-header">
        React Chat
      </header>
      { socket ? (
        <div className="chat-container">

          <Router>
            <div>
              <Routes>

                
                <Route path="/host" element={<Host socket={socket}  />}/>

              </Routes>
            </div>
          </Router>
          <GameWindow socket={socket} />
                

        </div>
      ) : (
        <div>Not Connected</div>
      )}
    </div>
  );
}

export default App;