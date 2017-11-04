class GameButton extends PIXI.extras.AnimatedSprite {

    constructor  (textures) {
        super(textures);
    }

} 

var getZeroButton = function() {
    return new GameButton([
        new PIXI.Texture(gameSprites, new PIXI.Rectangle(s_0_up.x, s_0_up.y, s_0_up.width, s_0_up.height)),
        new PIXI.Texture(gameSprites, new PIXI.Rectangle(s_0_down.x, s_0_down.y, s_0_down.width, s_0_down.height))
    ]);
}

var getOneButton = function() {
    return new GameButton([
        new PIXI.Texture(gameSprites, new PIXI.Rectangle(s_1_up.x, s_1_up.y, s_1_up.width, s_1_up.height)),
        new PIXI.Texture(gameSprites, new PIXI.Rectangle(s_1_down.x, s_1_down.y, s_1_down.width, s_0_down.height))
    ]);
}

var getCompileButton = function() {
    return new GameButton([
        new PIXI.Texture(gameSprites, new PIXI.Rectangle(s_compile_up.x, s_compile_up.y, s_compile_up.width, s_compile_up.height)),
        new PIXI.Texture(gameSprites, new PIXI.Rectangle(s_compile_down.x, s_compile_down.y, s_compile_down.width, s_compile_down.height))
    ]);
}