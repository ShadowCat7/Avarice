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
