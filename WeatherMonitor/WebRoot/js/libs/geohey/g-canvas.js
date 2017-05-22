/* global G:false */
G.Layer.Graphic = G.Layer.Graphic.extend({

	_update: function() {
		var self = this;
		self._draw();
	},

	_draw: function() {
		var layer = this;
		var map = layer._map;

		var ctx = layer._ctx = map._useOffScreen ? map._offScreenCtx : map._onScreenCtx;

		ctx.save();

		var extent = map.getRedrawExtent();
		var searched = layer._tree.search(extent).sort(layer._sortIndex);

		var g, bbox;
		for (var i in searched) {
			g = searched[i];
			bbox = g.bbox;

			if (g._layer && G.ExtentUtil.overlaps(bbox, extent)) {
				g._draw();
			}
		}

		ctx.restore();
	}


});
/* global G:false */
G.Layer.Html = G.Layer.Html.extend({

	_placeHtml: function(htmlDiv) {
		var self = this,
			mathUtil = G.MathUtil,
			pr = G.Browser.getPxRatio(),
			prX = pr[0],
			prY = pr[1],
			map = self._map,
			rotate = map._rotate,
			mapRes = map._res,
			options = self.options,
			domUtil = G.DomUtil;

		var zoomScale = self._zoomScale || self._scale;
		var zoomAround = self._aroundScreen;

		var pt = map.toScreen(htmlDiv.geom, zoomAround, zoomScale);
		var tx = pt[0],
			ty = pt[1];

		if (self._hidden) {
			domUtil.hide(htmlDiv);
		} else {
			domUtil.show(htmlDiv);
		}

		domUtil.markPosTransform(htmlDiv, tx, ty);
		domUtil.updateTransform(htmlDiv);
	},

	_onZoom: function() {
		var self = this,
			map = self._map,
			rotate = map._rotate,
			domUtil = G.DomUtil;

		if (!self._zooming) {
			return;
		}

		if (self._tempScale == self._latestTempScale) { // _tempScale在_onZoomUpdate()中被更新
			self._erase();
			return;
		} else {
			self._latestTempScale = self._tempScale;
		}
	},

	_onRotate: function() {
		var self = this;

		self._draw();
	},

	_onPinch: function() {
		var self = this;

		self._draw();
	}


});
/* global G:false */
G.Layer.Image = G.Layer.Image.extend({

	_initContainer: function() {
		var self = this;
		var map = self._map;

		self.addListener('imageSuccess', map._requestRedraw, map);
	},

	_destroyContainer: function() {
		var self = this;
		var map = self._map;

		self.removeListener('imageSuccess', map._requestRedraw, map);
	},

	_update: function() {
		var self = this,
			map = self._map;

		if (!map._isLoaded()) {
			return;
		}

		self._draw();
	},

	_draw: function() {
		var self = this;
		var map = self._map;
		var options = self.options;

		var ctx = self._ctx = map._useOffScreen ? map._offScreenCtx : map._onScreenCtx;

		var image;
		var key;

		var hasOpacity = options.opacity < 1;
		if (hasOpacity) {
			ctx.save();
			ctx.globalAlpha = options.opacity;
		}

		for (key in self._images) {
			image = self._images[key];

			if (!image._loaded) {
				continue;
			}

			self._placeImage(image);
		}

		if (hasOpacity) {
			ctx.restore();
		}
	},

	_placeImage: function(image) {
		if (!image._loaded) {
			return;
		}

		var self = this,
			mathUtil = G.MathUtil,
			pr = G.Browser.getPxRatio(),
			prX = pr[0],
			prY = pr[1],
			map = self._map,
			res = map._res,
			rotate = map._rotate,
			bbox = image.bbox,
			x = bbox[0],
			y = bbox[1];

		var zoomScale = self._zoomScale || self._scale;
		var zoomAround = self._aroundScreen;

		var imageWidth = (bbox[2] - bbox[0]) / res;
		var imageHeight = (bbox[3] - bbox[1]) / res;

		if (zoomScale && zoomScale !== 1) {
			imageWidth /= zoomScale;
			imageHeight /= zoomScale;
		}

		var pt = map.toScreen([x, y], zoomAround, zoomScale);
		var tx = pt[0],
			ty = pt[1];

		var canvasOffset = map._canvasOffset;
		tx += canvasOffset[0];
		ty += canvasOffset[1];

		var ctx = self._ctx;

		if (rotate) {
			ctx.save();
			ctx.translate(tx, ty);
			ctx.rotate(rotate / mathUtil.DEGREE_PER_RADIAN);
			ctx.translate(-tx, -ty);
		}

		try {
			ctx.drawImage(image, tx, ty - imageHeight / prY, imageWidth / prX, imageHeight / prY);
		} catch (e) {
			//console.log(e);
		}

		if (rotate) {
			ctx.restore();
		}

	},

	_onZoomStart: function() {},
	_onZoomUpdate: function() {},
	_onZoomEnd: function() {}



});
/* global G:false */
G.Layer.Tile = G.Layer.Tile.extend({

	canvasFilter : {
		filters : ['gray', 'dark', 'negative'],

		gray : function (data) {
			for(var k = 0 , len = data.length ; k < len ; k+=4){
				var average = (data[k] + data[k+1] + data[k+2]) / 3;
				data[k] = data[k+1] = data[k+2] = average;
			}
		},
		dark : function (data) {
			for(var k = 0 , len = data.length ; k < len ; k+=4){
				var average = (data[k] + data[k+1] + data[k+2]) / 3;
				data[k] = data[k+1] = data[k+2] = 255 - average;
			}
		},
		negative : function (data) {
			for(var k = 0 , len = data.length ; k < len ; k+=4){
				data[k] = 255 - data[k];
				data[k+1] = 255 - data[k+1];
				data[k+2] = 255 - data[k+2];
			}
		}
	},

	_initContainer: function() {
		var self = this;
		var map = self._map;

		self.addListener('tileSuccess', map._requestRedraw, map);
		self.addListener('allLoaded', map._requestRedraw, map);
	},

	_destroyContainer: function() {
		var self = this;
		var map = self._map;

		self.removeListener('tileSuccess', map._requestRedraw, map);
		self.removeListener('allLoaded', map._requestRedraw, map);
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
			sizeFactor = 1 + 2 * map.options.canvasExpandFactor,
			w = drawSize[0] * sizeFactor,
			h = drawSize[1] * sizeFactor,
			xmin = center[0] - w * zoomRes / 2,
			xmax = center[0] + w * zoomRes / 2,
			ymin = center[1] - h * zoomRes / 2,
			ymax = center[1] + h * zoomRes / 2,
			extentRedraw = [xmin, ymin, xmax, ymax],
			extentMap = map.options.maxExtent,
			idxX, idxY, tile, tileInfo, tileZoom, tileXmin, tileXmax, tileYmin, tileYmax, tileInExtent, tileRes,
            filter = options.filter = G.Util.trim(self.options.filter),
            filters = self.canvasFilter.filters;
		self._redrawExtent = extentRedraw;
		var extent = G.ExtentUtil.intersect(extentRedraw, extentMap);

        if (filter && filters.indexOf(filter)<0){
			options.filter = '';
            console.log('滤镜参数错误')
        }

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

		var centerTileIndex = self._calcTileIndex(center[0], center[1], zoom);
		self._sortTileInfos(tileInfos, centerTileIndex[0], centerTileIndex[1]);
		self._addTiles(tileInfos);

		self._draw();
	},

	_draw: function() {
		var self = this;
		var map = self._map;
		var options = self.options;

		var ctx = self._ctx = map._useOffScreen ? map._offScreenCtx : map._onScreenCtx;

		var tile, tileInfo, idxX, idxY, tileZoom;
		var zoom = self._zoom;

		var key;

		var hasOpacity = options.opacity < 1;
		if (hasOpacity) {
			ctx.save();
			ctx.globalAlpha = options.opacity;
		}

		// Drawing background tiles first
		for (key in self._tiles) {
			tile = self._tiles[key];

			tileInfo = tile._info;
			tileZoom = parseInt(tileInfo[2]);

			if (!tile._loaded || tileZoom === zoom || !options.keepResample || options.opacity < 1) {
				continue;
			}

			idxX = parseInt(tileInfo[0]);
			idxY = parseInt(tileInfo[1]);

			self._placeTile(tile, idxX, idxY, tileZoom);
		}

		// Drawing front tiles
		for (key in self._tiles) {
			tile = self._tiles[key];

			tileInfo = tile._info;
			tileZoom = parseInt(tileInfo[2]);

			if (!tile._loaded || tileZoom !== zoom) {
				continue;
			}

			idxX = parseInt(tileInfo[0]);
			idxY = parseInt(tileInfo[1]);

			self._placeTile(tile, idxX, idxY, tileZoom);
		}

		if (hasOpacity) {
			ctx.restore();
		}
	},

	_placeTile: function(tile, idxX, idxY, tileZoom) {
		if (!tile._loaded) {
			return;
		}

		var mathRound = Math.round;
		var self = this,
			mathUtil = G.MathUtil,
			pr = G.Browser.getPxRatio(),
			prX = pr[0],
			prY = pr[1],
			map = self._map,
			rotate = map._rotate,
			mapRes = map._res,
			options = self.options,
			mapOptions = map.options,
			tileSize = options.tileSize,
			zoomRes = options.zoomReses[tileZoom],
			tileMapSize = tileSize * zoomRes,
			tileEnlarge = options.tileEnlarge && (!!(rotate % 90) || G.Browser.gecko || G.Browser.safari),
		    filter = options.filter,
            filters = self.canvasFilter.filters,
			scaledTileSize = Math.ceil(tileMapSize / mapRes) + (tileEnlarge ? 2 : 0), // 尝试消除锯齿边缘
			x = options.originX + idxX * tileMapSize,
			y = options.originY - idxY * tileMapSize;

		var zoomScale = self._zoomScale || self._scale;
		var zoomAround = self._aroundScreen;

		if (zoomScale && zoomScale !== 1) {
			scaledTileSize /= zoomScale;
		}

		// Too large texture
		if (scaledTileSize > (tileSize + 2) * 4 || scaledTileSize < tileSize / 8) { // 1024 + 8
			return;
		}

		var iMax = 0,
			iMin = 0;

		var maxExtent = mapOptions.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];

		if (mapOptions.wrap) {
			var redrawExtent = self._redrawExtent;
			if (redrawExtent && maxExtent) {
				iMin = Math.floor((redrawExtent[0] - options.minX) / mapWidth) - 1;
				iMax = Math.ceil((redrawExtent[2] - options.maxX) / mapWidth) + 1;
			}
		}

		for (var i = iMin; i <= iMax; i++) {
			var px = x + i * mapWidth;
			var py = y;

			var pt = map.toScreen([px, py], zoomAround, zoomScale);
			var tx = pt[0],
				ty = pt[1];

			var canvasOffset = map._canvasOffset;
			tx += canvasOffset[0];
			ty += canvasOffset[1];

			if (tileEnlarge) {
				tx -= 1; // 1px
				ty -= 1;
			}

			tx = mathRound(tx);
			ty = mathRound(ty);

			var ctx = self._ctx;

			if (rotate) {
				ctx.save();
				ctx.translate(tx, ty); // Windows下如不为整数会导致图片模糊
				ctx.rotate(rotate / mathUtil.DEGREE_PER_RADIAN);
				ctx.translate(-tx, -ty);
			}

			try {
				var _tile = !filter ? tile : tile._canvas;
				ctx.drawImage(_tile, tx, ty, mathRound(scaledTileSize / prX), mathRound(scaledTileSize / prY));
			} catch (e) {
				//console.log(e);
			}

			if (rotate) {
				ctx.restore();
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
		}

		self._checkAllHandled();
	},

	_onTileLoad: function(tile) {
		var layer = tile._layer;

		tile._responseTime = +new Date();

		var errorUrl = layer.options.errorTileUrl || G.Layer.Tile.EMPTY_TILE;

		if (tile.src !== errorUrl) { // 图片加载成功并不意味加载正确，有可能加载了一个404页面

			if (('naturalWidth' in tile) && !tile.naturalWidth) { // HTML5支持的判断
				var errorSrc = tile.src;
				tile.src = errorUrl;

				layer._numLoadError++;
				layer.fireEvent('tileError', {
					tile: tile,
					url: errorSrc
				});
			} else {
				G.DomUtil.addClass(tile, 'g-tile-loaded');
				tile._loaded = true;

				var filter = this.options.filter;
				if(filter){
					var _ccanvas = G.DomUtil.create('canvas');
					var _cctx = _ccanvas.getContext('2d');
					var scale =  G.Browser.getCanvasRatio();
					var width = _ccanvas.width = 256*scale[0];
					var height = _ccanvas.height = 256*scale[1];

					_cctx.drawImage(tile, 0, 0, width, height);

					var imageData = _cctx.getImageData(0, 0, width, height);
					var data = imageData.data;

					this.canvasFilter[filter](data);

					_cctx.putImageData(imageData, 0, 0);
					tile._canvas = _cctx.canvas;
				}

				layer._numLoadSuccess++;
				layer.fireEvent('tileSuccess', {
					tile: tile,
					url: tile.src
				});
			}

			layer._checkAllHandled();
		}
	},

	_clearBgBuffer: function() {
		var self = this;

		var tile, tileInfo, tileZoom;
		for (var key in self._tiles) {
			tile = self._tiles[key];
			tileInfo = tile._info;
			tileZoom = tileInfo[2];

			if (tileZoom !== self._zoom) {
				self._removeTile(key);
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

	_draw: function() {
		var self = this;
		var options = self.options;
		var layer = self._layer;
		var map = layer._map;
		var ctx = layer._ctx;

		self._updateGeomDraw(map._res);

		var geom = self._geomDraw;
		var method;
		var part, pt;

		var canvasOffset = map._canvasOffset;

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];

		ctx.save();

		for (var m = range[0]; m <= range[1]; m++) {
			ctx.beginPath();

			for (var i = 0, iLen = geom.length; i < iLen; i++) {
				part = geom[i];

				for (var j = 0, jLen = part.length; j < jLen; j++) {
					pt = part[j];
					pt = map.toScreen([pt[0] + m * mapWidth, pt[1]]);

					method = j === 0 ? 'moveTo' : 'lineTo';
					ctx[method](pt[0] + canvasOffset[0], pt[1] + canvasOffset[1]);
				}

				pt = part[0];
				pt = map.toScreen([pt[0] + m * mapWidth, pt[1]]);
				ctx.lineTo(pt[0] + canvasOffset[0], pt[1] + canvasOffset[1]);
			}

			if (options.fill) {
				if (options.fillImage) {
					var imgSrc = G.Browser.getImageSrc(options.fillImage);
					var img = G.DomUtil.getImgElement(imgSrc, function() {
						map._requestRedraw();
					}, null, '*');

					if (img._loaded) {
						ctx.fillStyle = ctx.createPattern(img, 'repeat');
						ctx.globalAlpha = options.fillOpacity;
					} else {
						ctx.globalAlpha = 0; // 图片未加载时不进行fill
					}
				} else {
					ctx.fillStyle = options.fillColor;
					ctx.globalAlpha = options.fillOpacity;
				}

				ctx.fill();
			}

			if (options.outline || self._mouseOver || self._editing) {
				ctx.strokeStyle = self._editing ? options.lineHighlightColor : (options.outline ? options.outlineColor : options.fillColor);
				ctx.lineCap = options.outlineCap;
				ctx.lineJoin = options.outlineJoin;
				ctx.lineWidth = (options.outline ? options.outlineWidth : 0) + (self._mouseOver ? options.lineHighlightWiden : 0);
				ctx.globalAlpha = options.outlineOpacity;
				G.Util.setCanvasLineDash(ctx, options.outlineDashArray);

				ctx.stroke();
			}

		}

		ctx.restore();
	},

	_drawMask: function() {
		var self = this;
		var map = self._map;

		var ctx = map._maskCtx;

		self._updateGeomDraw(map._res);

		var geom = self._geomDraw;
		var method;
		var part, pt;

		var canvasOffset = map._canvasOffset;

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];


		ctx.beginPath();

		for (var m = range[0]; m <= range[1]; m++) {
			for (var i = 0, iLen = geom.length; i < iLen; i++) {
				part = geom[i];

				for (var j = 0, jLen = part.length; j < jLen; j++) {
					pt = part[j];
					pt = map.toScreen([pt[0] + m * mapWidth, pt[1]]);

					method = j === 0 ? 'moveTo' : 'lineTo';
					ctx[method](pt[0] + canvasOffset[0], pt[1] + canvasOffset[1]);
				}

				pt = part[0];
				pt = map.toScreen([pt[0] + m * mapWidth, pt[1]]);
				ctx.lineTo(pt[0] + canvasOffset[0], pt[1] + canvasOffset[1]);
			}
		}

		ctx.fill();
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

		G.DomUtil.removeClass(map._layersFrame, 'g-edit');

		map._requestRedraw();
	},

	_onMouseOver: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging && !self.options.allowPan) {
			//dragHandler.off();
		}

		map._requestRedraw();

		G.DomUtil.addClass(map._layersFrame, 'g-clickable');
	},

	_onMouseOut: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		map._requestRedraw();

		G.DomUtil.removeClass(map._layersFrame, 'g-clickable');
	}



});
/* global G:false */
G.Graphic.Circle = G.Graphic.Circle.extend({

	_onAdded: function() {
		var map = this._layer._map;

		if (map) {
			map._requestRedraw();
		}
	},

	_onRemoved: function() {
		var map = this._layer._map;

		if (map) {
			map._requestRedraw();
		}
	},

	_draw: function() {
		var self = this;
		var options = self.options;
		var layer = self._layer;
		var map = layer._map;
		var ctx = layer._ctx;

		var res = map._res;

		var geom = self.geom;
		var cx = geom[0];
		var cy = geom[1];
		var r = geom[2];

		var size = r / res;
		var canvasOffset = map._canvasOffset;

		var range = map._calcWrapPointRange(geom) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];

		ctx.save();

		for (var m = range[0]; m <= range[1]; m++) {
			var c = map.toScreen([cx + m * mapWidth, cy]);

			c[0] += canvasOffset[0];
			c[1] += canvasOffset[1];

			ctx.beginPath();

			ctx.arc(c[0], c[1], size, 0, 2 * Math.PI);

			if (options.fill) {
				if (options.fillImage) {
					var imgSrc = G.Browser.getImageSrc(options.fillImage);
					var img = G.DomUtil.getImgElement(imgSrc, function() {
						map._requestRedraw();
					}, null, '*');

					if (img._loaded) {
						ctx.fillStyle = ctx.createPattern(img, 'repeat');
						ctx.globalAlpha = options.fillOpacity;
					} else {
						ctx.globalAlpha = 0; // 图片未加载时不进行fill
					}
				} else {
					if (options.gradual) {
						var grd = ctx.createRadialGradient(c[0], c[1], 0, c[0], c[1], size);
						var rgb = G.Util.colorRgb(options.fillColor);
						grd.addColorStop(0, options.fillColor);
						grd.addColorStop(1, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + options.fillOpacity + ')');
						ctx.fillStyle = grd;
					} else {
						ctx.fillStyle = options.fillColor;
						ctx.globalAlpha = options.fillOpacity;
					}
				}

				ctx.fill();
			}
			if (options.outline || self._mouseOver) {
				ctx.strokeStyle = self._editing ? options.lineHighlightColor : options.outlineColor;
				ctx.lineWidth = self._mouseOver ? options.outlineWidth + options.lineHighlightWiden : options.outlineWidth;
				ctx.globalAlpha = options.outlineOpacity;
				G.Util.setCanvasLineDash(ctx, options.outlineDashArray);

				ctx.stroke();
			}
		}

		ctx.restore();

	},

	_drawMask: function() {
		var self = this;
		var map = self._map;

		var ctx = map._maskCtx;

		var res = map._res;

		var geom = self.geom;
		var cx = geom[0];
		var cy = geom[1];
		var r = geom[2];

		var size = r / res;
		var canvasOffset = map._canvasOffset;

		var range = map._calcWrapPointRange(geom) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];

		ctx.beginPath();

		for (var m = range[0]; m <= range[1]; m++) {
			var c = map.toScreen([cx + m * mapWidth, cy]);
			c[0] += canvasOffset[0];
			c[1] += canvasOffset[1];

			ctx.arc(c[0], c[1], size, 0, 2 * Math.PI, false);
		}

		ctx.fill();
	},

	_onStartEdit: function() {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var virtualMouse = self.virtualMouse;

		for (var i in virtualMouse.DOWN) {
			map.addListener(virtualMouse.DOWN[i], self._onVertexDragStart, self);
		}

		self._refreshVertexes();
	},

	_onEndEdit: function() {
		var self = this;
		var map = self._layer._map;
		var virtualMouse = self.virtualMouse;

		for (var i in virtualMouse.DOWN) {
			map.removeListener(virtualMouse.DOWN[i], self._onVertexDragStart, self);
		}

		self._removeVertexes();
	},

	_onMouseOver: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging && !self.options.allowPan) {
			//dragHandler.off();
		}

		map._requestRedraw();

		G.DomUtil.addClass(map._layersFrame, 'g-clickable');
	},

	_onMouseOut: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		map._requestRedraw();

		G.DomUtil.removeClass(map._layersFrame, 'g-clickable');
	}



});
/* global G:false */
G.Graphic.Group = G.Graphic.Group.extend({

	_onMouseOver: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging && !self.options.allowPan) {
			//dragHandler.off();
		}

		map._requestRedraw();

		G.DomUtil.addClass(map._layersFrame, 'g-clickable');
	},

	_onMouseOut: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		map._requestRedraw();

		G.DomUtil.removeClass(map._layersFrame, 'g-clickable');
	}


});
/* global G:false */
G.Graphic.MultiPoint = G.Graphic.MultiPoint.extend({

	_onAdded: function() {
		var map = this._layer._map;

		if (map) {
			map._requestRedraw();
		}
	},

	_onRemoved: function() {
		var map = this._layer._map;

		if (map) {
			map._requestRedraw();
		}
	},

	_draw: function() {
		var self = this;
		var options = self.options;
		var layer = self._layer;
		var map = layer._map;
		var ctx = layer._ctx;
		var mathRound = Math.round;

		var shape = options.shape;
		var size = options.size;
		var w = size[0],
			h = size[1];
		var offset = options.offset;

		var imageRotate = options.imageRotate;
		if (!options.imageGravity) {
			imageRotate += map._rotate;
		}

		if (shape == 'image' && imageRotate) {
			offset = G.MathUtil.rotateVector(offset, imageRotate);
		}

		var points = self.geom['m'];
		var pt, x, y;

		var canvasOffset = map._canvasOffset;

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];

		for (var m = range[0]; m <= range[1]; m++) {

			for (var i = 0; i < points.length; i++) {
				pt = points[i];
				pt = map.toScreen([pt[0] + m * mapWidth, pt[1]]);

				x = pt[0] + offset[0] + canvasOffset[0];
				y = pt[1] + offset[1] + canvasOffset[1];

				if (shape == 'rect') {
					ctx.beginPath();
					ctx.rect(x - w / 2, y - h / 2, w, h);
					self._renderPath(x, y, Math.max(w / 2, h / 2));
				} else if (shape == 'image') {
					var imgSrc = G.Browser.getImageSrc(options.image);
					var img = G.DomUtil.getImgElement(imgSrc, function() {
						map._requestRedraw();
					});

					if (img._loaded) {
						ctx.save();
						ctx.translate(mathRound(x), mathRound(y)); // Windows下如不为整数会导致图片模糊
						ctx.rotate(imageRotate / G.MathUtil.DEGREE_PER_RADIAN);

						ctx.drawImage(img, 0, 0, w, h);

						ctx.restore();
					}
				} else if (shape == 'text') {
					ctx.save();

					ctx.fillStyle = options.fillColor;
					ctx.globalAlpha = options.fillOpacity;
					ctx.font = options.textStyle + ' ' + w + 'px ' + options.textFont;
					ctx.textAlign = options.textAlign;
					ctx.textBaseline = 'middle';

					var text = options.text;
					if (!self._textMeasureWidth || self._textMeasure != text) {
						var metrics = ctx.measureText(text);
						self._textMeasureWidth = metrics.width;
						self._textMeasure = text;
					}

					ctx.fillText(text, x, y);

					ctx.restore();
				} else { // Default
					ctx.beginPath();
					ctx.arc(x, y, w / 2, 0, 2 * Math.PI);
					self._renderPath(x, y, w / 2);
				}
			}

		}
	},

	_renderPath: function(gradualX, gradualY, gradualSize) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var ctx = layer._ctx;
		var options = self.options;

		var imgSrc, img;

		ctx.save();

		if (options.fill) {
			if (options.fillImage) {
				imgSrc = G.Browser.getimgSrc(options.fillImage);
				img = G.DomUtil.getImgElement(imgSrc, function() {
					map._requestRedraw();
				});

				if (img._loaded) {
					ctx.fillStyle = ctx.createPattern(img, 'repeat');
					ctx.globalAlpha = options.fillOpacity;
				} else {
					ctx.globalAlpha = 0; // 图片未加载时不进行fill
				}
			} else {
				if (options.gradual) {
					var grd = ctx.createRadialGradient(gradualX, gradualY, 0, gradualX, gradualY, gradualSize);
					var rgb = G.Util.colorRgb(options.fillColor);
					grd.addColorStop(0, options.fillColor);
					grd.addColorStop(1, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + options.fillOpacity + ')');
					ctx.fillStyle = grd;
				} else {
					ctx.fillStyle = options.fillColor;
					ctx.globalAlpha = options.fillOpacity;
				}
			}

			ctx.fill();
		}

		if (options.outline || self._mouseOver || self._editing) {
			ctx.strokeStyle = self._editing ? options.lineHighlightColor : (options.outline ? options.outlineColor : options.fillColor);
			ctx.lineWidth = self._mouseOver ? options.outlineWidth + options.lineHighlightWiden : options.outlineWidth;
			ctx.globalAlpha = options.outlineOpacity;
			G.Util.setCanvasLineDash(ctx, options.outlineDashArray);

			ctx.stroke();
		}

		ctx.restore();
	},

	_onStartEdit: function() {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var virtualMouse = self.virtualMouse;

		for (var i in virtualMouse.DOWN) {
			map.addListener(virtualMouse.DOWN[i], self._onVertexDragStart, self);
		}

		self._refreshVertexes();
	},

	_onEndEdit: function() {
		var self = this;
		var map = self._layer._map;
		var virtualMouse = self.virtualMouse;

		for (var i in virtualMouse.DOWN) {
			map.removeListener(virtualMouse.DOWN[i], self._onVertexDragStart, self);
		}

		self._removeVertexes();
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

		map._requestRedraw();

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

		map._requestRedraw();

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
		var map = this._layer._map;

		if (map) {
			map._requestRedraw();
		}
	},

	_onRemoved: function() {
		var map = this._layer._map;

		if (map) {
			map._requestRedraw();
		}
	},

	_draw: function() {
		var self = this;
		var options = self.options;
		var layer = self._layer;
		var map = layer._map;
		var ctx = layer._ctx;

		var polygons = self.geom['m'];
		var pg;

		var method;
		var part, pt;

		var canvasOffset = map._canvasOffset;

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];

		ctx.save();

		ctx.beginPath();

		for (var m = range[0]; m <= range[1]; m++) {
			for (var n = 0, nLen = polygons.length; n < nLen; n++) {
				pg = polygons[n];

				for (var i = 0, iLen = pg.length; i < iLen; i++) {
					part = pg[i];

					for (var j = 0, jLen = part.length; j < jLen; j++) {
						pt = part[j];
						pt = map.toScreen([pt[0] + m * mapWidth, pt[1]]);

						method = j === 0 ? 'moveTo' : 'lineTo';
						ctx[method](pt[0] + canvasOffset[0], pt[1] + canvasOffset[1]);
					}

					pt = part[0];
					pt = map.toScreen([pt[0] + m * mapWidth, pt[1]]);
					ctx.lineTo(pt[0] + canvasOffset[0], pt[1] + canvasOffset[1]);
				}
			}
		}

		if (options.fill) {
			if (options.fillImage) {
				var imgSrc = G.Browser.getImageSrc(options.fillImage);
				var img = G.DomUtil.getImgElement(imgSrc, function() {
					map._requestRedraw();
				}, null, '*');

				if (img._loaded) {
					ctx.fillStyle = ctx.createPattern(img, 'repeat');
					ctx.globalAlpha = options.fillOpacity;
				} else {
					ctx.globalAlpha = 0; // 图片未加载时不进行fill
				}
			} else {
				ctx.fillStyle = options.fillColor;
				ctx.globalAlpha = options.fillOpacity;
			}

			ctx.fill();
		}

		if (options.outline || self._mouseOver || self._editing) {
			ctx.strokeStyle = self._editing ? options.lineHighlightColor : (options.outline ? options.outlineColor : options.fillColor);
			ctx.lineCap = options.outlineCap;
			ctx.lineJoin = options.outlineJoin;
			ctx.lineWidth = (options.outline ? options.outlineWidth : 0) + (self._mouseOver ? options.lineHighlightWiden : 0);
			ctx.globalAlpha = options.outlineOpacity;
			G.Util.setCanvasLineDash(ctx, options.outlineDashArray);

			ctx.stroke();
		}

		ctx.restore();
	},

	_drawMask: function() {
		var self = this;
		var map = self._map;

		var ctx = map._maskCtx;

		var polygons = self.geom['m'];
		var pg;

		var method;
		var part, pt;

		var canvasOffset = map._canvasOffset;

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];


		ctx.beginPath();

		for (var m = range[0]; m <= range[1]; m++) {
			for (var n = 0, nLen = polygons.length; n < nLen; n++) {
				pg = polygons[n];

				for (var i = 0, iLen = pg.length; i < iLen; i++) {
					part = pg[i];

					for (var j = 0, jLen = part.length; j < jLen; j++) {
						pt = part[j];
						pt = map.toScreen([pt[0] + m * mapWidth, pt[1]]);

						method = j === 0 ? 'moveTo' : 'lineTo';
						ctx[method](pt[0] + canvasOffset[0], pt[1] + canvasOffset[1]);
					}

					pt = part[0];
					pt = map.toScreen([pt[0] + m * mapWidth, pt[1]]);
					ctx.lineTo(pt[0] + canvasOffset[0], pt[1] + canvasOffset[1]);
				}
			}
		}

		ctx.fill();
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

		G.DomUtil.removeClass(map._layersFrame, 'g-edit');

		map._requestRedraw();
	},

	_onMouseOver: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging && !self.options.allowPan) {
			//dragHandler.off();
		}

		map._requestRedraw();

		G.DomUtil.addClass(map._layersFrame, 'g-clickable');
	},

	_onMouseOut: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		map._requestRedraw();

		G.DomUtil.removeClass(map._layersFrame, 'g-clickable');
	}



});
/* global G:false */
G.Graphic.MultiPolyline = G.Graphic.MultiPolyline.extend({

	_onAdded: function() {
		var map = this._layer._map;

		if (map) {
			map._requestRedraw();
		}
	},

	_onRemoved: function() {
		var map = this._layer._map;

		if (map) {
			map._requestRedraw();
		}
	},

	_draw: function() {
		var self = this;
		var options = self.options;
		var layer = self._layer;
		var map = layer._map;
		var ctx = layer._ctx;

		var polylines = self.geom['m'];
		var pl;

		var method;
		var pt;

		var canvasOffset = map._canvasOffset;

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];

		ctx.save();

		ctx.beginPath();

		for (var m = range[0]; m <= range[1]; m++) {
			for (var j = 0, jLen = polylines.length; j < jLen; j++) {
				pl = polylines[j];

				for (var i = 0, iLen = pl.length; i < iLen; i++) {
					pt = pl[i];
					pt = map.toScreen([pt[0] + m * mapWidth, pt[1]]);

					method = i === 0 ? 'moveTo' : 'lineTo';
					ctx[method](pt[0] + canvasOffset[0], pt[1] + canvasOffset[1]);
				}
			}
		}

		ctx.strokeStyle = self._editing ? options.lineHighlightColor : options.lineColor;
		ctx.lineCap = options.lineCap;
		ctx.lineJoin = options.lineJoin;
		ctx.lineWidth = self._mouseOver ? options.lineWidth + options.lineHighlightWiden : options.lineWidth;
		ctx.globalAlpha = options.lineOpacity;
		G.Util.setCanvasLineDash(ctx, options.lineDashArray);

		ctx.stroke();

		ctx.restore();
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

		G.DomUtil.removeClass(map._layersFrame, 'g-edit');

		map._requestRedraw();
	},

	_onMouseOver: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging && !self.options.allowPan) {
			//dragHandler.off();
		}

		map._requestRedraw();

		G.DomUtil.addClass(map._layersFrame, 'g-clickable');
	},

	_onMouseOut: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		map._requestRedraw();

		G.DomUtil.removeClass(map._layersFrame, 'g-clickable');
	}



});
/* global G:false */
G.Graphic.Point = G.Graphic.Point.extend({

	_onAdded: function() {
		var map = this._layer._map;

		if (map) {
			map._requestRedraw();
		}
	},

	_onRemoved: function() {
		var map = this._layer._map;

		if (map) {
			map._requestRedraw();
		}
	},

	_draw: function() {
		var self = this;
		var options = self.options;
		var layer = self._layer;
		var map = layer._map;
		var ctx = layer._ctx;
		var mathRound = Math.round;

		var shape = options.shape;
		var size = options.size;
		var w = size[0],
			h = size[1];
		var offset = options.offset;

		var imageRotate = options.imageRotate;
		if (!options.imageGravity) {
			imageRotate += map._rotate;
		}

		if (shape == 'image' && imageRotate) {
			offset = G.MathUtil.rotateVector(offset, imageRotate);
		}

		var mx = self.geom[0];
		var my = self.geom[1];

		var canvasOffset = map._canvasOffset;

		var range = map._calcWrapPointRange(self.geom) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];
		for (var i = range[0]; i <= range[1]; i++) {
			var pt = map.toScreen([mx + i * mapWidth, my]);

			var x = pt[0] + offset[0],
				y = pt[1] + offset[1];

			x += canvasOffset[0];
			y += canvasOffset[1];

			if (shape == 'rect') {
				ctx.beginPath();
				ctx.rect(x - w / 2, y - h / 2, w, h);
				self._renderPath(x, y, Math.max(w / 2, h / 2));
			} else if (shape == 'image') {
				var imgSrc = G.Browser.getImageSrc(options.image);
				var img = G.DomUtil.getImgElement(imgSrc, function() {
					map._requestRedraw();
				});

				if (img._loaded) {
					ctx.save();
					ctx.translate(mathRound(x), mathRound(y)); // Windows下如不为整数会导致图片模糊
					ctx.rotate(imageRotate / G.MathUtil.DEGREE_PER_RADIAN);

					ctx.drawImage(img, 0, 0, w, h);

					ctx.restore();
				}
			} else if (shape == 'text') {
				ctx.save();

				ctx.fillStyle = options.fillColor;
				ctx.globalAlpha = options.fillOpacity;
				ctx.font = options.textStyle + ' ' + w + 'px ' + options.textFont;
				ctx.textAlign = options.textAlign;
				ctx.textBaseline = 'middle';

				var text = options.text;
				if (!self._textMeasureWidth || self._textMeasure != text) {
					var metrics = ctx.measureText(text);
					self._textMeasureWidth = metrics.width;
					self._textMeasure = text;
				}

				ctx.fillText(text, x, y);

				ctx.restore();
			} else { // Default
				ctx.beginPath();
				ctx.arc(x, y, w / 2, 0, 2 * Math.PI);
				self._renderPath(x, y, w / 2);
			}
		}
	},

	_renderPath: function(gradualX, gradualY, gradualSize) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var ctx = layer._ctx;
		var options = self.options;

		var imgSrc, img;

		ctx.save();

		if (options.fill) {
			if (options.fillImage) {
				imgSrc = G.Browser.getimgSrc(options.fillImage);
				img = G.DomUtil.getImgElement(imgSrc, function() {
					map._requestRedraw();
				});

				if (img._loaded) {
					ctx.fillStyle = ctx.createPattern(img, 'repeat');
					ctx.globalAlpha = options.fillOpacity;
				} else {
					ctx.globalAlpha = 0; // 图片未加载时不进行fill
				}
			} else {
				if (options.gradual) {
					var grd = ctx.createRadialGradient(gradualX, gradualY, 0, gradualX, gradualY, gradualSize);
					var rgb = G.Util.colorRgb(options.fillColor);
					grd.addColorStop(0, options.fillColor);
					grd.addColorStop(1, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + options.fillOpacity + ')');
					ctx.fillStyle = grd;
				} else {
					ctx.fillStyle = options.fillColor;
					ctx.globalAlpha = options.fillOpacity;
				}
			}

			ctx.fill();
		}

		if (options.outline || self._mouseOver || self._editing) {
			ctx.strokeStyle = self._editing ? options.lineHighlightColor : (options.outline ? options.outlineColor : options.fillColor);
			ctx.lineWidth = self._mouseOver ? options.outlineWidth + options.lineHighlightWiden : options.outlineWidth;
			ctx.globalAlpha = options.outlineOpacity;
			G.Util.setCanvasLineDash(ctx, options.outlineDashArray);

			ctx.stroke();
		}

		ctx.restore();
	},

	_onStartEdit: function() {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var virtualMouse = self.virtualMouse;

		for (var i in virtualMouse.DOWN) {
			map.addListener(virtualMouse.DOWN[i], self._onVertexDragStart, self);
		}

		self._refreshVertexes();
	},

	_onEndEdit: function() {
		var self = this;
		var map = self._layer._map;
		var virtualMouse = self.virtualMouse;

		for (var i in virtualMouse.DOWN) {
			map.removeListener(virtualMouse.DOWN[i], self._onVertexDragStart, self);
		}

		self._removeVertexes();
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

		map._requestRedraw();

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

		map._requestRedraw();

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
		var map = this._layer._map;

		if (map) {
			map._requestRedraw();
		}
	},

	_onRemoved: function() {
		var map = this._layer._map;

		if (map) {
			map._requestRedraw();
		}
	},

	_draw: function() {
		var self = this;
		var options = self.options;
		var layer = self._layer;
		var map = layer._map;
		var ctx = layer._ctx;

		var geom = self.geom;
		var method;
		var part, pt;

		var canvasOffset = map._canvasOffset;

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];

		ctx.save();

		for (var m = range[0]; m <= range[1]; m++) {
			ctx.beginPath();

			for (var i = 0, iLen = geom.length; i < iLen; i++) {
				part = geom[i];

				for (var j = 0, jLen = part.length; j < jLen; j++) {
					pt = part[j];
					pt = map.toScreen([pt[0] + m * mapWidth, pt[1]]);

					method = j === 0 ? 'moveTo' : 'lineTo';
					ctx[method](pt[0] + canvasOffset[0], pt[1] + canvasOffset[1]);
				}

				pt = part[0];
				pt = map.toScreen([pt[0] + m * mapWidth, pt[1]]);
				ctx.lineTo(pt[0] + canvasOffset[0], pt[1] + canvasOffset[1]);
			}

			if (options.fill) {
				if (options.fillImage) {
					var imgSrc = G.Browser.getImageSrc(options.fillImage);
					var img = G.DomUtil.getImgElement(imgSrc, function() {
						map._requestRedraw();
					}, null, '*');

					if (img._loaded) {
						ctx.fillStyle = ctx.createPattern(img, 'repeat');
						ctx.globalAlpha = options.fillOpacity;
					} else {
						ctx.globalAlpha = 0; // 图片未加载时不进行fill
					}
				} else {
					ctx.fillStyle = options.fillColor;
					ctx.globalAlpha = options.fillOpacity;
				}

				ctx.fill();
			}

			if (options.outline || self._mouseOver || self._editing) {
				ctx.strokeStyle = self._editing ? options.lineHighlightColor : (options.outline ? options.outlineColor : options.fillColor);
				ctx.lineCap = options.outlineCap;
				ctx.lineJoin = options.outlineJoin;
				ctx.lineWidth = (options.outline ? options.outlineWidth : 0) + (self._mouseOver ? options.lineHighlightWiden : 0);
				ctx.globalAlpha = options.outlineOpacity;
				G.Util.setCanvasLineDash(ctx, options.outlineDashArray);

				ctx.stroke();
			}

		}

		ctx.restore();
	},

	_drawMask: function() {
		var self = this;
		var map = self._map;

		var ctx = map._maskCtx;

		var geom = self.geom;
		var method;
		var part, pt;

		var canvasOffset = map._canvasOffset;

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];


		ctx.beginPath();

		for (var m = range[0]; m <= range[1]; m++) {
			for (var i = 0, iLen = geom.length; i < iLen; i++) {
				part = geom[i];

				for (var j = 0, jLen = part.length; j < jLen; j++) {
					pt = part[j];
					pt = map.toScreen([pt[0] + m * mapWidth, pt[1]]);

					method = j === 0 ? 'moveTo' : 'lineTo';
					ctx[method](pt[0] + canvasOffset[0], pt[1] + canvasOffset[1]);
				}

				pt = part[0];
				pt = map.toScreen([pt[0] + m * mapWidth, pt[1]]);
				ctx.lineTo(pt[0] + canvasOffset[0], pt[1] + canvasOffset[1]);
			}
		}

		ctx.fill();
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

		G.DomUtil.removeClass(map._layersFrame, 'g-edit');

		map._requestRedraw();
	},

	_onMouseOver: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging && !self.options.allowPan) {
			//dragHandler.off();
		}

		map._requestRedraw();

		G.DomUtil.addClass(map._layersFrame, 'g-clickable');
	},

	_onMouseOut: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		map._requestRedraw();

		G.DomUtil.removeClass(map._layersFrame, 'g-clickable');
	}



});
/* global G:false */
G.Graphic.Polyline = G.Graphic.Polyline.extend({

	_onAdded: function() {
		var map = this._layer._map;

		if (map) {
			map._requestRedraw();
		}
	},

	_onRemoved: function() {
		var map = this._layer._map;

		if (map) {
			map._requestRedraw();
		}
	},

	_draw: function() {
		var self = this;
		var options = self.options;
		var layer = self._layer;
		var map = layer._map;
		var ctx = layer._ctx;

		var geom = self.geom;

		var method;
		var pt;

		var canvasOffset = map._canvasOffset;

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];

		ctx.save();

		for (var m = range[0]; m <= range[1]; m++) {
			ctx.beginPath();

			for (var i = 0; i < geom.length; i++) {
				pt = geom[i];
				pt = map.toScreen([pt[0] + m * mapWidth, pt[1]]);

				method = i === 0 ? 'moveTo' : 'lineTo';
				ctx[method](pt[0] + canvasOffset[0], pt[1] + canvasOffset[1]);
			}

			ctx.strokeStyle = self._editing ? options.lineHighlightColor : options.lineColor;
			ctx.lineCap = options.lineCap;
			ctx.lineJoin = options.lineJoin;
			ctx.lineWidth = self._mouseOver ? options.lineWidth + options.lineHighlightWiden : options.lineWidth;
			ctx.globalAlpha = options.lineOpacity;
			G.Util.setCanvasLineDash(ctx, options.lineDashArray);

			ctx.stroke();
		}

		ctx.restore();
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

		G.DomUtil.removeClass(map._layersFrame, 'g-edit');

		map._requestRedraw();
	},

	_onMouseOver: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging && !self.options.allowPan) {
			//dragHandler.off();
		}

		map._requestRedraw();

		G.DomUtil.addClass(map._layersFrame, 'g-clickable');
	},

	_onMouseOut: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		map._requestRedraw();

		G.DomUtil.removeClass(map._layersFrame, 'g-clickable');
	}



});
/* global G:false */
G.Map = G.Map.extend({

	print: function(imageWidth, imageHeight) {
		var self = this;
		var domUtil = G.DomUtil;
		var ratio = G.Browser.getCanvasRatio();

		var size = self.getSize();
		var w = size[0];
		var h = size[1];
		var iw = imageWidth || w;
		var ih = imageHeight || h;

		var scaleWidth = iw / w;
		var scaleHeight = ih / h;
		var scale = Math.max(scaleWidth, scaleHeight);

		var canvas = self._onScreenCtx.canvas;
		var cw = canvas.width / ratio[0];
		var ch = canvas.height / ratio[1];

		var imageCanvas = domUtil.create('canvas');
		imageCanvas.width = iw;
		imageCanvas.height = ih;

		imageCanvas.getContext('2d').drawImage(canvas, (iw - cw * scale) / 2, (ih - ch * scale) / 2, cw * scale, ch * scale);

		return imageCanvas.toDataURL();
	},

	_initAddition: function() {
		var self = this,
			domUtil = G.DomUtil;

		// The one canvas.		
		var useOffScreen = self._useOffScreen = !window.G_OFF_CANVAS_OFFSCREEN;
		self._onScreenCtx = domUtil.create('canvas', 'g-layer', self._layersFrame).getContext('2d');
		if (useOffScreen) {
			self._offScreenCtx = domUtil.create('canvas').getContext('2d');
		}
		self._snapshotCtx = domUtil.create('canvas').getContext('2d');

		self._maskCtx = domUtil.create('canvas').getContext('2d');

		self._mode = 'canvas';
	},

	_redrawSnapshot: function(startCenter, startRotate, startRes) {
		var map = this;

		var ratio = G.Browser.getCanvasRatio();
		var onScreenCanvas = map._onScreenCtx.canvas;
		var w = onScreenCanvas.width / (ratio[0] || 1);
		var h = onScreenCanvas.height / (ratio[1] || 1);

		var pr = G.Browser.getPxRatio();
		var prX = pr[0];
		var prY = pr[1];

		var newCenter = map._center;
		var newRotate = map._rotate;
		var newRes = map._res;

		var rotate = newRotate - startRotate;
		var scale = newRes / startRes;

		var ctx = map._onScreenCtx;

		var dx, dy, v, mx, my, x, y;

		// 求canvas左上角点的地图坐标
		dx = -w / 2;
		dy = -h / 2;
		if (startRotate) {
			v = G.MathUtil.rotateVector([dx, dy], -startRotate);

			dx = v[0];
			dy = v[1];
		}
		mx = dx * startRes * prX + startCenter[0];
		my = -dy * startRes * prY + startCenter[1];

		// 求canvas左上角新的屏幕坐标
		dx = (mx - newCenter[0]) / newRes / prX;
		dy = -(my - newCenter[1]) / newRes / prY;
		if (newRotate) {
			v = G.MathUtil.rotateVector([dx, dy], newRotate);

			dx = v[0];
			dy = v[1];
		}
		x = w / 2 + dx;
		y = h / 2 + dy;

		map._clearCanvas(ctx);

		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(rotate / G.MathUtil.DEGREE_PER_RADIAN);
		ctx.drawImage(map._snapshotCtx.canvas, 0, 0, w / scale, h / scale);

		ctx.restore();
	},

	_redraw: function() {
		var map = this;
		var useOffScreen = map._useOffScreen;
		var onScreenCanvas = map._onScreenCtx.canvas;

		var zoomAnim = map._zoomAnim;
		var rotateAnim = map._rotateAnim;
		var pinchHandler = map._handlers.Pinch;

		if (!map.options.canvasAnimRedraw && zoomAnim && zoomAnim._playing) {
			map._redrawSnapshot(zoomAnim._startCenter, map._rotate, zoomAnim._startRes);
			return;
		}

		if (!map.options.canvasAnimRedraw && rotateAnim && rotateAnim._playing) {
			map._redrawSnapshot(map._center, rotateAnim._startRotate, map._res);
			return;
		}

		if (!map.options.canvasAnimRedraw && pinchHandler && pinchHandler._pinching) {
			map._redrawSnapshot(pinchHandler._startCenter, pinchHandler._startRotate, pinchHandler._startRes);
			return;
		}

		if (useOffScreen) {
			map._clearCanvas(map._offScreenCtx);
		} else {
			map._clearCanvas(map._onScreenCtx);
		}

		var i, id, layer;
		for (i in map._layerOrder) {
			id = map._layerOrder[i];
			layer = map._layers[id];

			if (!layer) {
				continue;
			}

			if (layer.isVisible()) {
				layer._draw();
			}
		}

		map._drawMask();

		if (useOffScreen) {
			ratio = G.Browser.getCanvasRatio();
			w = onScreenCanvas.width / (ratio[0] || 1);
			h = onScreenCanvas.height / (ratio[1] || 1);

			try {
				map._clearCanvas(map._onScreenCtx);
				map._onScreenCtx.drawImage(map._offScreenCtx.canvas, 0, 0, w, h);
			} catch (e) {
				//console.log(e);
			}
		}

		try {
			map._onScreenCtx.drawImage(map._maskCtx.canvas, 0, 0);
		} catch (e) {
			//console.log(e);
		}

		map.fireEvent('redraw');
	},

	_update: function() {
		var map = this;
		var useOffScreen = map._useOffScreen;
		var onScreenCanvas = map._onScreenCtx.canvas;
		var ratio, w, h;

		if (useOffScreen) {
			map._clearCanvas(map._offScreenCtx);
		} else {
			map._clearCanvas(map._onScreenCtx);
		}

		var i, id, layer;
		for (i in map._layerOrder) {
			id = map._layerOrder[i];
			layer = map._layers[id];

			if (!layer) {
				continue;
			}

			if (layer.isVisible()) {
				layer._update();
			}
		}

		map._drawMask();

		if (useOffScreen) {
			ratio = G.Browser.getCanvasRatio();
			w = onScreenCanvas.width / (ratio[0] || 1);
			h = onScreenCanvas.height / (ratio[1] || 1);

			try {
				map._clearCanvas(map._onScreenCtx);
				map._onScreenCtx.drawImage(map._offScreenCtx.canvas, 0, 0, w, h);
			} catch (e) {
				//console.log(e);
			}
		}

		try {
			map._onScreenCtx.drawImage(map._maskCtx.canvas, 0, 0);
		} catch (e) {
			//console.log(e);
		}

		map.fireEvent('update');
	},

	_drawMask: function() {
		var map = this;
		var ctx = map._maskCtx;

		var mapOptions = map.options;

		var j, mask;
		var masks = map._masks;
		if (!masks) {
			return;
		}

		var maskCount = masks.length;
		if (mapOptions.mask) {
			map._clearCanvas(map._maskCtx);

			if (maskCount == 0) {
				return;
			}

			ctx.save();

			ctx.globalCompositeOperation = "source-over";
			ctx.fillStyle = mapOptions.maskColor;
			ctx.globalAlpha = mapOptions.maskOpacity;
			ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			ctx.globalCompositeOperation = "destination-out";
			ctx.globalAlpha = 1;

			for (j = 0; j < maskCount; j++) {
				mask = masks[j];
				if (mask._drawMask) {
					mask._drawMask();
				}
			}

			ctx.restore();
		}
	},

	_onResize: function() {
		var map = this;

		map._resizeCanvases();

		map._updateDrawSize();

		map._requestUpdate();
	},

	_clearCanvas: function(ctx) {
		var canvas = ctx.canvas;

		var ceil = Math.ceil;
		var w = ceil(canvas.width); // For some Android Chrome
		var h = ceil(canvas.height);
		ctx.clearRect(0, 0, w, h);

		var browser = G.Browser;
		if (browser.webkit533 || browser.webkit534) { // 处理clearRect没有清空画布的问题
			var style = canvas.style;
			var oldDisplay = style.display;
			style.display = 'none'; // Detach from DOM  
			canvas.offsetHeight; // Force the detach  
			style.display = oldDisplay; // Reattach to DOM
		}
	},

	_resizeCanvas: function(ctx, w, h, ratio) {
		if (!ctx || !w || !h) {
			return;
		}

		var self = this;
		var canvas = ctx.canvas;

		var ratioX = ratio ? (ratio[0] || 1) : 1;
		var ratioY = ratio ? (ratio[1] || 1) : 1;

		var expandFactor = self.options.canvasExpandFactor;
		var ew = w * expandFactor;
		var eh = h * expandFactor;
		var vw = w + 2 * ew;
		var vh = h + 2 * eh;

		G.DomUtil.setPosition(canvas, -ew, -eh);

		if (ratioX == 1 && ratioY == 1) {
			canvas.width = vw;
			canvas.height = vh;
			canvas.style.width = '';
			canvas.style.height = '';
			ctx.scale(1, 1);
		} else {
			canvas.width = vw * ratioX;
			canvas.height = vh * ratioY;
			canvas.style.width = vw + 'px';
			canvas.style.height = vh + 'px';
			ctx.scale(ratioX, ratioY);
		}
	},

	_resizeCanvases: function() {
		var map = this;

		var size = map.getSize();
		var w = size[0],
			h = size[1];
		var ratio = G.Browser.getCanvasRatio();

		var ratioX = ratio ? (ratio[0] || 1) : 1;
		var ratioY = ratio ? (ratio[1] || 1) : 1;

		var expandFactor = map.options.canvasExpandFactor;
		var ew = w * expandFactor;
		var eh = h * expandFactor;
		var vw = w + 2 * ew;
		var vh = h + 2 * eh;

		map._canvasOffset = [ew, eh]; // Cache canvas‘s offset

		map._resizeCanvas(map._onScreenCtx, w, h, ratio);
		map._resizeCanvas(map._snapshotCtx, w, h, ratio);
		map._resizeCanvas(map._maskCtx, w, h, [1, 1]);

		if (map._useOffScreen) {
			map._resizeCanvas(map._offScreenCtx, w, h, ratio);
		}
	},

	_onZoomStart: function(e) {
		this._snapshotCanvas();
	},

	_onRotateStart: function(e) {
		this._snapshotCanvas();
	},

	_onPinchStart: function(e) {
		this._snapshotCanvas();
	},

	_snapshotCanvas: function() {
		var map = this;

		if (!map.options.canvasAnimRedraw) {
			var onScreenCanvas = map._onScreenCtx.canvas;
			var ratio = G.Browser.getCanvasRatio();
			var w = onScreenCanvas.width / (ratio[0] || 1);
			var h = onScreenCanvas.height / (ratio[1] || 1);

			map._clearCanvas(map._snapshotCtx);
			map._snapshotCtx.drawImage(onScreenCanvas, 0, 0, w, h);
		}
	},

	_calcCanvasOffset: function() {
		var map = this;

		var size = map.getSize();
		var drawSize = map.getDrawSize();
		var w = drawSize[0],
			h = drawSize[1];

		var dx = (size[0] - w) / 2;
		var dy = (size[1] - h) / 2;

		return [dx, dy];
	},

	_beforeMergeFramePos: function() {
		var map = this,
			mapFrame = map._mapFrame,
			domUtil = G.DomUtil;

		var mapFramePos = domUtil.getPosition(mapFrame);
		var x = mapFramePos[0];
		var y = mapFramePos[1];

		var spark = map._spark;
		if (spark) {
			var sparkPos = domUtil.getPosition(spark) || [0, 0];
			domUtil.markPosTransform(spark, sparkPos[0] + x, sparkPos[1] + y);
			domUtil.updateTransform(spark);
		}

		try {
			map._onScreenCtx.drawImage(map._onScreenCtx.canvas, x, y);
		} catch (e) {}

	}


});