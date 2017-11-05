import * as http from 'http';
import * as WebSocket from 'ws';

import { Player } from './player';
import { Game } from './game';

import { Identifier } from './messages/identifier';

// Settings
const instantPlay: boolean = true;
const startDelay: number = 8;
const maxHealth: number = 64;
const hertz: number = 30;
const port: number = 3389;

const server = http.createServer((req, res) => {
    res.writeHead(404);
    res.end('what are you doing here');
});

const websocketServer = new WebSocket.Server({ server });

let allConnections: Player[] = [];
let lobbyPlayers: Player[] = [];
let games: Game[] = [];

websocketServer.on('connection', (socket: WebSocket) => {

    let player = new Player(socket);
    console.log(`New player (${player.identifier.c}) has joined, sending him an invite code.`);

    // Make sure the player is removed everywhere when he disconnects.
    socket.on('close', function() {
        console.log(`Player ${player.identifier.c} has disconnected.`);

        // Give invite code back to the identifier class
        Identifier.returnCode(parseInt(player.identifier.c));

        let index = allConnections.indexOf(this);
        if (index >= 0) {
            console.log(`Player ${player.identifier.c} was removed from connection array.`);
            allConnections.splice(index, 1);
        }

        index = lobbyPlayers.indexOf(this);
        if (index >= 0) {
            console.log(`Player ${player.identifier.c} was removed from lobby.`);
            lobbyPlayers.splice(index, 1);
        }

        for (let i = 0; i < games.length; i++) {
            
            index = games[i].participants.indexOf(this);
            if (index >= 0) {
                console.log(`Player ${player.identifier.c} was removed from the game.`);
                games[i].setWinner(index == 1 ? 0 : 1, "Rage Quit!");
            }
        }
    }.bind(player));

    // A new player joins, send him his 'invite code'
    player.sendIdentity();

    allConnections.push(player);
    lobbyPlayers.push(player);
    if (instantPlay && lobbyPlayers.length == 2) {
        console.log("Instant Play is enabled, starting a new game with another player.");
        games.push(new Game(hertz, maxHealth, startDelay, lobbyPlayers.splice(0, 1)[0], lobbyPlayers.splice(0, 1)[0]));
    }
});

server.listen(port, () => {
    console.log(`ws://localhost:${server.address().port}`);
});