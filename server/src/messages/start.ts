export class Start {
    static id: number = 3;

    m: string;
    c: string;

    constructor() {
        this.m = String(Start.id);

        this.c = "";
    }
}

export class PrepareStart {
    static id: number = 4;

    m: string;
    c: string;

    constructor(time: number) {
        this.m = String(PrepareStart.id);

        this.c = String(time);
    }
}
