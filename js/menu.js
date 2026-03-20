Game.Menu = function (game) { };

var timeline;

Game.Menu.prototype = {

	preload: function() {

	},

	create: function () {
		this.cursor = this.game.input.keyboard.createCursorKeys();
		this.intromusic = game.add.audio('intro');
		this.intromusic.play("", 0, 1, true);
		var logo = game.add.sprite(w/2, h+150, 'logo');
		logo.anchor.setTo(0.5, 0.5);
		game.add.tween(logo).to({ y: h/2 }, 2000, Phaser.Easing.Bounce.Out).start();

		var label = game.add.text(w/2, h-50, 'press the ↑ arrow key to start', { font: '30px Arial', fill: '#8f9d9d' });
		label.anchor.setTo(0.5, 0.5);
		label.alpha = 0;
		game.add.tween(label).delay(500).to({ alpha: 1}, 500).start();

		this.sound_toggle = this.game.add.button(w-70, 50, 'sound', this.toggle_sound, this);
		this.sound_toggle.alpha = 0;
		this.sound_toggle.inputEnabled = true;
		this.sound_toggle.input.useHandCursor = true;
		game.add.tween(this.sound_toggle).delay(500).to({ alpha: 1}, 500).start();

		game.add.tween(label).to({ angle:5 }, 500).to({ angle:-1 }, 500).loop().start();

		var player = game.add.sprite(logo.x+69-logo.width/2, -100, 'player');

    	var walk = player.animations.add('walk', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 15, true);

    	timeline = new TimelineMax();
    	player.animations.frame = 9;
    	timeline.insert(TweenMax.to(player, 2, {y:h/2-logo.height/2-30, ease:Linear.easeNone, onComplete: function() {
    		walk.play();
    	}}));
    	timeline.append(TweenMax.to(player, 3, {x:logo.x+logo.width/2-137, repeat:Number.MAX_VALUE, yoyo:true,ease:Linear.easeNone}), 0.5);
    	this.game.onBlur.add(TweenMax.pauseAll, TweenMax);
    	this.game.onFocus.add(TweenMax.resumeAll, TweenMax);

	},

	update: function() {
		if (this.cursor.up.isDown) {
			this.intromusic.stop();
			TweenMax.pauseAll();
			this.game.state.start('Play');
		}
		if (!sound) {
			this.intromusic.pause();
		}
		else {
			this.intromusic.resume();
		}

	},

	toggle_sound: function() {
		if (this.sound_toggle.frame == 0) {
			this.sound_toggle.frame = 1;
			sound = false;
		}
		else {
			this.sound_toggle.frame = 0;
			sound = true;
		}
	},

	render: function () {

	}
};
