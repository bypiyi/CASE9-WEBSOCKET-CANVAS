// ----- DOM ELEMENTS ----- 
const heroBanner = document.querySelector("#heroBanner");
const mainContent = document.querySelector("#mainContent");

const userForm = document.querySelector("#userForm");
const messageForm = document.querySelector("#messageForm");
const chat = document.querySelector("#chat");
const userInput = document.querySelector("#user");
const messageInput = document.querySelector("#message");

const gameTitle = document.querySelector("#gameTitle");
const gameDescription = document.querySelector("#gameDescription");
const gameDescriptionBox = document.querySelector("#gameDescriptionBox");
const gameImage = document.querySelector("#gameImage");
const welcomeText = document.querySelector("#welcomeText");
const userNameElement = document.querySelector("#userName");

const gameCanvas = document.querySelector("#gameCanvas");
const context = gameCanvas.getContext("2d");

// ----- DEPENDENCIES ----- 
const websocket = new WebSocket("ws://localhost:8082");

// ----- VARIABLES ----- 
let objChat = {};
let clientId = null;
let players = [];
let myPlayer = null; // Den aktuella spelarens data

// ----- CANVAS SETTINGS ----- 
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 650;
gameCanvas.width = CANVAS_WIDTH;
gameCanvas.height = CANVAS_HEIGHT;

// TARGET PROPERTIES
let targetX = 400;
let targetY = 400;
const targetSize = 50;
let targetSpeedX = 8;
let targetSpeedY = 8;

// IMAGES
const backgroundImage = new Image();
backgroundImage.src = './images/canvas.png';

const playerImage = new Image();
playerImage.src = './images/arcade1.png';

const targetImage = new Image();
targetImage.src = './images/target.png';

// KEY EVENTS 
let keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

// ----- EVENT LISTENERS ----- 

// HERO-BANNER 
heroBanner.addEventListener("click", () => {
    heroBanner.style.display = "none";
    mainContent.classList.remove("hidden");
    userInput.focus();
});

// USER FORM
userForm.addEventListener("submit", (e) => {
    e.preventDefault();
    userInput.setAttribute("disabled", true);

    gameDescription.style.display = "none";
    gameImage.style.display = "none";
    gameDescriptionBox.style.display = "none";

    userForm.style.display = "none";
    gameCanvas.classList.remove("hidden");
    messageForm.classList.remove("hidden");
    chat.classList.remove("hidden");

    userNameElement.textContent = userInput.value;
    welcomeText.classList.remove("hidden");

    objChat.user = userInput.value;
});

// MESSAGE FORM
messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    objChat.message = messageInput.value;
    objChat.datetime = new Date().toLocaleTimeString();

    messageInput.value = "";
    renderChatMessage(objChat);

    websocket.send(JSON.stringify(objChat));
});

// ----- WEBSOCKET HANDLING ----- 
websocket.addEventListener('message', (event) => {
    const obj = JSON.parse(event.data);

    // Hantera klientens ID
    if (obj.type === 'clientId') {
        clientId = obj.id;

        // Skicka information om den nya spelaren till servern
        const initialPlayer = {
            id: clientId,
            x: Math.random() * (CANVAS_WIDTH - 50),
            y: Math.random() * (CANVAS_HEIGHT - 50),
            width: 50,
            height: 50,
            score: 0
        };
        websocket.send(JSON.stringify({ type: 'newPlayer', player: initialPlayer }));
    }

    // Uppdatera alla spelares positioner
    if (obj.type === 'playersUpdate') {
        players = obj.players;
    }

    // Om meddelandet inte är relaterat till spelare, rendera chattmeddelandet
    if (obj.type !== 'clientId' && obj.type !== 'playersUpdate') {
        renderChatMessage(obj);
    }
});

// ----- GAME LOGIC ----- 

// MOVE PLAYER WITH WASD KEYS ONLY
function movePlayer(player) {
    if (keys['w']) player.y -= 5;
    if (keys['s']) player.y += 5;
    if (keys['a']) player.x -= 5;
    if (keys['d']) player.x += 5;

    // Skicka uppdatering till servern om spelarens rörelse
    websocket.send(JSON.stringify({ type: 'updatePlayerPosition', player: player }));
}

// MOVE TARGET
function moveTarget() {
    targetX += targetSpeedX;
    targetY += targetSpeedY;

    if (targetX <= 0 || targetX + targetSize >= CANVAS_WIDTH) {
        targetSpeedX = -targetSpeedX;
    }
    if (targetY <= 0 || targetY + targetSize >= CANVAS_HEIGHT) {
        targetSpeedY = -targetSpeedY;
    }
}

// CHECK COLLISION BETWEEN PLAYER AND TARGET
function checkCollision(player) {
    if (
        player.x < targetX + targetSize &&
        player.x + player.width > targetX &&
        player.y < targetY + targetSize &&
        player.y + player.height > targetY
    ) {
        targetX = Math.random() * (CANVAS_WIDTH - targetSize);
        targetY = Math.random() * (CANVAS_HEIGHT - targetSize);
        player.score += 1;
        websocket.send(JSON.stringify({ type: 'updateScore', player: player }));
    }
}

// KEEP PLAYER INSIDE CANVAS
function keepPlayerInsideCanvas(player) {
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > CANVAS_WIDTH) player.x = CANVAS_WIDTH - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > CANVAS_HEIGHT) player.y = CANVAS_HEIGHT - player.height;
}

// DRAW EVERYTHING
function draw() {
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (backgroundImage.complete) {
        context.drawImage(backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    players.forEach(player => {
        if (playerImage.complete) {
            context.drawImage(playerImage, player.x, player.y, player.width, player.height);
            context.fillStyle = 'black';
            context.font = '16px Silkscreen, serif';
            context.fillText('Score: ' + player.score, player.x, player.y - 10);
        }
    });

    if (targetImage.complete) {
        context.drawImage(targetImage, targetX, targetY, targetSize, targetSize);
    }
}

// GAME LOOP
function gameLoop() {
    players.forEach(player => {
        if (player.id === clientId) {
            // Uppdatera den aktuella spelarens rörelse
            movePlayer(player);  
            checkCollision(player);
            keepPlayerInsideCanvas(player);
        }
    });

    moveTarget();
    draw();
    requestAnimationFrame(gameLoop);
}

// START THE GAME
gameLoop();

// ----- CHAT FUNCTION ----- 

function renderChatMessage(obj) {
    if (obj.message && obj.user) {
        const div = document.createElement("div");
        const p = document.createElement("p");
        p.textContent = obj.message;

        const span = document.createElement("span");
        span.textContent = obj.user + ' ' + obj.datetime;

        div.appendChild(p);
        div.appendChild(span);
        chat.appendChild(div);
    }
}
