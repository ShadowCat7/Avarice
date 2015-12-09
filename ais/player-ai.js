var vector = require('../utility/vector');
var boundsFactory = require('../utility/bounds');
var entityFactory = require('../utility/entity');
var timerFactory = require('../utility/timer');
var hpModuleFactory = require('../controller-modules/hp-module');
var movementModuleFactory = require('../controller-modules/movement-module');
var types = require('../types');
var drawUtility = require('../utility/draw-utility');
var statsFactory = require('../stats');

module.exports = {
	init: function (player) {
		player.stats = statsFactory.create({
			health: 4,
			contactDamage: 0,
			rateOfFire: 0.5,
			bulletSpeed: 12,
			bulletDamage: 1,
			speed: 8
		});

		player.data.ai = {
			rateOfFireTimer: timerFactory.create(player.stats.rateOfFire, true),
			items: [],
			takeItem: function (item) {
				player.data.ai.items.push(item);
				player.stats = statsFactory.add(player.stats, item.stats);
				player.data.ai.itemDisplayTimer = timerFactory.create(3, false);
				
				if (item.stats.rateOfFire) {
					player.data.ai.rateOfFireTimer = timerFactory.create(player.stats.rateOfFire, false);
				}
			}
		};
	},
	update: function (updateData, player) {
		var acceleration = vector.create({
			x: 0,
			y: 0
		});

		// W
		if (updateData.buttonsPressed[87] || updateData.buttonsPressed[188]) {
			acceleration = acceleration.add(vector.create({
				x: 0,
				y: -1
			}));
		}

		// S
		if (updateData.buttonsPressed[83] || updateData.buttonsPressed[79]) {
			acceleration = acceleration.add(vector.create({
				x: 0,
				y: 1
			}));
		}

		// A
		if (updateData.buttonsPressed[65] || updateData.buttonsPressed[69]) {
			acceleration = acceleration.add(vector.create({
				x: -1,
				y: 0
			}));
		}

		// D
		if (updateData.buttonsPressed[68]) {
			acceleration = acceleration.add(vector.create({
				x: 1,
				y: 0
			}));
		}

		if (player.data.ai.rateOfFireTimer.isSet()) {
			var isBulletCreated = false;

			var movementModuleOptions = {
				maxSpeed: player.stats.bulletSpeed
			};

			var bulletOptions = {
				type: types.playerBullet,
				x: player.x + player.bounds.radius - 10,
				y: player.y + player.bounds.radius - 10,
				bounds: boundsFactory.createCircle({
					radius: 10
				}),
				controllerData: {
					hpModule: hpModuleFactory.create({
						amount: 1,
						timer: timerFactory.create(0.1, true)
					})
				},
				drawFunc: function (entity, roomPosition, ctx) {
					drawUtility.circle(ctx, entity.x - roomPosition.x, entity.y - roomPosition.y, entity.bounds.radius, '#00FF00');
				}
			};

			// Up - 38
			if (updateData.buttonsPressed[38]) {
				movementModuleOptions.velocity = vector.create({
					x: 0,
					y: -player.stats.bulletSpeed
				});
				bulletOptions.y -= player.bounds.radius + 10;
				isBulletCreated = true;
			}

			// Down - 40
			if (updateData.buttonsPressed[40]) {
				movementModuleOptions.velocity = vector.create({
					x: 0,
					y: player.stats.bulletSpeed
				});
				bulletOptions.y += player.bounds.radius + 10;
				isBulletCreated = true;
			}

			// Left - 37
			if (updateData.buttonsPressed[37]) {
				movementModuleOptions.velocity = vector.create({
					x: -player.stats.bulletSpeed,
					y: 0
				});
				bulletOptions.x -= player.bounds.radius + 10;
				isBulletCreated = true;
			}

			// Right - 39
			if (updateData.buttonsPressed[39]) {
				movementModuleOptions.velocity = vector.create({
					x: player.stats.bulletSpeed,
					y: 0
				});
				bulletOptions.x += player.bounds.radius + 10;
				isBulletCreated = true;
			}

			if (isBulletCreated) {
				bulletOptions.controllerData.movementModule = movementModuleFactory.create(movementModuleOptions);
				bulletOptions.stats = statsFactory.create({
					health: 1,
					contactDamage: player.stats.bulletDamage,
					speed: player.stats.bulletSpeed
				});
				updateData.entities.append(entityFactory.create(bulletOptions));
				player.data.ai.rateOfFireTimer.reset();
			}
		}
		else {
			player.data.ai.rateOfFireTimer.update(updateData.elapsedTime);
		}

		if (player.data.ai.itemDisplayTimer) {
			if (player.data.ai.itemDisplayTimer.isSet())
				player.data.ai.itemDisplayTimer = null;
			else
				player.data.ai.itemDisplayTimer.update(updateData.elapsedTime);
		}

		return {
			elapsedTime: updateData.elapsedTime,
			entities: updateData.entities,
			surfaces: updateData.surfaces,
			acceleration: acceleration
		};
	}
};
