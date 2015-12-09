var collisionRules = require('./rules/collisions');

module.exports = {
	collision: function (type1, type2) {
		var ruleSet = collisionRules.rules[type1];
		if (!ruleSet)
			return null;

		var rule = ruleSet[type2];

		if (!rule)
			return null;

		return rule.data;
	}
};
