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
