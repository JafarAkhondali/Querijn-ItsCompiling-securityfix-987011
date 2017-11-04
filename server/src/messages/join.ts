export class JoinMessage {
    public seed: number;
    public opponent: string;

    constructor(seed: number, opponentName: string) {
        this.seed = seed;
        this.opponent = opponentName;
    }
}

export class Join {
    m: string;
    c: JoinMessage;

    constructor(seed: number, opponentName: string) {
        this.m = "2";

        this.c = new JoinMessage(seed, opponentName);
    }
}
