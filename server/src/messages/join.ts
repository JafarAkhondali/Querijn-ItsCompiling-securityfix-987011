export class JoinMessage {

    public seed: number;
    public opponent: string;

    constructor(seed: number, opponentName: string) {
        this.seed = seed;
        this.opponent = opponentName;
    }
}

export class Join {
    static id: number = 2;

    m: string;
    c: JoinMessage;

    constructor(seed: number, opponentName: string) {
        this.m = String(Join.id);

        this.c = new JoinMessage(seed, opponentName);
    }
}
