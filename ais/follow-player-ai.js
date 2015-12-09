var vector = require('../utility/vector');
var statsFactory = require('../stats');

module.exports = {
	init: function (entity) {
		entity.stats = statsFactory.create({
			health: 3,
			contactDamage: 1,
			speed: 3
		});
	},
	update: function (updateData, entity) {
		var acceleration = vector.create({
			x: updateData.player.x - entity.x,
			y: updateData.player.y - entity.y
		});

		return {
			elapsedTime: updateData.elapsedTime,
			entities: updateData.entities,
			surfaces: updateData.surfaces,
			acceleration: acceleration
		};
	}
};
