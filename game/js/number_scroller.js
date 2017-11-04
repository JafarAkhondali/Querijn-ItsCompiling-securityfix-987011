
class NumberScroller {
    constructor(numberCount) {

        this.style = null;
        
        this.numberCount = numberCount || 10;
        this.numbers = [];
        
        this.style = new PIXI.TextStyle({
            fontFamily: 'xkcd-script',
            fontSize: 36,
            fill: '#000'
        });
        
        for(let i = 0; i < this.numberCount; i++) {
            let number = new PIXI.Text('', this.style);
            
            number.x = 300;
            number.y = i * 36;
            this.numbers.push(number);
        }

        for(let i = 0; i < this.numberCount; i++) {
            app.stage.addChild(this.numbers[i]);
        }
    }

    remove() {

    }
}