import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

const JoinRoomForm = ({ uuid, socket, setUser, roomExist }) => {
  const [roomId, setRoomId] = useState();
  const [name, setName] = useState("");
  const [createdRooms, setCreatedRooms] = useState([]);
  const [roomError, setRoomError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("createdRooms", (createdRooms) => {
      setCreatedRooms(createdRooms);
    });
  }, [socket]);

  const handleRoomJoin = (e) => {
    e.preventDefault();

    const roomData = {
      name,
      roomId,
      userId: uuid(),
      host: false,
    };

    if (!createdRooms[roomData.roomId]) {
      setRoomError(true);
      return;
    }

    setUser(roomData);
    navigate(`/${roomId}`);
    socket.emit("userJoined", roomData);
  };

  return (
    <form className="form">
      <div className="form-group">
        <input
          type="text"
          className="form-control my-2"
          placeholder="enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="form-group position-relative d-flex align-items-center justify-content-center">
        <input
          type="text"
          className="form-control my-2"
          placeholder="Enter room code"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        {roomError && (
          <p className="text-danger position-absolute" style={{ marginTop: '95px' }}>
            Pokój nie istnieje
          </p>
        )}
      </div>
      <button
        type="submit"
        onClick={handleRoomJoin}
        className="btn mt-4 btn-primary btn-block form-control"
      >
        Join room
      </button>
    </form>
  );
};

export default JoinRoomForm;
