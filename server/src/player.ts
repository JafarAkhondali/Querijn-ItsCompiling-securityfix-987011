import * as WebSocket from 'ws';

import { Identifier } from './messages/identifier';

export class Player {
    socket: WebSocket;

    identifier: Identifier = new Identifier();

    constructor(socket: WebSocket) {
        this.socket = socket;

        
    }

    public send(message: object) {
        this.socket.send(JSON.stringify(message));
    }

    public sendIdentity() {
        this.send(this.identifier);
    }
}
