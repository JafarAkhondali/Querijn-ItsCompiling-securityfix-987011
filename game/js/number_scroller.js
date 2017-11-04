
class NumberScroller {
    constructor(numberCount) {

        this.style = null;

        this.seed = 30;

        this.speed = 1;
        
        this.numberCount = numberCount || 10;
        this.numbers = [];
    }

    add() {        
        this.style = new PIXI.TextStyle({
            fontFamily: 'xkcd-script',
            fontSize: 36,
            fill: '#000'
        });
        
        for(let i = 0; i < this.numberCount; i++) {
            let number = new PIXI.Text('', this.style);
            
            number.x = windowWidth / 2;
            number.y = i * 36;
            this.numbers.push(number);
        }

        for(let i = 0; i < this.numberCount; i++) {
            app.stage.addChild(this.numbers[i]);
        }
    }

    update(delta) {
        if (!this.seed) return;

        this.speed += delta;

    }

    setSeed(number) {
        this.seed = number;
        this.rand = new Random(number);
        
        for(let i = 0; i < this.numbers.length; i++) {
            let number = this.numbers[i];

            number.text = this.rand.nextBinary();
        }
    }

    remove() {

    }
}