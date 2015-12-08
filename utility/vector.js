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
