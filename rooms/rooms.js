var roomTypes = require('./room-types');
var enemies = require('../enemies/enemies');

var rooms = {};
rooms[roomTypes.normal] = [
	createRoom(800, 600, null, [
		createEnemy('hunter', 380, 280)
	]),
	createRoom(800, 600, null, [
		createEnemy('blarg', 380, 280)
	]),
	createRoom(1200, 1000, null, [
		createEnemy('blarg', 200, 200),
		createEnemy('blarg', 1000, 200),
		createEnemy('blarg', 1000, 800),
		createEnemy('blarg', 200, 800)
	])
];

rooms[roomTypes.item] = [
	createRoom(800, 600)
];

rooms[roomTypes.boss] = [
	createRoom(800, 600, null, [
		createEnemy('boss', 350, 250)
	])
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
