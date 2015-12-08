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

var canvas = null;
var fpsLabel = null;
var currentRoom = null;
var player = null;

function update(buttonsPressed, elapsedTime) {
	if (currentRoom.moveNext) {
		currentRoom = currentRoom.moveNext;
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
}

function generateRoom(doors) {
	var entities = linkedListFactory.create();
	var surfaces = linkedListFactory.create();

	entities.append(entityFactory.create({
		type: types.neutral,
		x: 200,
		y: 370,
		bounds: boundsFactory.createCircle({
			radius: 100
		}),
		causesCollisions: true,
		drawFunc: function (entity, roomPosition, ctx) {
			drawUtility.circle(ctx, entity.x - roomPosition.x, entity.y - roomPosition.y, entity.bounds.radius, '#00FF00');
		}
	}));

	entities.append(entityFactory.create({
		type: types.enemy,
		x: 700,
		y: 700,
		bounds: boundsFactory.createCircle({
			radius: 20
		}),
		causesCollisions: true,
		controllerData: {
			ai: followPlayerAi,
			hpModule: hpModuleFactory.create({
				amount: 3,
				timer: timerFactory.create(0.4, true)
			}),
			movementModule: movementModuleFactory.create({
				maxSpeed: 3
			})
		},
		drawFunc: function (entity, roomPosition, ctx) {
			drawUtility.circle(ctx, entity.x - roomPosition.x, entity.y - roomPosition.y, entity.bounds.radius, '#FFFF00');
		}
	}));

	return roomFactory.create({
		size: {
			x: 1000,
			y: 1000
		},
		doors: doors,
		entities: entities,
		surfaces: surfaces,
		player: player
	});
}

document.addEventListener('DOMContentLoaded', function () {
	canvas = document.getElementById('game');
	fpsLabel = document.getElementById('fps');

	player = entityFactory.create({
		type: types.player,
		x: 1,
		y: 50,
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

	currentRoom = generateRoom({ e: generateRoom({}) });

	engine = engine.create(canvas, update, draw);
	engine.start();
});
