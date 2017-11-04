export class Identifier {
    m: string;
    c: string;

    constructor() {
        this.m = "1";

        let randomNumber = Math.floor((Math.random() * 242281) % 8999) + 1000;
        this.c = String(randomNumber);
    }
}
