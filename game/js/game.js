"use strict";
let app = new PIXI.Application(1920, 1080, { backgroundColor: 0xFFFFFF });
let gameSprites = PIXI.BaseTexture.fromImage("media/game.png");
let zeroButton = getZeroButton();

let assets = 0;
let assetsLoaded = 0;

function assetHasLoaded() { 
    assetsLoaded++;

    console.log(`Load progress: ${assetsLoaded}/${assets} (${(assetsLoaded/assets) * 100}%)`)
    if (assetsLoaded == assets) {
        init();
    }
}

function preload() {

    let font = new Font();
    font.onload = assetHasLoaded;
    font.onerror = function(e) { console.error(e);};
    font.fontFamily = "xkcd-script";
    font.src = 'media/xkcd-script.ttf';
    assets++;
}

function init() {

    document.getElementById("game").appendChild(app.view);
    let numberScroller = new NumberScroller(5);

    app.stage.addChild(zeroButton);
}

if (document.addEventListener)
    document.addEventListener("DOMContentLoaded", preload, false);
else if (document.attachEvent)
    document.attachEvent("onreadystatechange", preload);
else
    window.onload = preload;

window.onresize = function (event) {

    let oldAspect = app.view.style.width / app.view.style.height;

    let w = window.innerWidth;
    let h = window.innerWidth / oldAspect;
    app.view.style.width = w + "px";
    app.view.style.height = h + "px";
};