Game.Play = function (game) { };


// Current Level
var level = 0;
// Total number of levels
var totallevel = 4;

// Collision Groups
var gemsCollisionGroup;
var platformCollisionGroup;
var playerCollisionGroup;
var enemyCollisionGroup;

// Array for containing tileset images
var tilesets = [];

// Jump timer to create the perfect jump
var jumptimer = 0;

// Number of gems collected
var gemcount = 0;

// Whether on moving platform or not
var onplatform = false;
// Moving platform to keep aligned
var platformalign;

// Where to place the player
var playerx;
var playery;

// Is the player dead
var playerdead = false;


Game.Play.prototype = {
	create: function () {

		// Register the cursor for later use in player movement
		this.cursor = this.game.input.keyboard.createCursorKeys();

		// Start the phyics system
		game.physics.startSystem(Phaser.Physics.P2JS);

		// Create all the collison groups
		gemsCollisionGroup = game.physics.p2.createCollisionGroup(); // gems
		platformCollisionGroup = game.physics.p2.createCollisionGroup(); // platform
		playerCollisionGroup = game.physics.p2.createCollisionGroup(); // player
		enemyCollisionGroup = game.physics.p2.createCollisionGroup(); // enemies

		// adjust bounds to use its own collision group
		game.physics.p2.updateBoundsCollisionGroup();

		// Start the first level
		this.next_level();

		// Place the player
		this.add_player();


		// Set the gravity of the whole world
		game.physics.p2.gravity.y = 3000;

		// The camera follows wherever the player goes
		game.camera.follow(this.player);

		// Fire this.player_collide whenever the player collides with any of
		// the collision groups he has been set to collide
		this.player.body.onBeginContact.add(this.player_collide, this);

		this.player.body.onEndContact.add(this.player_detach, this);

	},

	update: function() {
		// Update the player movement
		this.player_movements();

		// Check if the level is complete
		this.check_level_complete();

		// Check if player in bounds
		this.playerInBounds();

		if (onplatform) {
			this.player.body.x = platformalign.x;
		};
	},

	playerInBounds: function() {
		// If player is out of bounds of screen except top - player is dead
		if (this.player.y > 0 && !this.player.inCamera) {
			this.player_dead();
		};
	},

	checkJump: function() {

		/*
			Utility function to check if the player is in contact with the floor
			to let him jump, returns true if he is allowed to jump
		*/

		// Get yAxi
		var yAxis = p2.vec2.fromValues(0, 1);
		// By Default dont allow jump
		var result = false;

		// Iterate through each of the contactEquations int the world
		for (var i = 0; i < game.physics.p2.world.narrowphase.contactEquations.length; i++) {
			var c = game.physics.p2.world.narrowphase.contactEquations[i];

			// Obtain dot product along yAxis to determine if the player is in contact with the floor
			if (c.bodyA === this.player.body.data || c.bodyB === this.player.body.data)
			{
				var d = p2.vec2.dot(c.normalA, yAxis); // Normal dot Y-axis
				if (c.bodyA === this.player.body.data) d *= -1;
				if (d > 0.5) result = true;
			}
		}

		return result;

	},

	check_level_complete: function() {
		// Check if all gems are collected - then go to next level
		if (this.gems.length == gemcount) {
			this.next_level();
		};
	},


	player_collide: function(body) {
		// If player collided with gems
		if (body.sprite && body.sprite.parent == this.gems) {
			this.take_gem(body);
		};
		// If player collides with enemies
		if (body.sprite && (body.sprite.parent == this.flies || body.sprite.parent == this.ladybugs)) {
			this.player_dead();
		};

		if (body.sprite && body.sprite.parent == this.movingplatforms) {
			onplatform = true;
			platformalign = body;
			canIJump = true;
		};

		if (body && body.sprite == null) {
			canIJump = true;
		};
	},

	player_detach: function(body) {
		if (body.sprite && body.sprite.parent == this.movingplatforms) {
			onplatform = false;
			canIJump = false;
		};
		if (body && body.sprite == null) {
			canIJump = false;
		};
	},

	take_gem: function(gem) {
		// Increment the number of gems collected
		gemcount++;
		// Remove the gem physics body from world
		gem.removeFromWorld();
		// Kill the gem sprite
		gem.sprite.kill();
	},

	player_dead: function(sprite, tile) {
		// Reset gemcount to 0
		gemcount = 0;
		// Reduce level to previous level so that the same level loads
		level -= 1;

		// increase dead count
		dead += 1;

		// Load the same level again
		this.next_level();
	},

	next_level: function() {

		if (level == totallevel) {
			game.state.start('Endd');
			level = 0;
			return;
		};
		// Reset gemcount
		gemcount = 0;

		onplatform = false;

		// Setup things before going to the next level
		level += 1;

		// Clear the map to remove everything of previous level
		this.clear_map();

		// Load the map for the next level
		this.load_map();

		// Add the objects to the map
		this.add_objects();

		// Reset Player Position
		if (this.player) {
			this.player.reset(playerx, h-playery);

			this.player.bringToTop();
		};

	},

	load_map: function() {
		// Add the Tilemap
		this.map = game.add.tilemap('map' + level);

		// Read the player positions from the map
		playerx = parseInt(this.map.properties.playerx);
		playery = parseInt(this.map.properties.playery);

		// Read the bakground color
		if (this.map.properties.bgcolor) {
			game.stage.backgroundColor = this.map.properties.bgcolor;
		};


		// Add Tileset images used in the map
		tilesets.push(this.map.addTilesetImage("grass"));
		tilesets.push(this.map.addTilesetImage("castle"));
		tilesets.push(this.map.addTilesetImage("props"));
		tilesets.push(this.map.addTilesetImage("gems"));
		tilesets.push(this.map.addTilesetImage("nature"));
		tilesets.push(this.map.addTilesetImage("clouds"));
		tilesets.push(this.map.addTilesetImage("keys"));
		tilesets.push(this.map.addTilesetImage("flags"));
		tilesets.push(this.map.addTilesetImage("fly"));
		tilesets.push(this.map.addTilesetImage("ladybug"));
		tilesets.push(this.map.addTilesetImage("others"));
		tilesets.push(this.map.addTilesetImage("movingplatform"));
		tilesets.push(this.map.addTilesetImage("extras"));
		tilesets.push(this.map.addTilesetImage("cake"));
		tilesets.push(this.map.addTilesetImage("candyprops"));
		tilesets.push(this.map.addTilesetImage("tundra"));
		tilesets.push(this.map.addTilesetImage("tundraprops"));
		tilesets.push(this.map.addTilesetImage("girl"));
		tilesets.push(this.map.addTilesetImage("chars"));

		// Create the platform layer
		this.platformlayer = this.map.createLayer("platform");
		// Resize the platform layer to World
		this.platformlayer.resizeWorld();

		// Set Collisions for the tiles in platform layer
		this.map.setCollisionBetween(0, 1);
		// Convert platform layer to convert with the physics bodies
		this.platform = game.physics.p2.convertTilemap(this.map, this.platformlayer);
		// Iterate through each of the bodies in platform layer
		this.platform.forEach(function(platformBody){
			// Set Collison group for the body
			platformBody.setCollisionGroup(platformCollisionGroup);
			// Set the collision groups with which the body collides
			platformBody.collides([playerCollisionGroup, gemsCollisionGroup, platformCollisionGroup, enemyCollisionGroup]);
		});

		// Add the background layer
		this.backgroundlayer = this.map.createLayer("background");
		// Resize the background layer to World
		this.backgroundlayer.resizeWorld();
	},

	add_objects: function() {
		// Add Gems
		this.add_gems();

		// Add Flies
		this.add_flies();

		// Add LadyBug
		this.add_bugs();

		// Add Moving Platform
		this.add_moving_platforms();
	},

	add_gems: function() {

		// Create a group for the gems
		this.gems = game.add.group();
		// Enable body for the gems
		this.gems.enableBody = true;
		// Set the physics body type of the gems to P2
		this.gems.physicsBodyType = Phaser.Physics.P2JS;

		// Create the gems from the tilemap
		// params: objectlayer, gid, cache key, frame, exists, autoCull, group
		this.map.createFromObjects('gems', 90, 'gems', 0, true, false, this.gems, Phaser.Sprite, false);
		this.map.createFromObjects('gems', 91, 'gems', 0, true, false, this.gems, Phaser.Sprite, false);
		this.map.createFromObjects('gems', 92, 'gems', 0, true, false, this.gems, Phaser.Sprite, false);
		this.map.createFromObjects('gems', 93, 'gems', 0, true, false, this.gems, Phaser.Sprite, false);
		// Iterate through each gem
		this.gems.forEach(function(gem) {
			// Set Collision group
			gem.body.setCollisionGroup(gemsCollisionGroup);
			// Set the collision group with which it collides
			gem.body.collides([playerCollisionGroup, platformCollisionGroup, gemsCollisionGroup]);
			// Set motion state for the gem
			// Only affected by its own velocity, doesnt move until we tell it to do so
			gem.body.kinematic = true;
			gem.animations.frame = parseInt(gem.gemframe);
			// gem.anchor.setTo(0.5, 0.5);
		});
	},

	add_flies: function() {

		// Create a group for the flies
		this.flies = game.add.group();
		// Enable body for the flies
		this.flies.enableBody = true;
		// Set the physics body type of the flies to P2
		this.flies.physicsBodyType = Phaser.Physics.P2JS;

		// Create the gems from the tilemap
		// params: objectlayer, gid, cache key, frame, exists, autoCull, group
		this.map.createFromObjects('fly', 125, 'fly', 0, true, false, this.flies);
		// Iterate through each fly
		this.flies.forEach(function(fly) {
			// Set Collision group
			fly.body.setCollisionGroup(enemyCollisionGroup);
			// Set the collision group with which it collides
			fly.body.collides([playerCollisionGroup, platformCollisionGroup]);
			// Set motion state for the fly
			// Only affected by its own velocity, doesnt move until we tell it to do so
			fly.body.kinematic = true;
			// Create the fly animation and play it
			fly.animations.add('fly', [0, 1], 10, true);
			fly.animations.play('fly');

			// Tween the fly to move up and down
			game.add.tween(fly.body).to( { y: fly.body.y-fly.movedistance }, 1500, Phaser.Easing.Quadratic.InOut ).to( { y: fly.body.y+fly.movedistance/2 }, 1500, Phaser.Easing.Quadratic.InOut ).loop().start();


		});
	},

	add_bugs: function() {
		// Create a group for the ladybugs
		this.ladybugs = game.add.group();
		// Enable body for the ladybugs
		this.ladybugs.enableBody = true;
		// Set the physics body type of the ladybugs to P2
		this.ladybugs.physicsBodyType = Phaser.Physics.P2JS;

		// Create the gems from the tilemap
		// params: objectlayer, gid, cache key, frame, exists, autoCull, group
		this.map.createFromObjects('ladybug', 457, 'ladybug', 0, true, false, this.ladybugs, Phaser.Sprite, false);
		// Iterate through each fly
		this.ladybugs.forEach(function(bug) {
			// Set Collision group
			bug.body.setCollisionGroup(enemyCollisionGroup);
			// Set the collision group with which it collides
			bug.body.collides([playerCollisionGroup, platformCollisionGroup]);
			// Set motion state for the fly
			// Only affected by its own velocity, doesnt move until we tell it to do so
			bug.body.kinematic = true;
			// Create the fly animation and play it
			bug.animations.add('fly', [0, 1], 10, true);
			bug.animations.play('fly');

			var tween = game.add.tween(bug.body).to( { x: bug.body.x-bug.movedistance }, 2500, Phaser.Easing.Linear.easeNone, true, 0, Number.MAX_VALUE, true );
			tween.onLoop.add(function(){
				bug.scale.x *= -1;
			}, this);

			if (bug.rotate == "1") {
				bug.anchor.setTo(0.5, 0.5);
				bug.scale.x *= -1;
			};


		});
	},

	add_moving_platforms: function() {
		// Create a group for the movingplatforms
		this.movingplatforms = game.add.group();
		// Enable body for the movingplatforms
		this.movingplatforms.enableBody = true;
		// Set the physics body type of the movingplatforms to P2
		this.movingplatforms.physicsBodyType = Phaser.Physics.P2JS;

		// Create the movingplatforms from the tilemap
		// params: objectlayer, gid, cache key, frame, exists, autoCull, group
		this.map.createFromObjects('movingplatform', 483, 'movingplatform', 0, true, false, this.movingplatforms, Phaser.Sprite, false);
		// Iterate through each movingplatform
		this.movingplatforms.forEach(function(movingplatform) {
			// Set Collision group
			movingplatform.body.setCollisionGroup(platformCollisionGroup);
			// Set the collision group with which it collides
			movingplatform.body.collides([playerCollisionGroup, platformCollisionGroup]);
			// Set motion state for the moving platform
			// Only affected by its own velocity, doesnt move until we tell it to do so
			movingplatform.body.kinematic = true;


			if (movingplatform.horizontal == "0") {
				game.add.tween(movingplatform.body).to( { y: movingplatform.body.y-movingplatform.movedistance }, 2500, Phaser.Easing.Linear.easeNone, true, 0, Number.MAX_VALUE, true );
			};
			if (movingplatform.horizontal == "1") {
				game.add.tween(movingplatform.body).to( { x: movingplatform.body.x-movingplatform.movedistance }, 2500, Phaser.Easing.Linear.easeNone, true, 0, Number.MAX_VALUE, true );
			};



		});
	},

	add_player: function() {
		// Place the player in his position
		this.player = game.add.sprite(playerx, h-playery, 'player');
		// Add walking animation to the player
		this.player.animations.add('walk', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 15, true);
		// Enable P2 physics for the player
		game.physics.p2.enable(this.player);
		// Enable body
		this.player.enableBody = true;
		// Set the physics body type to P2
		this.player.physicsBodyType = Phaser.Physics.P2;
		// The player should collide with the world bounds
		this.player.body.collideWorldBounds = true;
		// Player should not rotate due to physics forces
		this.player.body.fixedRotation = true;
		// Set the collision group of the player
		this.player.body.setCollisionGroup(playerCollisionGroup);
		// Set the collision groups with which the player collides
		this.player.body.collides([gemsCollisionGroup, platformCollisionGroup, enemyCollisionGroup]);
		this.player.body.gravity = 3000;
	},

	clear_map: function() {
		if (this.map) {
			this.platformlayer.destroy();
			this.backgroundlayer.destroy();
			this.platform = null;
			game.physics.p2.clearTilemapLayerBodies(this.map, this.platformlayer);
			this.map.destroy();
			game.tweens.removeAll();
			this.gems.callAll('body.removeFromWorld', 'body');
			this.gems.callAll('body.sprite.kill', 'body.sprite');
			this.flies.callAll('body.removeFromWorld', 'body');
			this.flies.callAll('body.sprite.kill', 'body.sprite');
			this.ladybugs.callAll('body.removeFromWorld', 'body');
			this.ladybugs.callAll('body.sprite.kill', 'body.sprite');
			this.movingplatforms.callAll('body.removeFromWorld', 'body');
			this.movingplatforms.callAll('body.sprite.kill', 'body.sprite');
			tilesets = [];
		};

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

	},

	render: function() {
		// game.debug.spriteInfo(this.player, 10, 10);
	}
};

