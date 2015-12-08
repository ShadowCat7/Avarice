var vector = require('./utility/vector');
var controller = require('./controller');
var drawUtility = require('./utility/draw-utility');

function collisionOccurred(entity, other) {
	if (!other.data || other.data && other.data.faction !== entity.data.faction)
		loseHp(entity);
}

function loseHp(entity) {
	if (entity.data.timeSinceDamageTaken >= entity.data.invulnerabilityTime) {
		entity.data.hp -= 1;
		entity.data.timeSinceDamageTaken = 0;
	}
}

module.exports = {
	update: function (updateData, entity) {
		if (entity.data.timeSinceDamageTaken < entity.data.invulnerabilityTime)
			entity.data.timeSinceDamageTaken += updateData.elapsedTime;

		return {
			elapsedTime: updateData.elapsedTime,
			entities: updateData.entities,
			surfaces: updateData.surfaces
		};
	},
	collision: function (entity, other) {
		if (other.controller && other.controller.collisionOccurred && entity.data.hp > 0)
			other.controller.collisionOccurred(other, entity);

		collisionOccurred(entity, other);
	},
	collisionOccurred: collisionOccurred,
	getData: function () {
		return {
			hp: 1,
			timeSinceDamageTaken: 0.5,
			invulnerabilityTime: 0.5,
			dealsDamage: true,
			hurtsEnemies: true
		};
	},
	draw: function (entity, roomPosition, ctx) {
		drawUtility.circle(ctx, entity.x - roomPosition.x, entity.y - roomPosition.y, entity.bounds.radius, '#00FF00');
	}
};
