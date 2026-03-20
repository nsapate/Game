Game = {};

// var w = (window.innerWidth > 600)?window.innerWidth:600;
// var h = (window.innerHeight > 470)?window.innerHeight:470;
var w = 1366;
var h = 643;
var sound = true;
var dead = 0;

function rand(num){ return Math.floor(Math.random() * num) };


Game.Boot = function (game) { };

Game.Boot.prototype = {
	preload: function () {
		game.stage.backgroundColor = '#d0f4f7';
		game.load.image('loading', 'images/ui/loading.png');
		game.load.image('loadingborder', 'images/ui/loadingborder.png');

	},
	create: function() {
		this.game.state.start('Load');

	}
};

Game.Load = function (game) { };

Game.Load.prototype = {
	preload: function () {
	    loadlabel = game.add.text(Math.floor(w/2)+0.5, Math.floor(h/2)-15+0.5, 'Loading...', { font: '30px Wallpoet', fill: '#8f9d9d' });
		loadlabel.anchor.setTo(0.5, 0.5);

		preloadingborder = game.add.sprite(w/2, h/2+15, 'loadingborder');
		preloadingborder.x -= preloadingborder.width/2;
		preloading = game.add.sprite(w/2, h/2+19, 'loading');
		preloading.x -= preloading.width/2;
		game.load.setPreloadSprite(preloading);

		game.load.spritesheet('sound', 'images/ui/sound.png', 28, 22);

		game.load.atlasJSONHash('player', 'images/p1_walk.png', 'images/p1_walk.json');
		game.load.image('logo', 'images/ui/logo.png');
		game.load.image('success', 'images/ui/success2.png');


		this.game.load.tilemap('map1', 'levels/map1.json', null, Phaser.Tilemap.TILED_JSON);
		this.game.load.tilemap('map2', 'levels/map2.json', null, Phaser.Tilemap.TILED_JSON);
		this.game.load.tilemap('map3', 'levels/map3.json', null, Phaser.Tilemap.TILED_JSON);
		this.game.load.tilemap('map4', 'levels/map4.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image('grass', 'images/mapassets/grass.png');
        this.game.load.image('castle', 'images/mapassets/castle.png');
        this.game.load.image('props', 'images/mapassets/props.png');
        this.game.load.spritesheet('gems', 'images/mapassets/gems.png', 46, 36);
        this.game.load.spritesheet('fly', 'images/mapassets/fly.png', 75, 36);
        this.game.load.spritesheet('ladybug', 'images/mapassets/ladybug.png', 61, 34);
        this.game.load.image('nature', 'images/mapassets/nature.png');
        this.game.load.image('clouds', 'images/mapassets/clouds.png');
        this.game.load.image('keys', 'images/mapassets/keys.png');
        this.game.load.image('flags', 'images/mapassets/flags.png');
        this.game.load.image('others', 'images/mapassets/others.png');
        this.game.load.image('movingplatform', 'images/mapassets/movingplatform.png');
        this.game.load.image('extras', 'images/mapassets/extras.png');
        this.game.load.image('cake', 'images/mapassets/cake.png');
        this.game.load.image('candyprops', 'images/mapassets/candyprops.png');
        this.game.load.image('tundraprops', 'images/mapassets/tundraprops.png');
        this.game.load.image('tundra', 'images/mapassets/tundra.png');
        this.game.load.image('girl', 'images/mapassets/girl.png');
        this.game.load.image('chars', 'images/mapassets/chars.png');


        // this.game.load.image('castle', 'images/castle.png');

        // this.game.load.spritesheet('gems', 'images/gems.png', 46, 36);
        // this.game.load.spritesheet('worm', 'images/worm.png', 63, 23);

        this.game.load.audio('intro', 'sounds/intro.wav');
	},
	create: function () {
		game.state.start('Menu');

	}
};
