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
    console.log(`New Client Connection, Number of Clients: ${wss.clients.size}`);
    // EVENT CLOSE
    ws.on(`close`, () => {
        console.log(`Client left. Number of Clients: ${wss.clients.size}` )
    });

    // LISTEN TO EVENT
    ws.on('message', (stream) => {

        const obj = JSON.parse(stream);

        // MEDDELANDET SOM MOTTOGS
        console.log(`${obj.datetime}: ${obj.user} typing ${obj.message}`);

        // // SKICKA VIDARE MEDDELANDE FRÅN SERVERN TILL ANSLUTNA KLIENTER
        // wss.clients.forEach(client => {
        //     if (client !== ws) {
        //         client.send(JSON.stringify(obj));
        //     }
        // });
        broadcastExclude(wss, ws, obj);
    });
});



// ---- FUNKTIONER -----
//SKICKA TRAFIK TILL ALLA/VISSA

function broadcast(wss, obj) {
    wss.clients.forEach(client => {
        client.send(JSON.stringify(obj));
    });
}

function broadcastExclude(wss, ws, obj) {
    wss.clients.forEach(client => {
        if (client !== ws) {
            client.send(JSON.stringify(obj));
        }
    });
}



//  ---------


server.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
});