export enum InputType {
    Zero = 0,
    One = 1,
    Compile = 2,
    Drop = 3
}

export class Input {
    static id: number = 5;

    m: string;
    c: string;

    constructor(button: InputType) {
        this.m = String(Input.id);

        this.c = String(button);
    }
}