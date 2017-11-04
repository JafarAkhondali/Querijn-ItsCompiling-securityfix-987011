class GameClient extends WebSocket {

    constructor  (connectionUrl) {
        super(connectionUrl);

        this.listeners = {};

        this.onopen = this.onConnected.bind(this);
        this.onmessage  = this.onReceive.bind(this);
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
        super.send(JSON.stringify({ m: id, c: json }));
    }
} 