import { Player } from './player';

import { Join } from './messages/join';

export class Game {
    players: Player[] = []; 

    constructor(player1 : Player, player2 : Player) {
        this.players.push(player1);
        this.players.push(player2);

        let seed = Math.floor(Math.random() * 123123123);

        player1.send(new Join(seed, "Player2"));
        player2.send(new Join(seed, "Player1"));
    }

    public setWinner(index: number, reason: string) {
        if (index !== 1 && index !== 0) 
            return;

        console.log(`Player ${this.players[index].identifier.c} won! Reason: ${reason}`);
    }

    public get participants() : Player[] {
        return this.players.concat();
    }
}