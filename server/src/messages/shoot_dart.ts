export class ShootDart {
    static id: number = 11;

    m: string;
    c: boolean;

    constructor(isShooting: boolean) {
        this.m = String(ShootDart.id);

        this.c = isShooting;
    }
}