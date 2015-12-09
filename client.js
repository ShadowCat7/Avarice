var engine = require('./utility/engine');
var entityFactory = require('./utility/entity');
var surfaceFactory = require('./utility/surface');
var vector = require('./utility/vector');
var boundsFactory = require('./utility/bounds');
var linkedListFactory = require('./utility/linked-list');
var drawUtility = require('./utility/draw-utility');
var hpModuleFactory = require('./controller-modules/hp-module');
var movementModuleFactory = require('./controller-modules/movement-module');
var timerFactory = require('./utility/timer');
var playerAi = require('./ais/player-ai');
var followPlayerAi = require('./ais/follow-player-ai');
var types = require('./types');
var roomFactory = require('./room');
var itemGenerator = require('./items/items');
var roomTypes = require('./rooms/room-types');
var roomGenerator = require('./rooms/rooms');
var enemies = require('./enemies/enemies');

var canvas = null;
var fpsLabel = null;
var currentRoom = null;
var player = null;
var roomMap = null;

function update(buttonsPressed, elapsedTime) {
	if (currentRoom.moveNext) {
		var nextRoom = currentRoom.moveNext;
		currentRoom.moveNext = null;
		currentRoom = nextRoom;
		currentRoom.startRoom();
	}

	currentRoom.update(buttonsPressed, elapsedTime);
}

function draw() {
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	fpsLabel.innerHTML = Math.round(engine.fps);

	currentRoom.draw(ctx, {
		x: canvas.width,
		y: canvas.height
	});

	drawUtility.rectangle(ctx, {
		x: canvas.width - 160,
		y: 0
	}, {
		x: 160,
		y: 100
	}, '#998899');

	for (var i = 0; i < roomMap.length; i++) {
		for (var j = 0; j < roomMap[i].length; j++) {
			var drawingRoom = roomMap[i][j];
			var x = canvas.width - 89 + 22 * (drawingRoom.mapPosition.x - currentRoom.mapPosition.x);
			var y = 44 + 16 * (drawingRoom.mapPosition.y - currentRoom.mapPosition.y);

			if (x > canvas.width - 160 && y < 100) {
				drawUtility.rectangle(ctx, {
					x: x,
					y: y
				}, {
					x: 18,
					y: 12
				}, drawingRoom === currentRoom ? '#FFFFFF' : '#AAAAAA');
			}
		}
	}
}

function generateRoom(roomType, mapPosition) {
	var entities = linkedListFactory.create();
	var surfaces = linkedListFactory.create();

	var roomData = roomGenerator.getRoom(roomType);

	if (roomData.enemies) {
		for (var i = 0; i < roomData.enemies.length; i++) {
			var enemyData = roomData.enemies[i];
			var enemy = enemies.getEnemy(enemyData.name);
			entities.append(entityFactory.create({
				type: types.enemy,
				x: enemyData.position.x,
				y: enemyData.position.y,
				bounds: boundsFactory.createCircle({
					radius: 20
				}),
				stats: enemy.stats,
				causesCollisions: true,
				controllerData: {
					ai: enemy.ai,
					hpModule: hpModuleFactory.create({
						amount: enemy.stats.health,
						timer: timerFactory.create(0.1, true)
					}),
					movementModule: movementModuleFactory.create({
						maxSpeed: enemy.stats.speed
					})
				},
				data: {
					enemyData: {
						name: enemy.name,
						description: enemy.description
					}
				},
				drawFunc: function (entity, roomPosition, ctx) {
					drawUtility.circle(ctx, entity.x - roomPosition.x, entity.y - roomPosition.y, entity.bounds.radius, '#FFFF00');
				}
			}));
		}
	}

	//entities.append(entityFactory.create({
	//	type: types.neutral,
	//	x: 200,
	//	y: 370,
	//	bounds: boundsFactory.createCircle({
	//		radius: 100
	//	}),
	//	causesCollisions: true,
	//	drawFunc: function (entity, roomPosition, ctx) {
	//		drawUtility.circle(ctx, entity.x - roomPosition.x, entity.y - roomPosition.y, entity.bounds.radius, '#00FF00');
	//	}
	//}));

	var roomEnteredCallback = null;

	if (roomType === roomTypes.item) {
		var item = entityFactory.create({
			type: types.item,
			x: roomData.size.x / 2 - 20,
			y: roomData.size.y / 2 - 20,
			bounds: boundsFactory.createCircle({
				radius: 20
			}),
			causesCollisions: true,
			drawFunc: function (entity, roomPosition, ctx) {
				drawUtility.circle(ctx, entity.x - roomPosition.x, entity.y - roomPosition.y, entity.bounds.radius, '#FFFFFF');
			}
		});

		entities.append(item);

		roomEnteredCallback = function () {
			if (!item.data || !item.data.item)
				item.data.item = itemGenerator.getItem();
		};
	}

	return roomFactory.create({
		size: roomData.size,
		mapPosition: mapPosition,
		entities: entities,
		surfaces: surfaces,
		player: player,
		roomEnteredCallback: roomEnteredCallback
	});
}

document.addEventListener('DOMContentLoaded', function () {
	canvas = document.getElementById('game');
	fpsLabel = document.getElementById('fps');

	player = entityFactory.create({
		type: types.player,
		x: 150,
		y: 150,
		bounds: boundsFactory.createCircle({
			radius: 20
		}),
		causesCollisions: true,
		controllerData: {
			ai: playerAi,
			hpModule: hpModuleFactory.create({
				amount: 4,
				timer: timerFactory.create(0.5, true)
			}),
			movementModule: movementModuleFactory.create({
				maxSpeed: 8
			})
		},
		drawFunc: function (entity, roomPosition, ctx) {
			drawUtility.circle(ctx, entity.x - roomPosition.x, entity.y - roomPosition.y, entity.bounds.radius, '#00FF00');
		}
	});

	roomMap = [];
	for (var i = 0; i < 6; i++) {
		var roomType = roomTypes.normal;
		if (i === 0)
			roomType = roomTypes.start;
		if (i === 2)
			roomType = roomTypes.item;

		roomMap.push([generateRoom(roomType, { x: i, y: 0 })]);
	}
	
	for (i = 0; i < roomMap.length; i++) {
		for (j = 0; j < roomMap[i].length; j++) {
			var doorLocations = {};
			
			if (i > 0 && roomMap[i - 1][j])
				doorLocations.w = roomMap[i - 1][j];

			if (i < roomMap.length - 1 && roomMap[i + 1][j])
				doorLocations.e = roomMap[i + 1][j];

			if (j > 0 && roomMap[i][j - 1])
				doorLocations.n = roomMap[i][j - 1];

			if (j < roomMap[i].length - 1 && roomMap[i][j + 1])
				doorLocations.s = roomMap[i][j + 1];

			roomMap[i][j].addWalls(doorLocations);
		}
	}

	currentRoom = roomMap[0][0];

	engine = engine.create(canvas, update, draw);
	engine.start();
});
