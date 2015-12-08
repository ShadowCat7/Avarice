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
