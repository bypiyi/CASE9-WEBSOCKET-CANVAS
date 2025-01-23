// DOM ELEMENT
const userForm = document.querySelector("#userForm");
const messageForm = document.querySelector("#messageForm");
const gameCanvas = document.querySelector("#gameCanvas");
const chat = document.querySelector("#chat");
const userInput = document.querySelector("#user");
const messageInput = document.querySelector("#message");

// ANVÄND WEBSOCKET
const websocket = new WebSocket("ws://localhost:8082");


// DEKLARERA OBJEKT - CHATTMEDDELANDE
let objChat = {};


// EVENT LISTENERS
// USER
userForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("OK", userInput.value);

    // NOT POSSIBLE TO CHANGE USERNAME
    userInput.setAttribute("disabled", true);

    // OPEN UP CANVA, REMOVE HIDDEN
    gameCanvas.classList = "";

    // OPEN UP CHAT, REMOVE HIDDEN
    messageForm.classList = "";
    chat.classList = "";

    // INPUTFIELD ACTIVE FOR MESSAGES
    // messageInput.focus();
    objChat.user = userInput.value;

});

messageForm.addEventListener("submit", (e) =>{
    e.preventDefault();
    objChat.message = messageInput.value;

    // LÄMNA BLANK INPUT EFTER SÄNDNING
    messageInput.value = "";

    //FUNKTION FÖR UPPDATERING AV CHATT
    renderChatMessage(objChat);
});

// USE JSON WHILE COMMUNICATION
// let msg = {type: "chat", message: "Hello World"};



// ---- FUNKTIONER -----

/**
 *
 *
 * @param {object} obj
 */
function renderChatMessage(obj) {
    // exempel objekt: {message: "Lorem ipsum", user""};
    const div = document.createElement("div");
    const p = document.createElement("p");
    p.textContent = obj.message;

    const span = document.createElement("span");
    span.textContent = obj.user;

    div.appendChild(p);
    div.appendChild(span);

    chat.appendChild(div);
};

renderChatMessage({ message: "HeejHeej", user: "Alicia"});