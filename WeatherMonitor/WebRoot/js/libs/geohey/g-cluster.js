/* global G:false */
G.Graphic.Cluster = G.Graphic.Group.extend({

	options: {
		clickable: true
	},

	init: function(group, zoom, tree, options) {
		var self = this;

		var bgGraphic = new G.Graphic.Point(null, null, {
			shape: 'circle',
			size: [32],
			fillColor: '#000',
			fillOpacity: 1.0,
			outline: true,
			outlineColor: '#000',
			outlineWidth: 10,
			outlineOpacity: 0.6
		});
		var txtGraphic = new G.Graphic.Point(null, null, {
			shape: 'text',
			size: [16],
			fillColor: '#fff',
			text: 0
		});

		self.options = G.Util.merge({}, self.options, options);

		G.Graphic.Group.prototype.init.call(self, [bgGraphic, txtGraphic], null, options);

		self._group = group;
		self._zoom = zoom;
		self._tree = tree;

		self.geom = null; // Center of gravity
		self.bbox = null;
		self._childCount = 0;

		self._childClusters = [];
		self._childPoints = [];
	},

	count: function() {
		var self = this;

		var count = self._childPoints.length;

		var i, childCluster;
		for (i in self._childClusters) {
			childCluster = self._childClusters[i];
			count += childCluster.count();
		}

		return count;
	},

	getNextZoom: function() {
		var self = this;
		var layer = self._layer;

		var zoom = self._zoom;

		if (!layer || !layer._showRelZoom) {
			return zoom;
		}

		var maxZoom = layer._showRelZoom;
		var i, cluster = self;
		for (i = zoom + 1; i <= maxZoom; i++) {
			if (cluster._childClusters.length + cluster._childPoints.length > 1 //
				|| cluster._childClusters.length == 0) {
				return i;
			}

			cluster = cluster._childClusters[0];
		}

		return maxZoom;
	},

	_ensureStyle: function() {
		var self = this;
		var layer = self._layer;
		if (!layer) {
			return;
		}

		var count = self._childCount;

		var graphics = self._graphics;
		var bgGraphic = graphics[0];
		var txtGraphic = graphics[1];
		var bgOptions = bgGraphic.options;
		var txtOptions = txtGraphic.options;

		var layerOptions = layer.options;
		var breakCount = layerOptions.breakValues.length;

		var index = 0;
		if (count <= layerOptions.breakValues[index]) {
			self._readLayerStyle(layerOptions, index, bgOptions, txtOptions);
		}
		for (index = 1; index < breakCount; index++) {
			if (count > layerOptions.breakValues[index - 1] && count <= layerOptions.breakValues[index]) {
				self._readLayerStyle(layerOptions, index, bgOptions, txtOptions);
			}
		}
		index = breakCount;
		if (count > layerOptions.breakValues[index - 1]) {
			self._readLayerStyle(layerOptions, index, bgOptions, txtOptions);
		}
	},

	_readLayerStyle: function(layerOptions, index, bgOptions, txtOptions) {
		bgOptions.size = [layerOptions.breakShapeSizes[index]];
		bgOptions.fillColor = layerOptions.breakFillColors[index];
		bgOptions.fillOpacity = layerOptions.breakFillOpacities[index];
		bgOptions.outline = layerOptions.breakOutlines[index];
		bgOptions.outlineColor = layerOptions.breakOutlineColors[index];
		bgOptions.outlineOpacity = layerOptions.breakOutlineOpacities[index];
		bgOptions.outlineWidth = layerOptions.breakOutlineWidths[index];
		txtOptions.size = [layerOptions.breakTextSizes[index]];
		txtOptions.fillColor = layerOptions.breakTextColors[index];
	},

	_updateByAdd: function(child, notifiedByChild) {
		var self = this;

		var addedCount = 0;
		if (child instanceof G.Graphic.Cluster) {
			if (notifiedByChild || !self._inList(self._childClusters, child)) {
				addedCount = child._childCount;
			}
		} else {
			if (notifiedByChild || !self._inList(self._childPoints, child)) {
				addedCount = 1;
			}
		}

		var oldCount = self._childCount;
		var totalCount = self._childCount = oldCount + addedCount;

		var graphics = self._graphics;

		var newX, newY, oldX, oldY, geom;
		if (!self.geom) {
			geom = self.geom = child.geom;
		} else {
			if (child.geom) {
				oldX = self.geom[0];
				oldY = self.geom[1];
				x = child.geom[0];
				y = child.geom[1];
				newX = (oldX * oldCount + x * addedCount) / totalCount;
				newY = (oldY * oldCount + y * addedCount) / totalCount;
				geom = self.geom = [newX, newY];
				self.bbox = [geom[0], geom[1], geom[0], geom[1]];
			}
		}

		if (geom) {
			graphics[0].updateGeom(geom, true);
			graphics[1].updateGeom(geom, true);
		}

		//self.bbox = G.ExtentUtil.union(self.bbox, child.bbox);

		graphics[1].options.text = totalCount;
	},

	_addChild: function(child, notifiedByChild, noRecursive) {
		var self = this;

		var tree = self._tree;
		if (tree && self.geom && self.geom[0] !== undefined && self.geom[1] !== undefined) {
			tree.remove([self.geom[0] - 1, self.geom[1] - 1, self.geom[0] + 1, self.geom[1] + 1], self);
		}

		self._updateByAdd(child);

		if (tree) {
			tree.insert(self.bbox, self);
		}

		if (!notifiedByChild) {
			child._group = self;

			if (child instanceof G.Graphic.Cluster) {
				self._childClusters.push(child);
			} else {
				self._childPoints.push(child);
			}
		}

		if (self._group && !noRecursive) {
			self._group._addChild(child, true);
		}

		self._ensureStyle();
	},

	_updateByRemove: function(child, notifiedByChild) {
		var self = this;

		var removedCount = 0;
		if (child instanceof G.Graphic.Cluster) {
			if (notifiedByChild || self._inList(self._childClusters, child)) {
				removedCount = child._childCount;
			}
		} else {
			if (notifiedByChild || self._inList(self._childPoints, child)) {
				removedCount = 1;
			}
		}

		var oldCount = self._childCount;
		var totalCount = self._childCount = oldCount - removedCount;

		var graphics = self._graphics;

		var newX, newY, oldX, oldY, geom;
		if (totalCount == 0) {
			self.geom = null;
			self.bbox = null;

			graphics[0].geom = null;
			graphics[0].bbox = null;
			graphics[1].geom = null;
			graphics[1].bbox = null;
		} else {
			if (self.geom && child.geom) {
				oldX = self.geom[0];
				oldY = self.geom[1];
				x = child.geom[0];
				y = child.geom[1];
				newX = (oldX * oldCount - x * removedCount) / totalCount;
				newY = (oldY * oldCount - y * removedCount) / totalCount;
				geom = self.geom = [newX, newY];
				self.bbox = [geom[0], geom[1], geom[0], geom[1]];

				graphics[0].updateGeom(geom, true);
				graphics[1].updateGeom(geom, true);
			}
		}

		//self.bbox = G.ExtentUtil.union(self.bbox, child.bbox);

		graphics[1].options.text = totalCount;
	},

	_removeChild: function(child, notifiedByChild, noRecursive) {
		var self = this;

		var tree = self._tree;
		if (tree && self.geom && self.geom[0] !== undefined && self.geom[1] !== undefined) {
			tree.remove([self.geom[0] - 1, self.geom[1] - 1, self.geom[0] + 1, self.geom[1] + 1], self);
		}

		self._updateByRemove(child, notifiedByChild);

		if (tree) {
			tree.insert(self.bbox, self);
		}

		if (!notifiedByChild) {
			child._group = null;

			if (child instanceof G.Graphic.Cluster) {
				self._removeFromList(self._childClusters, child);
			} else {
				self._removeFromList(self._childPoints, child);
			}
		}

		if (self._group && !noRecursive) {
			self._group._removeChild(child, true);
		}

		self._ensureStyle();
	},

	_inList: function(objs, target) {
		return objs && (objs.indexOf) && objs.indexOf(target) >= 0;
	},

	_removeFromList: function(objs, target) {
		var i, obj;
		for (i in objs) {
			obj = objs[i];
			if (obj === target) {
				objs.splice(i, 1);
				break;
			}
		}
	},

	_offClickable: function() {
		var self = this;

		self.options.clickable = false;

		var graphics = self._graphics;
		var i, g;
		for (i in graphics) {
			g = graphics[i];
			g.options.clickable = self.options.clickable;
		}
	},

	_onClickable: function() {
		var self = this;

		self.options.clickable = self._layer.options.clusterClickable;

		var graphics = self._graphics;
		var i, g;
		for (i in graphics) {
			g = graphics[i];
			g.options.clickable = self.options.clickable;
		}
	}


});
/* global G:false */
G.Layer.Cluster = G.Layer.Graphic.extend({
	mixins: [G.Layer.LOD],

	options: {
		radius: 50, // pixel
		showRealRes: null,
		pointClickable: false,
		clusterClickable: false,
		breakValues: [5, 10, 20],
		breakShapeSizes: [24, 32, 40, 48],
		breakFillColors: ['#71e28c', '#58d7dd', '#efcd45', '#ff936a'],
		breakFillOpacities: [1.0, 1.0, 1.0, 1.0],
		breakOutlines: [true, true, true, true],
		breakOutlineColors: ['#71e28c', '#58d7dd', '#efcd45', '#ff936a'],
		breakOutlineOpacities: [0.6, 0.6, 0.6, 0.6],
		breakOutlineWidths: [12, 16, 20, 24],
		breakTextSizes: [16, 18, 20, 24],
		breakTextColors: ['#fff', '#fff', '#fff', '#fff']
	},

	init: function(options) {
		var self = this;

		self.options = G.Util.merge({}, self.options, options);

		G.Layer.Graphic.prototype.init.call(self, options);

		self._zoom = 0;
		self._showRelZoom = 0;

		// Zoom level data
		self._clusteredTrees = [];
		self._unclusteredTrees = [];

		// Spiders
		self._spiderCluster = null;
	},

	count: function() {
		var self = this;

		var clusteredTree = self._clusteredTrees[0];
		var unclusteredTree = self._unclusteredTrees[0];

		var count = unclusteredTree.count();
		var clusters = clusteredTree.all();
		var i, c;
		for (i in clusters) {
			c = clusters[i];
			count += c.count();
		}

		return count;
	},

	addPoint: function(pointGraphic, redrawNow) {
		var self = this;

		if (!(pointGraphic instanceof G.Graphic.Point)) {
			return;
		}

		pointGraphic.addTo(self);

		var pointId = pointGraphic._id;

		var options = self.options;

		var clusterOptions = {
			clickable: options.clickable
		};

		var radius = options.radius;
		var zoomReses = options.zoomReses;

		var point = pointGraphic.geom;

		var clusteredTrees = self._clusteredTrees;
		var unclusteredTrees = self._unclusteredTrees;

		var zoom, zoomRadius;
		var nearestCluster, nearestGraphic, group, cluster;
		var i, c, clink;
		for (zoom = self._showRelZoom; zoom >= 0; zoom--) {
			zoomRadius = zoomReses[zoom] * radius;

			// 1. Has nearest cluster
			nearestCluster = self._searchNearest(clusteredTrees[zoom], point, zoomRadius);
			if (nearestCluster) {
				nearestCluster._addChild(pointGraphic);

				return pointId;
			}

			// 2. Has nearest graphic, create a new cluster
			nearestGraphic = self._searchNearest(unclusteredTrees[zoom], point, zoomRadius);
			if (nearestGraphic) {
				for (i = zoom; i >= 0; i--) {
					unclusteredTrees[i].remove(nearestGraphic.bbox, nearestGraphic);
				}
				//unclusteredTrees[zoom].remove(nearestGraphic.bbox, nearestGraphic);

				group = nearestGraphic._group;
				if (group) {
					group._removeChild(nearestGraphic);
				}

				cluster = new G.Graphic.Cluster(null, zoom, clusteredTrees[zoom], clusterOptions);
				cluster.addTo(self);
				// cluster._layer = self;
				// cluster._index = self._indexSeq++;
				// cluster._onAdded();

				clink = [cluster];
				for (i = zoom - 1; i >= 0; i--) {
					// Find cluster contains nearestGraphic
					c = self._searchNearest(clusteredTrees[i], nearestGraphic.geom, zoomReses[i] * radius);
					if (c && (c._group || i == 0)) {
						clink.push(c);
						break;
					} else {
						//unclusteredTrees[i].remove(nearestGraphic.bbox, nearestGraphic);

						c = new G.Graphic.Cluster(null, i, clusteredTrees[i], clusterOptions);
						c.addTo(self);
						// c._layer = self;
						// c._index = self._indexSeq++;
						// c._onAdded();

						clink.push(c);
					}
				}

				// Link clusters
				for (i = 0; i < clink.length - 1; i++) {
					if (!clink[i]._group) {
						clink[i + 1]._addChild(clink[i]);
					}
				}

				cluster._addChild(nearestGraphic);
				cluster._addChild(pointGraphic);

				return pointId;
			}

			// 3. No nearest cluster or graphic
			unclusteredTrees[zoom].insert(pointGraphic.bbox, pointGraphic);
		}


		return pointId;
	},

	removePoint: function(id, redrawNow) {
		var self = this;

		var dataPoint = self._dataPoints[id];
		delete self._dataPoints[id];

		self._tree.remove(dataPoint.bbox, dataPoint);

		if (redrawNow) {
			self._draw();
		}

		return self;
	},

	clear: function() {
		var self = this,
			map = self._map;

		self._graphics = {};

		self._tree.clear();

		delete self._hitGraphic;

		var i, iLen;
		for (i = 0, iLen = self._clusteredTrees.length; i < iLen; i++) {
			self._clusteredTrees[i].clear();
		}
		for (i = 0, iLen = self._unclusteredTrees.length; i < iLen; i++) {
			self._unclusteredTrees[i].clear();
		}

		self._onClear();

		if (map) {
			map._requestRedraw();
		}

		return self;
	},

	diveIn: function(cluster) {
		var self = this;
		var map = self._map;

		var clusterCenter = cluster.geom;

		var spiderZoom = cluster.getNextZoom();

		var res = self.options.zoomReses[spiderZoom];
		var size = map._size;
		var w = size[0] * res;
		var h = size[1] * res;

		map.zoomTo(clusterCenter, w, h);

		return self;
	},

	_onAdded: function() {
		var self = this;
		var map = self._map;
		var options = self.options;

		if (!self._container) {
			self._initContainer();
		}

		self.options.zoomReses = map._zoomReses;

		var zoomReses = options.zoomReses;
		var maxZoom = zoomReses.length - 1;
		var showRealRes = options.showRealRes || zoomReses[maxZoom];
		var zoom, zoomRes;
		for (zoom = 0; zoom < maxZoom; zoom++) {
			zoomRes = zoomReses[zoom];
			if (zoomRes < showRealRes) {
				break;
			}

			self._clusteredTrees[zoom] = new G.RTree();
			self._unclusteredTrees[zoom] = new G.RTree();

			self._showRelZoom = zoom;
		}

		self.addListener('graphicClicked', self._onGraphicClicked);
		self.addListener('graphicOver', self._onGraphicOver);
		self.addListener('graphicOut', self._onGraphicOut);

		map.addListener('click', self._onClick, self);
		map.addListener('mousemove', self._onMouseMove, self);
	},

	_onRemoved: function() {
		var self = this;
		var map = self._map;

		if (self._container) {
			self._destroyContainer();
		}

		self.removeListener('graphicClicked', self._onGraphicClicked);
		self.removeListener('graphicOver', self._onGraphicOver);
		self.removeListener('graphicOut', self._onGraphicOut);

		map.removeListener('click', self._onClick, self);
		map.removeListener('mousemove', self._onMouseMove, self);
	},

	_searchNearest: function(tree, point, radius) {
		var self = this;
		var x = point[0];
		var y = point[1];
		var extent = [x - radius, y - radius, x + radius, y + radius];
		var list = tree.search(extent);
		return self._getNearest(list, point, radius);
	},

	_getNearest: function(objs, point, radius) {
		if (!objs) {
			return;
		}

		var self = this;
		var maxSqrDis = radius * radius;
		var nearest, i, obj, pt, sqrDis;
		for (i in objs) {
			obj = objs[i];
			pt = obj.geom;
			sqrDis = self._sqrDis(pt, point);

			if (sqrDis < maxSqrDis) {
				nearest = obj;
				maxSqrDis = sqrDis;
			}
		}
		return nearest;
	},

	_sqrDis: function(p1, p2) {
		var dx = p1[0] - p2[0];
		var dy = p1[1] - p2[1];
		return dx * dx + dy * dy;
	},

	_onGraphicClicked: function(e) {
		var layer = this;
		var graphic = e.graphic;
		var cluster = graphic._parentGraphic;

		if (cluster && (cluster instanceof G.Graphic.Cluster)) {
			layer.fireEvent('clusterClicked', {
				cluster: cluster
			});
		}
	},

	_onGraphicOver: function(e) {
		var layer = this;
		var graphic = e.graphic;
		var cluster = graphic._parentGraphic;

		if (cluster && (cluster instanceof G.Graphic.Cluster)) {
			layer.fireEvent('clusterOver', {
				cluster: cluster
			});
		}
	},

	_onGraphicOut: function(e) {
		var layer = this;
		var graphic = e.graphic;
		var cluster = graphic._parentGraphic;

		if (cluster && (cluster instanceof G.Graphic.Cluster)) {
			layer.fireEvent('clusterOut', {
				cluster: cluster
			});
		}
	},

	_draw: function() {
		var self = this;
		var map = self._map;

		if (map._mode == 'canvas') {
			self._drawCanvas();
		} else if (map._mode == 'svg') {
			self._drawSvg();
		} else if (map._mode == 'vml') {
			self._drawVml();
		}
	},

	_drawCanvas: function() {
		var layer = this;
		var map = layer._map;

		var ctx = layer._ctx = map._useOffScreen ? map._offScreenCtx : map._onScreenCtx;

		ctx.save();

		var center = map.getCenter(),
			res = map._res,
			drawSize = map.getDrawSize(),
			w = drawSize[0],
			h = drawSize[1],
			xmin = center[0] - w * res / 2,
			xmax = center[0] + w * res / 2,
			ymin = center[1] - h * res / 2,
			ymax = center[1] + h * res / 2,
			extentRedraw = [xmin, ymin, xmax, ymax],
			extentMap = map.options.maxExtent;

		var extent = G.ExtentUtil.intersect(extentRedraw, extentMap);

		var zoom = layer._calcNearestZoom();
		var clusteredTree = layer._clusteredTrees[zoom];
		var unclusteredTree = layer._unclusteredTrees[zoom];

		if (layer._showRelZoom && zoom >= layer._showRelZoom) {
			clusteredTree = null;
			unclusteredTree = layer._tree;
		}

		var i, g, c, bbox;
		var j, jLen;
		var clusters, graphics;

		graphics = layer._tree.search(extent);
		for (i in graphics) {
			g = graphics[i];
			g.options.clickable = false;
		}

		for (j = 0, jLen = layer._clusteredTrees.length; j < jLen; j++) {
			clusters = layer._clusteredTrees[j].search(extent);
			for (i in clusters) {
				c = clusters[i];
				c._offClickable();
			}
		}

		for (j = 0, jLen = layer._unclusteredTrees.length; j < jLen; j++) {
			graphics = layer._unclusteredTrees[j].search(extent);
			for (i in graphics) {
				g = graphics[i];
				g.options.clickable = false;
			}
		}

		if (clusteredTree) {
			clusters = clusteredTree.search(extent).sort(layer._sortIndex);
			for (i in clusters) {
				c = clusters[i];
				c._onClickable();

				bbox = c.bbox;

				if (c._draw && c._layer && G.ExtentUtil.overlaps(bbox, extent)) {
					c._draw();
				}
			}
		}

		graphics = unclusteredTree.search(extent).sort(layer._sortIndex);
		for (i in graphics) {
			g = graphics[i];

			if (g._parentGraphic) {
				continue;
			}

			g.options.clickable = layer.options.pointClickable;

			bbox = g.bbox;
			if (g._draw && g._layer && G.ExtentUtil.overlaps(bbox, extent)) {
				g._draw();
			}
		}


		ctx.restore();

		layer._zoom = zoom;
	},

	_drawSvg: function() {
		var layer = this;
		var map = layer._map;
		var domUtil = G.DomUtil;
		var svg = layer._svg;

		var mapFramePos = domUtil.getPosition(map._mapFrame);
		var size = map.getSize();
		var drawSize = map.getDrawSize();
		var w = drawSize[0];
		var h = drawSize[1];
		var dx = (w - size[0]) / 2,
			dy = (h - size[1]) / 2; // 旋转后的绘制窗口和原始窗口的左上角偏移距离

		domUtil.setZIndex(layer._container, layer._zIndex);

		domUtil.show(svg);

		svg.style[domUtil.Transform] = domUtil.genTranslateStyle(-dx, -dy);

		svg.setAttribute('width', w);
		svg.setAttribute('height', h);
		svg.setAttribute('viewBox', [-mapFramePos[0], -mapFramePos[1], w, h].join(' '));

		var center = map.getCenter(),
			res = map._res,
			xmin = center[0] - w * res / 2,
			xmax = center[0] + w * res / 2,
			ymin = center[1] - h * res / 2,
			ymax = center[1] + h * res / 2,
			extentRedraw = [xmin, ymin, xmax, ymax],
			extentMap = map.options.maxExtent;

		var extent = G.ExtentUtil.intersect(extentRedraw, extentMap);

		var zoom = layer._calcNearestZoom();
		var clusteredTree = layer._clusteredTrees[zoom];
		var unclusteredTree = layer._unclusteredTrees[zoom];

		if (layer._showRelZoom && zoom >= layer._showRelZoom) {
			clusteredTree = null;
			unclusteredTree = layer._tree;
		}

		var i, g, c, bbox;
		var j, jLen;
		var clusters, graphics;

		graphics = layer._tree.all();
		for (i in graphics) {
			g = graphics[i];
			g._updateDomViz(false);
		}

		for (j = 0, jLen = layer._clusteredTrees.length; j < jLen; j++) {
			clusters = layer._clusteredTrees[j].all();
			for (i in clusters) {
				c = clusters[i];
				g._updateDomViz(false);
			}
		}

		for (j = 0, jLen = layer._unclusteredTrees.length; j < jLen; j++) {
			graphics = layer._unclusteredTrees[j].all();
			for (i in graphics) {
				g = graphics[i];
				g._updateDomViz(false);
			}
		}

		if (clusteredTree) {
			clusters = clusteredTree.search(extent).sort(layer._sortIndex);
			for (i in clusters) {
				c = clusters[i];
				c._onClickable();

				bbox = c.bbox;
				if (c._layer && G.ExtentUtil.overlaps(bbox, extent)) {
					c._updatePoints(true);
					c._updateStyles();
					c._updateDomViz(true);
				}
			}
		}

		graphics = unclusteredTree.search(extent).sort(layer._sortIndex);
		for (i in graphics) {
			g = graphics[i];

			if (g._parentGraphic) {
				continue;
			}

			g.options.clickable = layer.options.pointClickable;

			bbox = g.bbox;
			if (g._layer && G.ExtentUtil.overlaps(bbox, extent)) {
				g._updatePoints(true);
				g._updateStyles();
				g._updateDomViz(true);
			}
		}

		layer._zoom = zoom;
	},

	_drawVml: function() {
		var layer = this;
		var map = layer._map;
		var domUtil = G.DomUtil;

		var drawSize = map.getDrawSize();
		var w = drawSize[0];
		var h = drawSize[1];
		var vml = layer._vml;

		domUtil.setZIndex(layer._container, layer._zIndex);

		domUtil.show(vml);
		vml.style.width = w;
		vml.style.height = h;
		vml.coordsize = [w, h].join(' ');

		var center = map.getCenter(),
			res = map._res,
			xmin = center[0] - w * res / 2,
			xmax = center[0] + w * res / 2,
			ymin = center[1] - h * res / 2,
			ymax = center[1] + h * res / 2,
			extentRedraw = [xmin, ymin, xmax, ymax],
			extentMap = map.options.maxExtent;

		var extent = G.ExtentUtil.intersect(extentRedraw, extentMap);

		var zoom = layer._calcNearestZoom();
		var clusteredTree = layer._clusteredTrees[zoom];
		var unclusteredTree = layer._unclusteredTrees[zoom];

		if (layer._showRelZoom && zoom >= layer._showRelZoom) {
			clusteredTree = null;
			unclusteredTree = layer._tree;
		}

		var i, g, c, bbox;
		var j, jLen;
		var clusters, graphics;

		graphics = layer._tree.all();
		for (i in graphics) {
			g = graphics[i];
			g._updateDomViz(false);
		}

		for (j = 0, jLen = layer._clusteredTrees.length; j < jLen; j++) {
			clusters = layer._clusteredTrees[j].all();
			for (i in clusters) {
				c = clusters[i];
				g._updateDomViz(false);
			}
		}

		for (j = 0, jLen = layer._unclusteredTrees.length; j < jLen; j++) {
			graphics = layer._unclusteredTrees[j].all();
			for (i in graphics) {
				g = graphics[i];
				g._updateDomViz(false);
			}
		}

		if (clusteredTree) {
			clusters = clusteredTree.search(extent).sort(layer._sortIndex);
			for (i in clusters) {
				c = clusters[i];
				c._onClickable();

				bbox = c.bbox;
				if (c._layer && G.ExtentUtil.overlaps(bbox, extent)) {
					c._updatePoints(true);
					c._updateStyles();
					c._updateDomViz(true);
				}
			}
		}

		graphics = unclusteredTree.search(extent).sort(layer._sortIndex);
		for (i in graphics) {
			g = graphics[i];

			if (g._parentGraphic) {
				continue;
			}

			g.options.clickable = layer.options.pointClickable;

			bbox = g.bbox;
			if (g._layer && G.ExtentUtil.overlaps(bbox, extent)) {
				g._updatePoints(true);
				g._updateStyles();
				g._updateDomViz(true);
			}
		}

		layer._zoom = zoom;
	}


});