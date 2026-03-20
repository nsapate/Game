Game.Endd = function (game) { };

Game.Endd.prototype = {
	create: function () {
		game.camera.follow(null);
		game.camera.setPosition(0,0);

		this.cursor = this.game.input.keyboard.createCursorKeys();
		var logo = game.add.sprite(w/2, 300, 'success');
		logo.anchor.setTo(0.5, 0.5);
		logo.scale.setTo(0, 0);
		game.add.tween(logo.scale).to({ x:1, y:1 }, 1000, Phaser.Easing.Bounce.Out).start();

		var label = game.add.text(w/2, h-100, 'you died '+dead+' times\n\npress the ↑ key to restart', { font: '25px Arial', fill: '#ceb882', align: 'center' });
		label.anchor.setTo(0.5, 0.5);
		label.alpha = 0;
		game.add.tween(label).delay(500).to({ alpha: 1}, 500).start();

		game.add.tween(label).to({ angle:1 }, 500).to({ angle:-1 }, 500).loop().start();

		this.time = this.game.time.now + 500;
	},

	update: function() {
		if (this.cursor.up.isDown && this.time < this.game.time.now)
			game.state.start('Play');
	}
};
