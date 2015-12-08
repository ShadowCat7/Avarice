var surfaceFactory = require('./utility/surface');
var entityFactory = require('./utility/entity');
var boundsFactory = require('./utility/bounds');
var types = require('./types');
var drawUtility = require('./utility/draw-utility');

function Room(data) {
	var self = this;

	var cameraPosition = {
		x: 0,
		y: 0
	};
	var size = {
		x: data.size.x,
		y: data.size.y
	};

	var doors = data.doors;

	var entities = data.entities;
	var surfaces = data.surfaces;
	var player = data.player;

	self.moveNext = false;

	entities.insert(player, 0);

	if (doors.n) {
		surfaces.append(surfaceFactory.create({
			type: types.wall,
			x: 100,
			y: 100,
			x2: size.x / 2 - 60,
			y2: 100
		}));

		surfaces.append(surfaceFactory.create({
			type: types.wall,
			x: size.x / 2 + 60,
			y: 100,
			x2: size.x - 100,
			y2: 100
		}));
	}
	else {
		surfaces.append(surfaceFactory.create({
			type: types.wall,
			x: 100,
			y: 100,
			x2: size.x - 100,
			y2: 100,
			/*drawFunc: function (surface, ctx) {
				var path = new Path2D();
				path.moveTo(surface.x, surface.y);
				path.lineTo(surface.x2, surface.y2);
				path.lineTo(surface.x2 + 1, surface.y2);
				path.lineTo(surface.x + 1, surface.y);
				ctx.fillStyle = '#0000FF';
				ctx.fill(path);
			}*/
		}));
	}

	if (doors.e) {
		surfaces.append(surfaceFactory.create({
			type: types.wall,
			x: size.x - 100,
			y: 100,
			x2: size.x - 100,
			y2: size.y / 2 - 60
		}));

		surfaces.append(surfaceFactory.create({
			type: types.wall,
			x: size.x - 100,
			y: size.y / 2 - 60,
			x2: size.x,
			y2: size.y / 2 - 60
		}));

		surfaces.append(surfaceFactory.create({
			type: types.wall,
			x: size.x - 100,
			y: size.y / 2 + 60,
			x2: size.x - 100,
			y2: size.y - 100
		}));

		surfaces.append(surfaceFactory.create({
			type: types.wall,
			x: size.x,
			y: size.y / 2 + 60,
			x2: size.x - 100,
			y2: size.y / 2 + 60
		}));

		entities.append(entityFactory.create({
			type: types.openDoor,
			x: size.x - 30,
			y: size.y / 2 - 30,
			bounds: boundsFactory.createCircle({
				radius: 30
			}),
			causesCollisions: true,
			drawFunc: function (entity, roomPosition, ctx) {
				drawUtility.circle(ctx, entity.x - roomPosition.x, entity.y - roomPosition.y, entity.bounds.radius, '#00FFFF');
			}
		}));
	}
	else {
		surfaces.append(surfaceFactory.create({
			type: types.wall,
			x: size.x - 100,
			y: 100,
			x2: size.x - 100,
			y2: size.y - 100
		}));
	}

	if (doors.s) {
		surfaces.append(surfaceFactory.create({
			type: types.wall,
			x: size.x - 100,
			y: size.y - 100,
			x2: size.x / 2 + 60,
			y2: size.y - 100
		}));

		surfaces.append(surfaceFactory.create({
			type: types.wall,
			x: size.x / 2 - 60,
			y: size.y - 100,
			x2: 100,
			y2: size.y - 100
		}));
	}
	else {
		surfaces.append(surfaceFactory.create({
			type: types.wall,
			x: size.x - 100,
			y: size.y - 100,
			x2: 100,
			y2: size.y - 100
		}));
	}

	if (doors.w) {
		surfaces.append(surfaceFactory.create({
			type: types.wall,
			x: 100,
			y: size.y - 100,
			x2: 100,
			y2: size.y / 2 + 60
		}));

		surfaces.append(surfaceFactory.create({
			type: types.wall,
			x: 100,
			y: size.y / 2 + 0,
			x2: 100,
			y2: 100
		}));
	}
	else {
		surfaces.append(surfaceFactory.create({
			type: types.wall,
			x: 100,
			y: size.y - 100,
			x2: 100,
			y2: 100
		}));
	}

	self.update = function(buttonsPressed, elapsedTime) {
		var removals = [];

		var updateData = {
			buttonsPressed: buttonsPressed,
			elapsedTime: elapsedTime,
			entities: entities,
			surfaces: surfaces,
			player: player
		};

		entities.forEach(function (entity, index) {
			entity.update(updateData);
		});

		entities.forEach(function (entity, index) {
			if (entity.data.hp && entity.data.hp.amount <= 0)
				removals.push(index);
		});

		for (var i = 0; i < removals.length; i++)
			entities.removeAt(removals[i] - i); // (- i) on purpose
	};

	self.draw = function (ctx, viewPortSize) {
		var playerPosition = {
			x: player.x + player.bounds.radius,
			y: player.y + player.bounds.radius
		};

		if (playerPosition.x < viewPortSize.x / 2)
			cameraPosition.x = 0;
		else if (playerPosition.x > size.x - viewPortSize.x / 2)
			cameraPosition.x = size.x - viewPortSize.x;
		else
			cameraPosition.x = playerPosition.x - viewPortSize.x / 2;

		if (playerPosition.y < viewPortSize.y / 2)
			cameraPosition.y = 0;
		else if (playerPosition.y > size.y - viewPortSize.y / 2)
			cameraPosition.y = size.y - viewPortSize.y;
		else
			cameraPosition.y = playerPosition.y - viewPortSize.y / 2;

		drawUtility.rectangle(ctx, {
			x: 0,
			y: 0
		}, size, '#888888');

		drawUtility.rectangle(ctx, {
			x: 100 - cameraPosition.x,
			y: 100 - cameraPosition.y
		}, {
			x: size.x - 200,
			y: size.y - 200
		}, '#CCCCCC');

		if (doors.e) {
			drawUtility.rectangle(ctx, {
				x: size.x - 100 - cameraPosition.x,
				y: size.y / 2 - 60 - cameraPosition.y
			}, {
				x: 100,
				y: 120
			}, '#CCCCCC');
		}

		entities.forEach(function (entity) {
			entity.draw(ctx, cameraPosition);
		});

		surfaces.forEach(function (surface) {
			surface.draw(ctx, cameraPosition);
		});
	}
}

module.exports = {
	create: function (data) {
		return new Room(data);
	}
};
