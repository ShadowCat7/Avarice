function create(data) {
	return {
		init: function (entity) {
			entity.data.hp = {
				amount: data.amount,
				timer: data.timer
			};
		},
		update: function (updateData, entity) {
			entity.data.hp.timer.update(updateData.elapsedTime);
		},
		damages: function (entity, other, rule) {
			if (entity.data.hp.timer.isSet()) {
				entity.data.hp.timer.reset();
				entity.data.hp.amount--;
			}
		}
	};
}

module.exports = {
	create: create
};
