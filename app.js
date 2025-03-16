const express = require("express");
const app = express();
const path = require("path");

const http = require("http");
const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public"))); 

io.on("connection", (socket) => {
    socket.on("send-location", (data) => {
        io.emit("receive-location", data);
    });

    socket.on("remove-marker", (tabId) => {
        io.emit("user-disconnected", tabId);
    });
});

app.get("/", (req, res) => {
    res.render("index");
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});
