"use strict";
let app = new PIXI.Application(1920, 1080, { backgroundColor: 0xFFFFFF });
let gameSprites = PIXI.BaseTexture.fromImage("media/game.png");
let zeroButton = getZeroButton();
let inviteCode = 0;

let gameConnection = null;

let assetsRequested = 0;
let assetsLoaded = 0;

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

    // add assets here
    
    font.src = 'media/xkcd-script.ttf';
}

function init() {
    gameConnection = new GameClient("ws://localhost:1345");
    let hasReceivedInviteCode = gameConnection.addTalkBox(1, function (msg) { 
        console.log(`Received invite code ${msg}, confirming receiving it`);
        inviteCode = msg;
        hasReceivedInviteCode(msg);
    })

    let hasJoined = gameConnection.addTalkBox(2, function (game) { 
        console.log(`Received a game join! Playing against ${game.opponent} with seed ${game.seed}`);
        hasJoined(game.opponent);
    })
    
    document.getElementById("game").appendChild(app.view);
    let numberScroller = new NumberScroller(5);


}

if (document.addEventListener)
    document.addEventListener("DOMContentLoaded", preload, false);
else if (document.attachEvent)
    document.attachEvent("onreadystatechange", preload);
else window.onload = preload;

window.onresize = function (event) {

    let oldAspect = app.view.style.width / app.view.style.height;

    let w = window.innerWidth;
    let h = window.innerWidth / oldAspect;
    app.view.style.width = w + "px";
    app.view.style.height = h + "px";
};