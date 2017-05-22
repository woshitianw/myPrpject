/* global G:false */
G.Layer.Graphic = G.Layer.Graphic.extend({

	_initContainer: function() {
		var self = this,
			map = self._map,
			domUtil = G.DomUtil;

		var container = self._container = domUtil.create('div', 'g-layer');

		self._vml = domUtil.createVML('group', '', container);

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

		var drawSize = map.getDrawSize();
		var w = drawSize[0];
		var h = drawSize[1];
		var vml = self._vml;

		domUtil.setZIndex(self._container, self._zIndex);

		domUtil.show(vml);
		vml.style.width = w;
		vml.style.height = h;
		vml.coordsize = [w, h].join(' ');

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
		var vml = self._vml;

		G.DomUtil.hide(vml);
	},

	_onClear: function() {
		var self = this;

		var vml = self._vml;
		if (vml) {
			vml.innerHTML = '';
		}
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
				self._front.appendChild(tile);

				if (tile._wraps) {
					for (var j in tile._wraps) {
						var wrapTile = tile._wraps[j];
						if (wrapTile && wrapTile.parentNode !== self._front) {
							self._front.appendChild(wrapTile);
						}
					}
				}
			}

			self._placeTile(tile, idxX, idxY, tileZoom, maxZoom);
		}

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
		var domUtil = G.DomUtil;

		if (!self._dom) {
			self._dom = domUtil.createVML('group', 'g-vml-container');
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

		var vml = self._layer._vml;
		if (self._dom && vml && !self._dom.parentNode) {
			vml.appendChild(self._dom);
		}

		var round = Math.round;
		var mapFramePos = domUtil.getPosition(map._mapFrame);

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
				polygon = self._polygons[m] = domUtil.createVML('shape', 'g-vml');
				polygon._path = domUtil.createVML('path', 'g-vml', polygon);

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
					pt = map.toScreen([part[j][0] + m * mapWidth, part[j][1]]);
					x = pt[0] - mapFramePos[0];
					y = pt[1] - mapFramePos[1];

					partStr += (j === 0) ? ' M ' : '';
					partStr += (j === 1) ? ' L ' : ' ';
					partStr += (round(x) + ',' + round(y));
				}
				partStr += ' X';

				str += partStr;
			}

			str += ' E';

			polygon._path.v = str;

			polygon.style.width = polygon.style.height = 1;
			polygon.coordsize = '1 1';
		}

		self._updateStyles();
	},

	_updateStyles: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var options = self.options;
		var layer = self._layer;

		var dashstyle = [];
		for (var i = 0; i < options.outlineDashArray.length; i++) {
			dashstyle[i] = parseInt(options.outlineDashArray[i] / options.outlineWidth);
		}

		for (var i in self._polygons) {
			var polygon = self._polygons[i];

			if (options.outline || self._mouseOver || self._editing) {
				domUtil.strokeVML(polygon, {
					'color': self._editing ? options.lineHighlightColor : (options.outline ? options.outlineColor : options.fillColor),
					'dashstyle': dashstyle.join(' '),
					'endcap': options.outlineCap ? options.outlineCap.replace('butt', 'flat') : '',
					'joinstyle': options.outlineJoin,
					'weight': (options.outline ? options.outlineWidth : 0) + (self._mouseOver ? options.lineHighlightWiden : 0),
					'opacity': options.outlineOpacity
				});
			} else {
				domUtil.strokeVML(polygon, {
					'opacity': 0
				});
			}

			if (options.fill) {
				var imageSrc = G.Browser.getImageSrc(options.fillImage);
				domUtil.fillVML(polygon, {
					'color': options.fillColor,
					'opacity': options.fillOpacity,
					'src': imageSrc,
					'type': options.fillImage ? 'tile' : 'solid'
				});
			} else {
				domUtil.fillVML(polygon, {
					'opacity': 0
				});
			}
		}
	},

	_updateMask: function() {},

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
		var domUtil = G.DomUtil;

		if (!self._dom) {
			self._dom = domUtil.createVML('group', 'g-vml-container');
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

		var vml = self._layer._vml;
		if (self._dom && vml && !self._dom.parentNode) {
			vml.appendChild(self._dom);
		}

		var mapFramePos = domUtil.getPosition(map._mapFrame);

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
				circle = self._circles[m] = domUtil.createVML('oval', 'g-vml');

				circle._graphic = self;
				self._dom.appendChild(circle);
			}

			var c = map.toScreen([mx + m * mapWidth, my]);
			var x = c[0] - mapFramePos[0];
			var y = c[1] - mapFramePos[1];
			var cr = r / res;

			var style = circle.style;
			style.width = style.height = cr * 2;
			style.left = x - cr;
			style.top = y - cr;
		}

		self._updateStyles();
	},

	_updateStyles: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var options = self.options;
		var layer = self._layer;

		var dashstyle = [];
		for (var i = 0; i < options.outlineDashArray.length; i++) {
			dashstyle[i] = parseInt(options.outlineDashArray[i] / options.outlineWidth);
		}

		for (var i in self._circles) {
			var circle = self._circles[i];

			if (options.outline || self._mouseOver || self._editing) {
				domUtil.strokeVML(circle, {
					'color': self._editing ? options.lineHighlightColor : (options.outline ? options.outlineColor : options.fillColor),
					'dashstyle': dashstyle.join(' '),
					'weight': (options.outline ? options.outlineWidth : 0) + (self._mouseOver ? options.lineHighlightWiden : 0),
					'opacity': options.outlineOpacity
				});
			} else {
				domUtil.strokeVML(circle, {
					'opacity': 0
				});
			}

			if (options.fill) {
				var imageSrc = G.Browser.getImageSrc(options.fillImage);
				domUtil.fillVML(circle, {
					'color': options.fillColor,
					'opacity': options.fillOpacity,
					'color2': options.fillColor,
					'src': imageSrc,
					'focusposition': '50%, 50%',
					'type': options.fillImage ? 'tile' : (options.gradual ? 'gradientradial' : 'solid')
				});
			} else {
				domUtil.fillVML(circle, {
					'opacity': 0
				});
			}
		}
	},

	_updateMask: function() {},

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
		var domUtil = G.DomUtil;

		if (!self._dom) {
			self._dom = domUtil.createVML('group', 'g-vml-container');
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

		var vml = self._layer._vml;
		if (self._dom && vml && !self._dom.parentNode) {
			vml.appendChild(self._dom);
		}

		var mapFramePos = domUtil.getPosition(map._mapFrame);

		var shape = options.shape;

		var size = options.size;
		var w = size[0],
			h = size[1];
		var offset = options.offset;

		var imageRotate = options.imageRotate;
		if (options.imageGravity) {
			imageRotate += map._rotate;
		}

		if (shape == 'image' && imageRotate) {
			offset = G.MathUtil.rotateVector(offset, imageRotate);
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
						point = self._pointss[m][i] = domUtil.createVML('rect', 'g-vml');
					} else if (shape == 'image') {
						point = self._pointss[m][i] = domUtil.createVML('image', 'g-vml');
					} else if (shape == 'text') {
						point = self._pointss[m][i] = domUtil.createVML('text', 'g-vml');
					} else {
						point = self._pointss[m][i] = domUtil.createVML('oval', 'g-vml');
					}

					point._graphic = self;
					self._dom.appendChild(point);
				}

				var pt = map.toScreen([mx + m * mapWidth, my]);

				var x = pt[0],
					y = pt[1];

				var px = x + offset[0],
					py = y + offset[1];

				var style = point.style;

				if (shape == 'circle') {
					style.left = px - w / 2;
					style.top = py - w / 2;
					style.width = style.height = w;
				} else if (shape == 'rect') {
					style.left = px - w / 2;
					style.top = py - h / 2;
					style.width = w;
					style.height = h;
				} else if (shape == 'image') {
					style.left = px;
					style.top = py;
					style.width = w;
					style.height = h;

					if (imageRotate) { // VML绕图片中心旋转
						style.rotation = imageRotate;

						var v1 = [w / 2, h / 2];
						var v2 = G.MathUtil.rotateVector(v1, imageRotate);
						style.left = px - (v1[0] - v2[0]);
						style.top = py - (v1[1] - v2[1]);
					}

					var imageSrc = G.Browser.getImageSrc(options.image);
					point.src = imageSrc;
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
						self._textMeasureWidth = div.clientWidth + 4; // 不加宽度会导致文字显示不全
						div.parentNode.removeChild(div);
						self._textMeasure = text;
					}

					var textHeight = w;
					var textWidth = self._textMeasureWidth;
					var textAlign = options.textAlign;
					var textOffsetX;
					if (textAlign == 'left') {
						textOffsetX = 0;
					} else if (textAlign == 'right') {
						textOffsetX = -textWidth;
					} else { // center
						textOffsetX = -textWidth / 2;
					}
					style.left = px + textOffsetX;
					style.top = py - textHeight / 2;
					style.width = textWidth;
					style.height = textHeight;
					style.fontFamily = options.textFont;
					style.fontStyle = options.textStyle == 'italic' ? 'italic' : 'normal';
					style.fontWeight = options.textStyle == 'bold' ? 'bold' : 'normal';
					style.fontSize = w + 'px';
					style.color = options.fillColor;
					style.filter = 'alpha(opacity=' + options.fillOpacity * 100 + ')';

					point.innerHTML = options.text;
				}
			}
		}

		self._updateStyles();
	},

	_updateStyles: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var options = self.options;
		var layer = self._layer;

		for (var m in self._pointss) {
			var points = self._pointss[m];

			for (var n in points) {
				var point = points[n];

				if ((options.outline || self._mouseOver || self._editing) && options.shape != 'text') {
					var dashstyle = [],
						i;
					for (i = 0; i < options.outlineDashArray.length; i++) {
						dashstyle[i] = parseInt(options.outlineDashArray[i] / options.outlineWidth);
					}

					domUtil.strokeVML(point, {
						'color': self._editing ? options.lineHighlightColor : (options.outline ? options.outlineColor : options.fillColor),
						'dashstyle': dashstyle.join(' '),
						'weight': self._mouseOver ? options.outlineWidth + options.lineHighlightWiden : options.outlineWidth,
						'opacity': options.outlineOpacity
					});
				} else {
					domUtil.strokeVML(point, {
						'opacity': 0
					});
				}

				if (options.fill) {
					var imageSrc = G.Browser.getImageSrc(options.fillImage);
					domUtil.fillVML(point, {
						'color': options.fillColor,
						'opacity': options.fillOpacity,
						'color2': options.fillColor,
						'src': imageSrc,
						'focusposition': '50%, 50%',
						'type': options.fillImage ? 'tile' : (options.gradual ? 'gradientradial' : 'solid')
					});
				} else {
					domUtil.fillVML(point, {
						'opacity': 0
					});
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
		var domUtil = G.DomUtil;

		if (!self._dom) {
			self._dom = domUtil.createVML('group', 'g-vml-container');
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

		var vml = self._layer._vml;
		if (self._dom && vml && !self._dom.parentNode) {
			vml.appendChild(self._dom);
		}

		var round = Math.round;
		var mapFramePos = domUtil.getPosition(map._mapFrame);

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
					polygon = self._polygonss[m][n] = domUtil.createVML('shape', 'g-vml');
					polygon._path = domUtil.createVML('path', 'g-vml', polygon);

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
						pt = map.toScreen([part[j][0] + m * mapWidth, part[j][1]]);
						x = pt[0] - mapFramePos[0];
						y = pt[1] - mapFramePos[1];

						partStr += (j === 0) ? ' M ' : '';
						partStr += (j === 1) ? ' L ' : ' ';
						partStr += (round(x) + ',' + round(y));
					}
					partStr += ' X';

					str += partStr;
				}

				str += ' E';

				polygon._path.v = str;

				polygon.style.width = polygon.style.height = 1;
				polygon.coordsize = '1 1';
			}
		}

		self._updateStyles();
	},

	_updateStyles: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var options = self.options;
		var layer = self._layer;

		var dashstyle = [];
		for (var i = 0; i < options.outlineDashArray.length; i++) {
			dashstyle[i] = parseInt(options.outlineDashArray[i] / options.outlineWidth);
		}

		for (var m in self._polygonss) {
			var polygons = self._polygonss[m];

			for (var n in polygons) {
				var polygon = polygons[n];

				if (options.outline || self._mouseOver || self._editing) {
					domUtil.strokeVML(polygon, {
						'color': self._editing ? options.lineHighlightColor : (options.outline ? options.outlineColor : options.fillColor),
						'dashstyle': dashstyle.join(' '),
						'endcap': options.outlineCap ? options.outlineCap.replace('butt', 'flat') : '',
						'joinstyle': options.outlineJoin,
						'weight': (options.outline ? options.outlineWidth : 0) + (self._mouseOver ? options.lineHighlightWiden : 0),
						'opacity': options.outlineOpacity
					});
				} else {
					domUtil.strokeVML(polygon, {
						'opacity': 0
					});
				}

				if (options.fill) {
					var imageSrc = G.Browser.getImageSrc(options.fillImage);
					domUtil.fillVML(polygon, {
						'color': options.fillColor,
						'opacity': options.fillOpacity,
						'src': imageSrc,
						'type': options.fillImage ? 'tile' : 'solid'
					});
				} else {
					domUtil.fillVML(polygon, {
						'opacity': 0
					});
				}
			}
		}
	},

	_updateMask: function() {},

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
		var domUtil = G.DomUtil;

		if (!self._dom) {
			self._dom = domUtil.createVML('group', 'g-vml-container');
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

		var vml = self._layer._vml;
		if (self._dom && vml && !self._dom.parentNode) {
			vml.appendChild(self._dom);
		}

		var round = Math.round;
		var mapFramePos = domUtil.getPosition(map._mapFrame);

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
					polyline = self._polyliness[m][n] = domUtil.createVML('shape', 'g-vml');
					polyline._path = domUtil.createVML('path', 'g-vml', polyline);

					polyline._graphic = self;
					self._dom.appendChild(polyline);
				}

				var str = '';
				var pt, x, y;
				var pl = pls[n];
				for (var i = 0, iLen = pl.length; i < iLen; i++) {
					pt = map.toScreen([pl[i][0] + m * mapWidth, pl[i][1]]);
					x = pt[0] - mapFramePos[0];
					y = pt[1] - mapFramePos[1];

					str += (i === 0) ? ' M ' : '';
					str += (i === 1) ? ' L ' : ' ';
					str += (round(x) + ',' + round(y));
				}

				str += ' E';

				polyline._path.v = str;

				polyline.filled = 'f';
				polyline.style.width = polyline.style.height = 1;
				polyline.coordsize = '1 1';
			}
		}

		self._updateStyles();
	},

	_updateStyles: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var options = self.options;

		var dashstyle = [];
		for (var i = 0; i < options.lineDashArray.length; i++) {
			dashstyle[i] = parseInt(options.lineDashArray[i] / options.lineWidth);
		}

		for (var m in self._polyliness) {
			var polylines = self._polyliness[m];

			for (var n in polylines) {
				var polyline = polylines[n];

				domUtil.strokeVML(polyline, {
					'color': self._editing ? options.lineHighlightColor : options.lineColor,
					'dashstyle': dashstyle.join(' '),
					'endcap': options.lineCap ? options.lineCap.replace('butt', 'flat') : '',
					'joinstyle': options.lineJoin,
					'weight': self._mouseOver ? options.lineWidth + options.lineHighlightWiden : options.lineWidth,
					'opacity': options.lineOpacity
				});
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
		var domUtil = G.DomUtil;

		if (!self._dom) {
			self._dom = domUtil.createVML('group', 'g-vml-container');
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

		var vml = self._layer._vml;
		if (self._dom && vml && !self._dom.parentNode) {
			vml.appendChild(self._dom);
		}

		var mapFramePos = domUtil.getPosition(map._mapFrame);

		var shape = options.shape;

		var size = options.size;
		var w = size[0],
			h = size[1];
		var offset = options.offset;

		var imageRotate = options.imageRotate;
		if (options.imageGravity) {
			imageRotate += map._rotate;
		}

		if (shape == 'image' && imageRotate) {
			offset = G.MathUtil.rotateVector(offset, imageRotate);
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
					point = self._points[m] = domUtil.createVML('rect', 'g-vml');
				} else if (shape == 'image') {
					point = self._points[m] = domUtil.createVML('image', 'g-vml');
				} else if (shape == 'text') {
					point = self._points[m] = domUtil.createVML('text', 'g-vml');
				} else {
					point = self._points[m] = domUtil.createVML('oval', 'g-vml');
				}

				point._graphic = self;
				self._dom.appendChild(point);
			}

			var pt = map.toScreen([mx + m * mapWidth, my]);

			var x = pt[0],
				y = pt[1];

			var px = x + offset[0],
				py = y + offset[1];

			var style = point.style;

			if (shape == 'circle') {
				style.left = px - w / 2;
				style.top = py - w / 2;
				style.width = style.height = w;
			} else if (shape == 'rect') {
				style.left = px - w / 2;
				style.top = py - h / 2;
				style.width = w;
				style.height = h;
			} else if (shape == 'image') {
				style.left = px;
				style.top = py;
				style.width = w;
				style.height = h;

				if (imageRotate) { // VML绕图片中心旋转
					style.rotation = imageRotate;

					var v1 = [w / 2, h / 2];
					var v2 = G.MathUtil.rotateVector(v1, imageRotate);
					style.left = px - (v1[0] - v2[0]);
					style.top = py - (v1[1] - v2[1]);
				}

				var imageSrc = G.Browser.getImageSrc(options.image);
				point.src = imageSrc;
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
					self._textMeasureWidth = div.clientWidth + 4; // 不加宽度会导致文字显示不全
					div.parentNode.removeChild(div);
					self._textMeasure = text;
				}

				var textHeight = w;
				var textWidth = self._textMeasureWidth;
				var textAlign = options.textAlign;
				var textOffsetX;
				if (textAlign == 'left') {
					textOffsetX = 0;
				} else if (textAlign == 'right') {
					textOffsetX = -textWidth;
				} else { // center
					textOffsetX = -textWidth / 2;
				}
				style.left = px + textOffsetX;
				style.top = py - textHeight / 2;
				style.width = textWidth;
				style.height = textHeight;
				style.fontFamily = options.textFont;
				style.fontStyle = options.textStyle == 'italic' ? 'italic' : 'normal';
				style.fontWeight = options.textStyle == 'bold' ? 'bold' : 'normal';
				style.fontSize = w + 'px';
				style.color = options.fillColor;
				style.filter = 'alpha(opacity=' + options.fillOpacity * 100 + ')';

				point.innerHTML = options.text;
			}
		}

		self._updateStyles();
	},

	_updateStyles: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var options = self.options;
		var layer = self._layer;

		for (var i in self._points) {
			var point = self._points[i];

			if ((options.outline || self._mouseOver || self._editing) && options.shape != 'text') {
				var dashstyle = [],
					i;
				for (i = 0; i < options.outlineDashArray.length; i++) {
					dashstyle[i] = parseInt(options.outlineDashArray[i] / options.outlineWidth);
				}

				domUtil.strokeVML(point, {
					'color': self._editing ? options.lineHighlightColor : (options.outline ? options.outlineColor : options.fillColor),
					'dashstyle': dashstyle.join(' '),
					'weight': self._mouseOver ? options.outlineWidth + options.lineHighlightWiden : options.outlineWidth,
					'opacity': options.outlineOpacity
				});
			} else {
				domUtil.strokeVML(point, {
					'opacity': 0
				});
			}

			if (options.fill) {
				var imageSrc = G.Browser.getImageSrc(options.fillImage);
				domUtil.fillVML(point, {
					'color': options.fillColor,
					'opacity': options.fillOpacity,
					'color2': options.fillColor,
					'src': imageSrc,
					'focusposition': '50%, 50%',
					'type': options.fillImage ? 'tile' : (options.gradual ? 'gradientradial' : 'solid')
				});
			} else {
				domUtil.fillVML(point, {
					'opacity': 0
				});
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
		var domUtil = G.DomUtil;

		if (!self._dom) {
			self._dom = domUtil.createVML('group', 'g-vml-container');
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

		var vml = self._layer._vml;
		if (self._dom && vml && !self._dom.parentNode) {
			vml.appendChild(self._dom);
		}

		var round = Math.round;
		var mapFramePos = domUtil.getPosition(map._mapFrame);

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
				polygon = self._polygons[m] = domUtil.createVML('shape', 'g-vml');
				polygon._path = domUtil.createVML('path', 'g-vml', polygon);

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
					pt = map.toScreen([part[j][0] + m * mapWidth, part[j][1]]);
					x = pt[0] - mapFramePos[0];
					y = pt[1] - mapFramePos[1];

					partStr += (j === 0) ? ' M ' : '';
					partStr += (j === 1) ? ' L ' : ' ';
					partStr += (round(x) + ',' + round(y));
				}
				partStr += ' X';

				str += partStr;
			}

			str += ' E';

			polygon._path.v = str;

			polygon.style.width = polygon.style.height = 1;
			polygon.coordsize = '1 1';
		}

		self._updateStyles();
	},

	_updateStyles: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var options = self.options;
		var layer = self._layer;

		var dashstyle = [];
		for (var i = 0; i < options.outlineDashArray.length; i++) {
			dashstyle[i] = parseInt(options.outlineDashArray[i] / options.outlineWidth);
		}

		for (var i in self._polygons) {
			var polygon = self._polygons[i];

			if (options.outline || self._mouseOver || self._editing) {
				domUtil.strokeVML(polygon, {
					'color': self._editing ? options.lineHighlightColor : (options.outline ? options.outlineColor : options.fillColor),
					'dashstyle': dashstyle.join(' '),
					'endcap': options.outlineCap ? options.outlineCap.replace('butt', 'flat') : '',
					'joinstyle': options.outlineJoin,
					'weight': (options.outline ? options.outlineWidth : 0) + (self._mouseOver ? options.lineHighlightWiden : 0),
					'opacity': options.outlineOpacity
				});
			} else {
				domUtil.strokeVML(polygon, {
					'opacity': 0
				});
			}

			if (options.fill) {
				var imageSrc = G.Browser.getImageSrc(options.fillImage);
				domUtil.fillVML(polygon, {
					'color': options.fillColor,
					'opacity': options.fillOpacity,
					'src': imageSrc,
					'type': options.fillImage ? 'tile' : 'solid'
				});
			} else {
				domUtil.fillVML(polygon, {
					'opacity': 0
				});
			}
		}
	},

	_updateMask: function() {},

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
		var domUtil = G.DomUtil;

		if (!self._dom) {
			self._dom = domUtil.createVML('group', 'g-vml-container');
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

		var vml = self._layer._vml;
		if (self._dom && vml && !self._dom.parentNode) {
			vml.appendChild(self._dom);
		}

		var round = Math.round;
		var mapFramePos = domUtil.getPosition(map._mapFrame);

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
				polyline = self._polylines[m] = domUtil.createVML('shape', 'g-vml');
				polyline._path = domUtil.createVML('path', 'g-vml', polyline);

				polyline._graphic = self;
				self._dom.appendChild(polyline);
			}

			var str = '';
			var pt, x, y;
			for (var i = 0; i < ptCount; i++) {
				pt = map.toScreen([geom[i][0] + m * mapWidth, geom[i][1]]);
				x = pt[0] - mapFramePos[0];
				y = pt[1] - mapFramePos[1];

				str += (i === 0) ? ' M ' : '';
				str += (i === 1) ? ' L ' : ' ';
				str += (round(x) + ',' + round(y));
			}

			str += ' E';

			polyline._path.v = str;

			polyline.filled = 'f';
			polyline.style.width = polyline.style.height = 1;
			polyline.coordsize = '1 1';
		}

		self._updateStyles();
	},

	_updateStyles: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var options = self.options;

		var dashstyle = [];
		for (var i = 0; i < options.lineDashArray.length; i++) {
			dashstyle[i] = parseInt(options.lineDashArray[i] / options.lineWidth);
		}

		for (var i in self._polylines) {
			var polyline = self._polylines[i];

			domUtil.strokeVML(polyline, {
				'color': self._editing ? options.lineHighlightColor : options.lineColor,
				'dashstyle': dashstyle.join(' '),
				'endcap': options.lineCap ? options.lineCap.replace('butt', 'flat') : '',
				'joinstyle': options.lineJoin,
				'weight': self._mouseOver ? options.lineWidth + options.lineHighlightWiden : options.lineWidth,
				'opacity': options.lineOpacity
			});
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

		self._mode = 'vml';
	}


});