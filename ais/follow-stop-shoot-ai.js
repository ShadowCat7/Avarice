var vector = require('../utility/vector');
var controller = require('../controller');
var drawUtility = require('../utility/draw-utility');
var entityFactory = require('../utility/entity');
var boundsFactory = require('../utility/bounds');
var timerFactory = require('../utility/timer');
var hpModuleFactory = require('../controller-modules/hp-module');
var movementModuleFactory = require('../controller-modules/movement-module');
var types = require('../types');
var statsFactory = require('../stats');

module.exports = {
	init: function (entity) {
		entity.data.ai = {
			rateOfFireTimer: timerFactory.create(entity.stats.rateOfFire, true)
		};
	},
	update: function (updateData, entity) {
		var acceleration = vector.create({
			x: updateData.player.x + updateData.player.bounds.radius - entity.x - entity.bounds.radius,
			y: updateData.player.y + updateData.player.bounds.radius - entity.y - entity.bounds.radius
		});

		if (acceleration.magnitude > 150) {
			acceleration = vector.create({
				magnitude: 1,
				direction: acceleration.direction
			});
		}
		else {
			if (entity.data.ai.rateOfFireTimer.isSet()) {
				var bulletPosition = vector.create({
					magnitude: entity.bounds.radius,
					direction: acceleration.direction
				});

				var bullet = entityFactory.create({
					type: types.enemyBullet,
					x: entity.x + entity.bounds.radius + bulletPosition.x - 10,
					y: entity.y + entity.bounds.radius + bulletPosition.y - 10,
					maxSpeed: 10,
					bounds: boundsFactory.createCircle({
						radius: 10
					}),
					controllerData: {
						hpModule: hpModuleFactory.create({
							amount: 1,
							timer: timerFactory.create(0.1, true)
						}),
						movementModule: movementModuleFactory.create({
							velocity: vector.create({
								magnitude: entity.stats.bulletSpeed,
								direction: acceleration.direction
							})
						})
					},
					stats: statsFactory.create({
						health: 1,
						contactDamage: entity.stats.bulletDamage,
						speed: entity.stats.bulletSpeed
					}),
					drawFunc: function (entity, roomPosition, ctx) {
						drawUtility.circle(ctx, entity.x - roomPosition.x, entity.y - roomPosition.y, entity.bounds.radius, '#FF0000');
					}
				});

				updateData.entities.append(bullet);

				entity.data.ai.rateOfFireTimer.reset();
			}

			acceleration = vector.create({
				x: 0,
				y: 0
			});
		}

		if (!entity.data.ai.rateOfFireTimer.isSet())
			entity.data.ai.rateOfFireTimer.update(updateData.elapsedTime);

		return {
			elapsedTime: updateData.elapsedTime,
			entities: updateData.entities,
			surfaces: updateData.surfaces,
			acceleration: acceleration
		};
	}
};
