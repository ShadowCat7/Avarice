var vector = require('./utility/vector');
var boundsFactory = require('./utility/bounds');
var entityFactory = require('./utility/entity');
var drawUtility = require('./utility/draw-utility');
var controller = require('./controller');
var bulletController = require('./bullet-controller');

function collisionOccurred(player, other) {
	if (other.data && other.data.dealsDamage)
		loseHp(player);
}

function loseHp(player) {
	if (player.data.timeSinceDamageTaken >= player.data.invulnerabilityTime) {
		player.data.hp -= 1;
		player.data.timeSinceDamageTaken = 0;
	}
}

module.exports = {
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

		if (player.data.timeSinceLastFire >= player.data.rateOfFire) {
			var isBulletCreated = false;

			var bulletOptions = {
				x: player.x + player.bounds.radius - 10,
				y: player.y + player.bounds.radius - 10,
				maxSpeed: 10,
				controller: bulletController,
				bounds: boundsFactory.createCircle({
					radius: 10
				})
			};

			// Up - 38
			if (updateData.buttonsPressed[38]) {
				bulletOptions.velocity = vector.create({
					x: 0,
					y: -30
				});
				bulletOptions.y -= player.bounds.radius + 10;
				isBulletCreated = true;
			}

			// Down - 40
			if (updateData.buttonsPressed[40]) {
				bulletOptions.velocity = vector.create({
					x: 0,
					y: 30
				});
				bulletOptions.y += player.bounds.radius + 10;
				isBulletCreated = true;
			}

			// Left - 37
			if (updateData.buttonsPressed[37]) {
				bulletOptions.velocity = vector.create({
					x: -30,
					y: 0
				});
				bulletOptions.x -= player.bounds.radius + 10;
				isBulletCreated = true;
			}

			// Right - 39
			if (updateData.buttonsPressed[39]) {
				bulletOptions.velocity = vector.create({
					x: 30,
					y: 0
				});
				bulletOptions.x += player.bounds.radius + 10;
				isBulletCreated = true;
			}

			if (isBulletCreated) {
				updateData.entities.append(entityFactory.create(bulletOptions));
				player.data.timeSinceLastFire = 0;
			}
		}
		else {
			player.data.timeSinceLastFire += updateData.elapsedTime;
		}

		if (player.data.timeSinceDamageTaken < player.data.invulnerabilityTime)
			player.data.timeSinceDamageTaken += updateData.elapsedTime;

		return {
			elapsedTime: updateData.elapsedTime,
			entities: updateData.entities,
			surfaces: updateData.surfaces,
			acceleration: acceleration
		};
	},
	collision: function (player, other) {
		if (other.controller && other.controller.collisionOccurred)
			other.controller.collisionOccurred(other, player);

		collisionOccurred(player, other);
	},
	collisionOccurred: collisionOccurred,
	getData: function () {
		return {
			hp: 4,
			timeSinceDamageTaken: 0.5,
			invulnerabilityTime: 0.5,
			rateOfFire: 0.5,
			timeSinceLastFire: 0.5
		};
	},
	draw: function (entity, roomPosition, ctx) {
		var color;
		if (entity.data.timeSinceDamageTaken < 0.1)
			color = '#FF0000';
		else
			color = '#00FF00';

		drawUtility.circle(ctx, entity.x - roomPosition.x, entity.y - roomPosition.y, entity.bounds.radius, color);

		for (var i = 0; i < entity.data.hp; i++)
			drawUtility.circle(ctx, 5 + 15 * i, 5, 5, '#0000FF');
	}
};
