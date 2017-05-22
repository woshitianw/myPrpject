/* global G:false */
G.Layer.Graphic = G.Layer.Graphic.extend({

	_initContainer: function() {
		var self = this,
			map = self._map,
			domUtil = G.DomUtil;

		var container = self._container = domUtil.create('div', 'g-layer');

		var className = 'g-graphic-container g-zoom-animated';
		self._svg = domUtil.createSVG('svg', className, container);
		self._defs = domUtil.createSVG('defs', '', self._svg);

		map._layersFrame.appendChild(container);

		domUtil.setZIndex(container, self._zIndex);
	},

	_update: function() {
		var self = this;

		if (self.isVisible()) {
			self._draw();
		} else {
			self._erase();
		}
	},

	_draw: function() {
		var self = this,
			map = self._map;
		var domUtil = G.DomUtil;
		var svg = self._svg;
		var mapFramePos = domUtil.getPosition(map._mapFrame);
		var size = map.getSize();
		var drawSize = map.getDrawSize();
		var w = drawSize[0];
		var h = drawSize[1];
		var dx = (w - size[0]) / 2,
			dy = (h - size[1]) / 2; // 旋转后的绘制窗口和原始窗口的左上角偏移距离

		if (map.isZooming() || map.isDragging() || map.isPanning() || map.isRotating()) {
			return;
		}

		domUtil.setZIndex(self._container, self._zIndex);

		domUtil.show(svg);

		svg.style[domUtil.Transform] = domUtil.genTranslateStyle(-dx, -dy);

		svg.setAttribute('width', w);
		svg.setAttribute('height', h);
		svg.setAttribute('viewBox', [-mapFramePos[0], -mapFramePos[1], w, h].join(' '));

		var extent = map.getRedrawExtent();

		var g, key, bbox;
		for (key in self._graphics) {
			g = self._graphics[key];
			bbox = g.bbox;

			if (g._layer && G.ExtentUtil.overlaps(bbox, extent)) {
				g._draw();
			} else {
				g._erase();
			}
		}
	},

	_erase: function() {
		var self = this;
		var svg = self._svg;

		G.DomUtil.hide(svg);
	},

	_onClear: function() {
		var self = this;

		var svg = self._svg;
		if (svg) {
			svg.innerHTML = '';

			// 某些移动平台上svg需要手动移除子元素
			while (svg.lastChild) {
				svg.removeChild(svg.lastChild);
			}

			self._defs = G.DomUtil.createSVG('defs', '', self._svg);
		}
	},

	_onZoomStart: function(e) {
		var self = this,
			map = self._map,
			mapFrame = map._mapFrame,
			rotate = map._rotate,
			svg = self._svg,
			domUtil = G.DomUtil,
			transition = domUtil.Transition,
			transform = domUtil.Transform;

		if (!svg) {
			return;
		}

		if (!self._zooming) {
			self._zooming = true;
		}

		var size = map.getSize();
		var drawSize = map.getDrawSize();
		var w = drawSize[0];
		var h = drawSize[1];
		var dx = (w - size[0]) / 2,
			dy = (h - size[1]) / 2; //dx, dy为旋转后svg与旋转后窗口大小原点的偏移

		var centerScreen = [size[0] / 2, size[1] / 2],
			aroundScreen = e.aroundScreen || centerScreen;

		//centerScreen = G.MathUtil.rotateVector(centerScreen, rotate);
		//aroundScreen = G.MathUtil.rotateVector(aroundScreen, rotate);

		var xx = centerScreen[0] - aroundScreen[0],
			yy = centerScreen[1] - aroundScreen[1];

		if (rotate && xx && yy) {
			var v = G.MathUtil.rotateVector([xx, yy], -rotate);

			aroundScreen = [centerScreen[0] - v[0], centerScreen[1] - v[1]];
		}

		aroundScreen = self._aroundScreen =
			[aroundScreen[0] - centerScreen[0], aroundScreen[1] - centerScreen[1]]; // SVG rotate around its center

		var style = G.DomUtil.genScaleStyle(1 / e.scale,
			aroundScreen[0], aroundScreen[1], -dx, -dy);

		svg.style[transform] = style;

		var ignoreAnim = map._zoomAnim && map._zoomAnim._params.ignoreAnim;
		if (!ignoreAnim) {
			svg.style[transition] = mapFrame.style[transition];
		}
	},

	_onZoomUpdate: function(e) {
		var self = this,
			map = self._map,
			mapFrame = map._mapFrame,
			svg = self._svg,
			domUtil = G.DomUtil,
			transition = domUtil.Transition,
			transform = domUtil.Transform;

		if (!svg) {
			return;
		}

		if (!self._zooming) {
			return;
		}

		var aroundScreen = self._aroundScreen;

		var size = map.getSize();
		var drawSize = map.getDrawSize();
		var dx = (drawSize[0] - size[0]) / 2,
			dy = (drawSize[1] - size[1]) / 2; //dx, dy为旋转后svg与旋转后窗口大小原点的偏移

		var style = G.DomUtil.genScaleStyle(1 / e.scale,
			aroundScreen[0], aroundScreen[1], -dx, -dy);
		svg.style[transform] = style;

		var ignoreAnim = map._zoomAnim && map._zoomAnim._params.ignoreAnim;
		if (!ignoreAnim) {
			svg.style[transition] = mapFrame.style[transition];
		}
	},

	_onZoomEnd: function() {
		var self = this,
			map = self._map,
			svg = self._svg,
			domUtil = G.DomUtil;

		if (!svg) {
			return;
		}

		var size = map.getSize();
		var drawSize = map.getDrawSize();
		var dx = (drawSize[0] - size[0]) / 2,
			dy = (drawSize[1] - size[1]) / 2; //dx, dy为旋转后svg与旋转后窗口大小原点的偏移

		svg.style.visibility = '';
		svg.parentNode.appendChild(svg);

		svg.style[domUtil.Transform] = domUtil.genTranslateStyle(-dx, -dy);
		svg.style[domUtil.Transition] = '';

		self._zooming = false;
	}


});
/* global G:false */
G.Layer.Tile = G.Layer.Tile.extend({

	_initContainer: function() {
		var self = this;
		var map = self._map;
		var domUtil = G.DomUtil;

		var container = self._container = domUtil.create('div', 'g-layer');

		var className = 'g-tile-container g-zoom-animated';
		self._bg = domUtil.create('div', className, self._container);
		self._front = domUtil.create('div', className, self._container);

		map._layersFrame.appendChild(self._container);

		domUtil.setZIndex(container, self._zIndex);
	},

	_destroyContainer: function() {
		var self = this;

		self._container.parentNode.removeChild(self._container);
		delete self._container;
	},

	_update: function() {
		var self = this,
			map = self._map;

		if (!map._isLoaded()) {
			return;
		}

		var zoom = self._zoom = self._calcNearestZoom(true),
			tileInfos = self._calcVisTileInfos(true),
			size = map.getSize(),
			center = map.getCenter(),
			options = self.options,
			zoomRes = options.zoomReses[zoom],
			tileSize = options.tileSize,
			drawSize = map.getDrawSize(),
			w = drawSize[0],
			h = drawSize[1],
			xmin = center[0] - w * zoomRes / 2,
			xmax = center[0] + w * zoomRes / 2,
			ymin = center[1] - h * zoomRes / 2,
			ymax = center[1] + h * zoomRes / 2,
			extentRedraw = [xmin, ymin, xmax, ymax],
			extentMap = map.options.maxExtent,
			idxX, idxY, tile, tileInfo, tileZoom, tileXmin, tileXmax, tileYmin, tileYmax, tileInExtent, tileRes;

		self._redrawExtent = extentRedraw;
		var extent = G.ExtentUtil.intersect(extentRedraw, extentMap);

		for (var key in self._tiles) {
			tile = self._tiles[key];
			tileInfo = tile._info;
			idxX = tileInfo[0];
			idxY = tileInfo[1];
			tileZoom = tileInfo[2];
			tileRes = options.zoomReses[tileZoom];

			if (tileZoom !== zoom) {
				self._stopLoadingTile(tile);

				if (!options.keepResample || options.opacity < 1) {
					self._removeTile(key);
				}
			}

			tileXmin = options.originX + idxX * tileSize * tileRes;
			tileXmax = options.originX + (idxX + 1) * tileSize * tileRes;
			tileYmin = options.originY - (idxY + 1) * tileSize * tileRes;
			tileYmax = options.originY - idxY * tileSize * tileRes;
			tileInExtent = G.ExtentUtil.overlaps([tileXmin, tileYmin, tileXmax, tileYmax], extent);
			if (!tileInExtent && !self._tileInfoExist(tileInfo, tileInfos)) {
				self._removeTile(key);
			}
		}

		self._placeLoadedTiles(self._bg);
		self._placeLoadedTiles(self._front);

		var centerTileIndex = self._calcTileIndex(center[0], center[1], zoom);
		self._sortTileInfos(tileInfos, centerTileIndex[0], centerTileIndex[1]);
		self._addTiles(tileInfos);
	},

	_draw: function() {
		var self = this,
			map = self._map;
		var domUtil = G.DomUtil;

		if (!map._isLoaded()) {
			return;
		}

		domUtil.show(self._bg);
		domUtil.show(self._front);
		domUtil.setZIndex(self._container, self._zIndex);

		self._placeLoadedTiles(self._bg);
		self._placeLoadedTiles(self._front);
	},

	_erase: function() {
		var self = this;
		var domUtil = G.DomUtil;

		domUtil.hide(self._bg);
		domUtil.hide(self._front);
	},

	_onZoomStart: function(e) {
		var self = this,
			map = self._map,
			mapFrame = map._mapFrame,
			size = map.getSize(),
			rotate = map._rotate,
			front = self._front,
			bg = self._bg,
			domUtil = G.DomUtil,
			transition = domUtil.Transition,
			transform = domUtil.Transform;

		if (self._zooming) {
			return;
		}

		self._zooming = true;

		self._prepareBgBuffer();

		var centerScreen = [size[0] / 2, size[1] / 2],
			aroundScreen = e.aroundScreen || centerScreen,
			dx = centerScreen[0] - aroundScreen[0],
			dy = centerScreen[1] - aroundScreen[1];

		if (rotate && dx && dy) {
			var v = G.MathUtil.rotateVector([dx, dy], -rotate);

			aroundScreen = [centerScreen[0] - v[0], centerScreen[1] - v[1]];
		}

		self._aroundScreen = aroundScreen;

		var ignoreAnim = map._zoomAnim && map._zoomAnim._params.ignoreAnim;

		var style = G.DomUtil.genScaleStyle(1 / e.scale,
			aroundScreen[0], aroundScreen[1]);
		front.style[transform] = style;
		bg.style[transform] = style;

		if (!ignoreAnim) {
			front.style[transition] = mapFrame.style[transition];
			bg.style[transition] = mapFrame.style[transition];
		}
	},

	_onZoomUpdate: function(e) {
		var self = this,
			front = self._front,
			bg = self._bg,
			domUtil = G.DomUtil,
			transform = domUtil.Transform;

		if (!self._zooming) {
			return;
		}

		var aroundScreen = self._aroundScreen;

		var style = domUtil.genScaleStyle(1 / e.scale,
			aroundScreen[0], aroundScreen[1]);
		front.style[transform] = style;
		bg.style[transform] = style;
	},

	_onZoomEnd: function() {
		var self = this,
			front = self._front,
			bg = self._bg,
			domUtil = G.DomUtil,
			transition = domUtil.Transition,
			transform = domUtil.Transform;

		//front.style.visibility = '';
		front.parentNode.appendChild(front);

		front.style[transform] = '';
		front.style[transition] = '';

		bg.style[transform] = '';
		bg.style[transition] = '';

		self._zooming = false;
	},

	_clearBgBuffer: function() {
		var self = this,
			map = self._map;

		if (map && !map._zooming) {
			self._bg.innerHTML = '';
		}
	},

	_prepareBgBuffer: function() {
		var self = this,
			front = self._front,
			bg = self._bg;

		self._stopLoadingTiles(bg);

		//bg.style.visibility = 'hidden';
		//bg.style[G.DomUtil.Transform] = '';

		self._front = bg;
		self._bg = front;
	},

	_placeLoadedTiles: function(container) {
		var self = this,
			options = self.options,
			maxZoom = options.zoomReses.length,
			zoom = self._calcNearestZoom(true);

		var tiles = container.getElementsByTagName('img');
		var tile, tileInfo, idxX, idxY, tileZoom, zIndex;

		for (var i = 0, len = tiles.length; i < len; i++) {
			tile = tiles[i];
			if (!tile) {
				continue;
			}

			if (tile.complete) {
				tileInfo = tile._info;

				idxX = parseInt(tileInfo[0]);
				idxY = parseInt(tileInfo[1]);
				tileZoom = parseInt(tileInfo[2]);

				zIndex = tileZoom == zoom ? maxZoom + 1 : tileZoom;

				self._placeTile(tile, idxX, idxY, tileZoom, zIndex);
			}
		}
	},

	_addTiles: function(tileInfos) { //[[x1, y1, zoom], [x2, y2, zoom], ...]
		var self = this;

		if (tileInfos.length === 0) {
			return;
		}

		// Clear tile numbers
		self._numLoad = tileInfos.length;
		self._numLoadSuccess = 0;
		self._numLoadError = 0;

		var df = document.createDocumentFragment();

		var options = self.options,
			maxZoom = options.zoomReses.length,
			tile, tileInfo, idxX, idxY, tileZoom, key,
			zoomRes;

		var errorUrl = self.options.errorTileUrl || G.Layer.Tile.EMPTY_TILE;

		for (var i = 0, len = tileInfos.length; i < len; i++) {
			tileInfo = tileInfos[i];
			idxX = tileInfo[0];
			idxY = tileInfo[1];
			tileZoom = tileInfo[2];
			zoomRes = options.zoomReses[tileZoom];

			// Check if tile exist.
			key = self._getTileName(idxX, idxY, tileZoom);
			tile = self._tiles[key];
			if (tile) {
				if (tile.src == errorUrl) {
					if (+new Date() - tile._responseTime > options.tileLiveMs) {
						self._loadTile(tile, idxX, idxY, tileZoom);
					}
				} else {
					self._numLoadSuccess++;
				}
			} else {
				tile = self._getIdleTile();
				self._tiles[key] = tile;

				self._loadTile(tile, idxX, idxY, tileZoom);
			}

			if (tile.parentNode !== self._front) {
				df.appendChild(tile);

				if (tile._wraps) {
					for (var j in tile._wraps) {
						var wrapTile = tile._wraps[j];
						if (wrapTile && wrapTile.parentNode !== self._front) {
							df.appendChild(wrapTile);
						}
					}
				}
			}

			self._placeTile(tile, idxX, idxY, tileZoom, maxZoom);
		}

		self._front.appendChild(df);

		self._checkAllHandled();
	},

	_onNewWrapTile: function(tile, wrapId) {
		var self = this;
		var wrapTile = tile._wraps[wrapId];
		if (wrapTile) {
			if (wrapTile.parentNode !== self._front) {
				self._front.appendChild(wrapTile);
			}
		}
	}


});
/* global G:false */
G.Layer.Label = G.Layer.Graphic.extend({
	mixins: [G.Layer.LOD],

	options: {
		icons: '', // icon's root url
		cluster: [], // ['server1', 'server2']
		crossOrigin: '*'
	},

	init: function(url, options) {
		var self = this;

		G.Layer.Graphic.prototype.init.call(self, options);

		self.url = url;
		self.options = G.Util.merge({}, self.options, options);

		self._lts = {};

		self._gx = self._gy = 10; // Grid x|y size, used for measure label overlap
	},

	_initContainer: function() {
		var self = this;

		G.Layer.Graphic.prototype._initContainer.call(self);
	},

	_onAdded: function() {
		var self = this;

		if (!self._container) {
			self._initContainer();
		}
	},


	_onRemoved: function() {
		var self = this;

		if (self._container) {
			self._destroyContainer();
		}
	},

	_update: function() {
		var self = this,
			map = self._map;

		G.Layer.Graphic.prototype._update.call(self);

		if (!map._isLoaded()) {
			return;
		}

		var zoom = self._zoom = self._calcNearestZoom(true);
		var center = map.getCenter();

		self._clearGrids();

		var zoomAnim = map._zoomAnim;
		if (zoomAnim && zoomAnim._playing) {

		} else {
			var tileInfos = self._calcVisTileInfos();

			var centerTileIndex = self._calcTileIndex(center[0], center[1], zoom);
			self._sortTileInfos(tileInfos, centerTileIndex[0], centerTileIndex[1]);
			self._setLts(tileInfos);
		}

	},

	_setLts: function(tileInfos) { // [[x1, y1, zoom], [x2, y2, zoom], ...]
		var self = this;

		if (!tileInfos.length) {
			return;
		}

		var keys = [],
			key, lt,
			tileInfo, idxX, idxY, tileZoom;
		for (var i = 0, len = tileInfos.length; i < len; i++) {
			tileInfo = tileInfos[i];
			idxX = tileInfo[0];
			idxY = tileInfo[1];
			tileZoom = tileInfo[2];
			key = self._getTileName(idxX, idxY, tileZoom);
			keys.push(key);

			if (key in self._lts) {
				lt = self._lts[key];
				if (!lt.loading) {
					if (!lt.data && !lt.ri) {
						self._loadLtI(idxX, idxY, tileZoom);
					}
				}
			} else {
				self._loadLtI(idxX, idxY, tileZoom);
			}

			self._placeLt(key);
		}

		// Mark unvisible tiles, remove them when visible tiles loaded
		self._dirtyTileKeys = self._dirtyTileKeys || [];
		for (key in self._lts) {
			if (keys.indexOf(key) > -1) {
				continue;
			}

			self._stopLoadingLt(key);
			self._dirtyTileKeys.push(key);
		}
	},

	_checkDirtyTiles: function() {
		var self = this;
		var dirtyTileKeys = self._dirtyTileKeys;

		var key;
		if (dirtyTileKeys && dirtyTileKeys.length > 0) {
			for (var i = 0, len = dirtyTileKeys.length; i < len; i++) {
				key = dirtyTileKeys[i];
				self._removeLt(key);
			}
		}

		self._dirtyTileKeys = [];
	},

	_placeLt: function(key) {
		var self = this,
			lt = self._lts[key];

		if (!lt || !lt._info || !lt.data) {
			return;
		}

		var ils = lt.data.l;
		var id, il, lx, ly, lw, lh, lOffsetX, lOffsetY, lr;
		var data, img, width, height, offsetX, offsetY;
		var pt, imgsKey, imgs, imgKey;
		var g;
		for (id in ils) {
			il = ils[id];
			lx = Number(il[0]);
			ly = Number(il[1]);
			lw = Number(il[2]);
			lh = Number(il[3]);
			lOffsetX = Number(il[4]);
			lOffsetY = Number(il[5]);
			lr = il[6];

			pt = [lx, ly];

			imgsKey = 'imgs' + id;
			imgs = lt[imgsKey];
			for (imgKey in imgs) {
				data = imgs[imgKey];
				img = data[0];
				width = data[1];
				height = data[2];
				offsetX = data[3];
				offsetY = data[4];
				g = data[5];
				if (!g) {
					data[5] = g = new G.Graphic.Point(pt, null, {
						shape: 'image',
						size: [width, height],
						offset: [offsetX, offsetY],
						image: img,
						imageGravity: !!lr
					});

					g.addTo(self);
				}
			}

		}

	},

	_removeLt: function(key) {
		var self = this,
			lt = self._lts[key];

		if (!lt || !lt._info || !lt.data) {
			return;
		}

		self._stopLoadingLt(key);

		var ils = lt.data.l;
		var id;
		var imgData, img;
		var imgsKey, imgs, imgKey;
		for (id in ils) {
			imgsKey = 'imgs' + id;
			imgs = lt[imgsKey];
			for (imgKey in imgs) {
				imgData = imgs[imgKey];
				g = imgData[5];

				if (g) {
					g.remove();
				}
			}
		}

		delete self._lts[key];
	},

	_loadLtI: function(idxX, idxY, zoom) {
		var self = this;

		var key = self._getTileName(idxX, idxY, zoom);
		var lt = self._lts[key] = self._lts[key] || {};

		// Cache tileInfo
		lt._info = [idxX, idxY, zoom];

		// Already tried to load before and got 404 response
		if (lt.data === '') {
			return;
		}

		lt.loading = true;

		var url = self._getTileUrl(idxX, idxY, zoom, {
			d: 'i',
			i: G.Browser.retina ? '@2x' : ''
		});

		var header = {};
		if (self.options.crossOrigin) {
			header.crossOrigin = self.options.crossOrigin;
		}

		var options = {
			responseType: (url.slice(0, 4).toLowerCase() === 'http') ? 'JSONP' : 'JSON',
			header: header,
			success: function(xhr, data) {
				lt.data = data;
				self._processLt(key);
			},
			error: function(xhr) {
				if (xhr.status == 404) { // Does not exist, do not retry anymore
					lt.data = '';
				}
			},
			complete: function() {
				delete lt.ri;
				lt.loading = false;
			}
		};

		if (self.options.crossOrigin) {
			options.responseType = 'JSON';
		}

		var req = G.Util.ajax(url, options);
		lt.ri = req;
	},

	_processLt: function(key) {
		var self = this,
			lt = self._lts[key];

		var data = lt.data;
		if (!data) {
			return;
		}

		var ils = data.l,
			ibs = data.b,
			iis = data.i,
			ibb = data.bb;

		var iconsRoot = self.options.icons || '';

		var il, id, lx, ly, lr;
		var width, height, offsetX, offsetY, dataOffset, dataLen, src;
		var ib, ibo;
		var ii, iio;
		var imgData, img, imgKey;
		var j, jLen;
		for (id in ils) {
			il = ils[id];
			lx = Number(il[0]);
			ly = Number(il[1]);
			lr = il[6];

			if (ibs && id in ibs) {
				ib = ibs[id];
				for (j = 0, jLen = ib.length; j < jLen; j++) {
					ibo = ib[j];
					width = ibo[0];
					height = ibo[1];
					offsetX = ibo[2];
					offsetY = ibo[3];
					dataOffset = ibo[4];
					dataLen = ibo[5];

					if (dataLen == 0 || !ibb) {
						continue;
					}

					imgData = ibb.slice(dataOffset, dataOffset + dataLen);
					img = 'data:image/png;base64,' + imgData;

					imgKey = 'b' + j;
					lt['imgs' + id] = lt['imgs' + id] || {};
					lt['imgs' + id][imgKey] = [img, width, height, offsetX, offsetY];
				}
			}

			if (iis && id in iis) {
				ii = iis[id];
				for (j = 0, jLen = ii.length; j < jLen; j++) {
					iio = ii[j];
					width = iio[0];
					height = iio[1];
					offsetX = iio[2];
					offsetY = iio[3];
					src = iio[4];

					img = iconsRoot + src;

					imgKey = 'i' + j;
					lt['imgs' + id] = lt['imgs' + id] || {};
					lt['imgs' + id][imgKey] = [img, width, height, offsetX, offsetY];
				}
			}
		}

		self._checkDirtyTiles(); // Before display new loaded tile, check dirty tiles to remove
		self._placeLt(key);
	},

	_stopLoadingLt: function(key) {
		var lt = this._lts[key],
			ajaxCancel = G.Util.ajaxCancel;

		if (!lt) {
			return;
		}

		ajaxCancel(lt.ri);
		lt.loading = false;

	},

	_onIconLoad: function() {
		this._dirtyIcons = true;
	},

	_clearGrids: function() {
		this._g = {};
	},

	_hitGrids: function(gxmin, gymin, gxmax, gymax) {
		var self = this;
		var gkey;
		for (var i = gxmin; i <= gxmax; i++) {
			for (var j = gymin; j <= gymax; j++) {
				gkey = i + ',' + j;
				if (self._g[gkey]) {
					return true;
				}
			}
		}

		return false;
	},

	_markGrids: function(gxmin, gymin, gxmax, gymax) {
		var self = this;
		var gkey;
		for (var i = gxmin; i <= gxmax; i++) {
			for (var j = gymin; j <= gymax; j++) {
				gkey = i + ',' + j;
				self._g[gkey] = true;
			}
		}

	}


});
/* global G:false */
G.Layer.FeatureService = G.Layer.Graphic.extend({
	mixins: [G.Layer.LOD],

	options: {
		mode: 'all', // tile | all
		vacuumCount: 1000 // Vacuum when graphics count is greater than it, only useful when mode is 'tile'
	},

	init: function(reqFunc, options) { // reqFunc=function(extent){}, extent is undefined if mode is 'all'
		var self = this;

		G.Layer.Graphic.prototype.init.call(self, options);

		self.options = G.Util.merge({}, self.options, options);

		self._reqFunc = reqFunc;

		self._loadingKeys = {};
	},

	onSuccess: function(extent) {
		var self = this;

		if (self.options.mode == 'tile') {
			self.fireEvent('loadTileSuccess', {
				extent: extent
			});
		} else {
			self.fireEvent('loadAllSuccess');
		}
	},

	onError: function(extent) {
		var self = this;

		if (self.options.mode == 'tile') {
			self.fireEvent('loadTileError', {
				extent: extent
			});
		} else {
			self.fireEvent('loadAllError');
		}
	},

	onComplete: function(extent) {
		var self = this;

		if (self.options.mode == 'tile') {
			var key = extent.join(',');
			delete self._loadingKeys[key];

			self.fireEvent('loadTileComplete', {
				extent: extent
			});
		} else {
			self.fireEvent('loadAllComplete');
		}
	},

	_update: function() {
		var self = this,
			map = self._map;

		G.Layer.Graphic.prototype._update.call(self);

		if (!map._isLoaded()) {
			return;
		}

		if (self.options.mode == 'tile') {
			var count = self.count();
			if (count > self.options.vacuumCount) {
				self._vacuum();
			}

			var tileInfos = self._calcVisTileInfos();
			self._addFts(tileInfos);
		} else {
			self._loadAll();
		}
	},

	_addFts: function(tileInfos) { // [[x1, y1, zoom], [x2, y2, zoom], ...]
		var self = this;

		if (tileInfos.length === 0) {
			return;
		}

		var i, len;
		var key, req;
		var tileInfo, idxX, idxY, tileZoom, extent;
		var loadingKeys = self._loadingKeys;
		var keys = {};
		for (i = 0, len = tileInfos.length; i < len; i++) {
			tileInfo = tileInfos[i];
			idxX = tileInfo[0];
			idxY = tileInfo[1];
			tileZoom = tileInfo[2];
			extent = self._calcTileExtent(idxX, idxY, tileZoom);

			key = extent.join(',');
			keys[key] = extent;
		}

		for (key in loadingKeys) {
			if (!keys[key]) {
				req = loadingKeys[key];
				G.Util.ajaxCancel(req);
				delete loadingKeys[key];
			}
		}

		for (key in keys) {
			extent = keys[key];
			self._loadFt(extent);
		}
	},

	_loadFt: function(extent) {
		var self = this;
		var key = extent.join(',');
		var reqFunc = self._reqFunc;

		if (key in self._loadingKeys) {
			return;
		}

		if (!reqFunc) {
			return;
		}

		var req = reqFunc.call(self, extent);
		self._loadingKeys[key] = req;

		self.fireEvent('loadTileStart', {
			extent: extent
		});
	},

	_loadAll: function() {
		var self = this;
		var key = 'all';
		var reqFunc = self._reqFunc;

		if (key in self._loadingKeys) {
			return;
		}

		if (!reqFunc) {
			return;
		}

		var req = reqFunc.call(self);
		self._loadingKeys[key] = req;

		self.fireEvent('loadAllStart');
	}



});
/* global G:false */
G.Layer.GeoHeyFeature = G.Layer.FeatureService.extend({

	options: {
		apiKey: '',
		where: '1=1',
		outFields: '',
		limit: 1000
	},

	init: function(url, options) {
		var self = this;

		var func = function(extent) {
			var _url = url + '/query';
			var layerOptions = self.options;
			var data = {
				ak: layerOptions.apiKey,
				where: layerOptions.where,
				outFields: layerOptions.outFields,
				limit: layerOptions.limit
			};

			if (extent) {
				data.geometry = JSON.stringify(extent);
			}

			var reqOptions = {
				responseType: (_url.slice(0, 4).toLowerCase() === 'http') ? 'JSONP' : 'JSON',
				data: data,
				success: function(xhr, obj) {
					var data = obj.data;
					var geometryType = data.geometryType;
					var features = data.features;
					if (features) {
						var i, maxI = features.length - 1,
							minI = Math.max(0, maxI - layerOptions.limit),
							feature, fid, geom, attrs, id, gs = [],
							j, g;
						for (i = maxI; i >= minI; i--) {
							feature = features[i];
							fid = feature.id;
							geom = feature.geom;
							attrs = feature.attrs || {};

							if (geometryType == 'Point') {
								gs.push(new G.Graphic.Point(geom, attrs));
							} else if (geometryType == 'Polyline') {
								gs.push(new G.Graphic.Polyline(geom, attrs));
							} else if (geometryType == 'Polygon') {
								gs.push(new G.Graphic.Polygon(geom, attrs));
							} else if (geometryType == 'MultiPoint') {
								gs.push(new G.Graphic.MultiPoint(geom, attrs));
							} else if (geometryType == 'MultiPolyline') {
								gs.push(new G.Graphic.MultiPolyline(geom, attrs));
							} else if (geometryType == 'MultiPolygon') {
								gs.push(new G.Graphic.MultiPolygon(geom, attrs));
							}

							for (j in gs) {
								g = gs[j];
								if (!g) {
									continue;
								}

								id = fid + '_' + j;
								if (self.get(id)) {
									continue;
								} else {
									g.addTo(self, id);
								}
							}

						}
					}

					self.onSuccess(extent);
				},
				error: function() {
					self.onError(extent);
				},
				complete: function() {
					self.onComplete(extent);
				}
			};

			G.Util.ajax(_url, reqOptions);
		};

		G.Layer.FeatureService.prototype.init.call(self, func, options);
	}



});
/* global G:false */
G.Layer.GeoHeyProgressiveFeature = G.Layer.Graphic.extend({

	options: {
		stepFactor: 4,
		stepCount: 4,
		tolerance: 8,
		outFields: '[]'
	},

	init: function(url, options) {
		var self = this;

		G.Layer.Graphic.prototype.init.call(self, options);

		self.url = url;
	},

	onSuccess: function(extent) {
		this.fireEvent('extentSuccess', {
			extent: extent
		});
	},

	onError: function(extent) {
		this.fireEvent('extentError', {
			extent: extent
		});
	},

	onComplete: function(extent) {
		var self = this;

		self.fireEvent('extentComplete', {
			extent: extent
		});
	},

	_update: function() {
		var self = this,
			map = self._map;

		var res = self._loadRes = map._res;
		var extent = self._loadExtent = map.getExtent();

		var loadedStatus = self._loadedStatus;
		if (loadedStatus && res == loadedStatus[0] && G.ExtentUtil.equals(extent, loadedStatus[1])) {
			return;
		}

		G.Layer.Graphic.prototype._update.call(self);

		if (!map._isLoaded()) {
			return;
		}

		var req = self._req;
		if (req) {
			G.Util.ajaxCancel(req);
		}

		// Mark dirty
		var g, i;
		var graphics = self._graphics;
		for (i in graphics) {
			g = graphics[i];
			g._dirty = true;
		}

		self._loadStep(1);
	},

	_loadStep: function(step) {
		var self = this;
		var options = self.options;

		var loadRes = self._loadRes;
		var loadExtent = self._loadExtent;

		var cellPixel = options.tolerance * Math.pow(options.stepFactor, (options.stepCount - step));
		var url = self.url + '/filter';

		var reqOptions = {
			//responseType: (url.slice(0, 4).toLowerCase() === 'http') ? 'JSONP' : 'JSON',
			responseType: 'JSON', //test
			data: {
				extent: JSON.stringify(loadExtent),
				excludeExtents: JSON.stringify([]),
				res: loadRes,
				cellPixel: cellPixel,
				outFields: options.outFields
			},
			success: function(xhr, data) {
				self._processResult(step, data);
			},
			complete: function() {
				self._req = null;
			}
		};

		self._req = G.Util.ajax(url, reqOptions);
	},

	_processResult: function(step, data) {
		var self = this;
		var options = self.options;

		var loadRes = self._loadRes;
		var loadExtent = self._loadExtent;

		var cellPixel = options.tolerance * Math.pow(options.stepFactor, (options.stepCount - step));
		var realRes = loadRes * cellPixel;

		var geometryType = data.geometryType;
		var features = data.features;
		if (!features) {
			self.onError(loadExtent);
			self.onComplete(loadExtent);
			return;
		}

		var i, maxI = features.length - 1,
			feature, fid, geom, attrs,
			partKey, partGeom,
			g;
		for (i = maxI; i >= 0; i--) {
			feature = features[i];
			fid = feature.id;
			geom = feature.geom;
			attrs = feature.attrs || {};

			if (geometryType == 'Point') {
				g = new G.Graphic.Point(geom, attrs);
				self._updateGraphic(realRes, fid, 0, g);
			} else if (geometryType == 'Polyline') {
				g = new G.Graphic.Polyline(geom, attrs);
				self._updateGraphic(realRes, fid, 0, g);
			} else if (geometryType == 'Polygon') {
				g = new G.Graphic.Polygon(geom, attrs);
				self._updateGraphic(realRes, fid, 0, g);
			} else if (geometryType == 'MultiPoint') {
				for (partKey in geom.multi) {
					partGeom = geom.multi[partKey];
					g = new G.Graphic.Point(partGeom, attrs);
					self._updateGraphic(realRes, fid, partKey, g);
				}
			} else if (geometryType == 'MultiPolyline') {
				for (partKey in geom.multi) {
					partGeom = geom.multi[partKey];
					g = new G.Graphic.Polyline(partGeom, attrs);
					self._updateGraphic(realRes, fid, partKey, g);
				}
			} else if (geometryType == 'MultiPolygon') {
				for (partKey in geom.multi) {
					partGeom = geom.multi[partKey];
					g = new G.Graphic.Polygon(partGeom, attrs);
					self._updateGraphic(realRes, fid, partKey, g);
				}
			}

		}

		if (step < options.stepCount) {
			self._loadStep(step + 1);
		} else {
			self._clearDirty();
			self._loadedStatus = [loadRes, loadExtent];

			self.onSuccess(loadExtent);
			self.onComplete(loadExtent);
		}

	},

	_updateGraphic: function(res, fid, partKey, g) {
		var self = this;
		var id = fid + (partKey ? '_' + partKey : '');
		var old = self.get(id);
		if (old) {
			if (res < old._res) {
				old.updateGeom(g.geom, true);
				old._res = res;
			}

			old._dirty = false;
		} else {
			g._res = res;
			g.addTo(self, id);
		}
	},

	_clearDirty: function() {
		var self = this;
		var graphics = self._graphics;

		var g, i;
		for (i in graphics) {
			g = graphics[i];
			if (g._dirty) {
				g.remove();
			}
		}
	}



});
/* global G:false */
G.Layer.TiledService = G.Layer.extend({
	mixins: [G.Layer.LOD],

	init: function(reqFunc, options) { // reqFunc=function(x, y, zoom){}
		var self = this;

		self.options = G.Util.merge({}, self.options, options);

		self._reqFunc = reqFunc;

		self._loadingKeys = {};
		self._loadedKeys = {};
	},

	onSuccess: function(tileInfo, data) {
		var self = this;

		self._numLoadSuccess++;

		var idxX = parseInt(tileInfo[0]);
		var idxY = parseInt(tileInfo[1]);
		var tileZoom = parseInt(tileInfo[2]);
		var key = self._getTileName(idxX, idxY, tileZoom);
		self._loadedKeys[key] = tileInfo;

		self.fireEvent('loadTileSuccess', {
			tileInfo: tileInfo,
			data: data
		});
	},

	onError: function(tileInfo) {
		var self = this;

		self._numLoadError++;

		self.fireEvent('loadTileError', {
			tileInfo: tileInfo
		});
	},

	onComplete: function(tileInfo) {
		var self = this;

		var idxX = parseInt(tileInfo[0]);
		var idxY = parseInt(tileInfo[1]);
		var tileZoom = parseInt(tileInfo[2]);
		var key = self._getTileName(idxX, idxY, tileZoom);
		delete self._loadingKeys[key];

		self.fireEvent('loadTileComplete', {
			tileInfo: tileInfo
		});

		self._checkAllHandled();
	},

	_update: function() {
		var self = this,
			map = self._map;

		if (!map._isLoaded()) {
			return;
		}

		var i, len;
		var key;
		var tileInfo, idxX, idxY, tileZoom;
		var tileInfos = self._calcVisTileInfos();
		var keys = {};
		for (i = 0, len = tileInfos.length; i < len; i++) {
			tileInfo = tileInfos[i];
			idxX = tileInfo[0];
			idxY = tileInfo[1];
			tileZoom = tileInfo[2];
			key = self._getTileName(idxX, idxY, tileZoom);

			keys[key] = tileInfo;
		}
		self._addTiles(keys);

		for (key in self._loadedKeys) {
			if (!keys[key]) {
				tileInfo = self._loadedKeys[key];
				delete self._loadedKeys[key];

				self.fireEvent('unusedTile', {
					tileInfo: tileInfo
				});
			}
		}

		self._onUpdated();
	},

	_addTiles: function(keys) {
		var self = this;

		var key, req;
		var loadingKeys = self._loadingKeys;
		var tileInfo;
		for (key in loadingKeys) {
			if (!keys[key]) {
				req = loadingKeys[key];
				G.Util.ajaxCancel(req);
				delete loadingKeys[key];
			}
		}

		self._numLoad = Object.keys(keys).length;
		self._numLoadSuccess = 0;
		self._numLoadError = 0;

		for (key in keys) {
			tileInfo = keys[key];
			self._loadTile(tileInfo);
		}

		self._checkAllHandled(); // 可能不需要加载
	},

	_loadTile: function(tileInfo) {
		var self = this;
		var reqFunc = self._reqFunc;

		var idxX = parseInt(tileInfo[0]);
		var idxY = parseInt(tileInfo[1]);
		var tileZoom = parseInt(tileInfo[2]);
		var key = self._getTileName(idxX, idxY, tileZoom);

		if (key in self._loadingKeys) {
			return;
		}

		if (!reqFunc) {
			return;
		}

		if (key in self._loadedKeys) {
			self._numLoadSuccess++;
			return;
		}


		var req = reqFunc.call(self, idxX, idxY, tileZoom);
		self._loadingKeys[key] = req;

		self.fireEvent('loadTileStart', {
			tileInfo: tileInfo
		});
	},

	_stopLoadingByKey: function(key) {
		var loadingKeys = this._loadingKeys;
		var req = loadingKeys[key];

		if (!req) {
			return;
		}

		G.Util.ajaxCancel(req);
		delete loadingKeys[key];
	},

	_checkAllHandled: function() {
		var self = this;

		if (self._numLoad == self._numLoadSuccess + self._numLoadError) {
			self.fireEvent('allLoaded');
		}
	},

	_onUpdated: function() {}


});
/* global G:false */
G.Graphic.Arrow = G.Graphic.Arrow.extend({

	_onAdded: function() {
		var self = this;

		if (!self._dom) {
			self._dom = G.DomUtil.createSVG('g');
		}

		self._polygons = {};

		var map = self._layer._map;
		if (map) {
			map._requestRedraw();
		}
	},

	_onRemoved: function() {
		var self = this;

		var dom = self._dom;
		if (dom && dom.parentNode) {
			dom.parentNode.removeChild(dom);
		}

		var map = self._layer._map;
		if (map) {
			map._requestRedraw();
		}
	},

	_draw: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var options = self.options;
		var layer = self._layer;
		var map = layer._map;

		self._updateGeomDraw(map._res);

		if (!self._geomDraw) {
			return;
		}

		var svg = layer._svg;
		if (self._dom && svg && !self._dom.parentNode) {
			svg.appendChild(self._dom);
		}

		var size = map.getSize();
		var drawSize = map.getDrawSize();
		var dx = (drawSize[0] - size[0]) / 2,
			dy = (drawSize[1] - size[1]) / 2; // 旋转后的绘制窗口和原始窗口的左上角偏移距离

		var geom = self._geomDraw;
		var ptCount = geom.length;

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];
		for (var m = range[0]; m <= range[1]; m++) {
			var polygon = self._polygons[m];
			if (!polygon) {
				polygon = self._polygons[m] = domUtil.createSVG('path');

				polygon._graphic = self;
				self._dom.appendChild(polygon);
			}

			var str = '';
			var part, partStr;
			var pt, x, y;
			for (var i = 0, iLen = geom.length; i < iLen; i++) {
				part = geom[i];

				partStr = '';
				for (var j = 0, jLen = part.length; j < jLen; j++) {
					pt = map.toScreen([part[j][0] + m * mapWidth, part[j][1]], 0, 0, true);
					x = pt[0] + dx;
					y = pt[1] + dy;

					partStr += (j === 0) ? ' M ' : '';
					partStr += (j === 1) ? ' L ' : ' ';
					partStr += (x + ' ' + y);
				}
				partStr += ' Z';

				str += partStr;
			}

			polygon.setAttribute('d', str);
		}

		self._updateStyles();
	},

	_updateStyles: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var options = self.options;
		var layer = self._layer;

		var defs = layer._defs;

		for (var i in self._polygons) {
			var polygon = self._polygons[i];

			if (options.outline || self._mouseOver || self._editing) {
				polygon.setAttribute('stroke', self._editing ? options.lineHighlightColor : (options.outline ? options.outlineColor : options.fillColor));
				polygon.setAttribute('stroke-dasharray', options.outlineDashArray.join(' '));
				polygon.setAttribute('stroke-linecap', options.outlineCap);
				polygon.setAttribute('stroke-linejoin', options.outlineJoin);
				polygon.setAttribute('stroke-width', (options.outline ? options.outlineWidth : 0) + (self._mouseOver ? options.lineHighlightWiden : 0));
				polygon.setAttribute('stroke-opacity', options.outlineOpacity);
			} else {
				polygon.setAttribute('stroke', 'none');
			}

			if (options.fill) {
				if (options.fillImage) {
					var imageSrc = G.Browser.getImageSrc(options.fillImage);
					var imageSize = options.fillImageSize;
					var patternId = domUtil.svgImagePattern(defs, imageSrc, imageSize[0], imageSize[1]);
					polygon.setAttribute('fill', 'url(#' + patternId + ')');
				} else {
					polygon.setAttribute('fill', options.fillColor);
				}

				polygon.setAttribute('fill-opacity', options.fillOpacity);
			} else {
				polygon.setAttribute('fill', 'none');
			}
		}
	},

	_updateMask: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var options = self.options;
		var map = self._map;

		self._updateGeomDraw(map._res);

		if (!self._geomDraw) {
			return;
		}

		self._masks = self._masks || {};

		var size = map.getSize();
		var drawSize = map.getDrawSize();
		var dx = (drawSize[0] - size[0]) / 2,
			dy = (drawSize[1] - size[1]) / 2; // 旋转后的绘制窗口和原始窗口的左上角偏移距离

		var geom = self._geomDraw;
		var ptCount = geom.length;

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];
		for (var m = range[0]; m <= range[1]; m++) {
			var polygon = self._masks[m];
			if (!polygon) {
				polygon = self._masks[m] = domUtil.createSVG('path');

				polygon._graphic = self;
			}

			var str = '';
			var part, partStr;
			var pt, x, y;
			for (var i = 0, iLen = geom.length; i < iLen; i++) {
				part = geom[i];

				partStr = '';
				for (var j = 0, jLen = part.length; j < jLen; j++) {
					pt = map.toScreen([part[j][0] + m * mapWidth, part[j][1]], 0, 0, true);
					x = pt[0] + dx;
					y = pt[1] + dy;

					partStr += (j === 0) ? ' M ' : '';
					partStr += (j === 1) ? ' L ' : ' ';
					partStr += (x + ' ' + y);
				}
				partStr += ' Z';

				str += partStr;
			}

			polygon.setAttribute('d', str);
		}
	},

	_onStartEdit: function() {
		var graphic = this;
		var map = graphic._layer._map;
		var virtualMouse = graphic.virtualMouse;

		for (i in virtualMouse.DOWN) {
			map.addListener(virtualMouse.DOWN[i], graphic._onVertexDragStart, graphic);
		}

		graphic._refreshVertexes();
	},

	_onEndEdit: function() {
		var graphic = this;
		var map = graphic._layer._map;
		var virtualMouse = graphic.virtualMouse;

		var i, downType;
		for (i in virtualMouse.DOWN) {
			downType = virtualMouse.DOWN[i];
			map.removeListener(downType, graphic._onVertexDragStart, graphic);
			map.removeListener(virtualMouse.MOVE[downType], graphic._onVertexDrag, graphic);
			map.removeListener(virtualMouse.UP[downType], graphic._onVertexDragEnd, graphic);
		}

		graphic._removeVertexes();
	},

	_onMouseOver: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		self._updateStyles();

		G.DomUtil.addClass(map._layersFrame, 'g-clickable');
	},

	_onMouseOut: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		self._updateStyles();

		G.DomUtil.removeClass(map._layersFrame, 'g-clickable');
	}



});
/* global G:false */
G.Graphic.Circle = G.Graphic.Circle.extend({

	_onAdded: function() {
		var self = this;

		if (!self._dom) {
			self._dom = G.DomUtil.createSVG('g');
		}

		self._circles = {};

		var map = self._layer._map;
		if (map) {
			map._requestRedraw();
		}
	},

	_onRemoved: function() {
		var self = this;

		var dom = self._dom;
		if (dom && dom.parentNode) {
			dom.parentNode.removeChild(dom);
		}

		var map = self._layer._map;
		if (map) {
			map._requestRedraw();
		}
	},

	_draw: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var options = self.options;
		var layer = self._layer;
		var map = layer._map;

		if (!self.geom) {
			return;
		}

		var svg = layer._svg;
		if (self._dom && svg && !self._dom.parentNode) {
			svg.appendChild(self._dom);
		}

		var size = map.getSize();
		var drawSize = map.getDrawSize();
		var dx = (drawSize[0] - size[0]) / 2,
			dy = (drawSize[1] - size[1]) / 2; // 旋转后的绘制窗口和原始窗口的左上角偏移距离

		var res = map._res;

		var mx = self.geom[0];
		var my = self.geom[1];
		var r = self.geom[2];

		var range = map._calcWrapPointRange(self.geom) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];
		for (var m = range[0]; m <= range[1]; m++) {
			var circle = self._circles[m];
			if (!circle) {
				circle = self._circles[m] = domUtil.createSVG('circle');

				circle._graphic = self;
				self._dom.appendChild(circle);
			}

			var c = map.toScreen([mx + m * mapWidth, my], 0, 0, true);
			var x = c[0] + dx;
			var y = c[1] + dy;
			var cr = r / res;

			circle.setAttribute('cx', x);
			circle.setAttribute('cy', y);
			circle.setAttribute('r', cr);
		}

		self._updateStyles();
	},

	_updateStyles: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var options = self.options;
		var layer = self._layer;

		var defs = layer._defs;

		for (var i in self._circles) {
			var circle = self._circles[i];

			if (options.outline || self._mouseOver || self._editing) {
				circle.setAttribute('stroke', self._editing ? options.lineHighlightColor : (options.outline ? options.outlineColor : options.fillColor));
				circle.setAttribute('stroke-dasharray', options.outlineDashArray.join(' '));
				circle.setAttribute('stroke-linecap', options.outlineCap);
				circle.setAttribute('stroke-linejoin', options.outlineJoin);
				circle.setAttribute('stroke-width', self._mouseOver ? options.outlineWidth + options.lineHighlightWiden : options.outlineWidth);
				circle.setAttribute('stroke-opacity', options.outlineOpacity);
			} else {
				if (self._mouseOver) {
					circle.setAttribute('stroke', options.outlineColor);
					circle.setAttribute('stroke-width', self._mouseOver ? options.lineHighlightWiden : 0);
				} else {
					circle.setAttribute('stroke', 'none');
				}
			}

			if (options.fill) {
				if (options.fillImage) {
					var imageSrc = G.Browser.getImageSrc(options.fillImage);
					var imageSize = options.fillImageSize;
					var patternId = domUtil.svgImagePattern(defs, imageSrc, imageSize[0], imageSize[1]);
					circle.setAttribute('fill', 'url(#' + patternId + ')');
					circle.setAttribute('fill-opacity', options.fillOpacity);
				} else {
					if (options.gradual) {
						var gradientId = domUtil.svgGradient(defs, options.fillColor, options.fillOpacity);
						circle.setAttribute('fill', 'url(#' + gradientId + ')');
					} else {
						circle.setAttribute('fill', options.fillColor);
						circle.setAttribute('fill-opacity', options.fillOpacity);
					}
				}
			} else {
				circle.setAttribute('fill', 'none');
			}
		}
	},

	_updateMask: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var options = self.options;
		var map = self._map;

		if (!self.geom) {
			return;
		}

		self._masks = self._masks || {};

		var size = map.getSize();
		var drawSize = map.getDrawSize();
		var dx = (drawSize[0] - size[0]) / 2,
			dy = (drawSize[1] - size[1]) / 2; // 旋转后的绘制窗口和原始窗口的左上角偏移距离

		var res = map._res;

		var geom = self.geom;
		var ptCount = geom.length;

		var bbox = self.bbox;
		var cx = geom[0];
		var cy = geom[1];
		var r = geom[2];

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];
		for (var m = range[0]; m <= range[1]; m++) {
			var circle = self._masks[m];
			if (!circle) {
				circle = self._masks[m] = domUtil.createSVG('circle');

				circle._graphic = self;
			}

			var c = map.toScreen([cx + m * mapWidth, cy], 0, 0, true);
			var x = c[0] + dx;
			var y = c[1] + dy;
			var cr = r / res;

			circle.setAttribute('cx', x);
			circle.setAttribute('cy', y);
			circle.setAttribute('r', cr);
		}
	},

	_onStartEdit: function() {
		var graphic = this;
		var map = graphic._layer._map;
		var virtualMouse = graphic.virtualMouse;

		for (i in virtualMouse.DOWN) {
			map.addListener(virtualMouse.DOWN[i], graphic._onVertexDragStart, graphic);
		}

		graphic._refreshVertexes();
	},

	_onEndEdit: function() {
		var graphic = this;
		var map = graphic._layer._map;
		var virtualMouse = graphic.virtualMouse;

		var i, downType;
		for (i in virtualMouse.DOWN) {
			downType = virtualMouse.DOWN[i];
			map.removeListener(downType, graphic._onVertexDragStart, graphic);
			map.removeListener(virtualMouse.MOVE[downType], graphic._onVertexDrag, graphic);
			map.removeListener(virtualMouse.UP[downType], graphic._onVertexDragEnd, graphic);
		}

		graphic._removeVertexes();
	},

	_onMouseOver: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		self._updateStyles();

		G.DomUtil.addClass(map._layersFrame, 'g-clickable');
	},

	_onMouseOut: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		self._updateStyles();

		G.DomUtil.removeClass(map._layersFrame, 'g-clickable');
	}



});
/* global G:false */
G.Graphic.Group = G.Graphic.Group.extend({

	_updateStyles: function() {
		var self = this;

		var graphics = self._graphics;
		var i, iLen, g;
		if (graphics && graphics.length) {
			for (i = 0, iLen = graphics.length; i < iLen; i++) {
				g = graphics[i];

				if (g._updateStyles) {
					g._updateStyles();
				}
			}
		}
	},

	_onMouseOver: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		self._updateStyles();

		G.DomUtil.addClass(map._layersFrame, 'g-clickable');
	},

	_onMouseOut: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		self._updateStyles();

		G.DomUtil.removeClass(map._layersFrame, 'g-clickable');
	}



});
/* global G:false */
G.Graphic.MultiPoint = G.Graphic.MultiPoint.extend({

	_onAdded: function() {
		var self = this;

		if (!self._dom) {
			self._dom = G.DomUtil.createSVG('g');
		}

		self._pointss = {};

		var map = self._layer._map;
		if (map) {
			map._requestRedraw();
		}
	},

	_onRemoved: function() {
		var self = this;

		var dom = self._dom;
		if (dom && dom.parentNode) {
			dom.parentNode.removeChild(dom);
		}

		var map = self._layer._map;
		if (map) {
			map._requestRedraw();
		}
	},

	_draw: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var options = self.options;
		var layer = self._layer;
		var map = layer._map;

		var geom = self.geom;
		if (!geom || !geom['m']) {
			return;
		}

		var svg = layer._svg;
		if (self._dom && svg && !self._dom.parentNode) {
			svg.appendChild(self._dom);
		}

		var size = map.getSize();
		var drawSize = map.getDrawSize();
		var dx = (drawSize[0] - size[0]) / 2,
			dy = (drawSize[1] - size[1]) / 2; // 旋转后的绘制窗口和原始窗口的左上角偏移距离

		var rotate = map._rotate;

		var shape = options.shape;

		var ptSize = options.size;
		var w = ptSize[0],
			h = ptSize[1];
		var offset = options.offset;

		var imageRotate = options.imageRotate;
		if (shape == 'image' && imageRotate) {
			rotate -= imageRotate;
		}
		if (shape == 'image' && !options.imageGravity) {
			rotate -= map._rotate;
		}

		var pts = geom['m'];
		var mpt, mx, my;

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];

		for (var m = range[0]; m <= range[1]; m++) {
			var points = self._pointss[m] = self._pointss[m] || [];

			for (var i = 0; i < pts.length; i++) {
				mpt = pts[i];
				mx = mpt[0];
				my = mpt[1];

				var point = points[i];
				if (!point) {
					if (shape == 'rect') {
						point = self._pointss[m][i] = domUtil.createSVG('rect');
					} else if (shape == 'image') {
						point = self._pointss[m][i] = domUtil.createSVG('image');
					} else if (shape == 'text') {
						point = self._pointss[m][i] = domUtil.createSVG('text');
					} else {
						point = self._pointss[m][i] = domUtil.createSVG('circle');
					}

					point._graphic = self;
					self._dom.appendChild(point);
				}

				var pt = map.toScreen([mx + m * mapWidth, my], 0, 0, true);

				var x = pt[0] + dx,
					y = pt[1] + dy;

				var px = x + offset[0],
					py = y + offset[1];

				var svgRotateTransform = 'rotate(' + (-rotate) + ',' + x + ',' + y + ')';
				if (shape == 'circle') {
					point.setAttribute('cx', px);
					point.setAttribute('cy', py);
					point.setAttribute('r', w / 2);
				} else if (shape == 'rect') {
					point.setAttribute('x', px - w / 2);
					point.setAttribute('y', py - h / 2);
					point.setAttribute('width', w);
					point.setAttribute('height', h);
				} else if (shape == 'image') {
					point.setAttribute('x', px);
					point.setAttribute('y', py);
					point.setAttribute('width', w);
					point.setAttribute('height', h);
					var imageSrc = G.Browser.getImageSrc(options.image);
					point.setAttributeNS(G.DomUtil.XLINK_NS, 'href', imageSrc);
				} else if (shape == 'text') {
					var text = options.text;
					if (!self._textMeasureWidth || self._textMeasure != text) {
						var div = domUtil.create('div', '', document.body);
						div.style.position = 'absolute';
						div.style.visibility = 'hidden';
						div.style.width = div.style.height = 'auto';
						div.style.fontFamily = options.textFont;
						div.style.fontStyle = options.textStyle == 'italic' ? 'italic' : 'normal';
						div.style.fontWeight = options.textStyle == 'bold' ? 'bold' : 'normal';
						div.style.fontSize = w + 'px';
						div.innerHTML = text;
						self._textMeasureWidth = div.clientWidth + 4;
						div.parentNode.removeChild(div);
						self._textMeasure = text;
					}

					point.setAttribute('x', px);
					point.setAttribute('y', py);
					point.setAttribute('font-size', w + 'px');
					point.setAttribute('text-anchor', (options.textAlign == 'center' ? 'middle' : (options.textAlign == 'left' ? 'start' : 'end')));
					point.setAttribute('alignment-baseline', 'middle');
					point.setAttribute('font-family', options.textFont);
					point.setAttribute('font-style', options.textStyle == 'italic' ? 'italic' : 'normal');
					point.setAttribute('font-weight', options.textStyle == 'bold' ? 'bold' : 'normal');
					point.innerHTML = point.textContent /*IE*/ = options.text;
				}
				point.setAttribute('transform', svgRotateTransform);
			}
		}

		self._updateStyles();
	},

	_updateStyles: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var options = self.options;
		var layer = self._layer;

		var defs = layer._defs;

		for (var m in self._pointss) {
			var points = self._pointss[m];

			for (var i in points) {
				var point = points[i];

				if ((options.outline || self._mouseOver || self._editing) && options.shape != 'text') {
					point.setAttribute('stroke', self._editing ? options.lineHighlightColor : (options.outline ? options.outlineColor : options.fillColor));
					point.setAttribute('stroke-dasharray', options.outlineDashArray.join(' '));
					point.setAttribute('stroke-width', self._mouseOver ? options.outlineWidth + options.lineHighlightWiden : options.outlineWidth);
					point.setAttribute('stroke-opacity', options.outlineOpacity);
				} else {
					point.setAttribute('stroke', 'none');
				}

				if (options.fill) {
					if (options.fillImage) {
						var imageSrc = G.Browser.getImageSrc(options.fillImage);
						var imageSize = options.fillImageSize;
						var patternId = domUtil.svgImagePattern(defs, imageSrc, imageSize[0], imageSize[1]);
						point.setAttribute('fill', 'url(#' + patternId + ')');
						point.setAttribute('fill-opacity', options.fillOpacity);
					} else {
						if (options.gradual) {
							var gradientId = domUtil.svgGradient(defs, options.fillColor, options.fillOpacity);
							point.setAttribute('fill', 'url(#' + gradientId + ')');
						} else {
							point.setAttribute('fill', options.fillColor);
							point.setAttribute('fill-opacity', options.fillOpacity);
						}
					}
				} else {
					point.setAttribute('fill', 'none');
				}
			}
		}
	},

	_onStartEdit: function() {
		var graphic = this;
		var map = graphic._layer._map;
		var virtualMouse = graphic.virtualMouse;

		for (i in virtualMouse.DOWN) {
			map.addListener(virtualMouse.DOWN[i], graphic._onVertexDragStart, graphic);
		}

		graphic._refreshVertexes();
	},

	_onEndEdit: function() {
		var graphic = this;
		var map = graphic._layer._map;
		var virtualMouse = graphic.virtualMouse;

		var i, downType;
		for (i in virtualMouse.DOWN) {
			downType = virtualMouse.DOWN[i];
			map.removeListener(downType, graphic._onVertexDragStart, graphic);
			map.removeListener(virtualMouse.MOVE[downType], graphic._onVertexDrag, graphic);
			map.removeListener(virtualMouse.UP[downType], graphic._onVertexDragEnd, graphic);
		}

		graphic._removeVertexes();
	},

	_onMouseOver: function() {
		var self = this;
		var layer = self._layer;
		if (!layer) {
			return;
		}

		var map = layer._map;
		var domUtil = G.DomUtil;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging && !self.options.allowPan) {
			//dragHandler.off();
		}

		self._updateStyles();

		if (!self._isVertex) {
			domUtil.addClass(map._layersFrame, 'g-clickable');
		} else {
			domUtil.addClass(map._layersFrame, 'g-edit');
		}
	},

	_onMouseOut: function() {
		var self = this;
		var layer = self._layer;
		if (!layer) {
			return;
		}

		var map = layer._map;
		var domUtil = G.DomUtil;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		self._updateStyles();

		if (!self._isVertex) {
			domUtil.removeClass(map._layersFrame, 'g-clickable');
		} else {
			domUtil.removeClass(map._layersFrame, 'g-edit');
		}
	}



});
/* global G:false */
G.Graphic.MultiPolygon = G.Graphic.MultiPolygon.extend({

	_onAdded: function() {
		var self = this;

		if (!self._dom) {
			self._dom = G.DomUtil.createSVG('g');
		}

		self._polygonss = {};

		var map = self._layer._map;
		if (map) {
			map._requestRedraw();
		}
	},

	_onRemoved: function() {
		var self = this;

		var dom = self._dom;
		if (dom && dom.parentNode) {
			dom.parentNode.removeChild(dom);
		}

		var map = self._layer._map;
		if (map) {
			map._requestRedraw();
		}
	},

	_draw: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var options = self.options;
		var layer = self._layer;
		var map = layer._map;

		var geom = self.geom;
		if (!geom || !geom['m']) {
			return;
		}

		var svg = layer._svg;
		if (self._dom && svg && !self._dom.parentNode) {
			svg.appendChild(self._dom);
		}

		var size = map.getSize();
		var drawSize = map.getDrawSize();
		var dx = (drawSize[0] - size[0]) / 2,
			dy = (drawSize[1] - size[1]) / 2; // 旋转后的绘制窗口和原始窗口的左上角偏移距离

		var pgs = geom['m'];

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];

		for (var m = range[0]; m <= range[1]; m++) {
			var polygons = self._polygonss[m] = self._polygonss[m] || [];

			for (var n = 0; n < pgs.length; n++) {
				var polygon = self._polygonss[m][n];

				if (!polygon) {
					polygon = self._polygonss[m][n] = domUtil.createSVG('path');

					polygon._graphic = self;
					self._dom.appendChild(polygon);
				}

				var str = '';
				var part, partStr;
				var pt, x, y;
				var pg = pgs[n];
				for (var i = 0, iLen = pg.length; i < iLen; i++) {
					part = pg[i];

					partStr = '';
					for (var j = 0, jLen = part.length; j < jLen; j++) {
						pt = map.toScreen([part[j][0] + m * mapWidth, part[j][1]], 0, 0, true);
						x = pt[0] + dx;
						y = pt[1] + dy;

						partStr += (j === 0) ? ' M ' : '';
						partStr += (j === 1) ? ' L ' : ' ';
						partStr += (x + ' ' + y);
					}
					partStr += ' Z';

					str += partStr;
				}

				polygon.setAttribute('d', str);
			}
		}

		self._updateStyles();
	},

	_updateStyles: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var options = self.options;
		var layer = self._layer;

		var defs = layer._defs;

		for (var m in self._polygonss) {
			var polygons = self._polygonss[m];

			for (var n in polygons) {
				var polygon = polygons[n];

				if (options.outline || self._mouseOver || self._editing) {
					polygon.setAttribute('stroke', self._editing ? options.lineHighlightColor : (options.outline ? options.outlineColor : options.fillColor));
					polygon.setAttribute('stroke-dasharray', options.outlineDashArray.join(' '));
					polygon.setAttribute('stroke-linecap', options.outlineCap);
					polygon.setAttribute('stroke-linejoin', options.outlineJoin);
					polygon.setAttribute('stroke-width', (options.outline ? options.outlineWidth : 0) + (self._mouseOver ? options.lineHighlightWiden : 0));
					polygon.setAttribute('stroke-opacity', options.outlineOpacity);
				} else {
					polygon.setAttribute('stroke', 'none');
				}

				if (options.fill) {
					if (options.fillImage) {
						var imageSrc = G.Browser.getImageSrc(options.fillImage);
						var imageSize = options.fillImageSize;
						var patternId = domUtil.svgImagePattern(defs, imageSrc, imageSize[0], imageSize[1]);
						polygon.setAttribute('fill', 'url(#' + patternId + ')');
					} else {
						polygon.setAttribute('fill', options.fillColor);
					}

					polygon.setAttribute('fill-opacity', options.fillOpacity);
				} else {
					polygon.setAttribute('fill', 'none');
				}
			}
		}
	},

	_updateMask: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var options = self.options;
		var map = self._map;

		var geom = self.geom;
		if (!geom || !geom['m']) {
			return;
		}

		self._maskss = self._maskss || {};

		var size = map.getSize();
		var drawSize = map.getDrawSize();
		var dx = (drawSize[0] - size[0]) / 2,
			dy = (drawSize[1] - size[1]) / 2; // 旋转后的绘制窗口和原始窗口的左上角偏移距离

		var pgs = geom['m'];

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];

		for (var m = range[0]; m <= range[1]; m++) {
			var masks = self._maskss[m] = self._maskss[m] || [];

			for (var n = 0; n < pgs.length; n++) {
				var polygon = self._masks[m][n];
				if (!polygon) {
					polygon = self._masks[m][n] = domUtil.createSVG('path');

					polygon._graphic = self;
				}

				var str = '';
				var part, partStr;
				var pt, x, y;
				var pg = pgs[n];
				for (var i = 0, iLen = pg.length; i < iLen; i++) {
					part = pg[i];

					partStr = '';
					for (var j = 0, jLen = part.length; j < jLen; j++) {
						pt = map.toScreen([part[j][0] + m * mapWidth, part[j][1]], 0, 0, true);
						x = pt[0] + dx;
						y = pt[1] + dy;

						partStr += (j === 0) ? ' M ' : '';
						partStr += (j === 1) ? ' L ' : ' ';
						partStr += (x + ' ' + y);
					}
					partStr += ' Z';

					str += partStr;
				}

				polygon.setAttribute('d', str);
			}
		}
	},

	_onStartEdit: function() {
		var graphic = this;
		var map = graphic._layer._map;
		var virtualMouse = graphic.virtualMouse;

		for (i in virtualMouse.DOWN) {
			map.addListener(virtualMouse.DOWN[i], graphic._onVertexDragStart, graphic);
		}

		graphic._refreshVertexes();
	},

	_onEndEdit: function() {
		var graphic = this;
		var map = graphic._layer._map;
		var virtualMouse = graphic.virtualMouse;

		var i, downType;
		for (i in virtualMouse.DOWN) {
			downType = virtualMouse.DOWN[i];
			map.removeListener(downType, graphic._onVertexDragStart, graphic);
			map.removeListener(virtualMouse.MOVE[downType], graphic._onVertexDrag, graphic);
			map.removeListener(virtualMouse.UP[downType], graphic._onVertexDragEnd, graphic);
		}

		graphic._removeVertexes();
	},

	_onMouseOver: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		self._updateStyles();

		G.DomUtil.addClass(map._layersFrame, 'g-clickable');
	},

	_onMouseOut: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		self._updateStyles();

		G.DomUtil.removeClass(map._layersFrame, 'g-clickable');
	}



});
/* global G:false */
G.Graphic.MultiPolyline = G.Graphic.MultiPolyline.extend({

	_onAdded: function() {
		var self = this;

		if (!self._dom) {
			self._dom = G.DomUtil.createSVG('g');
		}

		self._polyliness = {};

		var map = self._layer._map;
		if (map) {
			map._requestRedraw();
		}
	},

	_onRemoved: function() {
		var self = this;

		var dom = self._dom;
		if (dom && dom.parentNode) {
			dom.parentNode.removeChild(dom);
		}

		var map = self._layer._map;
		if (map) {
			map._requestRedraw();
		}
	},

	_draw: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var options = self.options;
		var layer = self._layer;
		var map = layer._map;

		var geom = self.geom;
		if (!geom || !geom['m']) {
			return;
		}

		var svg = layer._svg;
		if (self._dom && svg && !self._dom.parentNode) {
			svg.appendChild(self._dom);
		}

		var size = map.getSize();
		var drawSize = map.getDrawSize();
		var dx = (drawSize[0] - size[0]) / 2,
			dy = (drawSize[1] - size[1]) / 2; // 旋转后的绘制窗口和原始窗口的左上角偏移距离

		var pls = geom['m'];

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];

		for (var m = range[0]; m <= range[1]; m++) {
			var polylines = self._polyliness[m] = self._polyliness[m] || [];

			for (var n = 0; n < pls.length; n++) {
				var polyline = self._polyliness[m][n];
				if (!polyline) {
					polyline = self._polyliness[m][n] = domUtil.createSVG('polyline');

					polyline._graphic = self;
					self._dom.appendChild(polyline);
				}

				var str = '';
				var pt, x, y;
				var pl = pls[n];
				for (var i = 0, iLen = pl.length; i < iLen; i++) {
					pt = map.toScreen([pl[i][0] + m * mapWidth, pl[i][1]], 0, 0, true);
					x = pt[0] + dx;
					y = pt[1] + dy;

					str += (str) ? ' ' : '';
					str += (x + ',' + y);
				}
				polyline.setAttribute('points', str);
			}
		}

		self._updateStyles();
	},

	_updateStyles: function() {
		var self = this;
		var options = self.options;

		for (var m in self._polyliness) {
			var polylines = self._polyliness[m];

			for (var n in polylines) {
				var polyline = polylines[n];

				polyline.setAttribute('stroke', self._editing ? options.lineHighlightColor : options.lineColor);
				polyline.setAttribute('stroke-dasharray', options.lineDashArray.join(' '));
				polyline.setAttribute('stroke-linecap', options.lineCap);
				polyline.setAttribute('stroke-linejoin', options.lineJoin);
				polyline.setAttribute('stroke-opacity', options.lineOpacity);
				polyline.setAttribute('stroke-width', self._mouseOver ? options.lineWidth + options.lineHighlightWiden : options.lineWidth);
				polyline.setAttribute('fill', 'none');
			}
		}
	},

	_onStartEdit: function() {
		var graphic = this;
		var map = graphic._layer._map;
		var virtualMouse = graphic.virtualMouse;

		for (i in virtualMouse.DOWN) {
			map.addListener(virtualMouse.DOWN[i], graphic._onVertexDragStart, graphic);
		}

		graphic._refreshVertexes();
	},

	_onEndEdit: function() {
		var graphic = this;
		var map = graphic._layer._map;
		var virtualMouse = graphic.virtualMouse;

		var i, downType;
		for (i in virtualMouse.DOWN) {
			downType = virtualMouse.DOWN[i];
			map.removeListener(downType, graphic._onVertexDragStart, graphic);
			map.removeListener(virtualMouse.MOVE[downType], graphic._onVertexDrag, graphic);
			map.removeListener(virtualMouse.UP[downType], graphic._onVertexDragEnd, graphic);
		}

		graphic._removeVertexes();
	},

	_onMouseOver: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		self._updateStyles();

		G.DomUtil.addClass(map._layersFrame, 'g-clickable');
	},

	_onMouseOut: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		self._updateStyles();

		G.DomUtil.removeClass(map._layersFrame, 'g-clickable');
	}



});
/* global G:false */
G.Graphic.Point = G.Graphic.Point.extend({

	_onAdded: function() {
		var self = this;

		if (!self._dom) {
			self._dom = G.DomUtil.createSVG('g');
		}

		self._points = {};

		var map = self._layer._map;
		if (map) {
			map._requestRedraw();
		}
	},

	_onRemoved: function() {
		var self = this;

		var dom = self._dom;
		if (dom && dom.parentNode) {
			dom.parentNode.removeChild(dom);
		}

		var map = self._layer._map;
		if (map) {
			map._requestRedraw();
		}
	},

	_draw: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var options = self.options;
		var layer = self._layer;
		var map = layer._map;

		if (!self.geom) {
			return;
		}

		var svg = layer._svg;
		if (self._dom && svg && !self._dom.parentNode) {
			svg.appendChild(self._dom);
		}

		var size = map.getSize();
		var drawSize = map.getDrawSize();
		var dx = (drawSize[0] - size[0]) / 2,
			dy = (drawSize[1] - size[1]) / 2; // 旋转后的绘制窗口和原始窗口的左上角偏移距离

		var rotate = map._rotate;

		var shape = options.shape;

		var ptSize = options.size;
		var w = ptSize[0],
			h = ptSize[1];
		var offset = options.offset;

		var imageRotate = options.imageRotate;
		if (shape == 'image' && imageRotate) {
			rotate -= imageRotate;
		}
		if (shape == 'image' && !options.imageGravity) {
			rotate -= map._rotate;
		}

		var mx = self.geom[0];
		var my = self.geom[1];

		var range = map._calcWrapPointRange(self.geom) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];
		for (var m = range[0]; m <= range[1]; m++) {
			var point = self._points[m];
			if (!point) {
				if (shape == 'rect') {
					point = self._points[m] = domUtil.createSVG('rect');
				} else if (shape == 'image') {
					point = self._points[m] = domUtil.createSVG('image');
				} else if (shape == 'text') {
					point = self._points[m] = domUtil.createSVG('text');
				} else {
					point = self._points[m] = domUtil.createSVG('circle');
				}

				point._graphic = self;
				self._dom.appendChild(point);
			}

			var pt = map.toScreen([mx + m * mapWidth, my], 0, 0, true);

			var x = pt[0] + dx,
				y = pt[1] + dy;

			var px = x + offset[0],
				py = y + offset[1];

			var svgRotateTransform = 'rotate(' + (-rotate) + ',' + x + ',' + y + ')';
			if (shape == 'circle') {
				point.setAttribute('cx', px);
				point.setAttribute('cy', py);
				point.setAttribute('r', w / 2);
			} else if (shape == 'rect') {
				point.setAttribute('x', px - w / 2);
				point.setAttribute('y', py - h / 2);
				point.setAttribute('width', w);
				point.setAttribute('height', h);
			} else if (shape == 'image') {
				point.setAttribute('x', px);
				point.setAttribute('y', py);
				point.setAttribute('width', w);
				point.setAttribute('height', h);
				var imageSrc = G.Browser.getImageSrc(options.image);
				point.setAttributeNS(G.DomUtil.XLINK_NS, 'href', imageSrc);
			} else if (shape == 'text') {
				var text = options.text;
				if (!self._textMeasureWidth || self._textMeasure != text) {
					var div = domUtil.create('div', '', document.body);
					div.style.position = 'absolute';
					div.style.visibility = 'hidden';
					div.style.width = div.style.height = 'auto';
					div.style.fontFamily = options.textFont;
					div.style.fontStyle = options.textStyle == 'italic' ? 'italic' : 'normal';
					div.style.fontWeight = options.textStyle == 'bold' ? 'bold' : 'normal';
					div.style.fontSize = w + 'px';
					div.innerHTML = text;
					self._textMeasureWidth = div.clientWidth + 4;
					div.parentNode.removeChild(div);
					self._textMeasure = text;
				}

				point.setAttribute('x', px);
				point.setAttribute('y', py);
				point.setAttribute('font-size', w + 'px');
				point.setAttribute('text-anchor', (options.textAlign == 'center' ? 'middle' : (options.textAlign == 'left' ? 'start' : 'end')));
				point.setAttribute('alignment-baseline', 'middle');
				point.setAttribute('font-family', options.textFont);
				point.setAttribute('font-style', options.textStyle == 'italic' ? 'italic' : 'normal');
				point.setAttribute('font-weight', options.textStyle == 'bold' ? 'bold' : 'normal');
				point.innerHTML = point.textContent /*IE*/ = options.text;
			}
			point.setAttribute('transform', svgRotateTransform);
		}

		self._updateStyles();
	},

	_updateStyles: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var options = self.options;
		var layer = self._layer;

		var defs = layer._defs;

		for (var i in self._points) {
			var point = self._points[i];

			if ((options.outline || self._mouseOver || self._editing) && options.shape != 'text') {
				point.setAttribute('stroke', self._editing ? options.lineHighlightColor : (options.outline ? options.outlineColor : options.fillColor));
				point.setAttribute('stroke-dasharray', options.outlineDashArray.join(' '));
				point.setAttribute('stroke-width', self._mouseOver ? options.outlineWidth + options.lineHighlightWiden : options.outlineWidth);
				point.setAttribute('stroke-opacity', options.outlineOpacity);
			} else {
				point.setAttribute('stroke', 'none');
			}

			if (options.fill) {
				if (options.fillImage) {
					var imageSrc = G.Browser.getImageSrc(options.fillImage);
					var imageSize = options.fillImageSize;
					var patternId = domUtil.svgImagePattern(defs, imageSrc, imageSize[0], imageSize[1]);
					point.setAttribute('fill', 'url(#' + patternId + ')');
					point.setAttribute('fill-opacity', options.fillOpacity);
				} else {
					if (options.gradual) {
						var gradientId = domUtil.svgGradient(defs, options.fillColor, options.fillOpacity);
						point.setAttribute('fill', 'url(#' + gradientId + ')');
					} else {
						point.setAttribute('fill', options.fillColor);
						point.setAttribute('fill-opacity', options.fillOpacity);
					}
				}
			} else {
				point.setAttribute('fill', 'none');
			}
		}
	},

	_onStartEdit: function() {
		var graphic = this;
		var map = graphic._layer._map;
		var virtualMouse = graphic.virtualMouse;

		for (i in virtualMouse.DOWN) {
			map.addListener(virtualMouse.DOWN[i], graphic._onVertexDragStart, graphic);
		}

		graphic._refreshVertexes();
	},

	_onEndEdit: function() {
		var graphic = this;
		var map = graphic._layer._map;
		var virtualMouse = graphic.virtualMouse;

		var i, downType;
		for (i in virtualMouse.DOWN) {
			downType = virtualMouse.DOWN[i];
			map.removeListener(downType, graphic._onVertexDragStart, graphic);
			map.removeListener(virtualMouse.MOVE[downType], graphic._onVertexDrag, graphic);
			map.removeListener(virtualMouse.UP[downType], graphic._onVertexDragEnd, graphic);
		}

		graphic._removeVertexes();
	},

	_onMouseOver: function() {
		var self = this;
		var layer = self._layer;
		if (!layer) {
			return;
		}

		var map = layer._map;
		var domUtil = G.DomUtil;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging && !self.options.allowPan) {
			//dragHandler.off();
		}

		self._updateStyles();

		if (!self._isVertex) {
			domUtil.addClass(map._layersFrame, 'g-clickable');
		} else {
			domUtil.addClass(map._layersFrame, 'g-edit');
		}
	},

	_onMouseOut: function() {
		var self = this;
		var layer = self._layer;
		if (!layer) {
			return;
		}

		var map = layer._map;
		var domUtil = G.DomUtil;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		self._updateStyles();

		if (!self._isVertex) {
			domUtil.removeClass(map._layersFrame, 'g-clickable');
		} else {
			domUtil.removeClass(map._layersFrame, 'g-edit');
		}
	}



});
/* global G:false */
G.Graphic.Polygon = G.Graphic.Polygon.extend({

	_onAdded: function() {
		var self = this;

		if (!self._dom) {
			self._dom = G.DomUtil.createSVG('g');
		}

		self._polygons = {};

		var map = self._layer._map;
		if (map) {
			map._requestRedraw();
		}
	},

	_onRemoved: function() {
		var self = this;

		var dom = self._dom;
		if (dom && dom.parentNode) {
			dom.parentNode.removeChild(dom);
		}

		var map = self._layer._map;
		if (map) {
			map._requestRedraw();
		}
	},

	_draw: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var options = self.options;
		var layer = self._layer;
		var map = layer._map;

		if (!self.geom) {
			return;
		}

		var svg = layer._svg;
		if (self._dom && svg && !self._dom.parentNode) {
			svg.appendChild(self._dom);
		}

		var size = map.getSize();
		var drawSize = map.getDrawSize();
		var dx = (drawSize[0] - size[0]) / 2,
			dy = (drawSize[1] - size[1]) / 2; // 旋转后的绘制窗口和原始窗口的左上角偏移距离

		var geom = self.geom;
		var ptCount = geom.length;

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];
		for (var m = range[0]; m <= range[1]; m++) {
			var polygon = self._polygons[m];
			if (!polygon) {
				polygon = self._polygons[m] = domUtil.createSVG('path');

				polygon._graphic = self;
				self._dom.appendChild(polygon);
			}

			var str = '';
			var part, partStr;
			var pt, x, y;
			for (var i = 0, iLen = geom.length; i < iLen; i++) {
				part = geom[i];

				partStr = '';
				for (var j = 0, jLen = part.length; j < jLen; j++) {
					pt = map.toScreen([part[j][0] + m * mapWidth, part[j][1]], 0, 0, true);
					x = pt[0] + dx;
					y = pt[1] + dy;

					partStr += (j === 0) ? ' M ' : '';
					partStr += (j === 1) ? ' L ' : ' ';
					partStr += (x + ' ' + y);
				}
				partStr += ' Z';

				str += partStr;
			}

			polygon.setAttribute('d', str);
		}

		self._updateStyles();
	},

	_updateStyles: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var options = self.options;
		var layer = self._layer;

		var defs = layer._defs;

		for (var i in self._polygons) {
			var polygon = self._polygons[i];

			if (options.outline || self._mouseOver || self._editing) {
				polygon.setAttribute('stroke', self._editing ? options.lineHighlightColor : (options.outline ? options.outlineColor : options.fillColor));
				polygon.setAttribute('stroke-dasharray', options.outlineDashArray.join(' '));
				polygon.setAttribute('stroke-linecap', options.outlineCap);
				polygon.setAttribute('stroke-linejoin', options.outlineJoin);
				polygon.setAttribute('stroke-width', (options.outline ? options.outlineWidth : 0) + (self._mouseOver ? options.lineHighlightWiden : 0));
				polygon.setAttribute('stroke-opacity', options.outlineOpacity);
			} else {
				polygon.setAttribute('stroke', 'none');
			}

			if (options.fill) {
				if (options.fillImage) {
					var imageSrc = G.Browser.getImageSrc(options.fillImage);
					var imageSize = options.fillImageSize;
					var patternId = domUtil.svgImagePattern(defs, imageSrc, imageSize[0], imageSize[1]);
					polygon.setAttribute('fill', 'url(#' + patternId + ')');
				} else {
					polygon.setAttribute('fill', options.fillColor);
				}

				polygon.setAttribute('fill-opacity', options.fillOpacity);
			} else {
				polygon.setAttribute('fill', 'none');
			}
		}
	},

	_updateMask: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var options = self.options;
		var map = self._map;

		if (!self.geom) {
			return;
		}

		self._masks = self._masks || {};

		var size = map.getSize();
		var drawSize = map.getDrawSize();
		var dx = (drawSize[0] - size[0]) / 2,
			dy = (drawSize[1] - size[1]) / 2; // 旋转后的绘制窗口和原始窗口的左上角偏移距离

		var geom = self.geom;
		var ptCount = geom.length;

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];
		for (var m = range[0]; m <= range[1]; m++) {
			var polygon = self._masks[m];
			if (!polygon) {
				polygon = self._masks[m] = domUtil.createSVG('path');

				polygon._graphic = self;
			}

			var str = '';
			var part, partStr;
			var pt, x, y;
			for (var i = 0, iLen = geom.length; i < iLen; i++) {
				part = geom[i];

				partStr = '';
				for (var j = 0, jLen = part.length; j < jLen; j++) {
					pt = map.toScreen([part[j][0] + m * mapWidth, part[j][1]], 0, 0, true);
					x = pt[0] + dx;
					y = pt[1] + dy;

					partStr += (j === 0) ? ' M ' : '';
					partStr += (j === 1) ? ' L ' : ' ';
					partStr += (x + ' ' + y);
				}
				partStr += ' Z';

				str += partStr;
			}

			polygon.setAttribute('d', str);
		}
	},

	_onStartEdit: function() {
		var graphic = this;
		var map = graphic._layer._map;
		var virtualMouse = graphic.virtualMouse;

		for (i in virtualMouse.DOWN) {
			map.addListener(virtualMouse.DOWN[i], graphic._onVertexDragStart, graphic);
		}

		graphic._refreshVertexes();
	},

	_onEndEdit: function() {
		var graphic = this;
		var map = graphic._layer._map;
		var virtualMouse = graphic.virtualMouse;

		var i, downType;
		for (i in virtualMouse.DOWN) {
			downType = virtualMouse.DOWN[i];
			map.removeListener(downType, graphic._onVertexDragStart, graphic);
			map.removeListener(virtualMouse.MOVE[downType], graphic._onVertexDrag, graphic);
			map.removeListener(virtualMouse.UP[downType], graphic._onVertexDragEnd, graphic);
		}

		graphic._removeVertexes();
	},

	_onMouseOver: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		self._updateStyles();

		G.DomUtil.addClass(map._layersFrame, 'g-clickable');
	},

	_onMouseOut: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		self._updateStyles();

		G.DomUtil.removeClass(map._layersFrame, 'g-clickable');
	}



});
/* global G:false */
G.Graphic.Polyline = G.Graphic.Polyline.extend({

	_onAdded: function() {
		var self = this;

		if (!self._dom) {
			self._dom = G.DomUtil.createSVG('g');
		}

		self._polylines = {};

		var map = self._layer._map;
		if (map) {
			map._requestRedraw();
		}
	},

	_onRemoved: function() {
		var self = this;

		var dom = self._dom;
		if (dom && dom.parentNode) {
			dom.parentNode.removeChild(dom);
		}

		var map = self._layer._map;
		if (map) {
			map._requestRedraw();
		}
	},

	_draw: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var options = self.options;
		var layer = self._layer;
		var map = layer._map;

		if (!self.geom) {
			return;
		}

		var svg = layer._svg;
		if (self._dom && svg && !self._dom.parentNode) {
			svg.appendChild(self._dom);
		}

		var size = map.getSize();
		var drawSize = map.getDrawSize();
		var dx = (drawSize[0] - size[0]) / 2,
			dy = (drawSize[1] - size[1]) / 2; // 旋转后的绘制窗口和原始窗口的左上角偏移距离

		var geom = self.geom;
		var ptCount = geom.length;

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];
		for (var m = range[0]; m <= range[1]; m++) {
			var polyline = self._polylines[m];
			if (!polyline) {
				polyline = self._polylines[m] = domUtil.createSVG('polyline');

				polyline._graphic = self;
				self._dom.appendChild(polyline);
			}

			var str = '';
			var pt, x, y;
			for (var i = 0; i < ptCount; i++) {
				pt = map.toScreen([geom[i][0] + m * mapWidth, geom[i][1]], 0, 0, true);
				x = pt[0] + dx;
				y = pt[1] + dy;

				str += (str) ? ' ' : '';
				str += (x + ',' + y);
			}
			polyline.setAttribute('points', str);
		}

		self._updateStyles();
	},

	_updateStyles: function() {
		var self = this;
		var options = self.options;

		for (var i in self._polylines) {
			var polyline = self._polylines[i];

			polyline.setAttribute('stroke', self._editing ? options.lineHighlightColor : options.lineColor);
			polyline.setAttribute('stroke-dasharray', options.lineDashArray.join(' '));
			polyline.setAttribute('stroke-linecap', options.lineCap);
			polyline.setAttribute('stroke-linejoin', options.lineJoin);
			polyline.setAttribute('stroke-opacity', options.lineOpacity);
			polyline.setAttribute('stroke-width', self._mouseOver ? options.lineWidth + options.lineHighlightWiden : options.lineWidth);
			polyline.setAttribute('fill', 'none');
		}
	},

	_onStartEdit: function() {
		var graphic = this;
		var map = graphic._layer._map;
		var virtualMouse = graphic.virtualMouse;

		for (i in virtualMouse.DOWN) {
			map.addListener(virtualMouse.DOWN[i], graphic._onVertexDragStart, graphic);
		}

		graphic._refreshVertexes();
	},

	_onEndEdit: function() {
		var graphic = this;
		var map = graphic._layer._map;
		var virtualMouse = graphic.virtualMouse;

		var i, downType;
		for (i in virtualMouse.DOWN) {
			downType = virtualMouse.DOWN[i];
			map.removeListener(downType, graphic._onVertexDragStart, graphic);
			map.removeListener(virtualMouse.MOVE[downType], graphic._onVertexDrag, graphic);
			map.removeListener(virtualMouse.UP[downType], graphic._onVertexDragEnd, graphic);
		}

		graphic._removeVertexes();
	},

	_onMouseOver: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		self._updateStyles();

		G.DomUtil.addClass(map._layersFrame, 'g-clickable');
	},

	_onMouseOut: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		self._updateStyles();

		G.DomUtil.removeClass(map._layersFrame, 'g-clickable');
	}



});
/* global G:false */
G.Map = G.Map.extend({

	_initAddition: function() {
		var self = this;
		var domUtil = G.DomUtil;

		var maskFrame = self._maskFrame;

		var className = 'g-graphic-container g-zoom-animated';
		var maskSvg = maskFrame._svg = domUtil.createSVG('svg', className, maskFrame);
		var maskDefs = maskFrame._defs = domUtil.createSVG('defs', '', maskSvg);
		var mask = maskFrame._mask = domUtil.createSVG('mask', '', maskDefs);
		mask.setAttribute('id', 'svg_mask');

		var base = mask._base = domUtil.createSVG('rect', '', mask);
		base.setAttribute('width', '100%');
		base.setAttribute('height', '100%');
		base.setAttribute('fill', '#fff');

		self._mode = 'svg';
	},

	_drawMask: function() {
		var map = this;
		var mapOptions = map.options;
		var domUtil = G.DomUtil;
		var maskFrame = map._maskFrame;
		var maskSvg = maskFrame._svg;
		var mask = maskFrame._mask;

		if (mapOptions.mask && map._masks && map._masks.length > 0) {
			domUtil.show(maskSvg);
		} else {
			domUtil.hide(maskSvg);
			return;
		}

		var mapFramePos = domUtil.getPosition(map._mapFrame);
		var size = map.getSize();
		var drawSize = map.getDrawSize();
		var w = drawSize[0];
		var h = drawSize[1];
		var dx = (w - size[0]) / 2,
			dy = (h - size[1]) / 2; // 旋转后的绘制窗口和原始窗口的左上角偏移距离

		//var w3 = 3 * w;
		//var h3 = 3 * h;
		maskSvg.style[domUtil.Transform] = domUtil.genTranslateStyle(-dx /* -w */ , -dy /* -h */ );

		maskSvg.setAttribute('width', w);
		maskSvg.setAttribute('height', h);
		maskSvg.setAttribute('viewBox', [-mapFramePos[0], -mapFramePos[1], w, h].join(' '));

		var center = map.getCenter(),
			res = map._res,
			xmin = center[0] - w * res / 2,
			xmax = center[0] + w * res / 2,
			ymin = center[1] - h * res / 2,
			ymax = center[1] + h * res / 2,
			extentRedraw = [xmin, ymin, xmax, ymax],
			extentMap = map.options.maxExtent;

		var extent = G.ExtentUtil.intersect(extentRedraw, extentMap);

		var g, key, bbox, wraps, wrapMask;
		for (key in map._masks) {
			g = map._masks[key];
			bbox = g.bbox;

			g._updateMask();

			for (var i in g._masks) {
				var gmask = g._masks[i];
				if (gmask) {
					if (!gmask.parentNode) {
						mask.appendChild(gmask);
					}
				}
			}
		}

		var base = mask._base;

		var rect = maskSvg._rect = maskSvg._rect ? maskSvg._rect : domUtil.createSVG('rect');
		rect.setAttribute('x', -mapFramePos[0]);
		rect.setAttribute('y', -mapFramePos[1]);
		rect.setAttribute('width', w);
		rect.setAttribute('height', h);
		rect.setAttribute('mask', 'url(#svg_mask)');
		rect.setAttribute('fill', mapOptions.maskColor);
		rect.setAttribute('fill-opacity', mapOptions.maskOpacity);

		if (!rect.parentNode) {
			maskSvg.appendChild(rect);
		}
	},

	_onZoomStart: function(e) {
		var map = this,
			mapFrame = map._mapFrame,
			maskFrame = map._maskFrame,
			maskSvg = maskFrame._svg,
			rotate = map._rotate,
			domUtil = G.DomUtil,
			transition = domUtil.Transition,
			transform = domUtil.Transform;

		if (!self._zooming) {
			self._zooming = true;
		}

		var size = map.getSize();
		var drawSize = map.getDrawSize();
		var w = drawSize[0];
		var h = drawSize[1];
		var dx = (w - size[0]) / 2,
			dy = (h - size[1]) / 2; //dx, dy为旋转后svg与旋转后窗口大小原点的偏移

		var centerScreen = [size[0] / 2, size[1] / 2],
			aroundScreen = e.aroundScreen || centerScreen;

		//centerScreen = G.MathUtil.rotateVector(centerScreen, rotate);
		//aroundScreen = G.MathUtil.rotateVector(aroundScreen, rotate);

		var xx = centerScreen[0] - aroundScreen[0],
			yy = centerScreen[1] - aroundScreen[1];

		if (rotate && xx && yy) {
			var v = G.MathUtil.rotateVector([xx, yy], -rotate);

			aroundScreen = [centerScreen[0] - v[0], centerScreen[1] - v[1]];
		}

		aroundScreen = self._aroundScreen =
			[aroundScreen[0] - centerScreen[0], aroundScreen[1] - centerScreen[1]]; // SVG rotate around its center

		var style = G.DomUtil.genScaleStyle(1 / e.scale,
			aroundScreen[0], aroundScreen[1], -dx, -dy);

		maskSvg.style[transform] = style;

		var ignoreAnim = map._zoomAnim && map._zoomAnim._params.ignoreAnim;
		if (!ignoreAnim) {
			maskSvg.style[transition] = mapFrame.style[transition];
		}
	},

	_onZoomUpdate: function(e) {
		var map = this,
			mapFrame = map._mapFrame,
			maskFrame = map._maskFrame,
			maskSvg = maskFrame._svg,
			domUtil = G.DomUtil,
			transition = domUtil.Transition,
			transform = domUtil.Transform;

		if (!self._zooming) {
			return;
		}

		var aroundScreen = self._aroundScreen;

		var size = map.getSize();
		var drawSize = map.getDrawSize();
		var w = drawSize[0];
		var h = drawSize[1];
		var dx = (w - size[0]) / 2,
			dy = (h - size[1]) / 2;

		var style = G.DomUtil.genScaleStyle(1 / e.scale,
			aroundScreen[0], aroundScreen[1], -dx, -dy);
		maskSvg.style[transform] = style;

		var ignoreAnim = map._zoomAnim && map._zoomAnim._params.ignoreAnim;
		if (!ignoreAnim) {
			maskSvg.style[transition] = mapFrame.style[transition];
		}
	},

	_onZoomEnd: function() {
		var map = this,
			maskFrame = map._maskFrame,
			maskSvg = maskFrame._svg,
			domUtil = G.DomUtil;

		var size = map.getSize();
		var drawSize = map.getDrawSize();
		var w = drawSize[0];
		var h = drawSize[1];
		var dx = (w - size[0]) / 2,
			dy = (h - size[1]) / 2;

		maskSvg.style.visibility = '';
		maskSvg.parentNode.appendChild(maskSvg);

		maskSvg.style[domUtil.Transform] = domUtil.genTranslateStyle(-dx, -dy);
		maskSvg.style[domUtil.Transition] = '';

		self._zooming = false;
	}


});