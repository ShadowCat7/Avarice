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

	var mapWidth = 160;
	var mapHeight = 100;

	drawUtility.rectangle(ctx, {
		x: canvas.width - mapWidth,
		y: 0
	}, {
		x: mapWidth,
		y: mapHeight
	}, '#998899');

	var mapStyle = false;

	var mapSizeX = roomMap.length;
	var mapSizeY = 1;

	for (var i = 0; i < roomMap.length; i++) {
		if (roomMap[i] && mapSizeY < roomMap[i].length)
			mapSizeY = roomMap[i].length;
	}

	if (mapStyle || mapSizeX < 7) {
		var xDivisions = 22;
		var xMargin = 4;
		var mapRoomSizeX = 18;
	}
	else {
		var xDivisions = Math.floor(mapWidth / (mapSizeX < 7 ? 7 : mapSizeX));
		var xMargin = Math.floor(xDivisions * 0.2) || 1;
		var mapRoomSizeX = xDivisions - xMargin;
	}

	if (mapStyle || mapSizeY < 7) {
		var yDivisions = 16;
		var yMargin = 4;
		var mapRoomSizeY = 12;
	}
	else {
		var yDivisions = Math.floor(mapHeight / (mapSizeY < 6 ? 6 : mapSizeY));
		var yMargin = Math.floor(yDivisions * 0.2) || 1;
		var mapRoomSizeY = yDivisions - yMargin;
	}

	for (var i = 0; i < roomMap.length; i++) {
		if (roomMap[i]) {
			for (var j = 0; j < roomMap[i].length; j++) {
				if (roomMap[i][j]) {
					var drawingRoom = roomMap[i][j];
					var x;
					var y;

					if (mapStyle) {
						x = canvas.width - mapWidth / 2 - mapRoomSizeX / 2 + xDivisions * (drawingRoom.mapPosition.x - currentRoom.mapPosition.x);
						y = mapHeight / 2 - mapRoomSizeY / 2 + yDivisions * (drawingRoom.mapPosition.y - currentRoom.mapPosition.y);
					}
					else {
						x = canvas.width - mapWidth + xDivisions * drawingRoom.mapPosition.x;
						if (mapSizeX < 7)
							x += (xMargin + xDivisions * (7 - mapSizeX)) / 2;
						y = yMargin + yDivisions * drawingRoom.mapPosition.y;
						if (mapSizeY < 6)
							y += (yMargin + yDivisions * (6 - mapSizeY)) / 2;
					}

					var roomColor = '#AAAAAA';
					if (drawingRoom.type === roomTypes.item)
						roomColor = '#FFFF00';
					if (drawingRoom.type === roomTypes.boss)
						roomColor = '#FF0000';
					if (drawingRoom === currentRoom)
						roomColor = '#FFFFFF';

					if (x >= canvas.width - mapWidth && y < mapHeight - mapRoomSizeY) {
						drawUtility.rectangle(ctx, {
							x: x,
							y: y
						}, {
							x: mapRoomSizeX,
							y: mapRoomSizeY
						}, roomColor);
					}
				}
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
					radius: enemyData.name === 'boss' ? 50 : 20
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
		type: roomType,
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
		x: 380,
		y: 280,
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

	var bossRoomX = Math.floor(Math.random() * 2 + 1) * (Math.random() > 0.5 ? -1 : 1) * 2;
	var bossRoomY = Math.floor(Math.random() * 2 + 1) * (Math.random() > 0.5 ? -1 : 1) * 2;
	var creatingRoomMap = [generateRoom(roomTypes.start, { x: 0, y: 0 })];
	var smallestX = bossRoomX < 0 ? bossRoomX : 0;
	var smallestY = bossRoomY < 0 ? bossRoomY : 0;
	var size = (Math.abs(bossRoomX) + Math.abs(bossRoomY)) / 2;
	var oldLocation;
	var location = { x: 0, y: 0 };
	var isItemRoomCreated = false;

	for (var i = 0; i <= size; i++) {
		var newLocationX = location.x;
		if (bossRoomX < location.x)
			newLocationX -= 2;
		else if (bossRoomX > location.x)
			newLocationX += 2;

		var newLocationY = location.y;
		if (bossRoomY < location.y)
			newLocationY -= 2;
		else if (bossRoomY > location.y)
			newLocationY += 2;

		if (newLocationX !== location.x && newLocationY !== location.y) {
			if (Math.random > 0.5)
				newLocationX = location.x;
			else
				newLocationY = location.y;
		}

		if (oldLocation) {
			creatingRoomMap.push(generateRoom(roomTypes.normal, {
				x: location.x - (location.x - oldLocation.x) / 2,
				y: location.y - (location.y - oldLocation.y) / 2
			}));

			creatingRoomMap.push(generateRoom(i === size ? roomTypes.boss : roomTypes.normal, {
				x: location.x,
				y: location.y
			}));
		}

		if (i !== size) {
			var createNewSideRoom = function (x, y) {
				var roomType = roomTypes.normal;
				if (!isItemRoomCreated && (i === size - 1 || Math.random() < 0.1))
					roomType = roomTypes.item;

				if (!isItemRoomCreated && i === size - 1 || Math.random() < 0.5) {
					creatingRoomMap.push(generateRoom(roomType, { x: x, y: y }));

					if (smallestX > x)
						smallestX = x;

					if (smallestY > y)
						smallestY = y;

					if (roomType === roomTypes.item)
						isItemRoomCreated = true;
				}
			}

			if (newLocationX <= location.x && (!oldLocation || oldLocation && oldLocation.x <= location.x))
				createNewSideRoom(location.x + 1, location.y);
			if (newLocationX >= location.x && (!oldLocation || oldLocation && oldLocation.x >= location.x))
				createNewSideRoom(location.x - 1, location.y);
			if (newLocationY <= location.y && (!oldLocation || oldLocation && oldLocation.y <= location.y))
				createNewSideRoom(location.x, location.y + 1);
			if (newLocationY >= location.y && (!oldLocation || oldLocation && oldLocation.y >= location.y))
				createNewSideRoom(location.x, location.y - 1);
		}

		oldLocation = location;

		location = { x: newLocationX, y: newLocationY };
	}

	roomMap = [];
	for (i = 0; i < creatingRoomMap.length; i++) {
		var room = creatingRoomMap[i];
		room.mapPosition = {
			x: room.mapPosition.x - smallestX,
			y: room.mapPosition.y - smallestY
		};
		if (!roomMap[room.mapPosition.x])
			roomMap[room.mapPosition.x] = [];

		roomMap[room.mapPosition.x][room.mapPosition.y] = room;
	}
	
	for (i = 0; i < roomMap.length; i++) {
		if (roomMap[i]) {
			for (j = 0; j < roomMap[i].length; j++) {
				if (roomMap[i][j]) {
					var doorLocations = {};
			
					if (i > 0 && roomMap[i - 1] && roomMap[i - 1][j])
						doorLocations.w = roomMap[i - 1][j];

					if (i < roomMap.length - 1 && roomMap[i + 1] && roomMap[i + 1][j])
						doorLocations.e = roomMap[i + 1][j];

					if (j > 0 && roomMap[i][j - 1])
						doorLocations.n = roomMap[i][j - 1];

					if (j < roomMap[i].length - 1 && roomMap[i][j + 1])
						doorLocations.s = roomMap[i][j + 1];

					roomMap[i][j].addWalls(doorLocations);
				}
			}
		}
	}

	currentRoom = roomMap[0 - smallestX][0 - smallestY];

	engine = engine.create(canvas, update, draw);
	engine.start();
});
