// Assets requirements
let windowWidth = 1920;
let windowHeight = 1080;

let dartComboCount = 8;
let numbersOnScreenCount = 8;
let maxHealth = 64;
let serverURL = "ws://localhost:1345";

let gameState = {

    reset: function(seed) {
        this.started = false;
        this.seed = seed;

        this.yourHealth = maxHealth;
        this.yourDarts = 0;

        this.opponentHealth = maxHealth;
        this.opponentDarts = 0;
    }
}

const InputType = {
    Zero: 0,
    One: 1,
    Compile: 2,
    Drop: 3
};

let app = new PIXI.Application(windowWidth, windowHeight, { backgroundColor: 0xFFFFFF });
let gameSprites = PIXI.BaseTexture.fromImage("media/game.png");
let assetsRequested = 0;
let assetsLoaded = 0;

// Assets
let button = [
    getZeroButton(),
    getOneButton()
];

let zeroButton = button[0];
let oneButton = button[1];
let compileButton = getCompileButton();

let inviteCode = 0;
let numberScroller = new NumberScroller(numbersOnScreenCount);

let background = PIXI.Sprite.from(new PIXI.Texture(gameSprites, new PIXI.Rectangle(s_bg.x, s_bg.y, s_bg.width, s_bg.height)));
let healthBorderLeft = PIXI.Sprite.from(new PIXI.Texture(gameSprites, new PIXI.Rectangle(s_healthborder.x, s_healthborder.y, s_healthborder.width, s_healthborder.height)));
let healthBorderRight = PIXI.Sprite.from(new PIXI.Texture(gameSprites, new PIXI.Rectangle(s_healthborder.x, s_healthborder.y, s_healthborder.width, s_healthborder.height)));
let healthBarLeft = PIXI.Sprite.from(new PIXI.Texture(gameSprites, new PIXI.Rectangle(s_healthbar.x, s_healthbar.y, s_healthbar.width, s_healthbar.height)));
let healthBarRight = PIXI.Sprite.from(new PIXI.Texture(gameSprites, new PIXI.Rectangle(s_healthbar.x, s_healthbar.y, s_healthbar.width, s_healthbar.height)));

let healthLeft = null;
let healthRight = null;

let computerLeft = PIXI.Sprite.from(new PIXI.Texture(gameSprites, new PIXI.Rectangle(s_cpu1_main.x, s_cpu1_main.y, s_cpu1_main.width, s_cpu1_main.height)));
let computerRight = PIXI.Sprite.from(new PIXI.Texture(gameSprites, new PIXI.Rectangle(s_cpu2_main.x, s_cpu2_main.y, s_cpu2_main.width, s_cpu2_main.height)));

let lobbyTitle = null;
let prepareToStartText = null;

let getNerfDart = function() { return PIXI.Sprite.from(new PIXI.Texture(gameSprites, new PIXI.Rectangle(s_nerf_dart.x, s_nerf_dart.y, s_nerf_dart.width, s_nerf_dart.height))); };
let dartsLeft = [];
let dartsRight = [];
for (let i = 0; i < dartComboCount; i++) {
    dartsLeft.push(getNerfDart());
    dartsRight.push(getNerfDart());
}

let gameConnection = null;
let sendInput = null;
let waitForUp = false;

function assetHasLoaded() { 
    assetsLoaded++;

    console.log(`Load progress: ${assetsLoaded}/${assetsRequested} (${(assetsLoaded/assetsRequested) * 100}%)`);
    if (assetsLoaded == assetsRequested) {
        init();
    }
}

function preload() {

    let font = new Font();
    font.onload = assetHasLoaded;
    font.onerror = function(e) { console.error(e);};
    font.fontFamily = "xkcd-script";
    assetsRequested++;

    // add load assets here
    
    font.src = 'media/xkcd-script.ttf'; // Start loading
}

function init() {
    window.onresize();
    document.getElementById("game").appendChild(app.view);

    gameConnection = new GameClient(serverURL);


    showSharedAssets();
    showLobby();

    addMessages();
}
    
function addMessages() {
    // On Lobby Join
    let hasReceivedInviteCode = gameConnection.addTalkBox(1, function (suggestedCode) { 
        console.log(`Received invite code ${suggestedCode}, confirming receiving it.`);
        inviteCode = suggestedCode;
        hasReceivedInviteCode(suggestedCode);

        lobbyTitle.text = 'We are connected to the server!\n\nGot a friend?\nSend them your URL to play with them!';
        lobbyTitle.x = windowWidth / 2 - lobbyTitle.width / 2;

        window.history.pushState(suggestedCode, suggestedCode, `?i=${suggestedCode}`);
    });

    // On Game Join
    let hasJoined = gameConnection.addTalkBox(2, function (game) { 
        console.log(`Received a game join! Playing against ${game.opponent} with seed ${game.seed}`);

        hideLobby();
        
        gameState.reset(game.seed);
        showGame();

        hasJoined(game.opponent);
    });

    let removeTimer = function () {
        if (!prepareToStartText) return;
        
        app.stage.removeChild(prepareToStartText);
        prepareToStartText = null;
    }

    // Prepare Start Game
    gameConnection.addTalkBox(4, function (time) { 
        console.log(`Received a game prepare start! Game will start in ${time} seconds.`);
        
        let style = new PIXI.TextStyle({
            fontFamily: 'xkcd-script',
            fontSize: 72,
            fill: '#000',
            align: "center"
        });
    
        prepareToStartText = new PIXI.Text(`Game will start in ${time}..`, style);
        time = parseInt(time);
        prepareToStartText.x = windowWidth / 2 - prepareToStartText.width / 2;
        prepareToStartText.y = 150;
        app.stage.addChild(prepareToStartText);

        let updateTimer = function(time) { 
            if (!prepareToStartText || prepareToStartText.time === 0) {
                removeTimer();
                return;
            } 
            time -= 1;

            prepareToStartText.text = `Game will start in ${(time)}..`;
            prepareToStartText.x = windowWidth / 2 - prepareToStartText.width / 2;
            setTimeout(updateTimer.bind(undefined, time), 1000);
        }

        setTimeout(updateTimer.bind(undefined, time), 1000);
    });

    // Start Game
    gameConnection.addTalkBox(3, function (game) { 
        console.log(`Received a game start!`);

        gameState.started = true;
        removeTimer();
        numberScroller.start();
    });

    // Send input
    sendInput = gameConnection.addTalkBox(5, function (game) { 
        console.log(`Received input?`);
    });

    // Receive player sync
    gameConnection.addTalkBox(6, function (game) { 
        if (game.player.isAttacking) {
            numberScroller.pause();
        }
        else if (numberScroller.paused) {
            numberScroller.unpause();
        }

        gameState.yourHealth = game.player.health;
        gameState.yourDarts = game.player.darts;
        gameState.opponentHealth = game.opponent.health;
        gameState.opponentDarts = game.opponent.darts;

        healthLeft.text = String(Math.min(maxHealth, Math.ceil(game.player.health)));
        healthBarLeft.scale.x = (game.player.health / maxHealth);       
        for (let i = 0; i < dartsLeft.length; i++) {
            dartsLeft[i].alpha = (i < game.player.darts) ? 1.0 : 0.5;
        }

        healthRight.text = String(Math.min(maxHealth, Math.ceil(game.opponent.health)));
        healthBarRight.scale.x = -(game.opponent.health / maxHealth);         
        healthBarRight.x = (windowWidth - 80) - s_healthbar.width * (1.0 - Math.abs(healthBarRight.scale.x));
        for (let i = 0; i < dartsRight.length; i++) {
            dartsRight[i].alpha = (i < game.opponent.darts) ? 1.0 : 0.5;
        }
    });
}

function showSharedAssets() {
    
    background.x = 0;
    background.y = windowHeight - s_bg.height;
    app.stage.addChild(background);
    
    computerLeft.x = 120;
    computerLeft.y = 320;
    app.stage.addChild(computerLeft);
    
    computerRight.x = windowWidth - s_cpu2_main.width - 120;
    computerRight.y = 320;
    app.stage.addChild(computerRight);
}

function showLobby() {
    let style = new PIXI.TextStyle({
        fontFamily: 'xkcd-script',
        fontSize: 52,
        fill: '#000',
        align: "center"
    });
    
    lobbyTitle = new PIXI.Text('Waiting for a connection..', style);
    lobbyTitle.x = windowWidth / 2 - lobbyTitle.width / 2;
    lobbyTitle.y = 50;
    app.stage.addChild(lobbyTitle);
}

function hideLobby() {
    app.stage.removeChild(lobbyTitle);
}

function showGame() { 
    numberScroller.add();
    numberScroller.setSeed(gameState.seed);

    healthBorderLeft.x = 20;
    healthBorderLeft.y = 20;
    app.stage.addChild(healthBorderLeft);

    healthBorderRight.x = windowWidth - s_healthborder.width - 20;
    healthBorderRight.y = 20;
    app.stage.addChild(healthBorderRight);

    healthBarLeft.x = 80;
    healthBarLeft.y = healthBorderLeft.y + s_healthborder.height / 2 - s_healthbar.height / 2;
    app.stage.addChild(healthBarLeft);

    healthBarRight.x = windowWidth - 80;
    healthBarRight.y = healthBorderRight.y + s_healthborder.height / 2 - s_healthbar.height / 2;
    healthBarRight.scale.x = -1;        
    app.stage.addChild(healthBarRight);
    
    for (let i = 0; i < dartComboCount; i++) {
        dartsLeft[i].x = (i + 0.5) * (10 + s_nerf_dart.width);
        dartsLeft[i].y = 100;
        dartsLeft[i].alpha = 0.5;
        app.stage.addChild(dartsLeft[i]);

        dartsRight[i].x = windowWidth - ((dartComboCount - i) + 0.5) * (10 + s_nerf_dart.width);
        dartsRight[i].y = 100;
        dartsRight[i].alpha = 0.5;
        app.stage.addChild(dartsRight[i]);
    }

    let style = new PIXI.TextStyle({
        fontFamily: 'xkcd-script',
        fontSize: 36,
        fill: '#000',
        align: "center"
    });

    healthLeft = new PIXI.Text(String(maxHealth), style);
    healthLeft.x = 38;
    healthLeft.y = 36;
    app.stage.addChild(healthLeft);

    healthRight = new PIXI.Text(String(maxHealth), style);
    healthRight.x = healthBarRight.x + 7;
    healthRight.y = healthBarRight.y + 5;
    app.stage.addChild(healthRight);

    compileButton.anchor.x = 0.5;
    compileButton.anchor.y = 0.5;
    compileButton.x = windowWidth / 2;
    compileButton.y = windowHeight - 50;
    app.stage.addChild(compileButton);

    zeroButton.anchor.x = 0.5;
    zeroButton.anchor.y = 0.5;
    zeroButton.x = windowWidth / 2 - compileButton.width / 2 - zeroButton.width / 2;
    zeroButton.y = windowHeight - 50;
    app.stage.addChild(zeroButton);

    oneButton.anchor.x = 0.5;
    oneButton.anchor.y = 0.5;
    oneButton.x = windowWidth / 2 + compileButton.width / 2 + zeroButton.width / 2;
    oneButton.y = windowHeight - 50;
    app.stage.addChild(oneButton);
    
    numberScroller.ticker = app.ticker.add(numberScroller.update.bind(numberScroller));
}

window.onkeydown = function(e) {

    if (waitForUp) return;

    if (e.keyCode == 13 || e.keyCode == 32 /*|| e.keyCode == 116*/) { // enter, space or F5
        e.preventDefault();
        
        if (!gameState.started)
            return;

        numberScroller.resetSpeed();
        compileButton.gotoAndStop(1);

        
        waitForUp = true;
        if (sendInput) {
            sendInput(InputType.Compile);
        }
    }
    else if (e.keyCode == 48 || e.keyCode == 49) { // 0 or 1
        let binary = e.keyCode - 48;

        if (!gameState.started)
            return;
        
        button[binary].gotoAndStop(1);

        let isCorrectButton = binary == numberScroller.currentNumber;

        waitForUp = true;
        if (sendInput) {
            sendInput(binary == 1 ? InputType.One : InputType.Zero);
        }

        if (isCorrectButton) {
            // addCode();
            numberScroller.dropNumber("caught");
        }
        else {
            numberScroller.dropNumber("dropped");
        }
    }
}

window.onkeyup = function(e) {
    
    if (e.keyCode == 13 || e.keyCode == 32 /*|| e.keyCode == 116*/) { // enter, space or F5
        e.preventDefault();
        compileButton.gotoAndStop(0);
        
        waitForUp = false;
    }
    else if (e.keyCode == 48 || e.keyCode == 49) { // 0 or 1
        let binary = e.keyCode - 48;
        button[binary].gotoAndStop(0);

        waitForUp = false;
    }
}


function hideGame() {

    numberScroller.remove();

    app.stage.removeChild(healthBorderLeft);
    app.stage.removeChild(healthBorderRight);
    app.stage.removeChild(healthBarLeft); 
    app.stage.removeChild(healthBarRight);
    
    for (let i = 0; i < dartComboCount; i++) {
        app.stage.removeChild(dartsLeft[i]);
        app.stage.removeChild(dartsRight[i]);
    }
    
    app.stage.removeChild(zeroButton);
    app.stage.removeChild(oneButton);
    app.stage.removeChild(compileButton);
    
    app.ticker.remove(numberScroller.update.bind(numberScroller));
}

if (document.addEventListener)
    document.addEventListener("DOMContentLoaded", preload, false);
else if (document.attachEvent)
    document.attachEvent("onreadystatechange", preload);
else window.onload = preload;

window.onresize = function (event) {

    let oldAspect = windowWidth / windowHeight;

    let w = Math.min(window.innerWidth * 0.8, 1920);
    let h = w / oldAspect;
    app.view.style.width = w + "px";
    app.view.style.height = h + "px";
};