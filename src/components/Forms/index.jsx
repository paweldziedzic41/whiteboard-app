import "./index.css";
import JoinRoomForm from "./JoinRoomForm";
import CreateRoomForm from "./CreateRoomForm";

const Forms = ({ uuid, socket, setUser}) => {
  return (
    <div className="row">
      <div className="col-md-4 form-box">
        <h1 className="room">Create Room</h1>
        <CreateRoomForm uuid={uuid} socket={socket} setUser={setUser} />
      </div>
      <div className="col-md-4 form-box">
        <h1 className="room">Join Room</h1>
        <JoinRoomForm uuid={uuid} socket={socket} setUser={setUser} />
      </div>
    </div>
  );
};

export default Forms;
