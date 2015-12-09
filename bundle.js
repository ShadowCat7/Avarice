(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"../utility/vector":25}],2:[function(require,module,exports){
var vector = require('../utility/vector');
var controller = require('../controller');
var drawUtility = require('../utility/draw-utility');
var entityFactory = require('../utility/entity');
var boundsFactory = require('../utility/bounds');
var timerFactory = require('../utility/timer');
var hpModuleFactory = require('../controller-modules/hp-module');
var movementModuleFactory = require('../controller-modules/movement-module');
var types = require('../types');
var statsFactory = require('../stats');

module.exports = {
	init: function (entity) {
		entity.data.ai = {
			rateOfFireTimer: timerFactory.create(entity.stats.rateOfFire, true)
		};
	},
	update: function (updateData, entity) {
		var acceleration = vector.create({
			x: updateData.player.x + updateData.player.bounds.radius - entity.x - entity.bounds.radius,
			y: updateData.player.y + updateData.player.bounds.radius - entity.y - entity.bounds.radius
		});

		if (acceleration.magnitude > 200) {
			acceleration = vector.create({
				magnitude: 1,
				direction: acceleration.direction
			});
		}
		else {
			if (entity.data.ai.rateOfFireTimer.isSet()) {
				var bulletPosition = vector.create({
					magnitude: entity.bounds.radius,
					direction: acceleration.direction
				});

				var bullet = entityFactory.create({
					type: types.enemyBullet,
					x: entity.x + entity.bounds.radius + bulletPosition.x - 10,
					y: entity.y + entity.bounds.radius + bulletPosition.y - 10,
					maxSpeed: 10,
					bounds: boundsFactory.createCircle({
						radius: 10
					}),
					controllerData: {
						hpModule: hpModuleFactory.create({
							amount: 1,
							timer: timerFactory.create(0.1, true)
						}),
						movementModule: movementModuleFactory.create({
							velocity: vector.create({
								magnitude: entity.stats.bulletSpeed,
								direction: acceleration.direction
							})
						})
					},
					stats: statsFactory.create({
						health: 1,
						contactDamage: entity.stats.bulletDamage,
						speed: entity.stats.bulletSpeed
					}),
					drawFunc: function (entity, roomPosition, ctx) {
						drawUtility.circle(ctx, entity.x - roomPosition.x, entity.y - roomPosition.y, entity.bounds.radius, '#FF0000');
					}
				});

				updateData.entities.append(bullet);

				entity.data.ai.rateOfFireTimer.reset();
			}

			acceleration = vector.create({
				x: 0,
				y: 0
			});
		}

		if (!entity.data.ai.rateOfFireTimer.isSet())
			entity.data.ai.rateOfFireTimer.update(updateData.elapsedTime);

		return {
			elapsedTime: updateData.elapsedTime,
			entities: updateData.entities,
			surfaces: updateData.surfaces,
			acceleration: acceleration
		};
	}
};

},{"../controller":7,"../controller-modules/hp-module":5,"../controller-modules/movement-module":6,"../stats":15,"../types":16,"../utility/bounds":17,"../utility/draw-utility":18,"../utility/entity":20,"../utility/timer":24,"../utility/vector":25}],3:[function(require,module,exports){
var vector = require('../utility/vector');
var boundsFactory = require('../utility/bounds');
var entityFactory = require('../utility/entity');
var timerFactory = require('../utility/timer');
var hpModuleFactory = require('../controller-modules/hp-module');
var movementModuleFactory = require('../controller-modules/movement-module');
var types = require('../types');
var drawUtility = require('../utility/draw-utility');
var statsFactory = require('../stats');

module.exports = {
	init: function (player) {
		player.stats = statsFactory.create({
			health: 4,
			contactDamage: 0,
			rateOfFire: 0.5,
			bulletSpeed: 12,
			bulletDamage: 1,
			speed: 8
		});

		player.data.ai = {
			rateOfFireTimer: timerFactory.create(player.stats.rateOfFire, true),
			items: [],
			takeItem: function (item) {
				player.data.ai.items.push(item);
				player.stats = statsFactory.add(player.stats, item.stats);
				player.data.ai.itemDisplayTimer = timerFactory.create(3, false);
				
				if (item.stats.rateOfFire) {
					player.data.ai.rateOfFireTimer = timerFactory.create(player.stats.rateOfFire, false);
				}
			}
		};
	},
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

		if (player.data.ai.rateOfFireTimer.isSet()) {
			var isBulletCreated = false;

			var movementModuleOptions = {
				maxSpeed: player.stats.bulletSpeed
			};

			var bulletOptions = {
				type: types.playerBullet,
				x: player.x + player.bounds.radius - 10,
				y: player.y + player.bounds.radius - 10,
				bounds: boundsFactory.createCircle({
					radius: 10
				}),
				controllerData: {
					hpModule: hpModuleFactory.create({
						amount: 1,
						timer: timerFactory.create(0.1, true)
					})
				},
				drawFunc: function (entity, roomPosition, ctx) {
					drawUtility.circle(ctx, entity.x - roomPosition.x, entity.y - roomPosition.y, entity.bounds.radius, '#00FF00');
				}
			};

			// Up - 38
			if (updateData.buttonsPressed[38]) {
				movementModuleOptions.velocity = vector.create({
					x: 0,
					y: -player.stats.bulletSpeed
				});
				bulletOptions.y -= player.bounds.radius + 10;
				isBulletCreated = true;
			}

			// Down - 40
			if (updateData.buttonsPressed[40]) {
				movementModuleOptions.velocity = vector.create({
					x: 0,
					y: player.stats.bulletSpeed
				});
				bulletOptions.y += player.bounds.radius + 10;
				isBulletCreated = true;
			}

			// Left - 37
			if (updateData.buttonsPressed[37]) {
				movementModuleOptions.velocity = vector.create({
					x: -player.stats.bulletSpeed,
					y: 0
				});
				bulletOptions.x -= player.bounds.radius + 10;
				isBulletCreated = true;
			}

			// Right - 39
			if (updateData.buttonsPressed[39]) {
				movementModuleOptions.velocity = vector.create({
					x: player.stats.bulletSpeed,
					y: 0
				});
				bulletOptions.x += player.bounds.radius + 10;
				isBulletCreated = true;
			}

			if (isBulletCreated) {
				bulletOptions.controllerData.movementModule = movementModuleFactory.create(movementModuleOptions);
				bulletOptions.stats = statsFactory.create({
					health: 1,
					contactDamage: player.stats.bulletDamage,
					speed: player.stats.bulletSpeed
				});
				updateData.entities.append(entityFactory.create(bulletOptions));
				player.data.ai.rateOfFireTimer.reset();
			}
		}
		else {
			player.data.ai.rateOfFireTimer.update(updateData.elapsedTime);
		}

		if (player.data.ai.itemDisplayTimer) {
			if (player.data.ai.itemDisplayTimer.isSet())
				player.data.ai.itemDisplayTimer = null;
			else
				player.data.ai.itemDisplayTimer.update(updateData.elapsedTime);
		}

		return {
			elapsedTime: updateData.elapsedTime,
			entities: updateData.entities,
			surfaces: updateData.surfaces,
			acceleration: acceleration
		};
	}
};

},{"../controller-modules/hp-module":5,"../controller-modules/movement-module":6,"../stats":15,"../types":16,"../utility/bounds":17,"../utility/draw-utility":18,"../utility/entity":20,"../utility/timer":24,"../utility/vector":25}],4:[function(require,module,exports){
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

},{"./ais/follow-player-ai":1,"./ais/player-ai":3,"./controller-modules/hp-module":5,"./controller-modules/movement-module":6,"./enemies/enemies":8,"./items/items":9,"./room":10,"./rooms/room-types":11,"./rooms/rooms":12,"./types":16,"./utility/bounds":17,"./utility/draw-utility":18,"./utility/engine":19,"./utility/entity":20,"./utility/linked-list":21,"./utility/surface":23,"./utility/timer":24,"./utility/vector":25}],5:[function(require,module,exports){
function create(data) {
	return {
		init: function (entity) {
			entity.data.hp = {
				amount: entity.stats ? entity.stats.health : data.amount,
				timer: data.timer
			};
		},
		update: function (updateData, entity) {
			entity.data.hp.timer.update(updateData.elapsedTime);
		},
		damages: function (entity, other, rule) {
			if (entity.data.hp.timer.isSet()) {
				entity.data.hp.timer.reset();
				entity.data.hp.amount -= other.stats ? other.stats.contactDamage : 1;
			}
		}
	};
}

module.exports = {
	create: create
};

},{}],6:[function(require,module,exports){
var vector = require('../utility/vector');
var rules = require('../rules');

function getMaxSpeed(entity) {
	return entity.stats ? entity.stats.speed : entity.data.movement.maxSpeed;
}

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
				else if (absoluteVelocityMagnitude <= 1) {
					entity.data.movement.velocity = vector.create({
						magnitude: 0,
						direction: entity.data.movement.velocity.direction
					});
				}
			}

			var maxSpeed = getMaxSpeed(entity);

			if (entity.data.movement.velocity.magnitude > maxSpeed) {
				entity.data.movement.velocity = vector.create({
					magnitude: maxSpeed,
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

},{"../rules":13,"../utility/vector":25}],7:[function(require,module,exports){
var vector = require('./utility/vector');
var drawUtility = require('./utility/draw-utility');
var rules = require('./rules');

function Controller(entity, data) {
	var self = this;

	if (data) {
		var hpModule = data.hpModule;
		var movementModule = data.movementModule;
		var ai = data.ai;
	}

	self.update = function (updateData) {
		if (hpModule)
			hpModule.update(updateData, entity);

		if (ai)
			updateData = ai.update(updateData, entity);

		if (movementModule)
			movementModule.update(updateData, entity);
	};

	self.collisionOccurred = function (other, rule) {
		if (!rule) {
			rule = rules.collision(entity.type, other.type);

			if (!rule)
				return;
		}

		if (rule.damages && hpModule)
			hpModule.damages(entity, other, rule);

		if (rule.callback)
			rule.callback(entity, other);
	};

	self.collision = function (other, rule) {
		self.collisionOccurred(other, rule);
		
		if (other.controller)
			other.controller.collisionOccurred(entity);
	};

	if (ai)
		ai.init(entity);
	if (hpModule)
		hpModule.init(entity);
	if (movementModule)
		movementModule.init(entity);
}

module.exports = {
	create: function (entity, data) {
		return new Controller(entity, data || {});
	}
};

},{"./rules":13,"./utility/draw-utility":18,"./utility/vector":25}],8:[function(require,module,exports){
var followPlayerAi = require('../ais/follow-player-ai');
var followStopShootAi = require('../ais/follow-stop-shoot-ai');

var enemies = {
	blarg: new Enemy('Blarg', 'Chases you', followPlayerAi, {
		contactDamage: 1,
		health: 3,
		speed: 3
	}),
	hunter: new Enemy('Blarg', 'Chases and shoots you', followStopShootAi, {
		contactDamage: 1,
		health: 3,
		speed: 2,
		rateOfFire: 1,
		bulletSpeed: 4,
		bulletDamage: 1
	})
};

function Enemy(name, description, ai, stats) {
	var self = this;

	self.name = name;
	self.description = description;
	self.ai = ai;
	self.stats = stats;
}

module.exports = {
	getEnemy: function (name) {
		return enemies[name];
	},
	createEnemy: function (data) {
		enemies[data.name] = new Enemy(data.name, data.description, data.ai, data.stats);
	}
};

},{"../ais/follow-player-ai":1,"../ais/follow-stop-shoot-ai":2}],9:[function(require,module,exports){
var items = [
	item('Adderol', 'Rate of fire up, speed up', {
		rateOfFire: -0.1,
		speed: 2
	}),
	item('Sniper Rifle', 'Rate of fire down, bullet speed up', {
		rateOfFire: 0.2,
		bulletSpeed: 10
	})
];

function item(name, subtext, stats) {
	return {
		name: name,
		subtext: subtext,
		stats: stats
	};
}

module.exports = {
	getItem() {
		if (items.length) {
			var index = Math.floor(Math.random() * items.length);
			return items.splice(index, 1)[0];
		}
		
		return item('Breakfast', 'Pool is empty', {});
	}
};

},{}],10:[function(require,module,exports){
var surfaceFactory = require('./utility/surface');
var entityFactory = require('./utility/entity');
var boundsFactory = require('./utility/bounds');
var types = require('./types');
var drawUtility = require('./utility/draw-utility');
var vector = require('./utility/vector');

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

	var doors = null;

	var entities = data.entities;
	var surfaces = data.surfaces;
	var player = data.player;

	var isPaused = false;
	var wasPausedLastTick = false;

	self.moveNext = false;

	entities.insert(player, 0);

	var roomEnteredCallback = data.roomEnteredCallback;

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

		if (roomEnteredCallback)
			roomEnteredCallback();
	};

	self.addWalls = function(doorLocations) {
		doors = doorLocations;

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
				x: size.x / 2 - 60,
				y: 100,
				x2: size.x / 2 - 60,
				y2: 0
			}));

			surfaces.append(surfaceFactory.create({
				type: types.wall,
				x: size.x / 2 + 60,
				y: 0,
				x2: size.x / 2 + 60,
				y2: 100
			}));

			surfaces.append(surfaceFactory.create({
				type: types.wall,
				x: size.x / 2 + 60,
				y: 100,
				x2: size.x - 100,
				y2: 100
			}));

			surfaces.append(surfaceFactory.create({
				type: types.openDoor,
				x: size.x / 2 - 60,
				y: 0,
				x2: size.x / 2 + 60,
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
				x: size.x,
				y: size.y / 2 + 60,
				x2: size.x - 100,
				y2: size.y / 2 + 60
			}));

			surfaces.append(surfaceFactory.create({
				type: types.wall,
				x: size.x - 100,
				y: size.y / 2 + 60,
				x2: size.x - 100,
				y2: size.y - 100
			}));

			surfaces.append(surfaceFactory.create({
				type: types.openDoor,
				x: size.x,
				y: size.y / 2 - 60,
				x2: size.x,
				y2: size.y / 2 + 60,
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
				x: size.x / 2 + 60,
				y: size.y - 100,
				x2: size.x / 2 + 60,
				y2: size.y
			}));

			surfaces.append(surfaceFactory.create({
				type: types.wall,
				x: size.x / 2 - 60,
				y: size.y,
				x2: size.x / 2 - 60,
				y2: size.y - 100
			}));

			surfaces.append(surfaceFactory.create({
				type: types.wall,
				x: size.x / 2 - 60,
				y: size.y - 100,
				x2: 100,
				y2: size.y - 100
			}));

			surfaces.append(surfaceFactory.create({
				type: types.openDoor,
				x: size.x / 2 + 60,
				y: size.y,
				x2: size.x / 2 - 60,
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
				y: size.y / 2 + 60,
				x2: 0,
				y2: size.y / 2 + 60
			}));

			surfaces.append(surfaceFactory.create({
				type: types.wall,
				x: 0,
				y: size.y / 2 - 60,
				x2: 100,
				y2: size.y / 2 - 60
			}));

			surfaces.append(surfaceFactory.create({
				type: types.wall,
				x: 100,
				y: size.y / 2 - 60,
				x2: 100,
				y2: 100
			}));

			surfaces.append(surfaceFactory.create({
				type: types.openDoor,
				x: 0,
				y: size.y / 2 + 60,
				x2: 0,
				y2: size.y / 2 - 60,
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
				x: 100,
				y: size.y - 100,
				x2: 100,
				y2: 100
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

			entities.forEach(function (entity, index) {
				entity.update(updateData);
			});

			entities.forEach(function (entity, index) {
				if (entity.data.remove || entity.data.hp && entity.data.hp.amount <= 0)
					removals.push(index);
			});

			for (var i = 0; i < removals.length; i++)
				entities.removeAt(removals[i] - i); // (- i) on purpose

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
			x: 100 - cameraPosition.x,
			y: 100 - cameraPosition.y
		}, {
			x: size.x - 200,
			y: size.y - 200
		}, '#CCCCCC');

		if (doors.n) {
			drawUtility.rectangle(ctx, {
				x: size.x / 2 - 60 - cameraPosition.x,
				y: -cameraPosition.y
			}, {
				x: 120,
				y: 110
			}, '#CCCCCC');
		}
		if (doors.s) {
			drawUtility.rectangle(ctx, {
				x: size.x / 2 - 60 - cameraPosition.x,
				y: size.y - 110 - cameraPosition.y
			}, {
				x: 120,
				y: 110
			}, '#CCCCCC');
		}
		if (doors.e) {
			drawUtility.rectangle(ctx, {
				x: size.x - 110 - cameraPosition.x,
				y: size.y / 2 - 60 - cameraPosition.y
			}, {
				x: 110,
				y: 120
			}, '#CCCCCC');
		}
		if (doors.w) {
			drawUtility.rectangle(ctx, {
				x: -cameraPosition.x,
				y: size.y / 2 - 60 - cameraPosition.y
			}, {
				x: 110,
				y: 120
			}, '#CCCCCC');
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
	}
}

module.exports = {
	create: function (data) {
		return new Room(data);
	}
};

},{"./types":16,"./utility/bounds":17,"./utility/draw-utility":18,"./utility/entity":20,"./utility/surface":23,"./utility/vector":25}],11:[function(require,module,exports){
module.exports = {
	normal: 'normal',
	item: 'item',
	boss: 'boss',
	start: 'start'
};

},{}],12:[function(require,module,exports){
var roomTypes = require('./room-types');
var enemies = require('../enemies/enemies');

var rooms = {};
rooms[roomTypes.normal] = [
	createRoom(800, 600, null, [
		//createEnemy('blarg', 700, 700),
		createEnemy('hunter', 380, 280)
	])
];

rooms[roomTypes.item] = [
	createRoom(800, 600)
];

rooms[roomTypes.boss] = [
	createRoom(1000, 1000)
];

var startingRoom = createRoom(800, 600);

function createRoom(width, height, objects, enemies) {
	return {
		size: {
			x: width,
			y: height
		},
		objects: objects,
		enemies: enemies
	};
}

function createObject(x, y, radius) {
	return {
		position: {
			x: x,
			y: y
		},
		radius: radius
	};
}

function createEnemy(name, x, y) {
	return {
		name: name,
		position: {
			x: x,
			y: y
		}
	};
}

module.exports = {
	getRoom: function (roomType) {
		if (roomType === roomTypes.start)
			return startingRoom;

		var roomList = rooms[roomType];
		return roomList[Math.floor(Math.random() * roomList.length)];
	}
};

},{"../enemies/enemies":8,"./room-types":11}],13:[function(require,module,exports){
var collisionRules = require('./rules/collisions');

module.exports = {
	collision: function (type1, type2) {
		var ruleSet = collisionRules.rules[type1];
		if (!ruleSet)
			return null;

		var rule = ruleSet[type2];

		if (!rule)
			return null;

		return rule.data;
	}
};

},{"./rules/collisions":14}],14:[function(require,module,exports){
var types = require('../types');
var ruleFactory = require('../utility/rule');

var rules = {};

var enemyRules = {};
rules[types.enemy] = enemyRules;
enemyRules[types.neutral] = ruleFactory.create({
	canCollide: true,
	damages: false
});

enemyRules[types.enemy] = ruleFactory.create({
	canCollide: true,
	damages: false
});

enemyRules[types.enemyBullet] = ruleFactory.create({
	canCollide: false,
	damages: false
});

enemyRules[types.player] = ruleFactory.create({
	canCollide: true,
	damages: false
});

enemyRules[types.playerBullet] = ruleFactory.create({
	canCollide: false,
	damages: true
});

enemyRules[types.wall] = ruleFactory.create({
	canCollide: true,
	damages: false
});

enemyRules[types.openDoor] = ruleFactory.create({
	canCollide: true,
	damages: false
});

var enemyBulletRules = {};
rules[types.enemyBullet] = enemyBulletRules;
enemyBulletRules[types.neutral] = ruleFactory.create({
	canCollide: true,
	damages: true
});

enemyBulletRules[types.enemy] = ruleFactory.create({
	canCollide: false,
	damages: false
});

enemyBulletRules[types.enemyBullet] = ruleFactory.create({
	canCollide: false,
	damages: false
});

enemyBulletRules[types.player] = ruleFactory.create({
	canCollide: false,
	damages: true,
	callback: function (enemyBullet, player) {
		enemyBullet.data.hp.amount = 0;
	}
});

enemyBulletRules[types.playerBullet] = ruleFactory.create({
	canCollide: false,
	damages: false
});

enemyBulletRules[types.wall] = ruleFactory.create({
	canCollide: false,
	damages: true
});

enemyBulletRules[types.openDoor] = ruleFactory.create({
	canCollide: false,
	damages: true
});

var playerRules = {};
rules[types.player] = playerRules;
playerRules[types.neutral] = ruleFactory.create({
	canCollide: true,
	damages: false
});

playerRules[types.enemy] = ruleFactory.create({
	canCollide: true,
	damages: true
});

playerRules[types.enemyBullet] = ruleFactory.create({
	canCollide: false,
	damages: true
});

playerRules[types.playerBullet] = ruleFactory.create({
	canCollide: false,
	damages: false
});

playerRules[types.wall] = ruleFactory.create({
	canCollide: true,
	damages: false
});

playerRules[types.openDoor] = ruleFactory.create({
	canCollide: false,
	damages: false,
	callback: function (player, openDoor) {
		openDoor.data.nextRoomTrigger(openDoor);
	}
});

playerRules[types.item] = ruleFactory.create({
	canCollide: false,
	damages: false,
	callback: function (player, item) {
		player.data.ai.takeItem(item.data.item);
		item.data.remove = true;
	}
});

var playerBulletRules = {};
rules[types.playerBullet] = playerBulletRules;
playerBulletRules[types.neutral] = ruleFactory.create({
	canCollide: false,
	damages: true
});

playerBulletRules[types.enemy] = ruleFactory.create({
	canCollide: false,
	damages: true
});

playerBulletRules[types.enemyBullet] = ruleFactory.create({
	canCollide: false,
	damages: false
});

playerBulletRules[types.player] = ruleFactory.create({
	canCollide: false,
	damages: false
});

playerBulletRules[types.playerBullet] = ruleFactory.create({
	canCollide: false,
	damages: false
});

playerBulletRules[types.wall] = ruleFactory.create({
	canCollide: false,
	damages: true
});

playerBulletRules[types.openDoor] = ruleFactory.create({
	canCollide: false,
	damages: true
});

module.exports = {
	rules: rules
};

},{"../types":16,"../utility/rule":22}],15:[function(require,module,exports){
function createStats (data) {
	return {
		health: data.health,
		contactDamage: data.contactDamage,
		rateOfFire: data.rateOfFire,
		bulletSpeed: data.bulletSpeed,
		bulletDamage: data.bulletDamage,
		speed: data.speed
	};
}

function addStats(stats1, stats2) {
	return {
		health: stats1.health + (stats2.health || 0),
		contactDamage: stats1.contactDamage + (stats2.contactDamage || 0),
		rateOfFire: stats1.rateOfFire + (stats2.rateOfFire || 0),
		bulletSpeed: stats1.bulletSpeed + (stats2.bulletSpeed || 0),
		bulletDamage: stats1.bulletDamage + (stats2.bulletDamage || 0),
		speed: stats1.speed + (stats2.speed || 0)
	};
}

module.exports = {
	create: createStats,
	add: addStats
};

},{}],16:[function(require,module,exports){
module.exports = {
	neutral: 'neutral',
	enemy: 'enemy',
	enemyBullet: 'enemy-bullet',
	player: 'player',
	playerBullet: 'player-bullet',
	wall: 'wall',
	openDoor: 'open-door',
	item: 'item'
};

},{}],17:[function(require,module,exports){
var vector = require('./vector');

function BoundingCircle(data) {
	var self = this;
	self.radius = data.radius;

	self.isInside = function(thisPosition, otherPosition) {
		var diff = vector.create({
			x: otherPosition.x - thisPosition.x,
			y: otherPosition.y - thisPosition.y
		});

		return diff.magnitude < self.radius ? true : false;
	};

	self.isColliding = function (thisPosition, other, otherPosition) {
		var diff = vector.create({
			x: otherPosition.x + other.radius - (thisPosition.x + self.radius),
			y: otherPosition.y + other.radius - (thisPosition.y + self.radius)
		});

		var distance = diff.magnitude - (self.radius + other.radius);

		if (distance > 0)
			return 0;

		return vector.create({
			magnitude: distance,
			direction: diff.direction
		});
	};
}

function BoundingRectangle(data) {
	var self = this;
	self.height = data.height;
	self.width = data.width;

	self.isInside = function(thisPosition, otherPosition) {
		if (otherPosition.x > thisPosition.x
			&& otherPosition.x < thisPosition.x + self.width
			&& otherPosition.y > thisPosition.y
			&& otherPosition.y < thisPosition.y + self.height) {
			return true;
		}

		return false;
	};

	self.isColliding = function (thisPosition, other, otherPosition) {
		if (otherPosition.x > thisPosition.x && otherPosition.x < thisPosition.x + self.width) {
			if (otherPosition.y > thisPosition.y && otherPosition.y < thisPosition.y + self.height)
				return true;
			if (otherPosition.y + other.height > thisPosition.y && otherPosition.y + other.height < thisPosition.y + self.height)
				return true;
		}
		
		if (otherPosition.x + other.width > thisPosition.x && otherPosition.x + other.width < thisPosition.x + self.width) {
			if (otherPosition.y > thisPosition.y && otherPosition.y < thisPosition.y + self.height)
				return true;
			if (otherPosition.y + other.height > thisPosition.y && otherPosition.y + other.height < thisPosition.y + self.height)
				return true;
		}

		return false;
	};
}

module.exports = {
	createCircle: function (data) {
		return new BoundingCircle(data);
	},
	createRectangle: function (data) {
		return new BoundingRectangle(data);
	}
};

},{"./vector":25}],18:[function(require,module,exports){
module.exports = {
	circle: function (ctx, x, y, radius, color) {
		ctx.beginPath();
		ctx.arc(x + radius, y + radius, radius, 0, 2 * Math.PI);
		ctx.fillStyle = color;
		ctx.fill();
	},
	rectangle: function (ctx, position, size, color) {
		var path = new Path2D();
		path.moveTo(position.x, position.y);
		path.lineTo(position.x + size.x, position.y);
		path.lineTo(position.x + size.x, position.y + size.y);
		path.lineTo(position.x, position.y + size.y);
		ctx.fillStyle = color;
		ctx.fill(path);
	}
};

},{}],19:[function(require,module,exports){
var epsilon = 0.00000001;
var targetFps = 60;
var targetSpf = 1 / targetFps;
var fpsSmoothness = 0.9;
var fpsOneFrameWeight = 1.0 - fpsSmoothness;
var minFps = 20;
var maxSpf = 1 / minFps;

function Engine(canvas, updateFunc, drawFunc) {
	var self = this;
	var animationFrameId = null;
	var timeoutId = null;
	var buttonsPressed = new Array(222);

	self.fps = targetFps;

	function mainLoop() {
		var previousUpdate = new Date().getTime();
		var previousDraw = new Date().getTime();

		function update() {
			var currentTime = new Date().getTime();
			var timeSinceLastUpdate = (currentTime - previousUpdate) / 1000;
			previousUpdate = currentTime;

			if (timeSinceLastUpdate < epsilon)
				timeSinceLastUpdate = epsilon;
			else if (timeSinceLastUpdate > maxSpf)
				timeSinceLastUpdate = maxSpf;

			setTimeout(function () {
				updateFunc(buttonsPressed, timeSinceLastUpdate);
			}, 0);

			animationFrameId = requestAnimationFrame(draw, canvas);
		}

		function draw() {
			var currentTime = new Date().getTime();
			var timeSinceLastDraw = (currentTime - previousDraw) / 1000;
			var fps = 1 / timeSinceLastDraw;
			previousDraw = currentTime;

			self.fps = self.fps * fpsSmoothness + fps * fpsOneFrameWeight;

			setTimeout(drawFunc, 0);

			timeoutId = setTimeout(update, 0);
		}

		update();
	}

	self.start = function () {
		mainLoop();
	};

	self.stop = function () {
		cancelAnimationFrame(animationFrameId);
		clearTimeout(timeoutId);
	}

	document.addEventListener('keydown', function (e) {
		e.stopPropagation();
		//console.log(e.keyCode);
		buttonsPressed[e.keyCode] = true;
	});

	document.addEventListener('keyup', function (e) {
		e.stopPropagation();
		buttonsPressed[e.keyCode] = false;
	});
}

module.exports = {
	create: function (canvas, updateFunc, drawFunc) {
		canvas = canvas;
		return new Engine(canvas, updateFunc, drawFunc);
	}
};

},{}],20:[function(require,module,exports){
var vector = require('./vector');
var controllerFactory = require('../controller');

function Entity(data) {
	var self = this;
	var drawFunc = data.drawFunc;

	self.x = data.x;
	self.y = data.y;
	self.bounds = data.bounds;
	
	self.causesCollisions = data.causesCollisions;

	self.type = data.type;

	self.data = data.data || {};

	self.stats = data.stats;

	self.controller = controllerFactory.create(self, data.controllerData);

	self.draw = function (ctx, roomPosition) {
		if (drawFunc)
			drawFunc(self, roomPosition, ctx);
		else if (self.controller && self.controller.draw)
			self.controller.draw(self, roomPosition, ctx);
	};

	self.update = function (updateData) {
		self.controller.update(updateData);
	};
}

module.exports = {
	create: function (data) {
		return new Entity(data);
	}
};

},{"../controller":7,"./vector":25}],21:[function(require,module,exports){
function Node(data) {
	var self = this;
	
	self.data = data;
	self.left = null;
	self.right = null;
}

function pointNodes(left, right) {
	left.right = right;
	right.left = left;
}

function LinkedList() {
	var self = this;
	var root = null;
	var end = null;

	self.count = 0;

	self.append = function (item) {
		if (!end) {
			root = new Node(item);
			end = root;
		}
		else {
			var newEnd = new Node(item);
			pointNodes(end, newEnd);
			end = newEnd;
		}

		self.count++;
	};

	self.insert = function (item, index) {
		if (index < 0)
			index = 0;
		
		if (!root) {
			root = new Node(item);
			end = root;
		}
		else if (index === 0) {
			var newRoot = new Node(item);
			pointNodes(newRoot, root);
			root = newRoot;
		}
		else if (index >= self.count) {
			var newEnd = new Node(item);
			pointNodes(end, newEnd);
			end = newEnd;
		}
		else if (index < self.count / 2) {
			var currentNode = root;

			for (var i = 0; i < index; i++)
				currentNode = currentNode.right;

			var newLeft = new Node(item);
			pointNodes(currentNode.left, newLeft);
			pointNodes(newLeft, currentNode);
		}
		else {
			var currentNode = end;

			for (var i = self.count - 1; i > index; i--)
				currentNode = currentNode.left;

			var newLeft = new Node(item);
			pointNodes(currentNode.left, newLeft);
			pointNodes(newLeft, currentNode);
		}

		self.count++;
	};

	self.remove = function (data) {
		if (root) {
			if (root.data === data) {
				root = root.right;
				if (root)
					root.left = null;
				else
					end = root;

				self.count--;
			}
			else if (end.data === data) {
				end = end.left;
				if (end)
					end.right = null;
				else
					root = end;

				self.count--;
			}
			else {
				var currentNode = root;
				var isFound = false;
				var isDone = true;

				for (var i = 0; !isDone && i < self.count; i++) {
					currentNode = currentNode.right;

					if (currentNode)
						isFound = currentNode.data === data;

					isDone = !currentNode || isFound;
				}

				if (isFound) {
					pointNodes(currentNode.left, currentNode.right);
					self.count--;
				}
			}
		}
	};

	self.removeAt = function (index) {
		if (index < 0)
			index = 0;
		
		if (root) {
			if (index === 0) {
				root = root.right;
				if (root)
					root.left = null;
				else
					end = root;
			}
			else if (index >= self.count - 1) {
				end = end.left;
				if (end)
					end.right = null;
				else
					root = end;
			}
			else if (index < self.count / 2) {
				var currentNode = root;

				for (var i = 0; i < index; i++)
					currentNode = currentNode.right;

				pointNodes(currentNode.left, currentNode.right);
			}
			else {
				var currentNode = end;

				for (var i = self.count - 1; i > index; i--) {
					if (currentNode && currentNode.left)
						currentNode = currentNode.left;
				}

				pointNodes(currentNode.left, currentNode.right);
			}

			self.count--;
		}
	};

	self.forEach = function (eachFunc) {
		if (root) {
			var currentNode = root;

			for (var i = 0; i < self.count; i++) {
				eachFunc(currentNode.data, i);
				currentNode = currentNode.right;
			}
		}
	};
}

module.exports = {
	create: function (array) {
		var linkedList = new LinkedList();
		
		if (array) {
			for (var i = 0; i < array.length; i++)
				linkedList.append(array[i]);
		}

		return linkedList;
	}
};

},{}],22:[function(require,module,exports){
function Rule(data) {
	var self = this;

	self.data = data;
}

module.exports = {
	create: function (data) {
		return new Rule(data);
	}
};

},{}],23:[function(require,module,exports){
var vector = require('./vector');

function Surface(data) {
	var self = this;
	var drawFunc = data.drawFunc;
	var position = {
		x: data.x,
		y: data.y
	};
	var position2 = {
		x: data.x2,
		y: data.y2
	};

	self.x = data.x;
	self.y = data.y;
	self.x2 = data.x2;
	self.y2 = data.y2;

	self.type = data.type;

	self.data = data.data;

	self.draw = function (ctx, roomPosition) {
		if (drawFunc)
			drawFunc(self, roomPosition, ctx);
	};

	self.isColliding = function (entity, entityPosition) {
		var interceptPoint = {};
		var isCollision = false;
		var isCornerCollision = false;
		entityPosition = {
			x: entityPosition.x + entity.bounds.radius,
			y: entityPosition.y + entity.bounds.radius
		};

		if (slope === 'inf') {
			if (entityPosition.y < self.y) {
				isCornerCollision = entity.bounds.isInside(entityPosition, position);
				interceptPoint = position;
			}
			else if (entityPosition.y > self.y2) {
				isCornerCollision = entity.bounds.isInside(entityPosition, position2);
				interceptPoint = position2;
			}
			else {
				isCollision = entityPosition.x + entity.bounds.radius > self.x;
				interceptPoint.x = self.x - entity.bounds.radius;
				interceptPoint.y = entityPosition.y;
			}
		}
		else if (slope === '-inf') {
			if (entityPosition.y > self.y) {
				isCornerCollision = entity.bounds.isInside(entityPosition, position);
				interceptPoint = position;
			}
			else if (entityPosition.y < self.y2) {
				isCornerCollision = entity.bounds.isInside(entityPosition, position2);
				interceptPoint = position2;
			}
			else {
				isCollision = entityPosition.x - entity.bounds.radius < self.x;
				interceptPoint.x = self.x + entity.bounds.radius;
				interceptPoint.y = entityPosition.y;
			}
		}
		else if (slope === '0') {
			if (entityPosition.x < self.x) {
				isCornerCollision = entity.bounds.isInside(entityPosition, position);
				interceptPoint = position;
			}
			else if (entityPosition.x > self.x2) {
				isCornerCollision = entity.bounds.isInside(entityPosition, position2);
				interceptPoint = position2;
			}
			else {
				isCollision = entityPosition.y - entity.bounds.radius < self.y;
				interceptPoint.x = entityPosition.x;
				interceptPoint.y = self.y + entity.bounds.radius;
			}
		}
		else if (slope === '-0') {
			if (entityPosition.x > self.x) {
				isCornerCollision = entity.bounds.isInside(entityPosition, position);
				interceptPoint = position;
			}
			else if (entityPosition.x < self.x2) {
				isCornerCollision = entity.bounds.isInside(entityPosition, position2);
				interceptPoint = position2;
			}
			else {
				isCollision = entityPosition.y + entity.bounds.radius > self.y;
				interceptPoint.x = entityPosition.x;
				interceptPoint.y = self.y - entity.bounds.radius;
			}
		}
		else {
			console.log("Error: You've met with a terrible fate, haven't you?");

			var perpendicularSlope = 1/slope;
			var otherYIntercept = entityPosition.y - perpendicularSlope * entityPosition.x;
			
			interceptPoint.x = (otherYIntercept - yIntercept) / (slope - perpendicularSlope);
			interceptPoint.y = slope * interceptPoint.x + yIntercept;

			if (interceptPoint.x > self.x && interceptPoint.x < self.x2)
				isCollision = (entityPosition.x * slope + yIntercept) < entityPosition.y;
		}

		if (!isCollision && !isCornerCollision)
			return 0;

		if (isCollision) {
			var collisionVector = vector.create({
				x: interceptPoint.x - entityPosition.x,
				y: interceptPoint.y - entityPosition.y
			});

			return vector.create({
				magnitude: collisionVector.magnitude,
				direction: collisionVector.direction
			});
		}

		if (isCornerCollision) {
			var collisionVector = vector.create({
				x: entityPosition.x - interceptPoint.x,
				y: entityPosition.y - interceptPoint.y
			});

			return vector.create({
				magnitude: entity.bounds.radius - collisionVector.magnitude,
				direction: collisionVector.direction
			});
		}
	};

	var slope;
	var yIntercept;

	if (self.x2 === self.x) {
		slope = self.y2 > self.y ? 'inf' : '-inf';
		yIntercept = self.y;
	}
	else if (self.y2 === self.y) {
		slope = self.x2 > self.x ? '0' : '-0';
		yIntercept = 'none';
	}
	else {
		slope = (self.y2 - self.y) / (self.x2 - self.x);
		yIntercept = self.y - slope * self.x;
	}
}

module.exports = {
	create: function (data) {
		return new Surface(data);
	}
};

},{"./vector":25}],24:[function(require,module,exports){
function Timer(duration, isStartingSet) {
	var self = this;
	var timeSince = isStartingSet ? duration : 0;

	self.update = function (elapsedTime) {
		if (timeSince < duration)
			timeSince += elapsedTime;
	};

	self.getDuration = function () {
		return duration;
	};

	self.getTimeSince = function () {
		return timeSince;
	};

	self.reset = function () {
		timeSince = 0;
	};

	self.isSet = function () {
		return timeSince >= duration;
	};
}

module.exports = {
	create: function (duration, isStartingSet) {
		return new Timer(duration, isStartingSet);
	}
};

},{}],25:[function(require,module,exports){
function Vector(data) {
	var self = this;

	if ((data.x || data.x === 0) && (data.y || data.y === 0)) {
		self.x = data.x;
		self.y = data.y;

		var absX = Math.abs(self.x);
		var absY = Math.abs(self.y);

		if (absX < 0.1)
			self.x = 0;
		if (absY < 0.1)
			self.y = 0;

		if (self.x === 0)
			self.magnitude = Math.abs(self.y);
		else if (self.y === 0)
			self.magnitude = Math.abs(self.x);
		else
			self.magnitude = Math.sqrt(self.x * self.x + self.y * self.y);
		self.direction = Math.atan2(self.y, self.x);
	}
	else if ((data.magnitude || data.magnitude === 0) && (data.direction || data.direction === 0)) {
		self.magnitude = data.magnitude;
		self.direction = data.direction;

		self.x = Math.cos(self.direction) * self.magnitude;
		self.y = Math.sin(self.direction) * self.magnitude;

		if (self.magnitude < 0) {
			self.magnitude = -self.magnitude;
			self.direction = Math.atan2(self.y, self.x);
		}
	}

	self.add = function (vector) {
		return new Vector({
			x: self.x + vector.x,
			y: self.y + vector.y
		});
	};

	self.addMagnitude = function (amount) {
		return new Vector({
			magnitude: self.magnitude + amount,
			direction: self.direction
		});
	};
}

module.exports = {
	create: function (data) {
		return new Vector(data);
	}
};

},{}]},{},[4]);
