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

// SKAPA WEBSOCKET-SERVER
const wss = new WebSocketServer({ noServer: true });

// HANTERA WEBSOCKET-KOMMUNIKATION
server.on('upgrade', (req, socket, head) => {

    console.log(`Klient uppgraderar ...`);

    wss.handleUpgrade(req, socket, head, (ws) => {
        console.log(`Klient ansluten...`);

        // SKICKA KOMMUNIKATION VIDARE
        wss.emit('connection', ws, req);

    });

});

// LYSSNA PÅ WEBSOCKET
wss.on('connection', (ws) => {
    console.log(`Ny klientanslutning, antal klienter: ${wss.clients.size}`);
    
    // EVENT FÖR STÄNGNING
    ws.on(`close`, () => {
        console.log(`Klient lämnade. Antal klienter: ${wss.clients.size}` );
    });

    // LYSSNA PÅ EVENT
    ws.on('message', (stream) => {

        const obj = JSON.parse(stream);

        // MEDDELANDET SOM MOTTOGS
        console.log(`${obj.datetime}: ${obj.user} skrev ${obj.message}`);

        // SKICKA VIDARE MEDDELANDE FRÅN SERVERN TILL ANSLUTNA KLIENTER
        broadcastExclude(wss, ws, obj);
    });
});

// ---- FUNKTIONER -----
// SKICKA TRAFIK TILL ALLA/VISSA

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

// ---------

server.listen(PORT, () => {
    console.log(`Servern lyssnar på port ${PORT}`);
});
