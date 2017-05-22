/* global G:false */
G.Layer.Fluid = G.Layer.extend({

	options: {
		gridPixels: 4, // 用于插值的网格像素边长
		gridMaxDivs: 200, // 最大网格边划分数量
		gridReduceFactor: 2, // 在移动设备上适当减少网格数量的比例	
		fieldFactor: 0.8,
		fieldMaxIntensity: 50, // 可视化时限制的流体场最大强度，比如风速最大值
		particleMaxAge: 100,
		particleCountFactor: 0.05,
		lineWidth: 1.2,
		opacity: 1.0,
		colors: ['#fff', '#fff', '#fff', '#fff', '#fff'],
		searchSteps: 3, // 插值检索的尝试次数
		interpolateCount: 4, //插值使用的数据数量
		frameDuration: 50 // ms
	},

	init: function(options) {
		var self = this;

		self.options = G.Util.merge({}, self.options, options);

		self._idSeq = 0;
		self._dataPoints = {};

		self._tree = new G.RTree();

		self._nullVector = [NaN, NaN, null];

		self._dirty = true;
		self._builtExtent = [];
	},

	start: function() {
		var self = this;

		self._buildGrid();

		self._startAnim();

		return self;
	},

	stop: function() {
		var self = this;

		clearTimeout(self._timer);

		self._playing = false;

		return self;
	},

	isPlaying: function() {
		return this._playing;
	},

	_startAnim: function() {
		var self = this;
		var map = self._map;
		var options = self.options;

		self._playing = true;

		(function frame() {
			try {
				clearTimeout(self._timer);
				self._timer = setTimeout(function() {
					G.Util.requestAnimFrame(frame);

					self._evolve();

					map._requestRedraw();
				}, options.frameDuration);
			} catch (e) {
				console.error(e);
			}
		})();
	},

	_onReize: function() {
		var self = this;
		var map = self._map;

		var mapCtx = map._useOffScreen ? map._offScreenCtx : map._onScreenCtx;
		var mapCanvas = mapCtx.canvas;

		var ctx = self._ctx;
		var canvas = ctx.canvas;

		var ratio = G.Browser.getCanvasRatio();

		var ratioX = ratio ? (ratio[0] || 1) : 1;
		var ratioY = ratio ? (ratio[1] || 1) : 1;

		ctx.scale(ratioX, ratioY);

		canvas.width = mapCanvas.width;
		canvas.height = mapCanvas.height;

		self._dirty = true;
	},

	_onViewChanged: function(e) {
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

	_initContainer: function() {
		var self = this;
		var map = self._map;
		var domUtil = G.DomUtil;

		if (!self._ctx) {
			self._ctx = domUtil.create('canvas').getContext('2d');
		}

		map.addListener('resize', self._onReize, self);
		map.addListener('viewChanged', self._onViewChanged, self);

		self._onReize();
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

		map.removeListener('resize', self._onReize, self);
		map.removeListener('viewChanged', self._onViewChanged, self);
	},

	addDataPoint: function(x, y, u, v, redrawNow) {
		var self = this,
			map = self._map;

		var u = u || 0;
		var v = v || 0;
		var bbox = [x, y, x, y];

		var dataPoint = {
			x: x,
			y: y,
			u: u,
			v: v
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

		self._particles = null;

		self._erase();

		self._dirty = true;

		if (!forbidRedraw && map) {
			map._requestRedraw();
		}

		return self;
	},

	calcField: function(x, y) {
		var self = this;
		var map = self._map;
		var options = self.options;

		var extent = map.options.maxExtent;
		var all = self._tree.all();
		var count = all && all.length;
		var divCount = Math.sqrt(count) || 1;
		var expand = Math.max((extent[2] - extent[0]), (extent[3] - extent[1])) / divCount;

		var x = map._calcRealCoords([x, y])[0];

		if (count > 0) {
			var i = 1;
			var searched, searchedExtent;
			do {
				searchedExtent = [x - i * expand, y - i * expand, x + i * expand, y + i * expand];
				searched = self._tree.search(searchedExtent);
				i *= 2;
			} while (!searched || searched.length == 0)

			return self._interpolate(x, y, searchedExtent);
		} else {
			return self._nullVector;
		}
	},

	hide: function() {
		var self = this,
			map = self._map;

		if (self._hidden) {
			return self;
		}

		self._hidden = true;

		self._erase();

		if (map) {
			map._requestRedraw();
		}

		return self;
	},

	_update: function() {
		var self = this;
		self._dirty = true;
		self._draw();
	},

	_erase: function() {
		var self = this;

		var ctx = self._ctx;
		var canvas = ctx.canvas;
		var w = canvas.width;
		var h = canvas.height;
		ctx.clearRect(0, 0, w, h);
	},

	_draw: function() {
		var self = this;
		var map = self._map;
		var options = self.options;
		var ctx = self._ctx;


		if (self._dirty) {
			self._erase();

			if (self._playing) {
				setTimeout(function() {
					self._buildGrid();

					self._particles = null;

					self._startAnim();
				}, options.frameDuration); // 耗时，防止阻塞绘制
			}
		}

		if (self._playing) {
			var particles = self._particles;
			if (!particles) {
				particles = self._particles = [];

				var particleCount = self._gridColCount * self._gridRowCount * options.particleCountFactor;
				for (var i = 0; i < particleCount; i++) {
					particles.push(self._createParticle());
				}
			}

			self._evolve();

			if (!self._batches) {
				return;
			}

			var canvas = ctx.canvas;
			var w = canvas.width;
			var h = canvas.height;

			var canvasOffset = map._canvasOffset;

			ctx.globalCompositeOperation = 'destination-in';
			ctx.globalAlpha = 0.75;
			ctx.fillRect(0, 0, w, h);

			ctx.globalCompositeOperation = 'source-over';
			ctx.globalAlpha = options.opacity;

			ctx.lineWidth = options.lineWidth;

			var maxExtent = map.options.maxExtent;

			var extent = self._gridExtent;
			var gridSize = self._gridSize;
			var batch, i, iLen, j, jLen, particle, pt, x, y, xt, yt;
			for (i = 0, iLen = self._batches.length; i < iLen; i++) {
				batch = self._batches[i];

				ctx.beginPath();
				ctx.strokeStyle = options.colors[i];
				for (j = 0, jLen = batch.length; j < jLen; j++) {
					particle = batch[j];

					x = extent[0] + gridSize * particle.x;
					y = extent[1] + gridSize * particle.y;
					xt = extent[0] + gridSize * particle.xt;
					yt = extent[1] + gridSize * particle.yt;

					if (maxExtent && (x < maxExtent[0] || x > maxExtent[2])) {
						continue;
					}

					pt = map.toScreen([x, y]);
					ctx.moveTo(pt[0] + canvasOffset[0], pt[1] + canvasOffset[1]);

					pt = map.toScreen([xt, yt]);
					ctx.lineTo(pt[0] + canvasOffset[0], pt[1] + canvasOffset[1]);

					particle.x = particle.xt;
					particle.y = particle.yt;
				}
				ctx.stroke();
			}
		}

		if (!self._hidden) {
			var mapCtx = map._useOffScreen ? map._offScreenCtx : map._onScreenCtx;
			var mapCanvas = mapCtx.canvas;
			mapCtx.drawImage(ctx.canvas, 0, 0, mapCanvas.width, mapCanvas.height);
		}
	},

	_createParticle: function(age) {
		var self = this;

		return {
			x: Math.round(Math.random() * self._gridColCount),
			y: Math.round(Math.random() * self._gridRowCount),
			age: age === undefined ? Math.floor(Math.random() * self.options.particleMaxAge) : age
		};
	},

	_field: function(x, y) {
		var self = this;
		var round = Math.round;

		var grid = self._grid;
		var row = grid[round(y)];
		var v = row && row[round(x)] || self._nullVector;

		return v;
	},

	_evolve: function() {
		var self = this;
		var map = self._map;
		var options = self.options;

		var particles = self._particles;
		if (!particles) {
			return;
		}

		var batches = options.colors.map(function() {
			return [];
		});

		var fieldScale = options.fieldFactor / options.fieldMaxIntensity;

		var particle, x, y, v;
		for (var i = 0, iLen = particles.length; i < iLen; i++) {
			particle = particles[i];
			if (particle.age > options.particleMaxAge) {
				particle = particles[i] = self._createParticle(0);
			}

			x = particle.x;
			y = particle.y;
			v = self._field(x, y);

			if (!v[2]) {
				particle = particles[i] = self._createParticle(0);
			} else {
				particle.xt = x + v[0] * fieldScale;
				particle.yt = y + v[1] * fieldScale;

				batches[self._colorIndex(v[2])].push(particle);
			}

			particle.age++;
		}

		self._batches = batches;
	},

	_buildGrid: function() {
		var self = this;
		var map = self._map;
		var options = self.options;

		if (!map || !self._dirty) {
			return;
		}

		// 格网地理尺寸
		var extent = self._gridExtent = map.getExtent();
		var maxExtent = map.options.maxExtent || extent;
		var size = map.getSize();
		var dim = Math.max(size[0], size[1]);
		var gridDivs = Math.min(dim / options.gridPixels, options.gridMaxDivs);
		if (G.Browser.mobile) {
			gridDivs /= options.gridReduceFactor;
		}
		var gridSize = self._gridSize = Math.max(extent[2] - extent[0], extent[3] - extent[1]) / gridDivs;

		// 采样范围
		var searched = self._tree.search(extent);
		var count = searched && searched.length;
		var divCount = Math.sqrt(count) || 1;
		var expand = Math.max((extent[2] - extent[0]), (extent[3] - extent[1])) / divCount;
		var tryExpand, tryCount;

		// 构建格网
		self._gridColCount = Math.ceil((extent[2] - extent[0]) / gridSize);
		self._gridRowCount = Math.ceil((extent[3] - extent[1]) / gridSize);
		var grid = self._grid = [];
		var x, y;
		for (var j = 0, jLen = self._gridRowCount + 1; j < jLen; j++) {
			y = extent[1] + j * gridSize;

			if (y >= maxExtent[1] && y <= maxExtent[3]) {
				var row = [];
				for (var i = 0, iLen = self._gridColCount + 1; i < iLen; i++) {
					x = extent[0] + i * gridSize;

					row[i] = self._interpolate(x, y, [x - expand, y - expand, x + expand, y + expand]);

					tryCount = 1;
					while (row[i][2] === null && tryCount <= options.searchSteps) {
						tryCount *= 2;
						tryExpand = tryCount * expand;
						row[i] = self._interpolate(x, y, [x - tryExpand, y - tryExpand, x + tryExpand, y + tryExpand]);
					}
				}

				grid[j] = row;
			}
		}

		self._dirty = false;
		self._builtExtent = map.getExtent();
	},

	_interpolate: function(x, y, searchExtent) {
		var self = this;
		var sqrt = Math.sqrt;

		var searched = self._tree.search(searchExtent);
		if (!searched) {
			return self._nullVector;
		}

		var Σux = 0,
			Σvx = 0,
			Σweight = 0;
		var dx, dy, dd, weight;
		var dataPoint, u, v;
		for (var i = 0, iLen = Math.min(self.options.interpolateCount, searched.length); i < iLen; i++) {
			dataPoint = searched[i];

			dx = dataPoint.x - x;
			dy = dataPoint.y - y;

			if (dx == 0 && dy == 0) {
				u = dataPoint.u;
				v = dataPoint.v;
				return [u, v, sqrt(u * u + v * v)];
			}

			dd = dx * dx + dy * dy;
			weight = Math.sqrt(1 / dd);

			Σux += dataPoint.u * weight;
			Σvx += dataPoint.v * weight;
			Σweight += weight;
		}

		if (Σweight > 0) {
			u = Σux / Σweight;
			v = Σvx / Σweight;
			return [u, v, sqrt(u * u + v * v)];
		}

		return self._nullVector;
	},

	_colorIndex: function(m) {
		var self = this;
		var options = self.options;

		var fieldMaxIntensity = options.fieldMaxIntensity;
		return Math.floor(Math.min(m, fieldMaxIntensity) / fieldMaxIntensity * (options.colors.length - 1));
	}


});