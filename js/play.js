Game.Play = function (game) { };

var level = 0;
var totallevel = 4;

var gemsCollisionGroup;
var platformCollisionGroup;
var playerCollisionGroup;
var enemyCollisionGroup;

var tilesets = [];
var jumptimer = 0;
var gemcount = 0;
var onplatform = false;
var platformalign;
var playerx;
var playery;

Game.Play.prototype = {
    create: function () {
        GameShell.setStatus('In Run', 'Collect every gem, dodge enemies, and use the moving platforms carefully.');
        GameShell.setStartLabel('Running');

        this.cursor = this.game.input.keyboard.createCursorKeys();
        this.restartKey = this.game.input.keyboard.addKey(Phaser.Keyboard.R);

        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.gravity.y = 3000;

        gemsCollisionGroup = game.physics.p2.createCollisionGroup();
        platformCollisionGroup = game.physics.p2.createCollisionGroup();
        playerCollisionGroup = game.physics.p2.createCollisionGroup();
        enemyCollisionGroup = game.physics.p2.createCollisionGroup();
        game.physics.p2.updateBoundsCollisionGroup();

        this.next_level();
        this.add_player();

        game.camera.follow(this.player);
        this.player.body.onBeginContact.add(this.player_collide, this);
        this.player.body.onEndContact.add(this.player_detach, this);
    },

    update: function () {
        this.update_platform_motion();
        this.player_movements();
        this.check_level_complete();
        this.playerInBounds();

        if (this.restartKey.justDown) {
            this.player_dead();
        }

        if (onplatform && platformalign) {
            this.player.body.x += platformalign.deltaX || 0;
            this.player.body.y += platformalign.deltaY || 0;
        }
    },

    update_platform_motion: function () {
        if (!this.movingplatforms) {
            return;
        }

        this.movingplatforms.forEachAlive(function (platform) {
            var currentX = platform.body.x;
            var currentY = platform.body.y;

            platform.deltaX = currentX - (platform.lastX || currentX);
            platform.deltaY = currentY - (platform.lastY || currentY);
            platform.lastX = currentX;
            platform.lastY = currentY;
        }, this);
    },

    playerInBounds: function () {
        if (this.player.y > 0 && !this.player.inCamera) {
            this.player_dead();
        }
    },

    checkJump: function () {
        var yAxis = p2.vec2.fromValues(0, 1);
        var result = false;

        for (var i = 0; i < game.physics.p2.world.narrowphase.contactEquations.length; i++) {
            var contact = game.physics.p2.world.narrowphase.contactEquations[i];

            if (contact.bodyA === this.player.body.data || contact.bodyB === this.player.body.data) {
                var dot = p2.vec2.dot(contact.normalA, yAxis);
                if (contact.bodyA === this.player.body.data) {
                    dot *= -1;
                }
                if (dot > 0.5) {
                    result = true;
                }
            }
        }

        return result;
    },

    check_level_complete: function () {
        if (this.gems && this.gems.countLiving() === 0) {
            this.next_level();
        }
    },

    player_collide: function (body) {
        if (!body) {
            return;
        }

        if (body.sprite && body.sprite.parent === this.gems) {
            this.take_gem(body);
        }

        if (body.sprite && (body.sprite.parent === this.flies || body.sprite.parent === this.ladybugs)) {
            this.player_dead();
        }

        if (body.sprite && body.sprite.parent === this.movingplatforms) {
            onplatform = true;
            platformalign = body.sprite;
        }
    },

    player_detach: function (body) {
        if (body && body.sprite && body.sprite.parent === this.movingplatforms) {
            onplatform = false;
            platformalign = null;
        }
    },

    take_gem: function (gem) {
        gemcount++;
        gem.removeFromWorld();
        gem.sprite.kill();
    },

    player_dead: function () {
        gemcount = 0;
        level -= 1;
        dead += 1;
        this.next_level();
    },

    next_level: function () {
        if (level === totallevel) {
            game.state.start('Endd');
            level = 0;
            return;
        }

        gemcount = 0;
        onplatform = false;
        platformalign = null;
        level += 1;

        this.clear_map();
        this.load_map();
        this.add_objects();

        if (this.player) {
            this.player.reset(playerx, h - playery);
            this.player.body.setZeroVelocity();
            this.player.body.setZeroForce();
            this.player.bringToTop();
        }
    },

    load_map: function () {
        this.map = game.add.tilemap('map' + level);
        playerx = parseInt(this.map.properties.playerx, 10);
        playery = parseInt(this.map.properties.playery, 10);

        if (this.map.properties.bgcolor) {
            game.stage.backgroundColor = this.map.properties.bgcolor;
        }

        tilesets.push(this.map.addTilesetImage('grass'));
        tilesets.push(this.map.addTilesetImage('castle'));
        tilesets.push(this.map.addTilesetImage('props'));
        tilesets.push(this.map.addTilesetImage('gems'));
        tilesets.push(this.map.addTilesetImage('nature'));
        tilesets.push(this.map.addTilesetImage('clouds'));
        tilesets.push(this.map.addTilesetImage('keys'));
        tilesets.push(this.map.addTilesetImage('flags'));
        tilesets.push(this.map.addTilesetImage('fly'));
        tilesets.push(this.map.addTilesetImage('ladybug'));
        tilesets.push(this.map.addTilesetImage('others'));
        tilesets.push(this.map.addTilesetImage('movingplatform'));
        tilesets.push(this.map.addTilesetImage('extras'));
        tilesets.push(this.map.addTilesetImage('cake'));
        tilesets.push(this.map.addTilesetImage('candyprops'));
        tilesets.push(this.map.addTilesetImage('tundra'));
        tilesets.push(this.map.addTilesetImage('tundraprops'));
        tilesets.push(this.map.addTilesetImage('girl'));
        tilesets.push(this.map.addTilesetImage('chars'));

        this.platformlayer = this.map.createLayer('platform');
        this.platformlayer.resizeWorld();
        this.map.setCollisionBetween(1, 2000, true, 'platform');
        this.platform = game.physics.p2.convertTilemap(this.map, this.platformlayer);

        this.platform.forEach(function (platformBody) {
            platformBody.setCollisionGroup(platformCollisionGroup);
            platformBody.collides([playerCollisionGroup, gemsCollisionGroup, platformCollisionGroup, enemyCollisionGroup]);
        });

        this.backgroundlayer = this.map.createLayer('background');
        this.backgroundlayer.resizeWorld();
        this.backgroundlayer.sendToBack();
    },

    add_objects: function () {
        this.add_gems();
        this.add_flies();
        this.add_bugs();
        this.add_moving_platforms();
    },

    add_gems: function () {
        this.gems = game.add.group();
        this.gems.enableBody = true;
        this.gems.physicsBodyType = Phaser.Physics.P2JS;

        this.map.createFromObjects('gems', 90, 'gems', 0, true, false, this.gems, Phaser.Sprite, false);
        this.map.createFromObjects('gems', 91, 'gems', 0, true, false, this.gems, Phaser.Sprite, false);
        this.map.createFromObjects('gems', 92, 'gems', 0, true, false, this.gems, Phaser.Sprite, false);
        this.map.createFromObjects('gems', 93, 'gems', 0, true, false, this.gems, Phaser.Sprite, false);

        this.gems.forEach(function (gem) {
            gem.body.setCollisionGroup(gemsCollisionGroup);
            gem.body.collides([playerCollisionGroup, platformCollisionGroup, gemsCollisionGroup]);
            gem.body.kinematic = true;
            gem.animations.frame = parseInt(gem.gemframe, 10);
        });
    },

    add_flies: function () {
        this.flies = game.add.group();
        this.flies.enableBody = true;
        this.flies.physicsBodyType = Phaser.Physics.P2JS;

        this.map.createFromObjects('fly', 125, 'fly', 0, true, false, this.flies);

        this.flies.forEach(function (fly) {
            fly.body.setCollisionGroup(enemyCollisionGroup);
            fly.body.collides([playerCollisionGroup, platformCollisionGroup]);
            fly.body.kinematic = true;
            fly.animations.add('fly', [0, 1], 10, true);
            fly.animations.play('fly');

            game.add.tween(fly.body)
                .to({ y: fly.body.y - fly.movedistance }, 1500, Phaser.Easing.Quadratic.InOut)
                .to({ y: fly.body.y + fly.movedistance / 2 }, 1500, Phaser.Easing.Quadratic.InOut)
                .loop()
                .start();
        });
    },

    add_bugs: function () {
        this.ladybugs = game.add.group();
        this.ladybugs.enableBody = true;
        this.ladybugs.physicsBodyType = Phaser.Physics.P2JS;

        this.map.createFromObjects('ladybug', 457, 'ladybug', 0, true, false, this.ladybugs, Phaser.Sprite, false);

        this.ladybugs.forEach(function (bug) {
            bug.body.setCollisionGroup(enemyCollisionGroup);
            bug.body.collides([playerCollisionGroup, platformCollisionGroup]);
            bug.body.kinematic = true;
            bug.animations.add('fly', [0, 1], 10, true);
            bug.animations.play('fly');

            var tween = game.add.tween(bug.body).to(
                { x: bug.body.x - bug.movedistance },
                2500,
                Phaser.Easing.Linear.None,
                true,
                0,
                Number.MAX_VALUE,
                true
            );

            tween.onLoop.add(function () {
                bug.scale.x *= -1;
            }, this);

            if (bug.rotate === '1') {
                bug.anchor.setTo(0.5, 0.5);
                bug.scale.x *= -1;
            }
        });
    },

    add_moving_platforms: function () {
        this.movingplatforms = game.add.group();
        this.movingplatforms.enableBody = true;
        this.movingplatforms.physicsBodyType = Phaser.Physics.P2JS;

        this.map.createFromObjects('movingplatform', 483, 'movingplatform', 0, true, false, this.movingplatforms, Phaser.Sprite, false);

        this.movingplatforms.forEach(function (movingplatform) {
            movingplatform.body.setCollisionGroup(platformCollisionGroup);
            movingplatform.body.collides([playerCollisionGroup, platformCollisionGroup]);
            movingplatform.body.kinematic = true;
            movingplatform.lastX = movingplatform.body.x;
            movingplatform.lastY = movingplatform.body.y;
            movingplatform.deltaX = 0;
            movingplatform.deltaY = 0;

            if (movingplatform.horizontal === '0') {
                game.add.tween(movingplatform.body).to(
                    { y: movingplatform.body.y - movingplatform.movedistance },
                    2500,
                    Phaser.Easing.Linear.None,
                    true,
                    0,
                    Number.MAX_VALUE,
                    true
                );
            }

            if (movingplatform.horizontal === '1') {
                game.add.tween(movingplatform.body).to(
                    { x: movingplatform.body.x - movingplatform.movedistance },
                    2500,
                    Phaser.Easing.Linear.None,
                    true,
                    0,
                    Number.MAX_VALUE,
                    true
                );
            }
        });
    },

    add_player: function () {
        this.player = game.add.sprite(playerx, h - playery, 'player');
        this.player.animations.add('walk', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 15, true);
        game.physics.p2.enable(this.player);
        this.player.enableBody = true;
        this.player.physicsBodyType = Phaser.Physics.P2;
        this.player.body.collideWorldBounds = true;
        this.player.body.fixedRotation = true;
        this.player.body.setCollisionGroup(playerCollisionGroup);
        this.player.body.collides([gemsCollisionGroup, platformCollisionGroup, enemyCollisionGroup]);
    },

    destroy_group: function (group) {
        if (!group) {
            return;
        }

        group.forEach(function (item) {
            if (item.body) {
                item.body.removeFromWorld();
            }
            item.destroy();
        }, this);

        group.destroy(true);
    },

    clear_map: function () {
        if (!this.map) {
            return;
        }

        game.tweens.removeAll();
        onplatform = false;
        platformalign = null;

        this.destroy_group(this.gems);
        this.destroy_group(this.flies);
        this.destroy_group(this.ladybugs);
        this.destroy_group(this.movingplatforms);

        game.physics.p2.clearTilemapLayerBodies(this.map, this.platformlayer);

        if (this.platformlayer) {
            this.platformlayer.destroy();
        }

        if (this.backgroundlayer) {
            this.backgroundlayer.destroy();
        }

        this.platform = null;
        this.map.destroy();
        this.map = null;
        tilesets = [];
    },

    player_movements: function () {
        if (this.cursor.left.isDown) {
            this.player.body.moveLeft(500);
            this.player.animations.play('walk');
            this.player.scale.x = -1;
        } else if (this.cursor.right.isDown) {
            this.player.body.moveRight(500);
            this.player.animations.play('walk');
            this.player.scale.x = 1;
        } else {
            this.player.body.velocity.x = 0;
            this.player.animations.stop();
            this.player.animations.frame = 0;
        }

        if (this.cursor.up.isDown && game.time.now > jumptimer && this.checkJump()) {
            this.player.body.moveUp(1200);
            jumptimer = game.time.now + 800;
        }
    }
};
