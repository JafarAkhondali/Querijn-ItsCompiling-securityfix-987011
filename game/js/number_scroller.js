
class NumberScroller {
    constructor(numberCount, dropAfter) {

        this.style = null;

        this.seed = 0;
        this.rand = null;
        
        this.speed = 1;
        this.timeOnNumber = 0;
        
        this.numberCount = numberCount || 10;
        this.dropDelay = dropAfter || 5;

        this.numberPositions = [];
        this.numbers = [];
        this.dropNumbers = [];
        this.caughtNumbers = [];
        
        let sizeTotal = 800;
        
        for(let i = 0; i < this.numberCount; i++) {
            let fontSize = 36 * ((i + 5) * 0.23);
            
            sizeTotal -= fontSize;

            this.numberPositions.push({
                y: sizeTotal,
                size: fontSize
            });
        }
    }

    get currentNumber() {
        return parseInt(this.numbers[this.numbers.length - 1].binaryNumber);
    }

    add() {   

        for(let i = 0; i < this.numberCount; i++) {

            this.createNumber("1", true);
        }
    }

    createNumber(value, push) { 
        
        let fontSize = this.numberPositions[push ? this.numberPositions.length - 1 : 0].size;

        let style = new PIXI.TextStyle({
            fontFamily: 'xkcd-script',
            fontSize: fontSize,
            fill: '#000', 
            align: "center",
            anchor: 0.5
        });
        
        let numberText = new PIXI.Text(value, style);

        app.stage.addChild(numberText);
        
        let number = {
            text: numberText,
            binaryNumber: value
        };
        
        number.text.y = 800;

        if (push) this.numbers.push(number);
        else this.numbers.unshift(number);
    }
    
    remove() {
        for(let i = 0; i < this.numberCount; i++) {
            app.stage.removeChild(this.numbers[i].text);
        }
        
        for(let i = 0; i < this.caughtNumbers.length; i++) {
            app.stage.removeChild(this.caughtNumbers[i].text);
        }

        for(let i = 0; i < this.dropNumbers.length; i++) {
            app.stage.removeChild(this.dropNumbers[i].text);
        }

        this.dropNumbers = [];
        this.caughtNumbers = [];
    }

    dropNumber(reason) {

        this.timeOnNumber = 0;
        let number = this.numbers.splice(this.numbers.length - 1, 1)[0];

        number.text.anchor.x = 0.5;
        number.text.anchor.y = 0.5;

        number.text.text = number.binaryNumber;
        number.text.x = windowWidth / 2;

        if (!reason || reason === "dropped") {
            number.text.style.fill = "#FF0000";
            this.dropNumbers.push(number);
        }
        else if (reason === "caught") {
            number.text.style.fill = "#00FF00";
            this.caughtNumbers.push(number);
        }

        this.createNumber(this.rand.nextBinary());
    }

    update() {
        if (this.seed === void 0) return;

        let delta = this.ticker.elapsedMS / 1000;

        this.speed += delta * 0.5;
        this.timeOnNumber += delta * this.speed;

        // A number gets dropped
        if (this.timeOnNumber >= this.dropDelay) {
            this.dropNumber();
        }

        let vibrateStrength = ((this.dropDelay - this.timeOnNumber) / this.dropDelay);
        vibrateStrength = 1 - (vibrateStrength * vibrateStrength);

        for(let i = 0; i < this.numbers.length; i++) {
            let number = this.numbers[i];
            let numberPosition = this.numberPositions[i];

            if (i == this.numbers.length - 1) {
                number.text.text = "[ " + number.binaryNumber + " ]";
                number.text.x = windowWidth / 2 - number.text.width / 2;

                number.vibro = !number.vibro ? true : false;
                number.text.x += (number.vibro ? -3 : 3) * vibrateStrength;
            }
            else { 
                number.text.text = number.binaryNumber;
                number.text.x = windowWidth / 2 - number.text.width / 2;
            }

            number.text.y += (numberPosition.y - number.text.y) * delta * 10;
            number.text.style.fontSize += (numberPosition.size - number.text.style.fontSize) * delta * 10;
        }

        for(let i = 0; i < this.dropNumbers.length; i++) {
            let number = this.dropNumbers[i];
            let numberPosition = this.numberPositions[this.numbers.length - 1];
            let targetY = numberPosition.y - 50;
            
            number.text.y += (targetY - number.text.y) * delta * 10;

            number.text.x += delta * 114;
            number.text.y += number.text.rotation * 50;

            number.text.rotation += delta;
            number.text.alpha -= delta;


            if (number.text.alpha <= 0) {
                app.stage.removeChild(this.dropNumbers[i].text);
                this.dropNumbers.splice(i, 1);
                i--;
            }
        }

        for(let i = 0; i < this.caughtNumbers.length; i++) {
            let number = this.caughtNumbers[i];
        }
    }

    setSeed(number) {
        this.seed = number;
        this.rand = new Random(number);
        
        for(let i = 0; i < this.numbers.length; i++) {
            let number = this.numbers[i];
            
            number.binaryNumber = String(this.rand.nextBinary());
        }
    }
}