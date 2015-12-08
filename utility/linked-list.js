function Node(data) {
	var self = this;
	
	self.data = data;
	self.left = null;
	self.right = null;
}

function pointNodes(left, right) {
	left.right = right;
	right.left = left;
}

function LinkedList() {
	var self = this;
	var root = null;
	var end = null;

	self.count = 0;

	self.append = function (item) {
		if (!end) {
			root = new Node(item);
			end = root;
		}
		else {
			var newEnd = new Node(item);
			pointNodes(end, newEnd);
			end = newEnd;
		}

		self.count++;
	};

	self.insert = function (item, index) {
		if (index < 0)
			index = 0;
		
		if (!root) {
			root = new Node(item);
			end = root;
		}
		else if (index === 0) {
			var newRoot = new Node(item);
			pointNodes(newRoot, root);
			root = newRoot;
		}
		else if (index >= self.count) {
			var newEnd = new Node(item);
			pointNodes(end, newEnd);
			end = newEnd;
		}
		else if (index < self.count / 2) {
			var currentNode = root;

			for (var i = 0; i < index; i++)
				currentNode = currentNode.right;

			var newLeft = new Node(item);
			pointNodes(currentNode.left, newLeft);
			pointNodes(newLeft, currentNode);
		}
		else {
			var currentNode = end;

			for (var i = self.count - 1; i > index; i--)
				currentNode = currentNode.left;

			var newLeft = new Node(item);
			pointNodes(currentNode.left, newLeft);
			pointNodes(newLeft, currentNode);
		}

		self.count++;
	};

	self.remove = function (data) {
		if (root) {
			if (root.data === data) {
				root = root.right;
				if (root)
					root.left = null;
				else
					end = root;

				self.count--;
			}
			else if (end.data === data) {
				end = end.left;
				if (end)
					end.right = null;
				else
					root = end;

				self.count--;
			}
			else {
				var currentNode = root;
				var isFound = false;
				var isDone = true;

				for (var i = 0; !isDone && i < self.count; i++) {
					currentNode = currentNode.right;

					if (currentNode)
						isFound = currentNode.data === data;

					isDone = !currentNode || isFound;
				}

				if (isFound) {
					pointNodes(currentNode.left, currentNode.right);
					self.count--;
				}
			}
		}
	};

	self.removeAt = function (index) {
		if (index < 0)
			index = 0;
		
		if (root) {
			if (index === 0) {
				root = root.right;
				if (root)
					root.left = null;
				else
					end = root;
			}
			else if (index >= self.count - 1) {
				end = end.left;
				if (end)
					end.right = null;
				else
					root = end;
			}
			else if (index < self.count / 2) {
				var currentNode = root;

				for (var i = 0; i < index; i++)
					currentNode = currentNode.right;

				pointNodes(currentNode.left, currentNode.right);
			}
			else {
				var currentNode = end;

				for (var i = self.count - 1; i > index; i--) {
					if (currentNode && currentNode.left)
						currentNode = currentNode.left;
				}

				pointNodes(currentNode.left, currentNode.right);
			}

			self.count--;
		}
	};

	self.forEach = function (eachFunc) {
		if (root) {
			var currentNode = root;

			for (var i = 0; i < self.count; i++) {
				eachFunc(currentNode.data, i);
				currentNode = currentNode.right;
			}
		}
	};
}

module.exports = {
	create: function (array) {
		var linkedList = new LinkedList();
		
		if (array) {
			for (var i = 0; i < array.length; i++)
				linkedList.append(array[i]);
		}

		return linkedList;
	}
};
