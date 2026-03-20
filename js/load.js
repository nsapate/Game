Game = {};

var w = 1366;
var h = 643;
var sound = true;
var dead = 0;

function rand(num) {
    return Math.floor(Math.random() * num);
}

var GameShell = {
    bind: function () {
        this.startButton = document.getElementById('startGameButton');
        this.soundButton = document.getElementById('soundButton');
        this.stateLabel = document.getElementById('stateLabel');
        this.stateDetail = document.getElementById('stateDetail');

        if (this.startButton) {
            this.startButton.addEventListener('click', this.startGame.bind(this));
        }

        if (this.soundButton) {
            this.soundButton.addEventListener('click', this.toggleSound.bind(this));
            this.syncSound();
        }
    },

    setStatus: function (label, detail) {
        if (this.stateLabel) {
            this.stateLabel.textContent = label;
        }

        if (this.stateDetail) {
            this.stateDetail.textContent = detail;
        }
    },

    setStartLabel: function (label) {
        if (this.startButton) {
            this.startButton.textContent = label;
        }
    },

    syncSound: function () {
        if (!this.soundButton) {
            return;
        }

        this.soundButton.textContent = sound ? 'Sound On' : 'Sound Off';
        this.soundButton.setAttribute('aria-pressed', sound ? 'true' : 'false');
    },

    toggleSound: function () {
        sound = !sound;
        this.syncSound();

        if (!window.game || !game.state) {
            return;
        }

        var currentState = game.state.states[game.state.current];
        if (currentState && typeof currentState.refreshSound === 'function') {
            currentState.refreshSound();
        }
    },

    startGame: function () {
        if (!window.game || !game.state) {
            return;
        }

        var currentState = game.state.states[game.state.current];
        if (currentState && typeof currentState.beginPlay === 'function') {
            currentState.beginPlay();
            return;
        }

        if (game.state.current === 'Endd') {
            dead = 0;
            game.state.start('Play');
        }
    }
};

GameShell.bind();

document.addEventListener('DOMContentLoaded', function () {
    GameShell.bind();
});

window.addEventListener('error', function (event) {
    GameShell.setStatus('Error', event.message || 'Unexpected runtime error.');
});

window.addEventListener('unhandledrejection', function (event) {
    GameShell.setStatus('Error', event.reason ? String(event.reason) : 'Unhandled promise rejection.');
});

Game.Boot = function (game) { };

Game.Boot.prototype = {
    preload: function () {
        game.stage.backgroundColor = '#0d1a28';
        game.load.image('loading', 'images/ui/loading.png');
        game.load.image('loadingborder', 'images/ui/loadingborder.png');
        GameShell.setStatus('Booting', 'Preparing Phaser and loading screen assets.');
    },

    create: function () {
        this.game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
        this.game.scale.refresh();

        this.game.state.start('Load');
    }
};

Game.Load = function (game) { };

Game.Load.prototype = {
    preload: function () {
        GameShell.setStatus('Loading', 'Streaming sprites, maps, and audio into the browser cache.');
        GameShell.setStartLabel('Loading…');

        var loadLabel = game.add.text(
            Math.floor(w / 2) + 0.5,
            Math.floor(h / 2) - 15 + 0.5,
            'Loading...',
            { font: '30px Arial', fill: '#8f9d9d' }
        );
        loadLabel.anchor.setTo(0.5, 0.5);

        var preloadingBorder = game.add.sprite(w / 2, h / 2 + 15, 'loadingborder');
        preloadingBorder.x -= preloadingBorder.width / 2;
        var preloading = game.add.sprite(w / 2, h / 2 + 19, 'loading');
        preloading.x -= preloading.width / 2;
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
        this.game.load.audio('intro', 'sounds/intro.wav');
    },

    create: function () {
        this.game.state.start('Menu');
    }
};
