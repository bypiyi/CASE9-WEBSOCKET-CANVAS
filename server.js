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

// Lägg till en global variabel för spelets status
let gameOver = false;
let scores = {};

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
    
    ws.on('close', () => {
        console.log(`Klient med ID: ${clientId} lämnade. Antal klienter: ${wss.clients.size}`);
    });

    // LYSSNA PÅ EVENT
    ws.on('message', (stream) => {
        const obj = JSON.parse(stream);

        // UNIKT ID I MEDDELANDET
        obj.clientId = clientId;

        // MEDDELANDE SOM MOTTAGITS
        console.log(`${obj.datetime}: ${obj.user} skrev ${obj.message} (Klient ID: ${clientId})`);

        // UPPDATERA POÄNG OM NÅGON GÖR MÅL
        if (obj.message.includes("SCORED!")) {
            if (!scores[obj.user]) {
                scores[obj.user] = 0;
            }
            scores[obj.user]++;
        }

        // SE OM NÅGON VUNNIT
        if (scores[obj.user] >= 10 && !gameOver) {
            const winnerMessage = `${obj.user} WINS WITH 10 POINTS!`;
            // SPELET MARKERAS SOM ÖVER
            gameOver = true; 
            obj.message = winnerMessage;
            obj.datetime = new Date().toLocaleTimeString();

            // SKICKA "GAME OVER" MEDDELANDE TILL ALLA KLIENTER
            broadcast(wss, { type: "gameOver", message: winnerMessage, user: obj.user });

            // SAMT SOM CHATTMEDDELANDE
            broadcastExclude(wss, ws, obj);
        } else if (!gameOver) {
         
            broadcastExclude(wss, ws, obj);
        }
    });
});

// ---- FUNKTIONER -----
// SKICKA MEDDELANDE TILL ALLA ANSLUTNA KLIENTER
function broadcast(wss, obj) {
    wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(obj));
        }
    });
}


function broadcastExclude(wss, ws, obj) {
    wss.clients.forEach(client => {
        if (client !== ws && client.readyState === client.OPEN) {
            client.send(JSON.stringify(obj));
        }
    });
}

// ---------

server.listen(PORT, () => {
    console.log(`Servern lyssnar på port ${PORT}`);
});
