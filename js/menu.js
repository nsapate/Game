Game.Menu = function (game) { };

Game.Menu.prototype = {
    create: function () {
        GameShell.setStatus('Ready', 'Press Up, Enter, Space, or the Start button to begin the run.');
        GameShell.setStartLabel('Start Run');

        this.cursor = this.game.input.keyboard.createCursorKeys();
        this.enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        this.introMusic = game.add.audio('intro');
        this.logo = game.add.sprite(w / 2, h + 120, 'logo');
        this.logo.anchor.setTo(0.5, 0.5);
        this.logoTween = game.add.tween(this.logo).to({ y: h / 2 - 15 }, 1400, Phaser.Easing.Cubic.Out, true);

        this.label = game.add.text(
            w / 2,
            h - 70,
            'PRESS UP, ENTER, OR SPACE TO START',
            { font: '28px Arial', fill: '#d9edf0', align: 'center' }
        );
        this.label.anchor.setTo(0.5, 0.5);
        this.label.alpha = 0;
        this.labelTween = game.add.tween(this.label).to({ alpha: 1 }, 500, Phaser.Easing.Linear.None, true, 400, -1, true);

        this.soundToggle = this.game.add.button(w - 70, 50, 'sound', this.toggleSound, this);
        this.soundToggle.input.useHandCursor = true;
        this.soundToggle.alpha = 0.92;

        this.player = game.add.sprite(this.logo.x + 69 - this.logo.width / 2, -80, 'player');
        this.player.animations.add('walk', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 15, true);
        this.player.animations.frame = 9;

        this.playerDropTween = game.add.tween(this.player).to(
            { y: h / 2 - this.logo.height / 2 - 30 },
            1200,
            Phaser.Easing.Cubic.Out,
            true
        );
        this.playerDropTween.onComplete.add(function () {
            this.player.animations.play('walk');
            this.playerPatrolTween = game.add.tween(this.player).to(
                { x: this.logo.x + this.logo.width / 2 - 137 },
                2600,
                Phaser.Easing.Linear.None,
                true,
                0,
                -1,
                true
            );
        }, this);

        this.refreshSound();
    },

    update: function () {
        if (this.cursor.up.justDown || this.enterKey.justDown || this.spaceKey.justDown) {
            this.beginPlay();
        }
    },

    beginPlay: function () {
        if (this.introMusic && this.introMusic.isPlaying) {
            this.introMusic.stop();
        }

        game.state.start('Play');
    },

    refreshSound: function () {
        if (!this.soundToggle) {
            return;
        }

        this.soundToggle.frame = sound ? 0 : 1;

        if (!this.introMusic) {
            return;
        }

        if (!sound) {
            this.introMusic.stop();
            return;
        }

        if (!this.introMusic.isPlaying) {
            this.introMusic.play('', 0, 0.6, true);
        }
    },

    toggleSound: function () {
        sound = !sound;
        GameShell.syncSound();
        this.refreshSound();
    },

    shutdown: function () {
        if (this.introMusic) {
            this.introMusic.stop();
        }
    }
};
