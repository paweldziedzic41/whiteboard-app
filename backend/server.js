const express = require("express");
const app = express();

const server = require("http").createServer(app);
const { Server } = require("socket.io");

const io = new Server(server);

// routes

app.get("/", (req,res) => {
    res.send("this in app server");
});

io.on("connection", (socket) => {
    console.log("User connected");
})

const port = process.env.port || 5000;

server.listen(port, () => console.log("server is running on http://localhost:5000"));
