import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

const CreateRoomForm = ({ uuid, socket, setUser }) => {
  const [roomId, setRoomId] = useState(uuid());
  const [name, setName] = useState("");

  const navigate = useNavigate();

  const copy = () => {
    navigator.clipboard.writeText(roomId);
  }

  const handleCreateRoom = (e) => {
    e.preventDefault();

    const roomData = {
      name,
      roomId,
      userId: uuid(),
      host: true,
    };
    setUser(roomData);
    navigate(`/${roomId}`);
    socket.emit("userJoined", roomData);
  };

  return (
    <form className="form">
      <div className="form-group">
        <input
          type="text"
          value={name}
          className="form-control my-2"
          placeholder="enter name"
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <div className="input-group">
          <input
            type="text"
            value={roomId}
            className="form-control my-2 border-0"
            placeholder="generate room code"
            disabled
          />
          <div className="input-group-append">
            <button
              className="btn btn-primary btn-sm me-1"
              type="button"
              onClick={() => setRoomId(uuid())}
            >
              generate
            </button>
            <button className="btn btn-outline-danger btn-sm" type="button" onClick={copy}>
              copy
            </button>
          </div>
        </div>
      </div>
      <button
        type="submit"
        onClick={handleCreateRoom}
        className="mt-4 btn btn-primary btn-block form-control"
      >
        Generate room
      </button>
    </form>
  );
};

export default CreateRoomForm;
