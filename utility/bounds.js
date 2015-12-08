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
