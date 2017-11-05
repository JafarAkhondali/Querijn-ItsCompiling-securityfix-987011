import * as WebSocket from 'ws';

import { Identifier } from './messages/identifier';
import { ShootDart } from './messages/shoot_dart';

export class Player {
    socket: WebSocket;

    identifier: Identifier = new Identifier();
    listeners: { [id: string] : any[] } = {};

    hasJoined: boolean = false;
    isInGame: boolean = false;

    public currentNumber = 0;
    public correct = 0;
    public combo = 0;
    public health = 64;
    public isAttacking = false;
    public dps = 0;

    constructor(socket: WebSocket) {
        this.socket = socket;

        this.socket.on('message', this.onReceive.bind(this));

        this.addListener(1, function (id: string) { 
            this.hasJoined = true;//id == this.identifier.c;
        }.bind(this));
    }

    public addListener(id: number, callback: any) {
        
        let stringId = String(id);
        if (this.listeners.hasOwnProperty(stringId) == false)
            this.listeners[stringId] = [];

        this.listeners[stringId].push(callback);
    }
    
    onReceive(message: string) {
        let msg = JSON.parse(message);
        let stringId = msg.m;

        if (this.listeners.hasOwnProperty(stringId) == false)
            this.listeners[stringId] = [];

        var listenerArray = this.listeners[stringId];
        for (let i = 0; i < listenerArray.length; i++) {
            listenerArray[i](msg.c);
        }
    }

    public send(message: object) {
        if (this.socket.readyState !== WebSocket.OPEN) 
            return;

        this.socket.send(JSON.stringify(message));
    }

    public sendIdentity() {

        this.send(this.identifier);
    }

    public shootDart(isShooting: boolean) {

        this.send(new ShootDart(isShooting));
    }

    public kill() {
        if (this.socket.readyState !== WebSocket.OPEN) 
            return;
            
        this.socket.close();
    }
}
