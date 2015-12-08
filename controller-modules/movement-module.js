var vector = require('../utility/vector');
var rules = require('../rules');

function create(data) {
	return {
		init: function (entity) {
			entity.data.movement = {
				maxSpeed: data.maxSpeed,
				velocity: data.velocity || vector.create({
					x: 0,
					y: 0
				})
			};
		},
		update: function (updateData, entity) {
			var absoluteVelocityMagnitude = Math.abs(entity.data.movement.velocity.magnitude);

			if (updateData.acceleration) {
				if (Math.abs(updateData.acceleration.magnitude >= 1)) {
					entity.data.movement.velocity = entity.data.movement.velocity.add(vector.create({
						magnitude: updateData.acceleration.magnitude * updateData.elapsedTime * 1000 / 17 * 2,
						direction: updateData.acceleration.direction
					}));
				}
				else if (absoluteVelocityMagnitude > 1) {
					entity.data.movement.velocity = entity.data.movement.velocity.addMagnitude(-1 * updateData.elapsedTime * 1000 / 17);
				}
				else if (absoluteVelocityMagnitude < 1) {
					entity.data.movement.velocity = vector.create({
						magnitude: 0,
						direction: entity.data.movement.velocity.direction
					});
				}
			}

			if (entity.data.movement.velocity.magnitude > entity.data.movement.maxSpeed) {
				entity.data.movement.velocity = vector.create({
					magnitude: entity.data.movement.maxSpeed,
					direction: entity.data.movement.velocity.direction
				});
			}

			if (Math.abs(entity.data.movement.velocity.magnitude) > 0.1) {
				entity.x += entity.data.movement.velocity.x;
				entity.y += entity.data.movement.velocity.y;
			}

			updateData.entities.forEach(function (other) {
				if (entity !== other && other.causesCollisions) {
					var diff = entity.bounds.isColliding({
						x: entity.x,
						y: entity.y
					},	other.bounds, {
						x: other.x,
						y: other.y
					});

					if (diff) {
						var rule = rules.collision(entity.type, other.type);

						if (rule && rule.canCollide) {
							entity.x += diff.x;
							entity.y += diff.y;
						}

						if (entity.controller.collision)
							entity.controller.collision(other, rule);
					}
				}
			});

			updateData.surfaces.forEach(function (surface) {
				var diff = surface.isColliding(entity, {
					x: entity.x,
					y: entity.y
				});

				if (diff) {
					var rule = rules.collision(entity.type, surface.type);

					if (rule && rule.canCollide) {
						entity.x += diff.x;
						entity.y += diff.y;
					}

					if (entity.controller.collision)
						entity.controller.collision(surface, rule);
				}
			});
		}
	};
}

module.exports = {
	create: create
};
