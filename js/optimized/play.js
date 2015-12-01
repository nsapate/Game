/*
  Programming and art made by www.lessmilk.com
  You can freely look at the code below,
  but you are not allowed to use the code or art to make your own games
*/

Game.Play = function (game) { };

var level = 1;
var jumptimer = 0;
var direction = "body.moveLeft";
Game.Play.prototype = {
	create: function () {

		// Set bounds for the world
		game.world.setBounds(0, 0, w, h);

		// regsiter the cursor keys
		this.cursor = this.game.input.keyboard.createCursorKeys();

		// Start the physics system
		game.physics.startSystem(Phaser.Physics.P2JS);
		//  Turn on impact events for the world, without this we get no collision callbacks
		game.physics.p2.setImpactEvents(true);

		var enemyMaterial = game.physics.p2.createMaterial('enemyMaterial');
		var worldMaterial = game.physics.p2.createMaterial('worldMaterial');
		game.physics.p2.setWorldMaterial(worldMaterial, true, true, true, true);

		var coinCollisionGroup = game.physics.p2.createCollisionGroup();
		var platformCollisionGroup = game.physics.p2.createCollisionGroup();
		var playerCollisionGroup = game.physics.p2.createCollisionGroup();
		var enemyCollisionGroup = game.physics.p2.createCollisionGroup();
		game.physics.p2.updateBoundsCollisionGroup();

		this.map = game.add.tilemap('map1');
		this.map.addTilesetImage("grass");
		this.map.addTilesetImage("castle");

		this.layer = this.map.createLayer("background");
		this.layer.resizeWorld();

		this.map.setCollisionBetween(0, 19);
		this.platform = game.physics.p2.convertTilemap(this.map, this.layer);
		for (var i = 0; i < this.platform.length; i++) {
	        var platformBody = this.platform[i];
	        platformBody.setCollisionGroup(platformCollisionGroup);
	        platformBody.collides([playerCollisionGroup, coinCollisionGroup, platformCollisionGroup, enemyCollisionGroup]);
	    }

		this.distant = this.map.createLayer("distant");
		this.distant.resizeWorld();

		this.coins = game.add.group();
		this.coins.enableBody = true;
		this.coins.physicsBodyType = Phaser.Physics.P2JS;

		this.map.createFromObjects('gems', 122, 'gems', 0, true, false, this.coins);
		this.coins.forEach(function(coin) {
			coin.body.setCollisionGroup(coinCollisionGroup);
			coin.body.collides([playerCollisionGroup, platformCollisionGroup, coinCollisionGroup]);
		});

		this.enemies = game.add.group();
		this.enemies.enableBody = true;
		this.enemies.physicsBodyType = Phaser.Physics.P2JS;

		this.map.createFromObjects('enemies', 176, 'worm', 0, true, false, this.enemies);
		this.enemies.forEach(function(enemy) {
			enemy.body.setCollisionGroup(enemyCollisionGroup);
			enemy.body.collides([playerCollisionGroup, platformCollisionGroup]);
			enemy.dynamic = true;
			enemy.body.fixedRotation = true;
		});
		// enemy.body.onBeginContact.add(this.enemy_collide, this);
		this.enemies.callAll('body.setMaterial', 'body', enemyMaterial);
		this.enemies.callAll('body.onBeginContact.add', 'body.onBeginContact', this.enemy_collide, this);
		this.enemies.callAll('animations.add', 'animations', 'crawl', [0, 1], 3, true);
		this.enemies.callAll('play', null, 'crawl');

		var contactMaterial = game.physics.p2.createContactMaterial(enemyMaterial, worldMaterial);
		contactMaterial.friction = 0;

		this.player = game.add.sprite(100, game.height-210, 'player');
		this.player.animations.add('walk', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 15, true);
		game.physics.p2.enable(this.player);
		this.player.enableBody = true;
		this.player.physicsBodyType = Phaser.Physics.P2;
		this.player.body.collideWorldBounds = true;
		this.player.body.fixedRotation = true;
		this.player.body.setCollisionGroup(playerCollisionGroup);
		this.player.body.collides([coinCollisionGroup, playerCollisionGroup, platformCollisionGroup, enemyCollisionGroup]);



		game.physics.p2.gravity.y = 3000;

		game.camera.follow(this.player);
		// this.player.body.collides(coinCollisionGroup, this.take_coin, this);
		this.player.body.onBeginContact.add(this.take_coin, this);
	},

	update: function() {
		this.player_movements();
		this.enemy_move();
	},

	checkJump: function() {

	    var yAxis = p2.vec2.fromValues(0, 1);
	    var result = false;

	    for (var i = 0; i < game.physics.p2.world.narrowphase.contactEquations.length; i++)
	    {
	        var c = game.physics.p2.world.narrowphase.contactEquations[i];

	        if (c.bodyA === this.player.body.data || c.bodyB === this.player.body.data)
	        {
	            var d = p2.vec2.dot(c.normalA, yAxis); // Normal dot Y-axis
	            if (c.bodyA === this.player.body.data) d *= -1;
	            if (d > 0.5) result = true;
	        }
	    }

	    return result;

	},

	enemy_collide: function(body, shapeA, shapeB, equation) {
		// if (body.velocity.x == 0) {
		// 	body.velocity.x = -100;
		// }
		// else {
		// 	body.velocity.x = 100;
		// }
		var d = p2.vec2.dot(equation[0].normalA, p2.vec2.fromValues(1,0)); // Normal dot Y-axis
        if (equation.bodyA === body.data) d *= -1;
        // if (d > 0.5) result = true;
        console.log(d);
        if(d > 0) {
        	direction = "body.moveRight";
        }
        else if(d == -1){
        	direction = 'body.moveLeft';
        }

	},

	enemy_move: function() {
		this.enemies.callAll(direction, 'body', 200);
	},

	take_coin: function(body, shapeA, shapeB, equation) {
		if (body.sprite && body.sprite.parent == this.coins) {
			body.removeFromWorld();
			body.sprite.kill();
		};
		if (body.sprite && body.sprite.parent == this.enemies) {
			this.player.reset(100, game.height-210);
		};
	},

	player_dead: function(sprite, tile) {

	},

	next_level: function() {

	},

	load_map: function() {

	},

	add_objects: function() {

	},

	clear_map: function() {

	},

	player_movements: function() {

		if (this.cursor.left.isDown)
	    {
	    	this.player.body.moveLeft(500);
	    	this.player.animations.play('walk');
	    }
	    else if (this.cursor.right.isDown)
	    {
	        this.player.body.moveRight(500);
	        this.player.animations.play('walk');
	    }
	    else {
	    	this.player.body.velocity.x  = 0;
	    	this.player.animations.stop();
	    	this.player.animations.frame = 0;
	    }
	    if (this.cursor.up.isDown && game.time.now > jumptimer && this.checkJump())
	    {
	        this.player.body.moveUp(1200);
	        jumptimer = game.time.now + 800;
	    }

	}
};

