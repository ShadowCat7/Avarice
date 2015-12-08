module.exports = {
	circle: function (ctx, x, y, radius, color) {
		ctx.beginPath();
		ctx.arc(x + radius, y + radius, radius, 0, 2 * Math.PI);
		ctx.fillStyle = color;
		ctx.fill();
	},
	rectangle: function (ctx, position, size, color) {
		var path = new Path2D();
		path.moveTo(position.x, position.y);
		path.lineTo(position.x + size.x, position.y);
		path.lineTo(position.x + size.x, position.y + size.y);
		path.lineTo(position.x, position.y + size.y);
		ctx.fillStyle = color;
		ctx.fill(path);
	}
};
