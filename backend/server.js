const express = require("express");
const app = express();
const server = require("http").createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Zakładając, że klient działa na porcie 3000
    methods: ["GET", "POST"]
  }
});

const createdRooms = {};
const roomDrawings = {}; // Obiekt przechowujący rysunki dla każdego pokoju
const undoStack = {}; // Stos do przechowywania cofniętych rysunków

app.get("/", (req, res) => {
  res.send("This is the app server");
});

io.on("connection", (socket) => {
  console.log('A user connected:', socket.id);
  socket.emit("createdRooms", createdRooms);

  socket.on("userJoined", (data) => {
    const { roomId, host } = data;

    if (host) {
      createdRooms[roomId] = roomId;
    }

    socket.join(roomId);

    if (roomDrawings[roomId]) {
      socket.emit("drawingHistory", roomDrawings[roomId]);
    }
    socket.emit("userIsJoined", { success: true });
  });

  // Obsługa zdarzeń rysowania
  socket.on("drawing", (data) => {
    const { roomId, line } = data;

    if (!roomDrawings[roomId]) {
      roomDrawings[roomId] = [];
    }
    roomDrawings[roomId].push(line);

    if (!undoStack[roomId]) {
      undoStack[roomId] = [];
    }
    undoStack[roomId] = [];

    socket.to(roomId).emit("drawing", line);
  });


  socket.on("undo", (roomId) => {
    if (roomDrawings[roomId] && roomDrawings[roomId].length > 0) {

      const undoneLine = roomDrawings[roomId].pop();
      if (!undoStack[roomId]) {
        undoStack[roomId] = [];
      }
      undoStack[roomId].push(undoneLine);

      io.to(roomId).emit("drawingHistory", roomDrawings[roomId]);
    }
  });


  socket.on("redo", (roomId) => {
    if (undoStack[roomId] && undoStack[roomId].length > 0) {     
      const redoneLine = undoStack[roomId].pop();
      roomDrawings[roomId].push(redoneLine);

      io.to(roomId).emit("drawingHistory", roomDrawings[roomId]);
    }
  });

  socket.on("disconnect", () => {
    console.log('User disconnected:', socket.id);
  });
});

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
