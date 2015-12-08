var collisionRules = require('./rules/collisions');

module.exports = {
	collision: function (type1, type2) {
		var ruleSet = collisionRules.rules[type1];
		if (!ruleSet)
			return ruleSet;

		return ruleSet[type2].data;
	}
};
