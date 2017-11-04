import * as http from 'http';
import * as WebSocket from 'ws';

import { Player } from './player';
import { Game } from './game';

// Settings
const instantPlay: boolean = true;


const server = http.createServer((req, res) => {
    res.writeHead(301, { 'Location': 'http://localhost:80/game/' });
    res.end('what are you doing here');
});

const websocketServer = new WebSocket.Server({ server });

let lobbyPlayers: Player[]=[];
let games: Game[]=[];

websocketServer.on('connection', (socket: WebSocket) => {

    console.log("New player has joined, sending him an invite code.");
    let player = new Player(socket);

    // A new player joins, send him his 'invite code'
    player.sendIdentity();

    lobbyPlayers.push(player);
    if (instantPlay && lobbyPlayers.length == 2) {
        console.log("Instant Play is enabled, starting a new game with another player.");
        games.push(new Game(lobbyPlayers.splice(0, 1)[0], lobbyPlayers.splice(0, 1)[0]));
    }
});

server.listen(1345, () => {
    console.log(`ws://localhost:${server.address().port}`);
});