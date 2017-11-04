export class Greeting {
    static id: number = 0;

    m: string;
    c: string;

    constructor(message: string) {
        this.m = String(Greeting.id);

        this.c = message;
    }
}
