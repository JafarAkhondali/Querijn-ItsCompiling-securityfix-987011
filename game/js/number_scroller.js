
class NumberScroller {
    constructor() {
        this.style = new PIXI.TextStyle({
            fontFamily: 'xkcd-script',
            fontSize: 36,
            fill: '#000'
        });
        
        this.numbers = [];
        
        for(let i = 0; i < 10; i++) {
            let number = new PIXI.Text('', style);
            
            number.x = app.view.width / 2;
            number.y = i * 36;
            this.numbers.push(number);
            app.stage.addChild(this.numbers[i]);
        }
    }

    remove() {

    }
}