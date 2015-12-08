var vector = require('./utility/vector');
var controller = require('./controller');
var drawUtility = require('./utility/draw-utility');
var entityFactory = require('./utility/entity');
var bulletController = require('./bullet-controller');
var boundsFactory = require('./utility/bounds');

module.exports = {
	update: function (updateData, entity) {
		var acceleration = vector.create({
			x: updateData.player.x - entity.x,
			y: updateData.player.y - entity.y
		});

		if (acceleration.magnitude > 200) {
			acceleration = vector.create({
				magnitude: 1,
				direction: acceleration.direction
			});
		}
		else {
			if (entity.data.timeSinceLastFire >= entity.data.rateOfFire) {
				var bulletPosition = vector.create({
					magnitude: entity.bounds.radius + 10,
					direction: acceleration.direction
				});

				/*var bullet = entityFactory.create({
					x: entity.x + entity.bounds.radius - 10 + bulletPosition.x,
					y: entity.y + entity.bounds.radius - 10 + bulletPosition.y,
					maxSpeed: 10,
					controller: bulletController,
					bounds: boundsFactory.createCircle({
						radius: 10
					}),
					velocity: vector.create({
						magnitude: 10,
						direction: acceleration.direction
					}),
					drawFunc: function (entity, roomPosition, ctx) {
						drawUtility.circle(ctx, entity.x - roomPosition.x, entity.y - roomPosition.y, entity.bounds.radius, '#00FF00');
					}
				});

				bullet.data.faction = 'enemy';

				updateData.entities.append(bullet);

				entity.data.timeSinceLastFire = 0;*/
			}
			else {
				entity.data.timeSinceLastFire += updateData.elapsedTime;
			}

			acceleration = vector.create({
				x: 0,
				y:0
			});
		}

		if (entity.data.timeSinceDamageTaken < entity.data.invulnerabilityTime)
			entity.data.timeSinceDamageTaken += updateData.elapsedTime;

		return {
			elapsedTime: updateData.elapsedTime,
			entities: updateData.entities,
			surfaces: updateData.surfaces,
			acceleration: acceleration
		};
	}
};
