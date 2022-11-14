import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import GameWindow from './GameWindow';
import Host from './Host'
import './App.css';


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
        AI Image Game
      </header>
      { socket ? (
        <>

          <Router>
            <div>
              <Routes>

                
                <Route path="/host" element={<Host socket={socket}  />}/>

              </Routes>
            </div>
          </Router>
          <GameWindow socket={socket} />
                

        </>
      ) : (
        <div>Not Connected</div>
      )}
    </div>
  );
}

export default App;