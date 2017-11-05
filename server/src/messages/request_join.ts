export class RequestGameJoin {
    static id: number = 7;

    m: string;
    c: number;

    constructor(game: number) {
        this.m = String(RequestGameJoin.id);

        this.c = game;
    }
}
