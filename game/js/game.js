// Assets requirements
let windowWidth = 1920;
let windowHeight = 1080;

let dartComboCount = 8;
let numbersOnScreenCount = 8;
let maxHealth = 64;
let serverURL = "ws://localhost:3389";

const InputType = {
    Zero: 0,
    One: 1,
    Compile: 2,
    Drop: 3
};

const PlayerState = {
    None: -1,
    Idle: 0,
    Attacking: 1,
    Clashing: 2,
    Winning: 3,
    Losing: 4,

    toString: function(state) {
        switch(state) {
            default:
            case PlayerState.None: return "PlayerState.None";
            case PlayerState.Idle: return "PlayerState.Idle";
            case PlayerState.Attacking: return "PlayerState.Attacking";
            case PlayerState.Clashing: return "PlayerState.Clashing";
            case PlayerState.Winning: return "PlayerState.Winning";
            case PlayerState.Losing: return "PlayerState.Losing";
        }
    }
};

let gameState = {

    reset: function(numbers) {
        this.started = false;
        this.numbers = numbers;

        this.yourPrevState = PlayerState.None;
        this.yourState = PlayerState.Idle;
        this.yourStateChanged = true;
        this.yourHealth = maxHealth;
        this.yourDarts = 0;

        this.opponentPrevState = PlayerState.None;
        this.opponentState = PlayerState.Idle;
        this.opponentStateChanged = true;
        this.opponentHealth = maxHealth;
        this.opponentDarts = 0;
    }
}

var gameArguments = { };
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

let codeLeft = null;
let codeRight = null;
let codeOffsetLeft = 0;
let codeOffsetRight = 0;
let codeRightInterval = null;
let codingRight = null;
let sourceCode = [""];
let getCode = function(offset) { let code = ""; for (var i = 0; i < 10; i++) code += sourceCode[offset + i] + "\n"; return code; }

let lobbyTitle = null;
let prepareToStartText = null;

let playerLeft = null;
let playerRight = null;

let getNerfDart = function() { return PIXI.Sprite.from(new PIXI.Texture(gameSprites, new PIXI.Rectangle(s_nerf_dart.x, s_nerf_dart.y, s_nerf_dart.width, s_nerf_dart.height))); };
let dartsLeft = [];
let dartsRight = [];
for (let i = 0; i < dartComboCount; i++) {
    dartsLeft.push(getNerfDart());
    dartsRight.push(getNerfDart());
}

let gameConnection = null;
let gameToJoin = null;
let sendInput = null;
let waitForUp = false;

let loaderAssets = null;

function assetHasLoaded() { 
    assetsLoaded++;

    console.log(`Load progress: ${assetsLoaded}/${assetsRequested} (${(assetsLoaded/assetsRequested) * 100}%)`);
    if (assetsLoaded == assetsRequested) {
        init();
    }
}

function preload(loader, resources) {

    if (gameArguments.hasOwnProperty("i")) {
        console.log("Found invite code", gameArguments["i"]);
        gameToJoin = parseInt(gameArguments["i"]);
    }
    else { 
        console.log("No invite code found");
        gameToJoin = 0;
    }

    loaderAssets = resources;

    let font = new Font();
    font.onload = assetHasLoaded;
    font.onerror = function(e) { console.error(e);};
    font.fontFamily = "xkcd-script";
    assetsRequested++;
    
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState != 4 || this.status != 200)
            return;

        sourceCode = this.responseText.split('\n');
        assetHasLoaded();
    };
    assetsRequested++;

    // add load assets here
    
    font.src = 'media/xkcd-script.ttf'; // Start loading
    xhttp.open("GET", "media/source.txt", true);
    xhttp.send();
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

        if (gameToJoin) {
            sendJoinRequest(gameToJoin);
            gameToJoin = 0;

            lobbyTitle.text = 'Attempting to join game..';
            lobbyTitle.x = windowWidth / 2 - lobbyTitle.width / 2;
        }
        else {
            lobbyTitle.text = 'We are connected to the server!\n\nGot a friend?\nSend them your URL to play with them!';
            lobbyTitle.x = windowWidth / 2 - lobbyTitle.width / 2;

            window.history.pushState(suggestedCode, suggestedCode, `?i=${suggestedCode}`);
        }
    });

    // On Game Join
    let hasJoined = gameConnection.addTalkBox(2, function (game) { 
        console.log(`Received a game join! Playing against ${game.opponent}`);

        hideLobby();
        
        gameState.reset(game.numbers);
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
        
        codingRight = function () { 
            codeOffsetRight++;
            codeRight.text = getCode(codeOffsetRight);

            codeRightInterval = setTimeout(codingRight, Math.random() * 300 + 50);
        };
        codeRightInterval = setTimeout(codingRight, 150);
    });

    // Send input
    sendInput = gameConnection.addTalkBox(5, function (game) { 
        console.log(`Received input?`);
    });

    // Send join game
    sendJoinRequest = gameConnection.addTalkBox(7, function (game) { 
        console.log(`Received join request?`);
    });

    // Receive player sync
    gameConnection.addTalkBox(6, function (game) { 
        if (game.player.isAttacking) {
            numberScroller.pause();
        }
        else if (numberScroller.paused) {
            numberScroller.unpause();
        }

        // Update animation state
        if (game.player.hasWon && gameState.yourState != PlayerState.Winning) {
            gameState.yourPrevState = gameState.yourState;
            gameState.yourState = PlayerState.Winning;
            gameState.yourStateChanged = true;
            
            let computerX = computerRight.x;
            let computerY = computerRight.y;
            app.stage.removeChild(computerRight);

            computerRight = PIXI.Sprite.from(new PIXI.Texture(gameSprites, new PIXI.Rectangle(s_cpu2_bsod.x, s_cpu2_bsod.y, s_cpu2_bsod.width, s_cpu2_bsod.height)));
            computerRight.x = computerX;
            computerRight.x = computerY;
            app.stage.addChild(computerRight);
            
            app.stage.removeChild(codeRight);

            hideGame();
            showLobby();
            
            lobbyTitle.text = 'You have won! Congratulations!';
            lobbyTitle.x = windowWidth / 2 - lobbyTitle.width / 2;
        }
        else if (game.player.isAttacking && gameState.yourState != PlayerState.Attacking) {
            gameState.yourPrevState = gameState.yourState;
            gameState.yourState = PlayerState.Attacking;
            gameState.yourStateChanged = true;
        }
        else if (game.player.isAttacking == false && gameState.yourState != PlayerState.Idle) {
            gameState.yourPrevState = gameState.yourState;
            gameState.yourState = PlayerState.Idle;
            gameState.yourStateChanged = true;
        }

        // Update opponent animation state
        if (game.opponent.hasWon && gameState.opponentState != PlayerState.Winning) {
            gameState.opponentPrevState = gameState.opponentState;
            gameState.opponentState = PlayerState.Winning;
            gameState.opponentStateChanged = true;

            let computerX = computerLeft.x;
            let computerY = computerLeft.y;
            app.stage.removeChild(computerLeft);

            computerLeft = PIXI.Sprite.from(new PIXI.Texture(gameSprites, new PIXI.Rectangle(s_cpu1_bsod.x, s_cpu1_bsod.y, s_cpu1_bsod.width, s_cpu1_bsod.height)));
            computerLeft.x = computerX;
            computerLeft.x = computerY;
            app.stage.addChild(computerLeft);
            app.stage.removeChild(codeLeft);

            hideGame();
            showLobby();

            lobbyTitle.text = 'You lost. Well, at least you gave it your best.';
            lobbyTitle.x = windowWidth / 2 - lobbyTitle.width / 2;
        }
        else if (game.opponent.isAttacking && gameState.opponentState != PlayerState.Attacking) {
            gameState.opponentPrevState = gameState.opponentState;
            gameState.opponentState = PlayerState.Attacking;
            gameState.opponentStateChanged = true;
        }
        else if (game.opponent.isAttacking == false && gameState.opponentState != PlayerState.Idle) {
            gameState.opponentPrevState = gameState.opponentState;
            gameState.opponentState = PlayerState.Idle;
            gameState.opponentStateChanged = true;
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

    // Shoot dart
    gameConnection.addTalkBox(11, function (isShooting) { 
        if (isShooting) {
            console.log("We shot them!");

            if (gameState.yourState == PlayerState.Attacking)
                playerLeft.state.setAnimation(0, 'shoot2');
            else playerLeft.state.setAnimation(0, 'shoot2');
        }
        else { 
            console.log("We got shot at!");

            if (gameState.opponentState == PlayerState.Attacking)
                playerRight.state.setAnimation(0, 'shoot2');
            else playerRight.state.setAnimation(0, 'shoot2');
        }
    });
}

function updateAnimations() {
    
    if (!gameState || !playerLeft || !playerRight) return;

    // If both are attacking, both are clashing
    if (gameState.yourState == PlayerState.Attacking && gameState.opponentState == PlayerState.Attacking) {

        console.log("Clash detected!");

        gameState.yourPrevState = gameState.yourState;
        gameState.yourState = PlayerState.Clashing;
        gameState.yourStateChanged = true;

        gameState.opponentPrevState = gameState.opponentState;
        gameState.opponentState = PlayerState.Clashing;
        gameState.opponentStateChanged = true;
    }


    if (gameState.yourStateChanged == true) {
        gameState.yourStateChanged = false;

        console.log(`You are now ${PlayerState.toString(gameState.yourState)}. Previous: ${PlayerState.toString(gameState.yourPrevState)}`);
        switch (gameState.yourState) {
            case PlayerState.Losing:
            case PlayerState.Idle: {
                let transitionAnimation = 'idle';
                let animation = 'idle';

                if (gameState.yourPrevState == PlayerState.Clashing) {
                    transitionAnimation = 'clash_to_idle';
                }
                else if (gameState.yourPrevState == PlayerState.Attacking) {
                    transitionAnimation = 'attack_to_idle';
                }

                if (transitionAnimation != 'idle') {
                    playerLeft.state.setAnimation(0, transitionAnimation, false);
                    playerLeft.state.addAnimation(0, animation, true, 0);
                }
                else {
                    playerLeft.state.setAnimation(0, animation, true);
                }
                break;
            }

            case PlayerState.Attacking: {
                let transitionAnimation = 'idle_to_attack';
                let animation = 'attack';

                if (gameState.yourPrevState == PlayerState.Clashing) {
                    transitionAnimation = 'clash_to_attack';
                }

                playerLeft.state.setAnimation(0, transitionAnimation, false);
                playerLeft.state.addAnimation(0, animation, true, 0);
                break;
            }
                
            case PlayerState.Clashing: {
                let transitionAnimation = 'idle_to_clash';
                let animation = 'clash';

                if (gameState.yourPrevState == PlayerState.Attacking) {
                    transitionAnimation = 'attack_to_clash';
                }

                playerLeft.state.setAnimation(0, transitionAnimation, false);
                playerLeft.state.addAnimation(0, animation, true, 0);
                break;
            }

            case PlayerState.Winning: {
                let transitionAnimation = 'idle';
                let animation = 'win';

                if (gameState.yourPrevState == PlayerState.Clashing) {
                    transitionAnimation = 'clash_to_idle';
                }
                else if (gameState.yourPrevState == PlayerState.Attacking) {
                    transitionAnimation = 'attack_to_idle';
                }

                if (transitionAnimation != 'idle') {
                    playerLeft.state.setAnimation(0, transitionAnimation, false);
                    playerLeft.state.addAnimation(0, animation, true, 0);
                }
                else {
                    playerLeft.state.setAnimation(0, animation, true);
                }
                break;
            }
        }
    }

    if (gameState.opponentStateChanged == true) {
        gameState.opponentStateChanged = false;

        console.log(`Opponent is now ${PlayerState.toString(gameState.opponentState)}. Previous: ${PlayerState.toString(gameState.opponentPrevState)}`);
        switch (gameState.opponentState) {
            case PlayerState.Losing:
            case PlayerState.Idle: {
                let transitionAnimation = 'idle';
                let animation = 'idle';

                if (gameState.opponentPrevState == PlayerState.Clashing) {
                    transitionAnimation = 'clash_to_idle';
                }
                else if (gameState.opponentPrevState == PlayerState.Attacking) {
                    transitionAnimation = 'attack_to_idle';
                }

                if (transitionAnimation != 'idle') {
                    playerRight.state.setAnimation(0, transitionAnimation, false);
                    playerRight.state.addAnimation(0, animation, true, 0);
                }
                else {
                    playerRight.state.setAnimation(0, animation, true);
                }
                break;
            }

            case PlayerState.Attacking: {
                let transitionAnimation = 'idle_to_attack';
                let animation = 'attack';

                if (gameState.opponentPrevState == PlayerState.Clashing) {
                    transitionAnimation = 'clash_to_attack';
                }

                playerRight.state.setAnimation(0, transitionAnimation, false);
                playerRight.state.addAnimation(0, animation, true, 0);
                break;
            }
                
            case PlayerState.Clashing: {
                let transitionAnimation = 'idle_to_clash';
                let animation = 'clash';

                if (gameState.opponentPrevState == PlayerState.Attacking) {
                    transitionAnimation = 'attack_to_clash';
                }

                playerRight.state.setAnimation(0, transitionAnimation, false);
                playerRight.state.addAnimation(0, animation, true, 0);
                break;
            }
            
            case PlayerState.Winning: {
                let transitionAnimation = 'idle';
                let animation = 'win';

                if (gameState.opponentPrevState == PlayerState.Clashing) {
                    transitionAnimation = 'clash_to_idle';
                }
                else if (gameState.opponentPrevState == PlayerState.Attacking) {
                    transitionAnimation = 'attack_to_idle';
                }

                if (transitionAnimation != 'idle') {
                    playerRight.state.setAnimation(0, transitionAnimation, false);
                    playerRight.state.addAnimation(0, animation, true, 0);
                }
                else {
                    playerRight.state.setAnimation(0, animation, true);
                }
                break;
            }
        }
    }

};

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
    
    codeOffsetLeft = Math.floor(Math.random() * 2000) % sourceCode.length;
    codeOffsetRight = Math.floor(Math.random() * 2000) % sourceCode.length;

    style = new PIXI.TextStyle({
        fontFamily: 'xkcd-script',
        fontSize: 21,
        fill: '#979797'
    });

    let getCode = function(offset) { let code = ""; for (var i = 0; i < 10; i++) code += sourceCode[offset + i] + "\n"; return code; }
    let code = getCode(codeOffsetLeft);
    codeLeft = new PIXI.Text(code, style);
    codeLeft.x = 190;
    codeLeft.y = 400;
    app.stage.addChild(codeLeft);

    codeLeft.mask = new PIXI.Graphics(); 
    codeLeft.mask.beginFill(0xFFFFFF, 1);
    codeLeft.mask.moveTo(190, 400);
    codeLeft.mask.lineTo(720, 400);
    codeLeft.mask.lineTo(715, 670);
    codeLeft.mask.lineTo(190, 670);
    
    code = getCode(codeOffsetRight);
    codeRight = new PIXI.Text(code, style);
    codeRight.x = 1210;
    codeRight.y = 400;
    app.stage.addChild(codeRight);

    codeRight.mask = new PIXI.Graphics(); 
    codeRight.mask.beginFill(0xFFFFFF, 1);
    codeRight.mask.moveTo(1210, 400);
    codeRight.mask.lineTo(1730, 400);
    codeRight.mask.lineTo(1725, 670);
    codeRight.mask.lineTo(1210, 670);
    
    playerLeft = new PIXI.spine.Spine(loaderAssets.player.spineData);
    app.stage.addChild(playerLeft);
    playerLeft.state.setAnimation(0, 'idle', true);
    playerLeft.x = 520;
    playerLeft.y = 1215;

    playerRight = new PIXI.spine.Spine(loaderAssets.player.spineData);
    app.stage.addChild(playerRight);
    playerRight.state.setAnimation(0, 'idle', true);
    playerRight.scale.x = -1;
    playerRight.x = 1360;
    playerRight.y = 1215;

    app.ticker.add(updateAnimations);
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
    numberScroller.setNumbers(gameState.numbers);
    numberScroller.add();

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

    if (window.onMobilePhone) { 
        // TODO: make a better mobile config
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
    }
    else { 
        // compileButton.anchor.x = 0.5;
        // compileButton.anchor.y = 0.5;
        // compileButton.x = windowWidth / 2;
        // compileButton.y = windowHeight - 50;
        // app.stage.addChild(compileButton);
    
        // zeroButton.anchor.x = 0.5;
        // zeroButton.anchor.y = 0.5;
        // zeroButton.x = windowWidth / 2 - compileButton.width / 2 - zeroButton.width / 2;
        // zeroButton.y = windowHeight - 50;
        // app.stage.addChild(zeroButton);
    
        // oneButton.anchor.x = 0.5;
        // oneButton.anchor.y = 0.5;
        // oneButton.x = windowWidth / 2 + compileButton.width / 2 + zeroButton.width / 2;
        // oneButton.y = windowHeight - 50;
        // app.stage.addChild(oneButton);
    }   
    
    numberScroller.ticker = app.ticker.add(numberScroller.update.bind(numberScroller));
}

window.onkeydown = function(e) {

    if (waitForUp || numberScroller.paused) return;

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
        
        codeOffsetLeft++;
        codeLeft.text = getCode(codeOffsetLeft);

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

    if (codeRightInterval) {
        clearTimeout(codeRightInterval);
        codeRightInterval = null;
    }

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

    app.stage.removeChild(healthLeft);
    app.stage.removeChild(healthRight);
    
    app.ticker.remove(numberScroller.update.bind(numberScroller));
}

// Load pixi stuff and continue to our own assets
function loadPIXI() {
    PIXI.loader.add('player', 'media/Player.json').load(preload);
}

if (document.addEventListener)
    document.addEventListener("DOMContentLoaded", loadPIXI, false);
else if (document.attachEvent)
    document.attachEvent("onreadystatechange", loadPIXI);
else window.onload = loadPIXI;

window.onresize = function (event) {

    let oldAspect = windowWidth / windowHeight;
    let relativeWidth = window.onMobilePhone ? 0.99 : 0.8;

    let w = Math.min(window.innerWidth * relativeWidth, 1920);
    let h = w / oldAspect;
    app.view.style.width = w + "px";
    app.view.style.height = h + "px";
};

var parts = window.location.search.substr(1).split("&");
for (var i = 0; i < parts.length; i++) {
    var temp = parts[i].split("=");
    gameArguments[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
}