// ----- DOM ELEMENT ----- 
const heroBanner = document.querySelector("#heroBanner");
const mainContent = document.querySelector("#mainContent");

const userForm = document.querySelector("#userForm");
const messageForm = document.querySelector("#messageForm");
const gameCanvas = document.querySelector("#gameCanvas");
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


// ----- DEPENDENCIES -----
const websocket = new WebSocket("ws://localhost:8082");


// DEKLARERA OBJEKT - CHATTMEDDELANDE
let objChat = {};



// ------ EVENT LISTENERS ------

// HERO-BANNER
heroBanner.addEventListener("click", () => {
    // Dölj hero-bannern
    heroBanner.style.display = "none";

    // Visa innehållet
    mainContent.classList.remove("hidden");

    // Fokus på användarens inputfält
    userInput.focus();
});

// ANVÄNDARE
userForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("OK", userInput.value);

    // NOT POSSIBLE TO CHANGE USERNAME
    userInput.setAttribute("disabled", true);

    // DÖLJ TITEL OCH BESKRIVNING
    // gameTitle.style.display = "none";
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

    // INPUTFIELD ACTIVE FOR MESSAGES
    objChat.user = userInput.value;
});

messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    objChat.message = messageInput.value;

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

    renderChatMessage(obj);
});

// * ------------* 



// ---- FUNKTIONER ----

/**
 *
 * @param {object} obj
 */
function renderChatMessage(obj) {
    const div = document.createElement("div");
    const p = document.createElement("p");
    p.textContent = obj.message;

    const span = document.createElement("span");
    span.textContent = obj.user;

    div.appendChild(p);
    div.appendChild(span);

    chat.appendChild(div);

    // AUTOSCROLL CHAT
    chat.scrollTop = chat.scrollHeight;
};

