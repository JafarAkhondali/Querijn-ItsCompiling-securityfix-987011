class GameClient {

    constructor  (connectionUrl) {
        this.socket = new WebSocket(connectionUrl);

        this.socket.onopen = this.onConnected.bind(this);
        this.socket.onmessage  = this.onReceive.bind(this);
        this.listeners = {};
    }

    addTalkBox(id, callback) {

        let stringId = String(id);
        if (this.listeners.hasOwnProperty(stringId) == false)
            this.listeners[stringId] = [];

        this.listeners[stringId].push(callback);

        return function (json) {
            this.send(stringId, json);
        }.bind(this);

    }

    removeTalkBox (id) {
        let stringId = String(id);
        this.listeners[stringId] = [];
    }

    onConnected(event) {
        console.log("Connected to server!"); 
    }

    onReceive (event) {
        let msg = JSON.parse(event.data);
        let stringId = msg.m;

        if (this.listeners.hasOwnProperty(stringId) == false)
            this.listeners[stringId] = [];

        var listenerArray = this.listeners[stringId];
        for (let i = 0; i < listenerArray.length; i++) {
            listenerArray[i](msg.c);
        }
    }

    send (id, json) {
        this.socket.send(JSON.stringify({ m: id, c: json }));
    }
} 