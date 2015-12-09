function createStats (data) {
	return {
		health: data.health,
		contactDamage: data.contactDamage,
		rateOfFire: data.rateOfFire,
		bulletSpeed: data.bulletSpeed,
		bulletDamage: data.bulletDamage,
		speed: data.speed
	};
}

function addStats(stats1, stats2) {
	return {
		health: stats1.health + (stats2.health || 0),
		contactDamage: stats1.contactDamage + (stats2.contactDamage || 0),
		rateOfFire: stats1.rateOfFire + (stats2.rateOfFire || 0),
		bulletSpeed: stats1.bulletSpeed + (stats2.bulletSpeed || 0),
		bulletDamage: stats1.bulletDamage + (stats2.bulletDamage || 0),
		speed: stats1.speed + (stats2.speed || 0)
	};
}

module.exports = {
	create: createStats,
	add: addStats
};
