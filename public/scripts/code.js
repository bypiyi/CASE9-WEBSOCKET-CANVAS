// ----- DOM ELEMENT ----- 
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

// * ------------------------ *

const websocket = new WebSocket("ws://localhost:8082");

// DEKLARERA OBJEKT - CHATTMEDDELANDE
let objChat = {};
let gameOver = false;

// CANVAS
const gameCanvas = document.querySelector("#gameCanvas");
const context = gameCanvas.getContext("2d");

// SÄTTER BREDD OCH HÖJD PÅ CANVAS
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 650;
gameCanvas.width = CANVAS_WIDTH;
gameCanvas.height = CANVAS_HEIGHT;

// MÅLETS EGENSKAPER
let targetX = 400;
let targetY = 400;
const targetSize = 80;
let targetSpeedX = 2;
let targetSpeedY = 2;

// POÄNGVARIABEL
let score = 0;

// BILDER
const backgroundImage = new Image();
backgroundImage.src = './images/canvas.png';

const targetImage = new Image();
targetImage.src = './images/target.png';

// KONTROLLERA OM MÅLET ÄR KLICKAT
// STOPPAR INTERAKTIONER OM SPELET ÄR SLUT
gameCanvas.addEventListener("click", (e) => {
    if (gameOver) return;

    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    // OM MÅLET KLICKAS - 
    if (
        mouseX > targetX &&
        mouseX < targetX + targetSize &&
        mouseY > targetY &&
        mouseY < targetY + targetSize
    ) {
        // NY POSITION FÖR MÅLET
        targetX = Math.random() * (CANVAS_WIDTH - targetSize);
        targetY = Math.random() * (CANVAS_HEIGHT - targetSize);

        // ÖKA POÄNG OCH MEDDELA I CHATT
        score += 1;
        objChat.message = `${objChat.user} scored! Total: ${score} points`;
        objChat.datetime = new Date().toLocaleTimeString();
        renderChatMessage(objChat);

        // SKICKA POÄNG TILL SERVERN
        websocket.send(JSON.stringify(objChat));
    }
});

// FLYTTA MÅLET
function moveTarget() {
    targetX += targetSpeedX;
    targetY += targetSpeedY;

    // OM MÅLET RÖR KANTEN, BYT RIKTNING
    if (targetX <= 0 || targetX + targetSize >= CANVAS_WIDTH) {
        targetSpeedX = -targetSpeedX;
    }
    if (targetY <= 0 || targetY + targetSize >= CANVAS_HEIGHT) {
        targetSpeedY = -targetSpeedY;
    }
}

// RITA BAKGRUND, MÅLET OCH POÄNG
function draw() {
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // BAKGRUNDSBILD
    if (backgroundImage.complete) {
        context.drawImage(backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // MÅLBILD
    if (targetImage.complete) {
        context.drawImage(targetImage, targetX, targetY, targetSize, targetSize);
    }

    // RITA POÄNG
    context.fillStyle = 'black';
    context.font = '20px Silkscreen, serif';
    context.fillText('Score: ' + score, 10, 30);
}

// SPELLOOP
function gameLoop() {
    if (!gameOver) {
        moveTarget();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

// STARTA SPELET
gameLoop();
// --------------------


// ------ EVENT LISTENERS ------

// HERO-BANNER
heroBanner.addEventListener("click", () => {
    // DÖLJ HERO-BANNER
    heroBanner.style.display = "none";

    // VISA INNEHÅLL
    mainContent.classList.remove("hidden");

    // FOKUS PÅ ANVÄNDARENS INPUTFÄLT
    userInput.focus();
});

// ANVÄNDARE
userForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("OK", userInput.value);

    // NOT POSSIBLE TO CHANGE USERNAME
    userInput.setAttribute("disabled", true);

    // DÖLJ TITEL OCH BESKRIVNING
    gameDescription.style.display = "none";
    gameImage.style.display = "none";
    gameDescriptionBox.style.display = "none";

    // DÖLJ FORMULÄR FÖR ANVÄNDARE
    userForm.style.display = "none";

    // ÖPPNA CANVAS, TA BORT HIDDEN
    gameCanvas.classList.remove("hidden");

    // ÖPPNA CHAT, TA BORT HIDDEN
    messageForm.classList.remove("hidden");
    chat.classList.remove("hidden");

    // VÄLJ VÄLKOMSTTEXT OCH VISA DEN
    userNameElement.textContent = userInput.value;
    welcomeText.classList.remove("hidden");

    // AKTIVERA INMATNINGSFÄLT FÖR MEDDELANDEN
    objChat.user = userInput.value;

    // SKICKA AUTOMATISKT VÄLKOMSTMEDDELANDE
    objChat.message = `${objChat.user} joined the game!`;
    objChat.datetime = new Date().toLocaleTimeString();
    renderChatMessage(objChat);
    websocket.send(JSON.stringify(objChat));
});

messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    objChat.message = messageInput.value;
    objChat.datetime = new Date().toLocaleTimeString();

    // LÄMNA BLANK INPUT EFTER SÄNDNING
    messageInput.value = "";

    // FUNKTION FÖR UPPDATERING AV CHATT
    renderChatMessage(objChat);

    // SKICKA TILL SERVERN/WEBSOCKET
    websocket.send(JSON.stringify(objChat));
});

websocket.addEventListener(`message`, (event) => {
    console.log("Event", event);

    // EVENT.DATA - DET OBJEKT SOM SKICKATS
    const obj = JSON.parse(event.data);

    if (obj.type === "gameOver") {
        // NÄR SPELET ÄR ÖVER VISAS EN ALERT FÖR SAMTLIGA KLIENTER
        gameOver = true;
        alert(`${obj.user} WON THE GAME! GAME OVER!`);

        // SPELET STARTAR OM
        resetGame();
    }

    renderChatMessage(obj);
});

// * ------------* 

// ---- FUNKTIONER ----

/**
 *
 * @param {object} obj
 */
function renderChatMessage(obj) {
    // ser till att funktionen inte ritar något i chatten om objChat.message eller objChat.user saknar värde.
    if (!obj.message || !obj.user) return;

    const div = document.createElement("div");
    const p = document.createElement("p");
    p.textContent = obj.message;

    const span = document.createElement("span");
    span.textContent = `${obj.user} - ${obj.datetime}`;

    div.appendChild(p);
    div.appendChild(span);

    chat.appendChild(div);

    // AUTOSCROLL CHAT
    chat.scrollTop = chat.scrollHeight;
};


// FUNKTION FÖR ATT ÅTERSTÄLLA SPELET VID VINST
function resetGame() {
    // ÅTERSTÄLL SPELETS TILLSTÅND
    score = 0;
    targetX = 400;
    targetY = 400;
    targetSpeedX = 2;
    targetSpeedY = 2;
    
    // DÖLJER SPELET OCH VISAR STARTSIDAN
    gameCanvas.classList.add("hidden");
    messageForm.classList.add("hidden");
    chat.classList.add("hidden");
    heroBanner.style.display = "block";
    mainContent.classList.add("hidden");
}
