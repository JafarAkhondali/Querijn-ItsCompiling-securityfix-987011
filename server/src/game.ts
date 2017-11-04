import { Player } from './player';

import { Join } from './messages/join';
import { Start, PrepareStart } from './messages/start';
import { Input } from './messages/input';

export class Game {
    players: Player[] = []; 
    startDelay: number;

    constructor(startDelay: number, player1 : Player, player2 : Player) {
        this.startDelay = startDelay;

        this.players.push(player1);
        this.players.push(player2);

        let seed = Math.floor(Math.random() * 123123123);

        player1.addListener(Join.id, function () {
            player1.isInGame = true;
            console.log("Player 1 joined!");
            this.checkStart();
        }.bind(this));

        player2.addListener(Join.id, function () {
            player2.isInGame = true;
            console.log("Player 2 joined!");
            this.checkStart();
        }.bind(this));

        player1.send(new Join(seed, "Player2"));
        player2.send(new Join(seed, "Player1"));

        for (let i = 0; i < this.players.length; i++) {
            let player = this.players[i];
            
            player.addListener(Input.id, function (input: Input) { 

                debugger;
            }.bind(this));
        }
    }

    public checkStart() {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].isInGame == false)
                return;
        }

        for (let i = 0; i < this.players.length; i++) 
            this.players[i].send(new PrepareStart(this.startDelay));

        console.log(`Starting game in ${this.startDelay} seconds.`);
        setTimeout(function() { 
            console.log("Starting game");
            for (let i = 0; i < this.players.length; i++) 
                this.players[i].send(new Start());
        }.bind(this), this.startDelay * 1000);
        
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