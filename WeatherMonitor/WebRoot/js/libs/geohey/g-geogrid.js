/* global G:false */
G.GeoGridUtil = {

	calcIndex: function(z, x, y) {
		if (x > 180 || x < -180 || y > 90 || y < -90) {
			return;
		}

		var mathFloor = Math.floor;

		var n = Math.pow(2, z);
		var dLambX = 180 / n;
		var dLambY = 2 / n;

		var lambX = x;
		var lambY = Math.sin(y / G.MathUtil.DEGREE_PER_RADIAN);

		var ix = mathFloor(lambX / dLambX);
		var iy = mathFloor(lambY / dLambY);

		return [ix, iy];
	},

	getGrid: function(z, ix, iy) {
		var mathAsin = Math.asin;

		var n = Math.pow(2, z);
		var dLambX = 180 / n;
		var dLambY = 2 / n;

		var lambX1 = ix * dLambX;
		var lambY1 = iy * dLambY;
		var lambX2 = (ix + 1) * dLambX;
		var lambY2 = (iy + 1) * dLambY;

		var x1 = lambX1;
		var y1 = mathAsin(lambY1) * G.MathUtil.DEGREE_PER_RADIAN;
		var x2 = lambX2;
		var y2 = mathAsin(lambY2) * G.MathUtil.DEGREE_PER_RADIAN;

		var pts = [];

		pts.push([x1, y1]);
		pts.push([x1, y2]);
		pts.push([x2, y2]);
		pts.push([x2, y1]);

		return [pts];
	}

};
/* global G:false */
G.Layer.GeoGrid = G.Layer.Graphic.extend({

	options: {
		gridOutline: true,
		gridOutlineColor: '#0f0',
		gridOutlineWidth: 2,
		gridOutlineOpacity: 1.0,
		gridFill: true,
		gridFillColor: '#000',
		gridFillOpacity: 0.3
	},

	init: function(level, projClass, options) {
		var self = this;

		self.options = G.Util.merge({}, self.options, options);

		G.Layer.Graphic.prototype.init.call(self, options);

		self._level = level;
		self._projClass = projClass;

		self._grids = {};
	},

	getLevel: function() {
		return this._level;
	},

	getGridByIndex: function(ix, iy) {
		var self = this;

		var level = self._level;

		var key = ix + ',' + iy;

		var grid = self._grids[key];

		return grid;
	},

	getGridByLL: function(lon, lat) {
		var self = this;

		var index = G.GeoGridUtil.calcIndex(self._level, lon, lat);

		return self.getGridByIndex(index[0], index[1]);
	},

	_update: function() {
		var self = this,
			map = self._map;

		if (!map._isLoaded()) {
			return;
		}

		var options = self.options,
			center = map.getCenter(),
			res = map.getResolution(),
			drawSize = map.getDrawSize(),
			sizeFactor = 1 + 2 * map.options.canvasExpandFactor,
			w = drawSize[0] * sizeFactor,
			h = drawSize[1] * sizeFactor,
			xmin = center[0] - w * res / 2,
			xmax = center[0] + w * res / 2,
			ymin = center[1] - h * res / 2,
			ymax = center[1] + h * res / 2,
			extentRedraw = [xmin, ymin, xmax, ymax],
			extentMap = map.options.maxExtent;

		var extent = G.ExtentUtil.intersect(extentRedraw, extentMap);

		var geoLB, geoTR;

		var projClass = self._projClass;
		if (projClass) {
			geoLB = G.ProjUtil.projectPoint([extent[0], extent[1]], projClass.unproject);
			geoTR = G.ProjUtil.projectPoint([extent[2], extent[3]], projClass.unproject);
		} else {
			geoLB = [extent[0], extent[1]];
			geoTR = [extent[2], extent[3]];
		}

		var mathMax = Math.max;
		var mathMin = Math.min;
		var x1 = mathMin(180, mathMax(-180, geoLB[0]));
		var y1 = mathMin(90, mathMax(-90, geoLB[1]));
		var x2 = mathMin(180, mathMax(-180, geoTR[0]));
		var y2 = mathMin(90, mathMax(-90, geoTR[1]));

		var level = self._level;
		var idxLB = G.GeoGridUtil.calcIndex(level, x1, y1);
		var idxTR = G.GeoGridUtil.calcIndex(level, x2, y2);

		var key;

		var dirtyKeys = {};
		for (key in self._grids) {
			dirtyKeys[key] = true;
		}

		var i, j, iMax, jMax;
		var geom, grid;
		for (i = idxLB[0], iMax = idxTR[0]; i <= iMax; i++) {
			for (j = idxLB[1], jMax = idxTR[1]; j <= jMax; j++) {
				key = i + ',' + j;
				dirtyKeys[key] = false;

				if (self._grids[key]) {
					continue;
				}

				geom = G.GeoGridUtil.getGrid(level, i, j);

				if (projClass) {
					geom = G.ProjUtil.projectPolygon(geom, projClass.project);
				}

				grid = new G.Graphic.Polygon(geom, {
					idx: i,
					idy: j
				}, {
					outline: options.gridOutline,
					outlineColor: options.gridOutlineColor,
					outlineWidth: options.gridOutlineWidth,
					outlineOpacity: options.gridOutlineOpacity,
					fill: options.gridFill,
					fillColor: options.gridFillColor,
					fillOpacity: options.gridFillOpacity
				});

				self._grids[key] = grid;
				grid.addTo(self);
			}
		}

		for (key in dirtyKeys) {
			if (!dirtyKeys[key]) {
				continue;
			}

			grid = self._grids[key];
			if (grid) {
				grid.remove();
			}

			self._grids[key] = undefined;
		}

		self._draw();
	}


});