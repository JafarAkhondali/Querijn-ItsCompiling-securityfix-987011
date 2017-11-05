
class NumberScroller {
    constructor(numberCount, dropAfter) {

        this.style = null;

        this.started = false;
        this.paused = false;
        this.added = false;

        this.randoms = [];
        this.iterator = 0;
        
        this.speed = 1;
        this.timeOnNumber = 0;
        
        this.numberCount = numberCount || 10;
        this.dropDelay = dropAfter || 5;

        this.numberPositions = [];
        this.numbers = [];
        this.dropNumbers = [];
        this.caughtNumbers = [];
        
        let sizeTotal = 100;

        for(let i = 0; i < this.numberCount; i++) {
            let fontSize = 36 * (((7 - i) + 5) * 0.23);
            
            sizeTotal += fontSize;

            this.numberPositions.push({
                y: sizeTotal,
                size: fontSize
            });
        }
    }

    get currentNumber() {
        return parseInt(this.numbers[7].binaryNumber);
    }

    add() {   
        if (this.added)
            return;

        this.added = true;

        for(let i = 0; i < this.numberCount; i++) {

            this.createNumber(this.nextBinary());
        }
    }
    
    remove() {
        this.added = false;
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

    start() { 
        this.started = true;
    }

    stop() {
        this.started = false;
    }

    pause() { 
        this.paused = true;
    }

    unpause() {
        this.paused = false;
    }

    resetSpeed() {
        this.speed = 1;
    }

    createNumber(value, push) { 
        
        let fontSize = this.numberPositions[0].size;

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
        this.numbers.unshift(number);
    }

    dropNumber(reason) {
        if (!reason) return;

        this.timeOnNumber = 0;
        let number = this.numbers.splice(this.numbers.length - 1, 1)[0];

        number.text.anchor.x = 0.5;
        number.text.anchor.y = 0.5;

        number.text.text = number.binaryNumber;
        number.text.x = windowWidth / 2;

        if (reason === "dropped") {
            
            // If we mistyped
            if (reason === "dropped") {
                this.speed += 0.3;
            }

            if (sendInput && gameState.started) {
                sendInput({ key: InputType.Drop, i: this.iterator });
            }

            number.text.style.fill = "#FF0000";
            this.dropNumbers.push(number);
        }
        else if (reason === "caught") {
            this.speed += 0.3;
            
            number.text.style.fill = "#00FF00";
            this.caughtNumbers.push(number);
        }

        this.createNumber(this.nextBinary());
    }

    nextBinary() {
        let newNumber = this.randoms[this.iterator];
        this.iterator++;
        
        return newNumber;
    }

    update() {
        let delta = this.ticker.elapsedMS / 1000;
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
            let numberPosition = this.numberPositions[this.numbers.length - 1];
            let targetY = numberPosition.y - 50;
            
            number.text.y += (targetY - number.text.y) * delta * 10;

            number.text.x -= delta * 114;
            number.text.y += number.text.rotation * 50;

            number.text.rotation += delta;
            number.text.alpha -= delta;


            if (number.text.alpha <= 0) {
                app.stage.removeChild(this.caughtNumbers[i].text);
                this.caughtNumbers.splice(i, 1);
                i--;
            }
        }

        if (this.started !== true || this.paused === true) 
            return;

        this.timeOnNumber += delta * this.speed;

        // A number gets dropped
        if (this.timeOnNumber >= this.dropDelay) {
            this.dropNumber();
        }

        let vibrateStrength = ((this.dropDelay - this.timeOnNumber) / this.dropDelay);
        vibrateStrength = Math.max(-1, Math.min(1, 1 - (vibrateStrength * vibrateStrength)));

        for(let i = 0; i < this.numbers.length; i++) {
            let number = this.numbers[i];
            let numberPosition = this.numberPositions[7 - i];

            if (i == 7) {
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
    }

    setNumbers(numbers) {
        this.randoms = numbers;
    }
}