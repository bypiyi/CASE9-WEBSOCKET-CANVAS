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

server.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
});