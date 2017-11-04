import { Random } from './random';
import { Player } from './player';

import { Join } from './messages/join';
import { Start, PrepareStart } from './messages/start';
import { Input, InputType } from './messages/input';
import { PlayerUpdate } from './messages/player_update';

export class Game {
    players: Player[] = []; 
    startDelay: number;
    hertz: number;

    damageModifier: number;

    random: Random;
    numbers: number[] = [];

    attackTimeout: (NodeJS.Timer|null)[] = [ null, null ];
    updateInterval: NodeJS.Timer|null = null;

    constructor(hertz: number, maxHealth: number, startDelay: number, player1 : Player, player2 : Player) {
        this.startDelay = startDelay;
        this.hertz = hertz;

        player1.health = maxHealth;
        player1.currentNumber = 0;
        player1.correct = 0;
        player1.combo = 0;
        player1.isAttacking = false;
        player1.dps = 0;

        player2.health = maxHealth;
        player2.currentNumber = 0;
        player2.correct = 0;
        player2.combo = 0;
        player2.isAttacking = false;
        player2.dps = 0;

        this.players.push(player1);
        this.players.push(player2);

        this.damageModifier = (Math.random() * 1.5 + 0.5) * 0.3;
        console.log(`Damage modifier = ${this.damageModifier}`);

        let seed = Math.floor(Math.random() * 123123123);
        this.random = new Random(seed);

        for (let i = 0; i < 1000; i++) {
            this.numbers.push(this.random.nextBinary());
        }

        player1.addListener(Join.id, function () {
            if (player1.isInGame) return;

            player1.isInGame = true;
            console.log("Player 1 joined!");
            this.checkStart();
        }.bind(this));

        player2.addListener(Join.id, function () {
            if (player2.isInGame) return;

            player2.isInGame = true;
            console.log("Player 2 joined!");
            this.checkStart();
        }.bind(this));

        player1.send(new Join(seed, "Player2"));
        player2.send(new Join(seed, "Player1"));

        for (let i = 0; i < this.players.length; i++) {
            let player = this.players[i];
            
            player.addListener(Input.id, function (player: Player, input: InputType) { 

                // console.log(`Received input from ${player.identifier.c}: ${input}`);
                switch(input) {
                    case InputType.Compile:
                        // Calculate damage       
                        
                        if (player.isAttacking || player.correct == 0) {
                            break;
                        }
                        
                        player.isAttacking = true;
                        
                        player.dps = this.damageModifier * player.correct;
                        let time = player.correct * 500;

                        console.log(`Player ${player.identifier.c} will do ${player.dps} dps for ${time} ms`);
                        
                        player.correct = 0;
                        player.combo = 0;

                        this.attackTimeout[i] = setTimeout(function (index: number) { 
                            this.players[index].isAttacking = false; 
                        }.bind(this, i), time);
                        break;

                    case InputType.One:
                    case InputType.Zero:
                        // Check if correct, award if so

                        let number = this.numbers[player.currentNumber];
                        player.currentNumber++;

                        if (number == input) {
                            player.correct += 1;
                            player.combo++;
                        }
                        else {
                            player.correct -= 1;
                            player.combo = 0;
                        }
                        break;

                    case InputType.Drop:
                        // Drop a number
                        player.currentNumber++;
                        player.correct = 0.5;
                        break;
                };
            }.bind(this, player));
        }
    }

    public getNumber(index: number) {
        return this.numbers[index];
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

            this.updateInterval = setInterval(this.update.bind(this), 1000 / this.hertz);
        }.bind(this), this.startDelay * 1000);
        
    }

    update() {
        let delta = this.hertz / 1000;

        for (let j = 0; j < this.players.length; j++) {
            let player = this.players[j];
            let opponent = this.players[(j + 1) % 2];

            console.log(`Player ${player.identifier.c} health: ${player.health}`);
            if (player.isAttacking && opponent.isAttacking == false) {
                opponent.health -= player.dps * (delta);
            }

            player.send(new PlayerUpdate(player.isAttacking,    player.health,      player.combo,   opponent.health <= 0, 
                                        opponent.isAttacking,   opponent.health,    opponent.combo, player.health <= 0));

            // If we've won, don't update the other player.
            if (opponent.health <= 0) {
                console.log("Game over by death!");
                this.setWinner(j, "Death");
                if (j == 0) opponent.send(new PlayerUpdate(opponent.isAttacking,    opponent.health,        opponent.combo,   opponent.health <= 0, 
                                                            player.isAttacking,     player.health,          player.combo,     player.health <= 0));
                return;
            }
            
        }
    }

    clearTimeouts() {
        if (this.updateInterval) clearInterval(this.updateInterval);

        for (let i = 0; i < this.attackTimeout.length; i++) {
            let timeout = this.attackTimeout[i];
            if (timeout === null) continue;
            
            clearTimeout(timeout);
        }
    }

    public setWinner(index: number, reason: string) {
        if (index !== 1 && index !== 0) 
            return;

        this.clearTimeouts();
        console.log(`Player ${this.players[index].identifier.c} won! Reason: ${reason}`);
    }

    public get participants() : Player[] {
        return this.players.concat();
    }
}