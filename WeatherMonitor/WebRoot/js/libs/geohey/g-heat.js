/* global G:false */
G.Layer.Heat = G.Layer.extend({
	mixins: [G.Layer.Filter],

	options: {
		radius: 30,
		radiusUnit: 'pixel', // map || pixel
		maxOpacity: 1.0,
		minOpacity: 0,
		colors: {
			0.2: '#00f',
			0.4: '#0ff',
			0.6: '#0f0',
			0.8: '#ff0',
			1.0: '#f00'
		},
		topValue: 5,
		drawResolution: 1,
		drawOnAnim: false
	},

	init: function(options) {
		var self = this;

		self.options = G.Util.merge({}, self.options, options);

		self._idSeq = 0;
		self._dataPoints = {};

		self._tree = new G.RTree();

		self._updateColorsImage();

		self._dirty = true;
		self._builtExtent = [];
	},

	_onResize: function() {
		var self = this;
		var map = self._map;
		var drawResolution = Math.max(self.options.drawResolution, 1);

		var mapCtx = map._useOffScreen ? map._offScreenCtx : map._onScreenCtx;
		var mapCanvas = mapCtx.canvas;

		var ctx = self._ctx;
		var actx = self._actx;

		var canvasCtx = ctx.canvas;
		var canvasActx = actx.canvas;

		var ratio = G.Browser.getCanvasRatio();

		var ratioX = ratio ? (ratio[0] || 1) : 1;
		var ratioY = ratio ? (ratio[1] || 1) : 1;

		self._bkScale = Math.max(ratioX, ratioY) * drawResolution;

		canvasCtx.width = canvasActx.width = mapCanvas.width / self._bkScale;
		canvasCtx.height = canvasActx.height = mapCanvas.height / self._bkScale;

		self._dirty = true;
	},

	_initContainer: function() {
		var self = this;
		var map = self._map;
		var domUtil = G.DomUtil;

		if (!self._ctx) {
			self._ctx = domUtil.create('canvas').getContext('2d');
		}

		if (!self._actx) {
			self._actx = domUtil.create('canvas').getContext('2d');
		}

		if (!self._cctx) {
			self._cctx = G.DomUtil.create('canvas').getContext('2d');
		}

		map.addListener('resize', self._onResize, self);
		map.addListener('moveEnd', self._onExtentChanged, self);
		map.addListener('zoomEnd', self._onExtentChanged, self);

		self._onResize();
	},

	_onAdded: function() {
		var self = this,
			map = self._map;

		self._initContainer();
		map._requestUpdate();
	},

	_onRemoved: function() {
		var self = this;
		var map = self._map;

		map.removeListener('resize', self._onResize, self);
		map.removeListener('moveEnd', self._onExtentChanged, self);
		map.removeListener('zoomEnd', self._onExtentChanged, self);
	},

	_onExtentChanged: function(e) {
		var self = this;
		var map = self._map;

		var extent = map.getExtent();
		var builtExtent = self._builtExtent;

		// 有可能有鼠标滚动或拖动操作，但是由于最大范围限制或者操作幅度很小导致extent基本没有变化，此时不需要标记dirty
		if (!G.ExtentUtil.equals(extent, builtExtent, 2 * map._res)) {
			setTimeout(function() {
				self._dirty = true;
			}, 50); // 防止阻塞绘制
		}
	},

	updateColors: function() {
		this._updateColorsImage();
	},

	addDataPoint: function(x, y, val, attrsOrRedrawNow /*向下兼容*/ , redrawNow) {
		var self = this,
			map = self._map;

		var bbox = [x, y, x, y];

		var val = val || 1;
		var attrs = G.Util.isObject(attrsOrRedrawNow) ? attrsOrRedrawNow : {};

		var dataPoint = {
			x: x,
			y: y,
			val: val,
			attrs: attrs
		};

		dataPoint.bbox = bbox;

		dataPoint._id = self._idSeq++;
		dataPoint._addAt = +new Date();

		self._dataPoints[dataPoint._id] = dataPoint;
		self._tree.insert(bbox, dataPoint);

		self._dirty = true;

		if (redrawNow && map) {
			map._requestRedraw();
		}

		return dataPoint._id;
	},

	removeDataPoint: function(id, redrawNow) {
		var self = this,
			map = self._map;

		var dataPoint = self._dataPoints[id];

		if (!dataPoint) {
			return self;
		}

		delete self._dataPoints[id];

		self._tree.remove(dataPoint.bbox, dataPoint);

		self._dirty = true;

		if (redrawNow && map) {
			map._requestRedraw();
		}

		return self;
	},

	clear: function(forbidRedraw) {
		var self = this,
			map = self._map;

		self._dataPoints = {};
		self._tree.clear();

		self._dirty = true;

		if (!forbidRedraw && map) {
			map._requestRedraw();
		}

		return self;
	},

	_update: function() {
		var self = this;
		self._dirty = true;
		self._draw();
	},

	_draw: function() {
		var self = this;
		var map = self._map;
		var options = self.options;

		var ctx = self._ctx;
		var canvas = ctx.canvas;
		var cw = canvas.width;
		var ch = canvas.height;

		if (self._dirty) {
			var radius = options.radius;
			if (options.radiusUnit == 'pixel') {
				radius *= map._res;
			}

			var center = map.getCenter(),
				res = map._res,
				drawSize = map.getDrawSize(),
				w = drawSize[0],
				h = drawSize[1],
				xmin = center[0] - w * res / 2 - radius,
				xmax = center[0] + w * res / 2 + radius,
				ymin = center[1] - h * res / 2 - radius,
				ymax = center[1] + h * res / 2 + radius,
				extentRedraw = [xmin, ymin, xmax, ymax],
				extentMap = map.options.maxExtent;

			var extent = G.ExtentUtil.intersect(extentRedraw, extentMap);

			if (!options.drawOnAnim &&
				(map.isZooming() || map.isPinching() || map.isRotating() || map.isPanning())
			) {
				return;
			}

			var searched = self._tree.search(extent);
			if (!searched) {
				return;
			}

			var dataPoint;
			var i;
			var actx = self._actx;
			var acanvas = actx.canvas;
			var aw = acanvas.width;
			var ah = acanvas.height;
			actx.clearRect(0, 0, aw, ah);
			for (i in searched) {
				dataPoint = searched[i];

				var passFilters = dataPoint._passFilters;
				if (!passFilters) {
					passFilters = dataPoint._passFilters = self._calcFilter(dataPoint.attrs) ? 1 : -1;
				}

				if (passFilters) {
					self._drawA(dataPoint.x, dataPoint.y, dataPoint.val);
				}
			}

			var image = actx.getImageData(0, 0, aw, ah);
			var imageData = image.data;
			var len = imageData.length;
			var maxAlpha = Math.min(parseInt(options.maxOpacity * 255), 255);
			var minAlpha = Math.min(maxAlpha, Math.min(parseInt(options.minOpacity * 255), 255));
			var colorsImage = self._colorsImage;
			var alpha, colorsImageIndex;
			for (i = 0; i < len - 3; i += 4) { // [0] -> r, [1] -> g, [2] -> b, [3] -> alpha
				alpha = imageData[i + 3];
				if (!alpha) {
					if (minAlpha > 0) {
						imageData[i] = colorsImage[0];
						imageData[i + 1] = colorsImage[1];
						imageData[i + 2] = colorsImage[2];
						imageData[i + 3] = minAlpha;
					}

					continue;
				}

				colorsImageIndex = alpha * 4;
				imageData[i] = colorsImage[colorsImageIndex];
				imageData[i + 1] = colorsImage[colorsImageIndex + 1];
				imageData[i + 2] = colorsImage[colorsImageIndex + 2];
				imageData[i + 3] = minAlpha + (maxAlpha - minAlpha) * alpha / 255;
			}
			image.data = imageData;

			ctx.clearRect(0, 0, cw, ch);
			ctx.putImageData(image, 0, 0, 0, 0, cw, ch);

			self._dirty = false;
			self._builtExtent = map.getExtent();
		}

		if (!self._hidden) {
			var mapCtx = map._useOffScreen ? map._offScreenCtx : map._onScreenCtx;
			var mapCanvas = mapCtx.canvas;
			mapCtx.drawImage(ctx.canvas, 0, 0, mapCanvas.width, mapCanvas.height);
		}
	},

	_updateColorsImage: function() {
		var self = this;

		var ctx = G.DomUtil.create('canvas').getContext('2d');
		var canvas = ctx.canvas;

		canvas.width = 1;
		canvas.height = 256;

		var colors = self.options.colors;
		var grad = ctx.createLinearGradient(0, 0, 1, 256);

		for (var v in colors) {
			grad.addColorStop(v, colors[v]);
		}

		ctx.fillStyle = grad;
		ctx.fillRect(0, 0, 1, 256);

		self._colorsImage = ctx.getImageData(0, 0, 1, 256).data;
	},

	_updateCircle: function(radius, blur) {
		var self = this;

		var ctx = self._cctx;
		var canvas = ctx.canvas;

		var r = radius + blur * 2;
		var shadowOffset = 2 * r;

		canvas.width = canvas.height = 2 * r;

		ctx.shadowColor = '#000';
		ctx.shadowOffsetX = ctx.shadowOffsetY = shadowOffset;
		ctx.shadowBlur = blur;

		ctx.beginPath();
		ctx.arc(r - shadowOffset, r - shadowOffset, radius, 0, 2 * Math.PI, true);
		ctx.closePath();
		ctx.fill();

		self._circleRadius = radius;
		self._circleR = r;

		return self;
	},

	_drawA: function(x, y, value) {
		var self = this;
		var map = self._map;
		var options = self.options;

		if (!value) {
			return;
		}

		var topValue = options.topValue;
		var radius = options.radius / self._bkScale;

		if (options.radiusUnit == 'map') {
			radius /= map._res;
		}

		if (!self._circleRadius || self._circleRadius != radius) {
			self._updateCircle(radius, radius);
		}

		var actx = self._actx;
		var canvasOffset = map._canvasOffset;

		var p = map.toScreen([x, y]);
		var tx = p[0] + canvasOffset[0],
			ty = p[1] + canvasOffset[1];

		var alpha = Math.min(1, value / topValue);

		actx.globalAlpha = alpha;
		actx.drawImage(self._cctx.canvas, tx / self._bkScale - self._circleR, ty / self._bkScale - self._circleR);
	}


});
/* global G:false */
G.Layer.TiledGridHeat = G.Layer.TiledService.extend({
	mixins: [G.Layer.LOD],

	options: {
		cluster: [], // ['server1', 'server2']
		responseType: 'json',
		gridCols: 64,
		gridRows: 64,
		maxOpacity: 1.0,
		minOpacity: 0,
		colors: {
			0.2: '#00f',
			0.4: '#0ff',
			0.6: '#0f0',
			0.8: '#ff0',
			1.0: '#f00'
		},
		topValue: 1,
		drawOnAnim: false
	},

	init: function(url, dataFunc, options) { // dataFunc = function(tileInfo, data){ return [[x, y, value], ...] }   
		var self = this;

		self.url = url;
		self._dataFunc = dataFunc;

		self.options = G.Util.merge({}, self.options, options);

		self._tiles = {};
		self._dirtyTiles = {};

		self._dirty = true;

		var reqFunc = function(idxX, idxY, zoom) {
			var key = self._getTileName(idxX, idxY, zoom);
			var reqUrl = self._getTileUrl(idxX, idxY, zoom)
			var tileInfo = [idxX, idxY, zoom];
			var map;

			G.Util.ajax(reqUrl, {
				responseType: self.options.responseType,
				success: function(xhr, data) {
					self.onSuccess(tileInfo, data);

					self._tiles[key] = {
						info: tileInfo,
						data: dataFunc(tileInfo, data)
					};

					map = self._map;
					if (map) {
						map._requestRedraw();
					}
				},
				error: function(xhr) {
					self.onError(tileInfo);
				},
				complete: function(xhr) {
					self.onComplete(tileInfo);
				}
			});
		}

		G.Layer.TiledService.prototype.init.call(self, reqFunc, self.options);

		self._updateColorsImage();
	},

	setUrl: function(url) {
		var self = this;
		var map = self._map;

		var key;
		for (key in self._loadingKeys) {
			self._stopLoadingByKey(key);
		}

		self.url = url;

		// Move loaded tiles to dirty tiles
		self._dirtyTiles = self._tiles;
		self._tiles = {};

		self._loadedKeys = {};

		self._dirty = true;

		if (map) {
			map._requestUpdate();
		}

		return self;
	},

	clear: function() {
		var self = this,
			map = self._map;

		var key;

		for (key in self._loadingKeys) {
			self._stopLoadingByKey(key);
		}

		self._dirtyTiles = {};
		self._tiles = {};

		self._loadedKeys = {};

		self._dirty = true;

		self._onClear();

		if (map) {
			map._requestUpdate();
		}

		return self;
	},

	_onResize: function() {
		var self = this;
		var map = self._map;

		var mapCtx = map._useOffScreen ? map._offScreenCtx : map._onScreenCtx;
		var mapCanvas = mapCtx.canvas;

		var ctx = self._ctx;
		var canvasCtx = ctx.canvas;

		canvasCtx.width = mapCanvas.width;
		canvasCtx.height = mapCanvas.height;

		self._dirty = true;
	},

	_onViewChanged: function(e) {
		var self = this;
		var map = self._map;

		// 有可能有鼠标滚动或拖动操作，但是由于最大范围限制或者操作幅度很小导致extent基本没有变化，此时不需要标记dirty
		setTimeout(function() {
			self._dirty = true;

			if (map) {
				map._requestRedraw();
			}
		}, 50); // 防止阻塞绘制
	},

	_initContainer: function() {
		var self = this;
		var map = self._map;
		var domUtil = G.DomUtil;

		if (!self._ctx) {
			self._ctx = domUtil.create('canvas').getContext('2d');
		}

		map.addListener('resize', self._onResize, self);

		self._onResize();
	},

	_onAdded: function() {
		var self = this,
			map = self._map;

		self._initContainer();
		map._requestUpdate();

		self.addListener('loadTileSuccess', self._onLoadTileSuccess, self);
		self.addListener('unusedTile', self._onUnusedTile, self);
		self.addListener('allLoaded', self._onAllLoaded, self);

		map.addListener('viewChanged', self._onViewChanged, self);
	},

	_onRemoved: function() {
		var self = this;
		var map = self._map;

		self.removeListener('loadTileSuccess', self._onLoadTileSuccess, self);
		self.removeListener('unusedTile', self._onUnusedTile, self);
		self.removeListener('allLoaded', self._onAllLoaded, self);

		map.removeListener('resize', self._onResize, self);
		map.removeListener('viewChanged', self._onViewChanged, self);
	},

	updateColors: function() {
		this._updateColorsImage();
	},

	_onLoadTileSuccess: function(e) {
		var self = this;
		var map = self._map;

		self._dirty = true;

		if (map) {
			map._requestRedraw();
		}
	},

	_onUnusedTile: function(e) {
		var self = this;

		var tileInfo = e.tileInfo;
		var key = self._getTileName(tileInfo[0], tileInfo[1], tileInfo[2]);

		delete self._tiles[key];
	},

	_onAllLoaded: function(e) {
		var self = this;
		var map = self._map;

		self._dirtyTiles = {};

		if (map) {
			map._requestRedraw();
		}
	},

	_onUpdated: function() {
		var self = this;
		self._dirty = true;
		self._draw();
	},

	_draw: function() {
		var self = this;
		var map = self._map;
		var options = self.options;

		var ctx = self._ctx;
		var canvas = ctx.canvas;
		var cw = canvas.width;
		var ch = canvas.height;

		var forbidRedraw = !options.drawOnAnim &&
			(map.isZooming() || map.isPinching() || map.isRotating() || map.isPanning());

		if (!forbidRedraw && self._dirty) {
			var maxAlpha = Math.min(parseInt(options.maxOpacity * 255), 255);
			var minAlpha = Math.min(maxAlpha, Math.min(parseInt(options.minOpacity * 255), 255));

			ctx.clearRect(0, 0, cw, ch);

			for (key in self._dirtyTiles) {
				if (self._tiles[key]) {
					delete self._dirtyTiles[key];
					continue;
				}

				tile = self._dirtyTiles[key];
				self._drawTile(tile, minAlpha, maxAlpha);
			}

			for (key in self._tiles) {
				tile = self._tiles[key];
				self._drawTile(tile, minAlpha, maxAlpha);
			}

			self._dirty = false;
		}

		if (!self._hidden) {
			var mapCtx = map._useOffScreen ? map._offScreenCtx : map._onScreenCtx;
			var mapCanvas = mapCtx.canvas;
			mapCtx.drawImage(ctx.canvas, 0, 0, mapCanvas.width, mapCanvas.height);
		}
	},

	_updateColorsImage: function() {
		var self = this;

		var ctx = G.DomUtil.create('canvas').getContext('2d');
		var canvas = ctx.canvas;

		canvas.width = 1;
		canvas.height = 256;

		var colors = self.options.colors;
		var grad = ctx.createLinearGradient(0, 0, 1, 256);

		for (var v in colors) {
			grad.addColorStop(v, colors[v]);
		}

		ctx.fillStyle = grad;
		ctx.fillRect(0, 0, 1, 256);

		self._colorsImage = ctx.getImageData(0, 0, 1, 256).data;

		self._dirty = true;
	},

	_drawTile: function(tile, minAlpha, maxAlpha) {
		var self = this;
		var map = self._map;
		var options = self.options;

		var tctx = tile._ctx;
		if (!tctx) {
			tctx = tile._tctx = G.DomUtil.create('canvas').getContext('2d');

			var tcanvas = tctx.canvas;
			var tw = tcanvas.width = options.gridCols;
			var th = tcanvas.height = options.gridRows;

			var topValue = options.topValue;
			var colorsImage = self._colorsImage;

			var image = tctx.getImageData(0, 0, tw, th);
			var imageData = image.data;

			var data = tile.data;
			for (var key in data) {
				var dataPoint = data[key];
				var i = 4 * ((options.gridRows - dataPoint[1] - 1) * options.gridCols + dataPoint[0]);
				var alpha = Math.min(parseInt(dataPoint[2] / topValue * 255), 255);

				var colorsImageIndex = alpha * 4;
				imageData[i] = colorsImage[colorsImageIndex];
				imageData[i + 1] = colorsImage[colorsImageIndex + 1];
				imageData[i + 2] = colorsImage[colorsImageIndex + 2];
				imageData[i + 3] = minAlpha + (maxAlpha - minAlpha) * alpha / 255;
			}

			image.data = imageData;
			tctx.putImageData(image, 0, 0, 0, 0, tw, th);
		}

		var mathRound = Math.round;
		var pr = G.Browser.getPxRatio();
		var prX = pr[0];
		var prY = pr[1];
		var mapRes = map._res;
		var rotate = map._rotate;
		var tileInfo = tile.info;
		var idxX = parseInt(tileInfo[0]);
		var idxY = parseInt(tileInfo[1]);
		var tileZoom = parseInt(tileInfo[2]);
		var tileSize = options.tileSize;
		var zoomRes = options.zoomReses[tileZoom];
		var tileMapSize = tileSize * zoomRes;
		var scaledTileSize = Math.ceil(tileMapSize / mapRes);

		var px = options.originX + idxX * tileMapSize;
		var py = options.originY - idxY * tileMapSize;

		var pt = map.toScreen([px, py]);
		var tx = pt[0],
			ty = pt[1];

		var canvasOffset = map._canvasOffset;
		tx += canvasOffset[0];
		ty += canvasOffset[1];

		tx = mathRound(tx);
		ty = mathRound(ty);

		var ctx = self._ctx;

		if (rotate) {
			ctx.save();
			ctx.translate(tx, ty);
			ctx.rotate(rotate / G.MathUtil.DEGREE_PER_RADIAN);
			ctx.translate(-tx, -ty);
		}

		try {
			ctx.drawImage(tctx.canvas, tx, ty, mathRound(scaledTileSize / prX), mathRound(scaledTileSize / prY));
		} catch (e) {
			//console.log(e);
		}

		if (rotate) {
			ctx.restore();
		}
	}


});
/* global G:false */
G.Layer.TiledHeat = G.Layer.TiledService.extend({
	mixins: [G.Layer.LOD, G.Layer.Filter],

	options: {
		cluster: [], // ['server1', 'server2']
		responseType: 'json',
		radius: 30,
		radiusUnit: 'pixel', // map || pixel
		maxOpacity: 1.0,
		minOpacity: 0,
		colors: {
			0.2: '#00f',
			0.4: '#0ff',
			0.6: '#0f0',
			0.8: '#ff0',
			1.0: '#f00'
		},
		topValue: 5,
		drawResolution: 1,
		drawOnAnim: false
	},

	init: function(url, dataFunc, options) { // dataFunc = function(tileInfo, data){ return [[x, y, value], ...] }   
		var self = this;

		self.url = url;
		self._dataFunc = dataFunc;

		self.options = G.Util.merge({}, self.options, options);

		self._tiles = {};
		self._dirtyTiles = {};

		self._dirty = true;

		var reqFunc = function(idxX, idxY, zoom) {
			var key = self._getTileName(idxX, idxY, zoom);
			var reqUrl = self._getTileUrl(idxX, idxY, zoom)
			var tileInfo = [idxX, idxY, zoom];
			var map;

			G.Util.ajax(reqUrl, {
				responseType: self.options.responseType,
				success: function(xhr, data) {
					self.onSuccess(tileInfo, data);

					self._tiles[key] = dataFunc(tileInfo, data);

					map = self._map;
					if (map) {
						map._requestRedraw();
					}
				},
				error: function(xhr) {
					self.onError(tileInfo);
				},
				complete: function(xhr) {
					self.onComplete(tileInfo);
				}
			});
		}

		G.Layer.TiledService.prototype.init.call(self, reqFunc, self.options);

		self._updateColorsImage();
	},

	setUrl: function(url) {
		var self = this;
		var map = self._map;

		var key;
		for (key in self._loadingKeys) {
			self._stopLoadingByKey(key);
		}

		self.url = url;

		// Move loaded tiles to dirty tiles
		self._dirtyTiles = self._tiles;
		self._tiles = {};

		self._loadedKeys = {};

		self._dirty = true;

		if (map) {
			map._requestUpdate();
		}

		return self;
	},

	clear: function() {
		var self = this,
			map = self._map;

		var key;

		for (key in self._loadingKeys) {
			self._stopLoadingByKey(key);
		}

		self._dirtyTiles = {};
		self._tiles = {};

		self._loadedKeys = {};

		self._dirty = true;

		self._onClear();

		if (map) {
			map._requestUpdate();
		}

		return self;
	},

	_onResize: function() {
		var self = this;
		var map = self._map;
		var drawResolution = Math.max(self.options.drawResolution, 1);

		var mapCtx = map._useOffScreen ? map._offScreenCtx : map._onScreenCtx;
		var mapCanvas = mapCtx.canvas;

		var ctx = self._ctx;
		var actx = self._actx;

		var canvasCtx = ctx.canvas;
		var canvasActx = actx.canvas;

		var ratio = G.Browser.getCanvasRatio();

		var ratioX = ratio ? (ratio[0] || 1) : 1;
		var ratioY = ratio ? (ratio[1] || 1) : 1;

		self._bkScale = Math.max(ratioX, ratioY) * drawResolution;

		canvasCtx.width = canvasActx.width = mapCanvas.width / self._bkScale;
		canvasCtx.height = canvasActx.height = mapCanvas.height / self._bkScale;

		self._dirty = true;
	},

	_onViewChanged: function(e) {
		var self = this;
		var map = self._map;

		// 有可能有鼠标滚动或拖动操作，但是由于最大范围限制或者操作幅度很小导致extent基本没有变化，此时不需要标记dirty
		setTimeout(function() {
			self._dirty = true;

			if (map) {
				map._requestRedraw();
			}
		}, 50); // 防止阻塞绘制
	},

	_initContainer: function() {
		var self = this;
		var map = self._map;
		var domUtil = G.DomUtil;

		if (!self._ctx) {
			self._ctx = domUtil.create('canvas').getContext('2d');
		}

		if (!self._actx) {
			self._actx = domUtil.create('canvas').getContext('2d');
		}

		if (!self._cctx) {
			self._cctx = G.DomUtil.create('canvas').getContext('2d');
		}

		map.addListener('resize', self._onResize, self);

		self._onResize();
	},

	_onAdded: function() {
		var self = this,
			map = self._map;

		self._initContainer();
		map._requestUpdate();

		self.addListener('loadTileSuccess', self._onLoadTileSuccess, self);
		self.addListener('unusedTile', self._onUnusedTile, self);
		self.addListener('allLoaded', self._onAllLoaded, self);

		map.addListener('viewChanged', self._onViewChanged, self);
	},

	_onRemoved: function() {
		var self = this;
		var map = self._map;

		self.removeListener('loadTileSuccess', self._onLoadTileSuccess, self);
		self.removeListener('unusedTile', self._onUnusedTile, self);
		self.removeListener('allLoaded', self._onAllLoaded, self);

		map.removeListener('resize', self._onResize, self);
		map.removeListener('viewChanged', self._onViewChanged, self);
	},

	updateColors: function() {
		this._updateColorsImage();
	},

	_onLoadTileSuccess: function(e) {
		var self = this;
		var map = self._map;

		self._dirty = true;

		if (map) {
			map._requestRedraw();
		}
	},

	_onUnusedTile: function(e) {
		var self = this;

		var tileInfo = e.tileInfo;
		var key = self._getTileName(tileInfo[0], tileInfo[1], tileInfo[2]);

		delete self._tiles[key];
	},

	_onAllLoaded: function(e) {
		var self = this;
		var map = self._map;

		self._dirtyTiles = {};

		if (map) {
			map._requestRedraw();
		}
	},

	_onUpdated: function() {
		var self = this;
		self._dirty = true;
		self._draw();
	},

	_draw: function() {
		var self = this;
		var map = self._map;
		var options = self.options;

		var ctx = self._ctx;
		var canvas = ctx.canvas;
		var cw = canvas.width;
		var ch = canvas.height;

		var radius = options.radius;
		if (options.radiusUnit == 'pixel') {
			radius *= map._res;
		}

		var forbidRedraw = !options.drawOnAnim &&
			(map.isZooming() || map.isPinching() || map.isRotating() || map.isPanning());

		if (!forbidRedraw && self._dirty) {
			var tile;
			var key;
			var dataPoint;
			var i;

			var actx = self._actx;
			var acanvas = actx.canvas;
			var aw = acanvas.width;
			var ah = acanvas.height;
			actx.clearRect(0, 0, aw, ah);

			for (key in self._dirtyTiles) {
				if (self._tiles[key]) {
					delete self._dirtyTiles[key];
					continue;
				}

				tile = self._dirtyTiles[key];

				for (i in tile) {
					dataPoint = tile[i];
					if (!self._filters /*提升效率，如果没有filter不调用后面的函数*/ || self._calcFilter(dataPoint[3])) {
						self._drawA(dataPoint[0], dataPoint[1], dataPoint[2]);
					}
				}
			}

			for (key in self._tiles) {
				tile = self._tiles[key];

				for (i in tile) {
					dataPoint = tile[i];
					if (!self._filters /*提升效率，如果没有filter不调用后面的函数*/ || self._calcFilter(dataPoint[3])) {
						self._drawA(dataPoint[0], dataPoint[1], dataPoint[2]);
					}
				}
			}

			var image = actx.getImageData(0, 0, aw, ah);
			var imageData = image.data;
			var len = imageData.length;
			var maxAlpha = Math.min(parseInt(options.maxOpacity * 255), 255);
			var minAlpha = Math.min(maxAlpha, Math.min(parseInt(options.minOpacity * 255), 255));
			var colorsImage = self._colorsImage;
			var alpha, colorsImageIndex;
			for (i = 0; i < len - 3; i += 4) { // [0] -> r, [1] -> g, [2] -> b, [3] -> alpha
				alpha = imageData[i + 3];
				if (!alpha) {
					if (minAlpha > 0) {
						imageData[i] = colorsImage[0];
						imageData[i + 1] = colorsImage[1];
						imageData[i + 2] = colorsImage[2];
						imageData[i + 3] = minAlpha;
					}

					continue;
				}

				colorsImageIndex = alpha * 4;
				imageData[i] = colorsImage[colorsImageIndex];
				imageData[i + 1] = colorsImage[colorsImageIndex + 1];
				imageData[i + 2] = colorsImage[colorsImageIndex + 2];
				imageData[i + 3] = minAlpha + (maxAlpha - minAlpha) * alpha / 255;
			}
			image.data = imageData;

			ctx.clearRect(0, 0, cw, ch);
			ctx.putImageData(image, 0, 0, 0, 0, cw, ch);

			self._dirty = false;
		}

		if (!self._hidden) {
			var mapCtx = map._useOffScreen ? map._offScreenCtx : map._onScreenCtx;
			var mapCanvas = mapCtx.canvas;
			mapCtx.drawImage(ctx.canvas, 0, 0, mapCanvas.width, mapCanvas.height);
		}
	},

	_updateColorsImage: function() {
		var self = this;

		var ctx = G.DomUtil.create('canvas').getContext('2d');
		var canvas = ctx.canvas;

		canvas.width = 1;
		canvas.height = 256;

		var colors = self.options.colors;
		var grad = ctx.createLinearGradient(0, 0, 1, 256);

		for (var v in colors) {
			grad.addColorStop(v, colors[v]);
		}

		ctx.fillStyle = grad;
		ctx.fillRect(0, 0, 1, 256);

		self._colorsImage = ctx.getImageData(0, 0, 1, 256).data;

		self._dirty = true;
	},

	_updateCircle: function(radius, blur) {
		var self = this;

		var ctx = self._cctx;
		var canvas = ctx.canvas;

		var r = radius + blur * 2;
		var shadowOffset = 2 * r;

		canvas.width = canvas.height = 2 * r;

		ctx.shadowColor = '#000';
		ctx.shadowOffsetX = ctx.shadowOffsetY = shadowOffset;
		ctx.shadowBlur = blur;

		ctx.beginPath();
		ctx.arc(r - shadowOffset, r - shadowOffset, radius, 0, 2 * Math.PI, true);
		ctx.closePath();
		ctx.fill();

		self._circleRadius = radius;
		self._circleR = r;

		return self;
	},

	_drawA: function(x, y, value) {
		var self = this;
		var map = self._map;
		var options = self.options;

		if (!value) {
			return;
		}

		var topValue = options.topValue;
		var radius = options.radius / self._bkScale;

		if (options.radiusUnit == 'map') {
			radius /= map._res;
		}

		if (!self._circleRadius || self._circleRadius != radius) {
			self._updateCircle(radius, radius);
		}

		var actx = self._actx;
		var canvasOffset = map._canvasOffset;

		var p = map.toScreen([x, y]);
		var tx = p[0] + canvasOffset[0],
			ty = p[1] + canvasOffset[1];

		var alpha = Math.min(1, value / topValue);

		actx.globalAlpha = alpha;
		actx.drawImage(self._cctx.canvas, tx / self._bkScale - self._circleR, ty / self._bkScale - self._circleR);
	}


});