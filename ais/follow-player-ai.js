var vector = require('../utility/vector');

module.exports = {
	init: function () {},
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
