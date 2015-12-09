function create(data) {
	return {
		init: function (entity) {
			entity.data.hp = {
				amount: entity.stats ? entity.stats.health : data.amount,
				timer: data.timer
			};
		},
		update: function (updateData, entity) {
			entity.data.hp.timer.update(updateData.elapsedTime);
		},
		damages: function (entity, other, rule) {
			if (entity.data.hp.timer.isSet()) {
				entity.data.hp.timer.reset();
				entity.data.hp.amount -= other.stats ? other.stats.contactDamage : 1;
			}
		}
	};
}

module.exports = {
	create: create
};
