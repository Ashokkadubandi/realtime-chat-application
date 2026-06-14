const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const port = process.env.PORT || 3000;
const crypto = require("crypto")

const app = express();

const server = http.createServer(app);

const wss = new WebSocket.Server({
  server,
});
let userDb = []
app.use(express.static(path.join(__dirname, "sample_public")));


wss.on("connection", (ws) => {
    console.log("Client Connected");
    ws.isJoined = false;

    ws.on("message", (message) => {
        console.log("Message from browser:", message.toString());

        const data = JSON.parse(message);
        console.log(data,"Data from browser");
        if(data.type === "JOIN" && !ws.isJoined){
            ws.isJoined = true;
            const userDetails = {username:data.username,userId:crypto.randomUUID()}
            ws.userId = userDetails.userId
            ws.username = userDetails.username
            userDb.push(userDetails);
            broadcastOnlineUsers();
            return 
        }

        if(data.type === "CHAT" && ws.isJoined){
            broadcastMessage(data.message,data.username, ws);
            return
        }
    });

    ws.on("close", () => {
        if(ws.isJoined){
            userDb = userDb.filter(user => user.userId !== ws.userId)
            broadcastOnlineUsers();
            console.log("Client Disconnected");
        }
    });
});


function getOnlineUsersCount() {
    let count = 0;
    wss.clients.forEach((client) => {
        if(client.isJoined){
            count++;
        }
    });
    return count;
}

function broadcastOnlineUsers() {
    const payload = JSON.stringify({
        type: "JOIN",
        count: getOnlineUsersCount(),
        userDb,
    });
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client.isJoined) {
            client.send(payload);
        }
    });
}

function broadcastMessage(message,username,sender) {
    const payload = JSON.stringify({
    type: "CHAT",
    message,
    username,
    });
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN 
            && client.isJoined 
            && client !== sender) {
            client.send(payload);
        }
    });
}

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});