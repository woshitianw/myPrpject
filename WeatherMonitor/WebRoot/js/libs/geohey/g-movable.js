/* global G:false */
G.Graphic.MovablePoint = G.Graphic.Point.extend({

	init: function(geom, attrs, options) {
		var self = this;

		G.Graphic.Point.prototype.init.call(self, geom, attrs, options);

		self.options.duration = self.options.duration || 2000;
	},

	start: function() {
		var self = this;

		if (!self._i) {
			self._i = 1;
		}

		self._move();

		return self;
	},

	stop: function() {
		var self = this;

		if (self._tid) {
			clearTimeout(self._tid);
		}

		return self;
	},

	setRoute: function(route) {
		var self = this;

		self._setChunk(route);

		return self;
	},

	//Breaks the route up into tiny chunks 
	_setChunk: function(route) {
		var self = this,
			duration = self.options.duration;

		var numVertex = route.length;
		var totleDist = 0;
		var dists = [],
			pts = self._pts = [];
		var dist, pt;

		var curStart, curEnd, curCount;
		var factorX, factorY;
		var cur, next;

		var i, j;

		for (i = 0; i < numVertex - 1; i++) {
			cur = route[i];
			next = route[i + 1];
			dist = G.MathUtil.calcDistance(cur, next);
			dists.push(dist);
			totleDist += dist;
		}

		for (i = 0; i < numVertex - 1; i++) {
			curCount = (duration * (dists[i] / totleDist)) / 30;
			curStart = route[i];
			curEnd = route[i + 1];
			factorX = (curEnd[0] - curStart[0]) / curCount;
			factorY = (curEnd[1] - curStart[1]) / curCount;

			for (j = 0; j < curCount; j++) {
				pt = [curStart[0] + factorX * j, curStart[1] + factorY * j];
				pts.push(pt);
			}
		}
		pts.push([route[numVertex - 1][0], route[numVertex - 1][1]]);

		return pts;
	},

	_move: function() {
		var self = this,
			pts = self._pts,
			numPts = pts.length;
		var map = self._layer._map;

		self._updateGeom(pts[self._i]);
		map._requestRedraw();

		self._i++;

		self._tid = setTimeout(function() {
			if (self._i === numPts) {
				self.stop();
			} else {
				self._move();
			}
		}, 30);
	}

});