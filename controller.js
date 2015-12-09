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
