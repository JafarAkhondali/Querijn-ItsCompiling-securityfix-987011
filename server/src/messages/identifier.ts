export class Identifier {
    static id: number = 0;

    static codesAvailable: number[] = [];
    static codesInitialized: boolean = false;
    m: string;
    c: string;

    constructor() {
        if (Identifier.codesInitialized === false) {
            for(let i = 1000; i <= 9999; i++) {
                Identifier.codesAvailable.push(i);
            }
            Identifier.codesInitialized = true;
        }

        this.m = String(Identifier.id);

        let index = Math.floor(Math.random() * Identifier.codesAvailable.length);
        let randomNumber = Identifier.codesAvailable.splice(index, 1)[0];
        this.c = String(randomNumber);
    }

    public static returnCode(code: number) {
        Identifier.codesAvailable.push(code);
    }
}
