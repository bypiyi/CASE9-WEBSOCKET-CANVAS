console.log("Hello World");

// USE WEBSOCKET
const websocket = new WebSocket("ws://localhost:8082");


setTimeout(() => {
    // SEND MESSAGE TO SERVER
    let msg = {type: "chat", message: "Hello World"};

    websocket.send(JSON.stringify(msg));
    console.log("Meddelande skickades till servern");

}, 5000);