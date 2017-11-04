export class PlayerUpdateMessage {
    
    public isAttacking: boolean;
    public hasWon: boolean;
    public health: number;
    public darts: number;

    constructor(isAttacking: boolean, hasWon: boolean, health: number, darts: number) {
        this.isAttacking = isAttacking;
        this.hasWon = hasWon;
        this.health = health;
        this.darts = darts;
    }
}

export class PlayerUpdate {
    static id: number = 6;

    m: string;
    c: object;

    constructor(playerIsAttacking: boolean, playerHealth: number, playerDarts: number, playerHasWon: boolean,
                opponentIsAttacking: boolean, opponentHealth: number, opponentDarts: number, opponentHasWon: boolean) {
        this.m = String(PlayerUpdate.id);

        this.c = {
            player: new PlayerUpdateMessage(playerIsAttacking, playerHasWon, playerHealth, playerDarts),
            opponent: new PlayerUpdateMessage(opponentIsAttacking, opponentHasWon, opponentHealth, opponentDarts),
        };
    }
}
