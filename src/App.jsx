import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import io from "socket.io-client";
import Forms from './components/Forms';
import RoomPage from "./pages/RoomPage";
import './App.css';

const server = "http://localhost:5000";
const connectionOptions = {
  "force new connection": true,
  timeout: 10000,
  transports: ["websocket"],
};

const socket = io(server, connectionOptions);

const App = () => {
  const [user, setUser] = useState(null);

  const uuid = () => {
    let S4 = () => {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
  };

  return (
    <div className='container m-0 p-0 h-100 w-100'>
      <Routes>
        <Route path="/" element={<Forms uuid={uuid} socket={socket} setUser={setUser} />} />
        <Route path="/:roomId" element={<RoomPage user={user} socket={socket} />} />
      </Routes>
    </div>
  );
};

export default App;
