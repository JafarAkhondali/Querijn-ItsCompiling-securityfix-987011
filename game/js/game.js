"use strict";
let app = new PIXI.Application(1920, 1080, { backgroundColor: 0xFFFFFF });
let gameSprites = PIXI.BaseTexture.fromImage("media/game.png");
let zeroButton = getZeroButton();
let numberScroller = new NumberScroller();

function update(delta) {

}

function init() {
    document.getElementById("game").appendChild(app.view);


    app.stage.addChild(zeroButton);
    app.ticker.add(update);
}

if (document.addEventListener)
    document.addEventListener("DOMContentLoaded", init, false);
else if (document.attachEvent)
    document.attachEvent("onreadystatechange", init);
else
    window.onload = init;

window.onresize = function (event) {
    let w = window.innerWidth;
    let h = window.innerHeight;
    app.view.style.width = w + "px";
    app.view.style.height = h + "px";
    app.view.resize(w, h);
};