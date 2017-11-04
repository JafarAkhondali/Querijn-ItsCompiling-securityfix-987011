import { Player } from './player';

import { Join } from './messages/join';

export class Game {
    public players: Player[] = []; 

    constructor(player1 : Player, player2 : Player) {
        this.players.push(player1);
        this.players.push(player2);

        player1.send(new Join("Player2"));
        player2.send(new Join("Player1"));
    }
}