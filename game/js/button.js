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