// DOM ELEMENTS
const userForm = document.querySelector("#userForm");
const messageForm = document.querySelector("#messageForm");
const chat = document.querySelector("#chat");


// USE WEBSOCKET
const websocket = new WebSocket("ws://localhost:8082");




// USE JSON WHILE COMMUNICATION
// let msg = {type: "chat", message: "Hello World"};

