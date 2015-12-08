var epsilon = 0.00000001;
var targetFps = 60;
var targetSpf = 1 / targetFps;
var fpsSmoothness = 0.9;
var fpsOneFrameWeight = 1.0 - fpsSmoothness;
var minFps = 20;
var maxSpf = 1 / minFps;

function Engine(canvas, updateFunc, drawFunc) {
	var self = this;
	var animationFrameId = null;
	var timeoutId = null;
	var buttonsPressed = new Array(222);

	self.fps = targetFps;

	function mainLoop() {
		var previousUpdate = new Date().getTime();
		var previousDraw = new Date().getTime();

		function update() {
			var currentTime = new Date().getTime();
			var timeSinceLastUpdate = (currentTime - previousUpdate) / 1000;
			previousUpdate = currentTime;

			if (timeSinceLastUpdate < epsilon)
				timeSinceLastUpdate = epsilon;
			else if (timeSinceLastUpdate > maxSpf)
				timeSinceLastUpdate = maxSpf;

			setTimeout(function () {
				updateFunc(buttonsPressed, timeSinceLastUpdate);
			}, 0);

			animationFrameId = requestAnimationFrame(draw, canvas);
		}

		function draw() {
			var currentTime = new Date().getTime();
			var timeSinceLastDraw = (currentTime - previousDraw) / 1000;
			var fps = 1 / timeSinceLastDraw;
			previousDraw = currentTime;

			self.fps = self.fps * fpsSmoothness + fps * fpsOneFrameWeight;

			setTimeout(drawFunc, 0);

			timeoutId = setTimeout(update, 0);
		}

		update();
	}

	self.start = function () {
		mainLoop();
	};

	self.stop = function () {
		cancelAnimationFrame(animationFrameId);
		clearTimeout(timeoutId);
	}

	document.addEventListener('keydown', function (e) {
		e.stopPropagation();
		//console.log(e.keyCode);
		buttonsPressed[e.keyCode] = true;
	});

	document.addEventListener('keyup', function (e) {
		e.stopPropagation();
		buttonsPressed[e.keyCode] = false;
	});
}

module.exports = {
	create: function (canvas, updateFunc, drawFunc) {
		canvas = canvas;
		return new Engine(canvas, updateFunc, drawFunc);
	}
};
