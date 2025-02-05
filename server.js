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

    // SKAPAR UNIKT KLIENT-ID
    wss.handleUpgrade(req, socket, head, (ws) => {
        const clientId = nanoid(); 

        console.log(`Klient ansluten med ID: ${clientId}`);

        // SKICKAR TILLBAKA KLIENTENS UNIKA ID TILL KLIENTEN
        ws.send(JSON.stringify({ type: 'clientId', clientId }));

        // SKICKA KOMMUNIKATION VIDARE
        wss.emit('connection', ws, req, clientId);
    });

});

// LYSSNA PÅ WEBSOCKET
wss.on('connection', (ws, req, clientId) => {
    console.log(`Ny klientanslutning med ID: ${clientId}, antal klienter: ${wss.clients.size}`);
    
    // EVENT FÖR STÄNGNING
    ws.on(`close`, () => {
        console.log(`Klient med ID: ${clientId} lämnade. Antal klienter: ${wss.clients.size}` );
    });

    // LYSSNA PÅ EVENT
    ws.on('message', (stream) => {

        const obj = JSON.parse(stream);

        // LÄGGER TILL KLIENTES ID I MEDDELANDET
        obj.clientId = clientId;

        // MEDDELANDET SOM MOTTAGITS
        console.log(`${obj.datetime}: ${obj.user} skrev ${obj.message} (Klient ID: ${clientId})`);

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
