Game.Endd = function (game) { };

Game.Endd.prototype = {
    create: function () {
        game.camera.follow(null);
        game.camera.setPosition(0, 0);

        GameShell.setStatus('Run Complete', 'All levels cleared. Start another run whenever you want.');
        GameShell.setStartLabel('Restart Run');

        this.cursor = this.game.input.keyboard.createCursorKeys();
        this.enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        var logo = game.add.sprite(w / 2, 300, 'success');
        logo.anchor.setTo(0.5, 0.5);
        logo.scale.setTo(0, 0);
        game.add.tween(logo.scale).to({ x: 1, y: 1 }, 1000, Phaser.Easing.Bounce.Out, true);

        var label = game.add.text(
            w / 2,
            h - 100,
            'You died ' + dead + ' times\n\nPress Up, Enter, Space, or Start to replay',
            { font: '25px Arial', fill: '#ceb882', align: 'center' }
        );
        label.anchor.setTo(0.5, 0.5);
        label.alpha = 0;
        game.add.tween(label).to({ alpha: 1 }, 500, Phaser.Easing.Linear.None, true, 500);
        game.add.tween(label).to({ angle: 1 }, 500).to({ angle: -1 }, 500).loop().start();

        this.time = this.game.time.now + 500;
    },

    update: function () {
        if ((this.cursor.up.justDown || this.enterKey.justDown || this.spaceKey.justDown) && this.time < this.game.time.now) {
            this.beginPlay();
        }
    },

    beginPlay: function () {
        if (this.time >= this.game.time.now) {
            return;
        }

        dead = 0;
        game.state.start('Play');
    }
};
