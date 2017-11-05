export class JoinGameMessage {

    public numbers: number[];
    public opponent: string;

    constructor(numbers: number[], opponentName: string) {
        this.numbers = numbers;
        this.opponent = opponentName;
    }
}

export class JoinGame {
    static id: number = 2;

    m: string;
    c: JoinGameMessage;

    constructor(numbers: number[], opponentName: string) {
        this.m = String(JoinGame.id);

        this.c = new JoinGameMessage(numbers, opponentName);
    }
}
