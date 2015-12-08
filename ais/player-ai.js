var vector = require('../utility/vector');
var boundsFactory = require('../utility/bounds');
var entityFactory = require('../utility/entity');
var timerFactory = require('../utility/timer');
var hpModuleFactory = require('../controller-modules/hp-module');
var movementModuleFactory = require('../controller-modules/movement-module');
var types = require('../types');
var drawUtility = require('../utility/draw-utility');

module.exports = {
	init: function (player) {
		player.data.ai = {
			timer: timerFactory.create(0.5, true)
		};
	},
	update: function (updateData, player) {
		var acceleration = vector.create({
			x: 0,
			y: 0
		});

		// W
		if (updateData.buttonsPressed[87]) {
			acceleration = acceleration.add(vector.create({
				x: 0,
				y: -1
			}));
		}

		// S
		if (updateData.buttonsPressed[83]) {
			acceleration = acceleration.add(vector.create({
				x: 0,
				y: 1
			}));
		}

		// A
		if (updateData.buttonsPressed[65]) {
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

		if (player.data.ai.timer.isSet()) {
			var isBulletCreated = false;

			var movementModuleOptions = {
				maxSpeed: 10
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
					y: -30
				});
				bulletOptions.y -= player.bounds.radius + 10;
				isBulletCreated = true;
			}

			// Down - 40
			if (updateData.buttonsPressed[40]) {
				movementModuleOptions.velocity = vector.create({
					x: 0,
					y: 30
				});
				bulletOptions.y += player.bounds.radius + 10;
				isBulletCreated = true;
			}

			// Left - 37
			if (updateData.buttonsPressed[37]) {
				movementModuleOptions.velocity = vector.create({
					x: -30,
					y: 0
				});
				bulletOptions.x -= player.bounds.radius + 10;
				isBulletCreated = true;
			}

			// Right - 39
			if (updateData.buttonsPressed[39]) {
				movementModuleOptions.velocity = vector.create({
					x: 30,
					y: 0
				});
				bulletOptions.x += player.bounds.radius + 10;
				isBulletCreated = true;
			}

			if (isBulletCreated) {
				bulletOptions.controllerData.movementModule = movementModuleFactory.create(movementModuleOptions);
				updateData.entities.append(entityFactory.create(bulletOptions));
				player.data.ai.timer.reset();
			}
		}
		else {
			player.data.ai.timer.update(updateData.elapsedTime);
		}

		return {
			elapsedTime: updateData.elapsedTime,
			entities: updateData.entities,
			surfaces: updateData.surfaces,
			acceleration: acceleration
		};
	}
};
