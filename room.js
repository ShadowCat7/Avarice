var surfaceFactory = require('./utility/surface');
var entityFactory = require('./utility/entity');
var boundsFactory = require('./utility/bounds');
var types = require('./types');
var drawUtility = require('./utility/draw-utility');
var vector = require('./utility/vector');
var types = require('./types');
var roomTypes = require('./rooms/room-types');

var wallThickness = 50;
var halfDoorWidth = 50;

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
	self.mapPosition = data.mapPosition;
	self.type = data.type;

	var doors = null;

	var entities = data.entities;
	var surfaces = data.surfaces;
	var player = data.player;

	var isPaused = false;
	var wasPausedLastTick = false;

	var isYouWin = false;

	self.moveNext = false;

	entities.insert(player, 0);

	var roomEnteredCallback = data.roomEnteredCallback;
	var isEnemyExist = self.type === roomTypes.normal ? true : false;

	function nextRoomTrigger(door) {
		player.data.nextSide = door.data.doorLocation;

		self.moveNext = door.data.room;
	}

	self.startRoom = function() {
		if (player.data) {
			if (player.data.nextSide === 'n') {
				player.x = size.x / 2 - player.bounds.radius;
				player.y = size.y - player.bounds.radius * 3;
			}
			else if (player.data.nextSide === 's') {
				player.x = size.x / 2 - player.bounds.radius;
				player.y = player.bounds.radius;
			}
			else if (player.data.nextSide === 'e') {
				player.x = player.bounds.radius;
				player.y = size.y / 2 - player.bounds.radius;
			}
			else if (player.data.nextSide === 'w') {
				player.x = size.x - player.bounds.radius * 3;
				player.y = size.y / 2 - player.bounds.radius;
			}

			player.data.movement.velocity = vector.create({
				x: 0,
				y: 0
			});

			player.data.nextSide = null;
		}

		var removals = [];

		entities.forEach(function (entity, index) {
			if (entity.type === types.playerBullet || entity.type === types.enemyBullet)
				removals.push(index);
		});

		for (var i = 0; i < removals.length; i++)
			entities.removeAt(removals[i] - i); // (- i) on purpose

		if (roomEnteredCallback)
			roomEnteredCallback();
	};

	self.addWalls = function(doorLocations) {
		doors = doorLocations;

		if (doors.n) {
			surfaces.append(surfaceFactory.create({
				type: types.wall,
				x: wallThickness,
				y: wallThickness,
				x2: size.x / 2 - halfDoorWidth,
				y2: wallThickness
			}));

			surfaces.append(surfaceFactory.create({
				type: types.wall,
				x: size.x / 2 - halfDoorWidth,
				y: wallThickness,
				x2: size.x / 2 - halfDoorWidth,
				y2: 0
			}));

			surfaces.append(surfaceFactory.create({
				type: types.wall,
				x: size.x / 2 + halfDoorWidth,
				y: 0,
				x2: size.x / 2 + halfDoorWidth,
				y2: wallThickness
			}));

			surfaces.append(surfaceFactory.create({
				type: types.wall,
				x: size.x / 2 + halfDoorWidth,
				y: wallThickness,
				x2: size.x - wallThickness,
				y2: wallThickness
			}));

			if (data.type === roomTypes.normal) {
				surfaces.append(surfaceFactory.create({
					type: types.wall,
					x: size.x / 2 - halfDoorWidth,
					y: wallThickness / 2,
					x2: size.x / 2 + halfDoorWidth,
					y2: wallThickness / 2,
					data: {
						closedDoor: true
					}
				}));
			}

			surfaces.append(surfaceFactory.create({
				type: types.openDoor,
				x: size.x / 2 - halfDoorWidth,
				y: 0,
				x2: size.x / 2 + halfDoorWidth,
				y2: 0,
				data: {
					nextRoomTrigger: nextRoomTrigger,
					room: doors.n,
					doorLocation: 'n'
				}
			}));
		}
		else {
			surfaces.append(surfaceFactory.create({
				type: types.wall,
				x: wallThickness,
				y: wallThickness,
				x2: size.x - wallThickness,
				y2: wallThickness,
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
				x: size.x - wallThickness,
				y: wallThickness,
				x2: size.x - wallThickness,
				y2: size.y / 2 - halfDoorWidth
			}));

			surfaces.append(surfaceFactory.create({
				type: types.wall,
				x: size.x - wallThickness,
				y: size.y / 2 - halfDoorWidth,
				x2: size.x,
				y2: size.y / 2 - halfDoorWidth
			}));

			surfaces.append(surfaceFactory.create({
				type: types.wall,
				x: size.x,
				y: size.y / 2 + halfDoorWidth,
				x2: size.x - wallThickness,
				y2: size.y / 2 + halfDoorWidth
			}));

			surfaces.append(surfaceFactory.create({
				type: types.wall,
				x: size.x - wallThickness,
				y: size.y / 2 + halfDoorWidth,
				x2: size.x - wallThickness,
				y2: size.y - wallThickness
			}));

			if (data.type === roomTypes.normal) {
				surfaces.append(surfaceFactory.create({
					type: types.wall,
					x: size.x - wallThickness / 2,
					y: size.y / 2 - halfDoorWidth,
					x2: size.x - wallThickness / 2,
					y2: size.y / 2 + halfDoorWidth,
					data: {
						closedDoor: true
					}
				}));
			}

			surfaces.append(surfaceFactory.create({
				type: types.openDoor,
				x: size.x,
				y: size.y / 2 - halfDoorWidth,
				x2: size.x,
				y2: size.y / 2 + halfDoorWidth,
				data: {
					nextRoomTrigger: nextRoomTrigger,
					room: doors.e,
					doorLocation: 'e'
				}
			}));

			//entities.append(entityFactory.create({
			//	type: types.openDoor,
			//	x: size.x - 30,
			//	y: size.y / 2 - 30,
			//	bounds: boundsFactory.createCircle({
			//		radius: 30
			//	}),
			//	causesCollisions: true,
			//	drawFunc: function (entity, roomPosition, ctx) {
			//		drawUtility.circle(ctx, entity.x - roomPosition.x, entity.y - roomPosition.y, entity.bounds.radius, '#00FFFF');
			//	}
			//}));
		}
		else {
			surfaces.append(surfaceFactory.create({
				type: types.wall,
				x: size.x - wallThickness,
				y: wallThickness,
				x2: size.x - wallThickness,
				y2: size.y - wallThickness
			}));
		}

		if (doors.s) {
			surfaces.append(surfaceFactory.create({
				type: types.wall,
				x: size.x - wallThickness,
				y: size.y - wallThickness,
				x2: size.x / 2 + halfDoorWidth,
				y2: size.y - wallThickness
			}));

			surfaces.append(surfaceFactory.create({
				type: types.wall,
				x: size.x / 2 + halfDoorWidth,
				y: size.y - wallThickness,
				x2: size.x / 2 + halfDoorWidth,
				y2: size.y
			}));

			surfaces.append(surfaceFactory.create({
				type: types.wall,
				x: size.x / 2 - halfDoorWidth,
				y: size.y,
				x2: size.x / 2 - halfDoorWidth,
				y2: size.y - wallThickness
			}));

			surfaces.append(surfaceFactory.create({
				type: types.wall,
				x: size.x / 2 - halfDoorWidth,
				y: size.y - wallThickness,
				x2: wallThickness,
				y2: size.y - wallThickness
			}));

			if (data.type === roomTypes.normal) {
				surfaces.append(surfaceFactory.create({
					type: types.wall,
					x: size.x / 2 + halfDoorWidth,
					y: size.y - wallThickness / 2,
					x2: size.x / 2 - halfDoorWidth,
					y2: size.y - wallThickness / 2,
					data: {
						closedDoor: true
					}
				}));
			}

			surfaces.append(surfaceFactory.create({
				type: types.openDoor,
				x: size.x / 2 + halfDoorWidth,
				y: size.y,
				x2: size.x / 2 - halfDoorWidth,
				y2: size.y,
				data: {
					nextRoomTrigger: nextRoomTrigger,
					room: doors.s,
					doorLocation: 's'
				}
			}));
		}
		else {
			surfaces.append(surfaceFactory.create({
				type: types.wall,
				x: size.x - wallThickness,
				y: size.y - wallThickness,
				x2: wallThickness,
				y2: size.y - wallThickness
			}));
		}

		if (doors.w) {
			surfaces.append(surfaceFactory.create({
				type: types.wall,
				x: wallThickness,
				y: size.y - wallThickness,
				x2: wallThickness,
				y2: size.y / 2 + halfDoorWidth
			}));

			surfaces.append(surfaceFactory.create({
				type: types.wall,
				x: wallThickness,
				y: size.y / 2 + halfDoorWidth,
				x2: 0,
				y2: size.y / 2 + halfDoorWidth
			}));

			surfaces.append(surfaceFactory.create({
				type: types.wall,
				x: 0,
				y: size.y / 2 - halfDoorWidth,
				x2: wallThickness,
				y2: size.y / 2 - halfDoorWidth
			}));

			surfaces.append(surfaceFactory.create({
				type: types.wall,
				x: wallThickness,
				y: size.y / 2 - halfDoorWidth,
				x2: wallThickness,
				y2: wallThickness
			}));

			if (data.type === roomTypes.normal) {
				surfaces.append(surfaceFactory.create({
					type: types.wall,
					x: wallThickness / 2,
					y: size.y / 2 + halfDoorWidth,
					x2: wallThickness / 2,
					y2: size.y / 2 - halfDoorWidth,
					data: {
						closedDoor: true
					}
				}));
			}

			surfaces.append(surfaceFactory.create({
				type: types.openDoor,
				x: 0,
				y: size.y / 2 + halfDoorWidth,
				x2: 0,
				y2: size.y / 2 - halfDoorWidth,
				data: {
					nextRoomTrigger: nextRoomTrigger,
					room: doors.w,
					doorLocation: 'w'
				}
			}));
		}
		else {
			surfaces.append(surfaceFactory.create({
				type: types.wall,
				x: wallThickness,
				y: size.y - wallThickness,
				x2: wallThickness,
				y2: wallThickness
			}));
		}
	}

	self.update = function(buttonsPressed, elapsedTime) {
		if (buttonsPressed[27]) {
			if (!wasPausedLastTick)
				isPaused = !isPaused;

			wasPausedLastTick = true;
		}
		else {
			wasPausedLastTick = false;
		}

		if (!isPaused) {
			var removals = [];

			var updateData = {
				buttonsPressed: buttonsPressed,
				elapsedTime: elapsedTime,
				entities: entities,
				surfaces: surfaces,
				player: player
			};

			var isNoEnemyExists = true;

			entities.forEach(function (entity, index) {
				entity.update(updateData);
				if (entity.type === types.enemy)
					isNoEnemyExists = false;
			});

			entities.forEach(function (entity, index) {
				if (entity.data.remove || entity.data.hp && entity.data.hp.amount <= 0) {
					removals.push(index);

					if (entity.data && entity.data.enemyData && entity.data.enemyData.name === 'Boss')
						isYouWin = true;
				}
			});

			for (var i = 0; i < removals.length; i++)
				entities.removeAt(removals[i] - i); // (- i) on purpose

			if (isNoEnemyExists && isEnemyExist) {
				surfaces.forEach(function (surface, index) {
					if (surface.data && surface.data.closedDoor)
						removals.push(index);
				});

				for (var i = 0; i < removals.length; i++)
					surfaces.removeAt(removals[i] - i); // (- i) on purpose

				isEnemyExist = false;
			}

			if (player.data && player.data.nextRoom)
				self.moveNext = player.data.nextRoom;
		}
	};

	self.draw = function (ctx, viewPortSize) {
		var playerPosition = {
			x: player.x + player.bounds.radius,
			y: player.y + player.bounds.radius
		};

		if (size.x <= viewPortSize.x) {
			cameraPosition.x = (size.x - viewPortSize.x) / 2;
		}
		else {
			if (playerPosition.x < viewPortSize.x / 2)
				cameraPosition.x = 0;
			else if (playerPosition.x > size.x - viewPortSize.x / 2)
				cameraPosition.x = size.x - viewPortSize.x;
			else
				cameraPosition.x = playerPosition.x - viewPortSize.x / 2;
		}

		if (size.y <= viewPortSize.y) {
			cameraPosition.y = (size.y - viewPortSize.y) / 2;
		}
		else {
			if (playerPosition.y < viewPortSize.y / 2)
				cameraPosition.y = 0;
			else if (playerPosition.y > size.y - viewPortSize.y / 2)
				cameraPosition.y = size.y - viewPortSize.y;
			else
				cameraPosition.y = playerPosition.y - viewPortSize.y / 2;
		}

		drawUtility.rectangle(ctx, {
			x: 0,
			y: 0
		}, viewPortSize, '#888888');

		drawUtility.rectangle(ctx, {
			x: wallThickness - cameraPosition.x,
			y: wallThickness - cameraPosition.y
		}, {
			x: size.x - 2 * wallThickness,
			y: size.y - 2 * wallThickness
		}, '#CCCCCC');

		if (doors.n) {
			drawUtility.rectangle(ctx, {
				x: size.x / 2 - halfDoorWidth - cameraPosition.x,
				y: -cameraPosition.y
			}, {
				x: 2 * halfDoorWidth,
				y: wallThickness + 1
			}, '#CCCCCC');

			if (isEnemyExist) {
				drawUtility.rectangle(ctx, {
					x: size.x / 2 - halfDoorWidth - cameraPosition.x,
					y: -cameraPosition.y
				}, {
					x: 2 * halfDoorWidth,
					y: wallThickness / 2
				}, '#A52A2A');
			}
		}
		if (doors.s) {
			drawUtility.rectangle(ctx, {
				x: size.x / 2 - halfDoorWidth - cameraPosition.x,
				y: size.y - (wallThickness + 1) - cameraPosition.y
			}, {
				x: 2 * halfDoorWidth,
				y: wallThickness + 1
			}, '#CCCCCC');

			if (isEnemyExist) {
				drawUtility.rectangle(ctx, {
					x: size.x / 2 - halfDoorWidth - cameraPosition.x,
					y: size.y - wallThickness / 2 - cameraPosition.y
				}, {
					x: 2 * halfDoorWidth,
					y: wallThickness / 2
				}, '#A52A2A');
			}
		}
		if (doors.e) {
			drawUtility.rectangle(ctx, {
				x: size.x - (wallThickness + 1) - cameraPosition.x,
				y: size.y / 2 - halfDoorWidth - cameraPosition.y
			}, {
				x: wallThickness + 1,
				y: 2 * halfDoorWidth
			}, '#CCCCCC');

			if (isEnemyExist) {
				drawUtility.rectangle(ctx, {
					x: size.x - wallThickness / 2 - cameraPosition.x,
					y: size.y / 2 - halfDoorWidth - cameraPosition.y
				}, {
					x: wallThickness / 2,
					y: 2 * halfDoorWidth
				}, '#A52A2A');
			}
		}
		if (doors.w) {
			drawUtility.rectangle(ctx, {
				x: -cameraPosition.x,
				y: size.y / 2 - halfDoorWidth - cameraPosition.y
			}, {
				x: wallThickness + 1,
				y: 2 * halfDoorWidth
			}, '#CCCCCC');

			if (isEnemyExist) {
				drawUtility.rectangle(ctx, {
					x: -cameraPosition.x,
					y: size.y / 2 - halfDoorWidth - cameraPosition.y
				}, {
					x: wallThickness / 2,
					y: 2 * halfDoorWidth
				}, '#A52A2A');
			}
		}

		entities.forEach(function (entity) {
			entity.draw(ctx, cameraPosition);
			if (isPaused) {
				if (entity.type === types.item) {
					ctx.font = "30px Arial";
					ctx.fillStyle = "#FFFFFF";
					ctx.textAlign = "center";
					ctx.fillText(entity.data.item.name, entity.x + entity.bounds.radius - cameraPosition.x, entity.y - 70 - cameraPosition.y);

					ctx.font = "20px Arial";
					ctx.fillStyle = "#FFFFFF";
					ctx.textAlign = "center";
					ctx.fillText(entity.data.item.subtext, entity.x + entity.bounds.radius - cameraPosition.x, entity.y - 30 - cameraPosition.y);
				}
				else if (entity.type === types.enemy) {
					ctx.font = "30px Arial";
					ctx.fillStyle = "#BB8888";
					ctx.textAlign = "center";
					ctx.fillText(entity.data.enemyData.name, entity.x + entity.bounds.radius - cameraPosition.x, entity.y - 70 - cameraPosition.y);

					ctx.font = "20px Arial";
					ctx.fillStyle = "#BB8888";
					ctx.textAlign = "center";
					ctx.fillText(entity.data.enemyData.description, entity.x + entity.bounds.radius - cameraPosition.x, entity.y - 30 - cameraPosition.y);
				}
			}
		});

		surfaces.forEach(function (surface) {
			surface.draw(ctx, cameraPosition);
		});

		for (var i = 0; i < player.data.hp.amount; i++)
			drawUtility.circle(ctx, 10 + 24 * i, 10, 7, '#FF0000');

		if (player.data.ai.itemDisplayTimer) {
			var mostRecentItem = player.data.ai.items[player.data.ai.items.length - 1];
			ctx.font = "30px Arial";
			ctx.fillStyle = "#FFFFFF";
			ctx.textAlign = "center";
			ctx.fillText(mostRecentItem.name, viewPortSize.x / 2, 150);

			ctx.font = "20px Arial";
			ctx.fillStyle = "#FFFFFF";
			ctx.textAlign = "center";
			ctx.fillText(mostRecentItem.subtext, viewPortSize.x / 2, 200);
		}

		if (isPaused) {
			drawUtility.rectangle(ctx, {
				x: 0,
				y: 0
			}, {
				x: viewPortSize.x,
				y: viewPortSize.y
			}, 'rgba(0, 0, 0, 0.5)');
		}

		if (isYouWin) {
			ctx.font = "50px Arial";
			ctx.fillStyle = "#FFFFFF";
			ctx.textAlign = "center";
			ctx.fillText('YOU DID IT', viewPortSize.x / 2, 250);
		}

	}
}

module.exports = {
	create: function (data) {
		return new Room(data);
	}
};
