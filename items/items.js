var items = [
	item('Adderol', 'Can\'t stop shaking', {
		rateOfFire: -0.1,
		speed: 2
	}),
	item('Sniper Rifle', 'Headshot', {
		rateOfFire: 0.2,
		bulletSpeed: 10
	})
];

function item(name, subtext, stats) {
	return {
		name: name,
		subtext: subtext,
		stats: stats
	};
}

module.exports = {
	getItem() {
		if (items.length) {
			var index = Math.floor(Math.random() * items.length);
			return items.splice(index, 1)[0];
		}
		
		return item('Breakfast', 'Pool is empty', {});
	}
};
