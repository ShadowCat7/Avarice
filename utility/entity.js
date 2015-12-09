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

	self.data = {};

	self.stats = null;

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
