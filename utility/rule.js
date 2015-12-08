function Rule(data) {
	var self = this;

	self.data = data;
}

module.exports = {
	create: function (data) {
		return new Rule(data);
	}
};
