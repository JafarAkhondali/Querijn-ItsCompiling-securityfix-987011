export class JoinGameMessage {

    public seed: number;
    public opponent: string;

    constructor(seed: number, opponentName: string) {
        this.seed = seed;
        this.opponent = opponentName;
    }
}

export class JoinGame {
    static id: number = 2;

    m: string;
    c: JoinGameMessage;

    constructor(seed: number, opponentName: string) {
        this.m = String(JoinGame.id);

        this.c = new JoinGameMessage(seed, opponentName);
    }
}
