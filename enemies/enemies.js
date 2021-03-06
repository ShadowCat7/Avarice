var followPlayerAi = require('../ais/follow-player-ai');
var followStopShootAi = require('../ais/follow-stop-shoot-ai');
var shootPlayerAi = require('../ais/shoot-player-ai');

var enemies = {
	blarg: new Enemy('Blarg', 'Chases you', followPlayerAi, {
		contactDamage: 1,
		health: 3,
		speed: 3
	}),
	hunter: new Enemy('Hunter', 'Chases and shoots you', followStopShootAi, {
		contactDamage: 1,
		health: 3,
		speed: 2,
		rateOfFire: 1,
		bulletSpeed: 4,
		bulletDamage: 1
	}),
	boss: new Enemy('Boss', 'Shoots at you', shootPlayerAi, {
		contactDamage: 1,
		health: 10,
		speed: 1,
		rateOfFire: 0.4,
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
