import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { nanoid } from 'nanoid';

// SERVER
const app = express();
const PORT = 8082;

// HANTERA FRONTEND SOM STATISK MED EXPRESS
app.use(express.static("public"));


// HTTP
const server = http.createServer(app);

// CREATE WEBSOCKET SERVER
const wss = new WebSocketServer({ noServer: true });

// HANDLE WEBSOCKET COMMUNICATION
server.on('upgrade', (req, socket, head) => {

    console.log(`Client Upgrade ...`);

    wss.handleUpgrade(req, socket, head, (ws) => {
        console.log(`Client Connected...`);

        // SEND COMMUNICATION FORWARD
        wss.emit('connection', ws, req);

    });

});

// LISTEN TO WEBSOCKET
wss.on('connection', (ws) => {
    console.log("New client connection");

    // LISTEN TO EVENT
    ws.on('message', (stream) => {

        const obj = JSON.parse(stream);

        // MESSAGE RECIEVED
        console.log(obj.message);
    })
});


server.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
});