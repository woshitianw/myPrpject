/* global G:false */
G.DrawHandler = G.Class.extend({
	mixins: [G.Event],

	init: function(layer) {
		var self = this;

		self._layer = layer;

		self._enabled = false;

		return self;
	},

	on: function() {
		var self = this;

		if (!self._enabled) {
			self._enabled = true;

			delete self._graphic;

			self.afterOn();
		}

		return self;
	},

	off: function() {
		var self = this;

		if (self._enabled) {
			self._enabled = false;

			// 绘制 Polyline、Polygon、Rect 的时候，如果没有结束图形绘制就调用off()方法，需要先结束绘制
			var graphic = self._graphic;
			var layer = self._layer;
			if (graphic && layer && layer._drawing //
				&& (graphic instanceof G.Graphic.Polyline || graphic instanceof G.Graphic.Polygon)) {
				layer.fireEvent('drawEnd', {
					graphic: graphic
				});
			}

			self.afterOff();
		}

		return self;
	},

	// To be override by sub class.
	afterOn: function() {},
	afterOff: function() {}


});
/* global G:false */
G.DrawHandler.Arrow = G.DrawHandler.extend({

	afterOn: function() {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var virtualMouse = G.Event.virtualMouse;

		map.addListener('virtualclick', self._onClick, self);
		map.addListener('doubleclick', self._onDoubleClick, self);
	},

	afterOff: function() {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var virtualMouse = self.virtualMouse;

		for (var i in virtualMouse.MOVE) {
			map.removeListener(virtualMouse.MOVE[i], self._onMove, self);
		}

		map.removeListener('virtualclick', self._onClick, self);
		map.removeListener('doubleclick', self._onDoubleClick, self);
	},

	_onClick: function(e) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var domUtil = G.DomUtil;
		var virtualMouse = self.virtualMouse;

		e.cancel();

		var graphic = self._graphic;
		var pt = [e.mapX, e.mapY];
		var geom, i;
		if (!graphic) {
			var wrapOffset = [0, 0];
			if (map.options.wrap) {
				pt = map._calcRealCoords(pt);
				wrapOffset = [pt[0] - e.mapX, pt[1] - e.mapY];
			}

			geom = [pt, pt];
			graphic = self._graphic = (new G.Graphic.Arrow(geom, null, layer._drawOptions)).addTo(layer);

			graphic._wrapOffset = wrapOffset;

			self._ptIndex = 0;

			for (i in virtualMouse.MOVE) {
				map.addListener(virtualMouse.MOVE[i], self._onMove, self);
			}

			// 禁用DoubleZoom
			self._realDoubleZoom = map.options.doubleZoom;
			map.options.doubleZoom = false;

			map._requestRedraw();

			layer.fireEvent('drawStart', {
				graphic: graphic
			});
		} else {
			self._ptIndex++;

			if (map.options.wrap) {
				var wrapOffset = graphic._wrapOffset;
				pt[0] += wrapOffset[0];
				pt[1] += wrapOffset[1];
			}

			geom = graphic.geom;
			geom[self._ptIndex] = pt;
			graphic.updateGeom();

			map._requestRedraw();

			layer.fireEvent('draw', {
				graphic: graphic
			});
		}
	},

	_onMove: function(e) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var domUtil = G.DomUtil;
		var virtualMouse = self.virtualMouse;

		e.cancel();

		var graphic = self._graphic;
		var pt = [e.mapX, e.mapY];
		var geom, i;
		if (graphic) {
			if (map.options.wrap) {
				var wrapOffset = graphic._wrapOffset;
				pt[0] += wrapOffset[0];
				pt[1] += wrapOffset[1];
			}

			geom = graphic.geom;
			geom[self._ptIndex + 1] = pt;
			graphic.updateGeom();

			map._requestRedraw();
		}
	},

	_onDoubleClick: function(e) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var domUtil = G.DomUtil;
		var virtualMouse = self.virtualMouse;

		e.cancel();

		var i;
		for (i in virtualMouse.MOVE) {
			map.removeListener(virtualMouse.MOVE[i], self._onMove, self);
		}

		var graphic = self._graphic;
		delete self._graphic;

		map.options.doubleZoom = self._realDoubleZoom || map.options.doubleZoom;

		if (graphic) {
			// 双击会产生两次virtualclick，需要将最后的点去掉
			if (graphic.geom && graphic.geom.length > 2) {
				graphic.geom.splice(graphic.geom.length - 1);

				graphic.updateGeom();
			}
			map._requestRedraw();

			layer.fireEvent('drawEnd', {
				graphic: graphic
			});
		}
	}

});
/* global G:false */
G.DrawHandler.Circle = G.DrawHandler.extend({

	afterOn: function() {
		var self = this;
		var layer = self._layer;
		var map = layer._map;

		var virtualMouse = self.virtualMouse;
		for (var i in virtualMouse.DOWN) {
			map.addListener(virtualMouse.DOWN[i], self._onDown, self);
		}
	},

	afterOff: function() {
		var self = this;
		var layer = self._layer;
		var map = layer._map;

		var virtualMouse = self.virtualMouse;
		for (var i in virtualMouse.DOWN) {
			map.removeListener(virtualMouse.DOWN[i], self._onDown, self);
			map.removeListener(virtualMouse.MOVE[i], self._onMove);
			map.removeListener(virtualMouse.UP[i], self._onUp);
		}
	},

	_onDown: function(e) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var domUtil = G.DomUtil;

		domUtil.stopPropagation(e);
		domUtil.preventDefault(e);

		domUtil.disableImageDrag();
		domUtil.disableTextSelection();

		var virtualMouse = self.virtualMouse;
		map.addListener(virtualMouse.MOVE[e.type], self._onMove, self);
		map.addListener(virtualMouse.UP[e.type], self._onUp, self);

		var pt = [e.mapX, e.mapY];
		var wrapOffset = [0, 0];
		if (map.options.wrap) {
			pt = map._calcRealCoords(pt);
			wrapOffset = [pt[0] - e.mapX, pt[1] - e.mapY];
		}

		var geom = [
			pt[0], pt[1], 0
		];

		var graphic = self._graphic = (new G.Graphic.Circle(geom, null, layer._drawOptions)).addTo(layer);

		graphic._wrapOffset = wrapOffset;

		layer.fireEvent('drawStart', {
			graphic: graphic
		});
	},

	_onMove: function(e) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var domUtil = G.DomUtil;

		domUtil.stopPropagation(e);
		domUtil.preventDefault(e);

		var graphic = self._graphic;
		var geom = graphic.geom;
		var pt = [e.mapX, e.mapY];
		if (map.options.wrap) {
			var wrapOffset = graphic._wrapOffset;
			pt[0] += wrapOffset[0];
			pt[1] += wrapOffset[1];
		}

		var r = G.MathUtil.calcHypotenuse(pt[0] - geom[0], pt[1] - geom[1]);
		geom[2] = r;
		graphic.updateGeom();

		map._requestRedraw();

		layer.fireEvent('draw', {
			graphic: graphic
		});
	},

	_onUp: function(e) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var domUtil = G.DomUtil;

		domUtil.stopPropagation(e);
		domUtil.preventDefault(e);

		var virtualMouse = self.virtualMouse;
		for (var i in virtualMouse.MOVE) {
			map.removeListener(virtualMouse.MOVE[i], self._onMove);
			map.removeListener(virtualMouse.UP[i], self._onUp);
		}

		layer.fireEvent('drawEnd', {
			graphic: self._graphic
		});
	}

});
/* global G:false */
G.DrawHandler.Freepolygon = G.DrawHandler.extend({

	afterOn: function() {
		var self = this;
		var layer = self._layer;
		var map = layer._map;

		var virtualMouse = self.virtualMouse;
		for (var i in virtualMouse.DOWN) {
			map.addListener(virtualMouse.DOWN[i], self._onDown, self);
		}
	},

	afterOff: function() {
		var self = this;
		var layer = self._layer;
		var map = layer._map;

		var virtualMouse = self.virtualMouse;
		for (var i in virtualMouse.DOWN) {
			map.removeListener(virtualMouse.DOWN[i], self._onDown, self);
			map.removeListener(virtualMouse.MOVE[i], self._onMove);
			map.removeListener(virtualMouse.UP[i], self._onUp);
		}
	},

	_onDown: function(e) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var domUtil = G.DomUtil;

		domUtil.stopPropagation(e);
		domUtil.preventDefault(e);

		domUtil.disableImageDrag();
		domUtil.disableTextSelection();

		var virtualMouse = self.virtualMouse;
		map.addListener(virtualMouse.MOVE[e.type], self._onMove, self);
		map.addListener(virtualMouse.UP[e.type], self._onUp, self);

		var graphic = self._graphic;
		var pt = [e.mapX, e.mapY];
		var geom;
		if (!graphic) {
			var wrapOffset = [0, 0];
			if (map.options.wrap) {
				pt = map._calcRealCoords(pt);
				wrapOffset = [pt[0] - e.mapX, pt[1] - e.mapY];
			}

			geom = [
				[pt]
			];
			graphic = self._graphic = (new G.Graphic.Polygon(geom, null, layer._drawOptions)).addTo(layer);

			graphic._wrapOffset = wrapOffset;
		}

		for (var i in virtualMouse.MOVE) {
			map.addListener(virtualMouse.MOVE[i], self._onMove, self);
		}

		layer.fireEvent('drawStart', {
			graphic: graphic
		});
	},

	_onMove: function(e) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var domUtil = G.DomUtil;

		domUtil.stopPropagation(e);
		domUtil.preventDefault(e);

		var graphic = self._graphic;
		var line = graphic.geom[0];
		var lineLen = line.length;
		line[lineLen] = [e.mapX, e.mapY];
		if (map.options.wrap) {
			var wrapOffset = graphic._wrapOffset;
			line[lineLen][0] += wrapOffset[0];
			line[lineLen][1] += wrapOffset[1];
		}

		graphic.updateGeom();

		map._requestRedraw();

		layer.fireEvent('draw', {
			graphic: graphic
		});
	},

	_onUp: function(e) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var domUtil = G.DomUtil;

		domUtil.stopPropagation(e);
		domUtil.preventDefault(e);

		var graphic = self._graphic;
		var line = graphic.geom[0];
		var lineLen = line.length;
		line[lineLen] = [e.mapX, e.mapY];
		if (map.options.wrap) {
			var wrapOffset = graphic._wrapOffset;
			line[lineLen][0] += wrapOffset[0];
			line[lineLen][1] += wrapOffset[1];
		}
		
		graphic.updateGeom();

		map._requestRedraw();

		var virtualMouse = self.virtualMouse;
		for (var i in virtualMouse.MOVE) {
			map.removeListener(virtualMouse.MOVE[i], self._onMove);
			map.removeListener(virtualMouse.UP[i], self._onUp);
		}

		delete self._graphic;

		layer.fireEvent('drawEnd', {
			graphic: graphic
		});
	}
});
/* global G:false */
G.DrawHandler.Freepolyline = G.DrawHandler.extend({

	afterOn: function() {
		var self = this;
		var layer = self._layer;
		var map = layer._map;

		var virtualMouse = self.virtualMouse;
		for (var i in virtualMouse.DOWN) {
			map.addListener(virtualMouse.DOWN[i], self._onDown, self);
		}
	},

	afterOff: function() {
		var self = this;
		var layer = self._layer;
		var map = layer._map;

		var virtualMouse = self.virtualMouse;
		for (var i in virtualMouse.DOWN) {
			map.removeListener(virtualMouse.DOWN[i], self._onDown, self);
			map.removeListener(virtualMouse.MOVE[i], self._onMove);
			map.removeListener(virtualMouse.UP[i], self._onUp);
		}
	},

	_onDown: function(e) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var domUtil = G.DomUtil;

		domUtil.stopPropagation(e);
		domUtil.preventDefault(e);

		domUtil.disableImageDrag();
		domUtil.disableTextSelection();

		var virtualMouse = self.virtualMouse;
		map.addListener(virtualMouse.MOVE[e.type], self._onMove, self);
		map.addListener(virtualMouse.UP[e.type], self._onUp, self);

		var graphic = self._graphic;
		var pt = [e.mapX, e.mapY];
		var geom;
		if (!graphic) {
			var wrapOffset = [0, 0];
			if (map.options.wrap) {
				pt = map._calcRealCoords(pt);
				wrapOffset = [pt[0] - e.mapX, pt[1] - e.mapY];
			}

			geom = [pt];
			graphic = self._graphic = (new G.Graphic.Polyline(geom, null, layer._drawOptions)).addTo(layer);

			graphic._wrapOffset = wrapOffset;
		}

		for (var i in virtualMouse.MOVE) {
			map.addListener(virtualMouse.MOVE[i], self._onMove, self);
		}

		layer.fireEvent('drawStart', {
			graphic: graphic
		});
	},

	_onMove: function(e) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var domUtil = G.DomUtil;

		domUtil.stopPropagation(e);
		domUtil.preventDefault(e);

		var graphic = self._graphic;
		var geom = graphic.geom;
		var geomLen = geom.length;
		geom[geomLen] = [e.mapX, e.mapY];
		if (map.options.wrap) {
			var wrapOffset = graphic._wrapOffset;
			geom[geomLen][0] += wrapOffset[0];
			geom[geomLen][1] += wrapOffset[1];
		}

		graphic.updateGeom();

		map._requestRedraw();

		layer.fireEvent('draw', {
			graphic: graphic
		});
	},

	_onUp: function(e) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var domUtil = G.DomUtil;

		domUtil.stopPropagation(e);
		domUtil.preventDefault(e);

		var graphic = self._graphic;
		var geom = graphic.geom;
		var geomLen = geom.length;
		geom[geomLen] = [e.mapX, e.mapY];
		if (map.options.wrap) {
			var wrapOffset = graphic._wrapOffset;
			geom[geomLen][0] += wrapOffset[0];
			geom[geomLen][1] += wrapOffset[1];
		}

		graphic.updateGeom();

		map._requestRedraw();

		var virtualMouse = self.virtualMouse;
		for (var i in virtualMouse.MOVE) {
			map.removeListener(virtualMouse.MOVE[i], self._onMove);
			map.removeListener(virtualMouse.UP[i], self._onUp);
		}

		delete self._graphic;

		layer.fireEvent('drawEnd', {
			graphic: graphic
		});
	}
});
/* global G:false */
G.DrawHandler.NormalRect = G.DrawHandler.extend({

	afterOn: function() {
		var self = this;
		var layer = self._layer;
		var map = layer._map;

		var virtualMouse = self.virtualMouse;
		for (var i in virtualMouse.DOWN) {
			map.addListener(virtualMouse.DOWN[i], self._onDown, self);
		}
	},

	afterOff: function() {
		var self = this;
		var layer = self._layer;
		var map = layer._map;

		var virtualMouse = self.virtualMouse;
		for (var i in virtualMouse.DOWN) {
			map.removeListener(virtualMouse.DOWN[i], self._onDown, self);
			map.removeListener(virtualMouse.MOVE[i], self._onMove);
			map.removeListener(virtualMouse.UP[i], self._onUp);
		}
	},

	_onDown: function(e) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var domUtil = G.DomUtil;

		domUtil.stopPropagation(e);
		domUtil.preventDefault(e);

		domUtil.disableImageDrag();
		domUtil.disableTextSelection();

		var virtualMouse = self.virtualMouse;
		map.addListener(virtualMouse.MOVE[e.type], self._onMove, self);
		map.addListener(virtualMouse.UP[e.type], self._onUp, self);

		var graphic = self._graphic;
		var pt = [e.mapX, e.mapY];
		var geom;
		if (!graphic) {
			var wrapOffset = [0, 0];
			if (map.options.wrap) {
				pt = map._calcRealCoords(pt);
				wrapOffset = [pt[0] - e.mapX, pt[1] - e.mapY];
			}

			geom = [
				[pt]
			];
			graphic = self._graphic = (new G.Graphic.Polygon(geom, null, layer._drawOptions)).addTo(layer);

			graphic._wrapOffset = wrapOffset;
		}

		for (var i in virtualMouse.MOVE) {
			map.addListener(virtualMouse.MOVE[i], self._onMove, self);
		}

		layer.fireEvent('drawStart', {
			graphic: graphic
		});
	},

	_onMove: function(e) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var domUtil = G.DomUtil;

		domUtil.stopPropagation(e);
		domUtil.preventDefault(e);

		var graphic = self._graphic;
		var pt = [e.mapX, e.mapY];
		if (map.options.wrap) {
			var wrapOffset = graphic._wrapOffset;
			pt[0] += wrapOffset[0];
			pt[1] += wrapOffset[1];
		}

		var geom = self._genRect(graphic.geom[0][0], pt);

		graphic.updateGeom(geom);

		map._requestRedraw();

		layer.fireEvent('draw', {
			graphic: graphic
		});
	},

	_onUp: function(e) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var domUtil = G.DomUtil;

		domUtil.stopPropagation(e);
		domUtil.preventDefault(e);

		var graphic = self._graphic;
		graphic.updateGeom();

		map._requestRedraw();

		var virtualMouse = self.virtualMouse;
		for (var i in virtualMouse.MOVE) {
			map.removeListener(virtualMouse.MOVE[i], self._onMove);
			map.removeListener(virtualMouse.UP[i], self._onUp);
		}

		delete self._graphic;

		layer.fireEvent('drawEnd', {
			graphic: graphic
		});
	},

	_genRect: function(p1, p2) {
		var self = this;
		var mathUtil = G.MathUtil;

		var dx = p2[0] - p1[0];
		var dy = p2[1] - p1[1];

		return [
			[p1, [p1[0] + dx, p1[1]], p2, [p1[0], p1[1] + dy]]
		];
	}
});
/* global G:false */
G.DrawHandler.Point = G.DrawHandler.extend({

	afterOn: function() {
		var self = this;
		var layer = self._layer;
		var map = layer._map;

		map.addListener('click', self._onClick, self);
	},

	afterOff: function() {
		var self = this;
		var layer = self._layer;
		var map = layer._map;

		map.removeListener('click', self._onClick, self);
	},

	_onClick: function(e) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var domUtil = G.DomUtil;

		e.cancel();

		var geom = [e.mapX, e.mapY];
		if (map.options.wrap) {
			geom = map._calcRealCoords(geom);
		}

		var graphic = self._graphic = (new G.Graphic.Point(geom, null, layer._drawOptions)).addTo(layer);

		layer.fireEvent('drawStart', {
			graphic: graphic
		}).fireEvent('draw', {
			graphic: graphic
		}).fireEvent('drawEnd', {
			graphic: graphic
		});

		map._requestRedraw();
	}

});
/* global G:false */
G.DrawHandler.Polygon = G.DrawHandler.extend({

	afterOn: function() {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var virtualMouse = G.Event.virtualMouse;

		map.addListener('virtualclick', self._onClick, self);
		map.addListener('doubleclick', self._onDoubleClick, self);
	},

	afterOff: function() {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var virtualMouse = self.virtualMouse;

		for (var i in virtualMouse.MOVE) {
			map.removeListener(virtualMouse.MOVE[i], self._onMove, self);
		}

		map.removeListener('virtualclick', self._onClick, self);
		map.addListener('doubleclick', self._onDoubleClick, self);
	},

	_onClick: function(e) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var domUtil = G.DomUtil;
		var virtualMouse = self.virtualMouse;

		e.cancel();

		var graphic = self._graphic;
		var pt = [e.mapX, e.mapY];
		var geom, i;
		if (!graphic) {
			var wrapOffset = [0, 0];
			if (map.options.wrap) {
				pt = map._calcRealCoords(pt);
				wrapOffset = [pt[0] - e.mapX, pt[1] - e.mapY];
			}

			geom = [
				[pt, pt]
			];
			graphic = self._graphic = (new G.Graphic.Polygon(geom, null, layer._drawOptions)).addTo(layer);

			graphic._wrapOffset = wrapOffset;


			self._ptIndex = 0;

			for (i in virtualMouse.MOVE) {
				map.addListener(virtualMouse.MOVE[i], self._onMove, self);
			}

			// 禁用DoubleZoom
			self._realDoubleZoom = map.options.doubleZoom;
			map.options.doubleZoom = false;

			map._requestRedraw();

			layer.fireEvent('drawStart', {
				graphic: graphic
			});
		} else {
			self._ptIndex++;

			if (map.options.wrap) {
				var wrapOffset = graphic._wrapOffset;
				pt[0] += wrapOffset[0];
				pt[1] += wrapOffset[1];
			}

			geom = graphic.geom;
			geom[0][self._ptIndex] = pt;
			graphic.updateGeom();

			map._requestRedraw();

			layer.fireEvent('draw', {
				graphic: graphic
			});
		}
	},

	_onMove: function(e) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var domUtil = G.DomUtil;
		var virtualMouse = self.virtualMouse;

		e.cancel();

		var graphic = self._graphic;
		var pt = [e.mapX, e.mapY];
		var geom, i;
		if (graphic) {
			if (map.options.wrap) {
				var wrapOffset = graphic._wrapOffset;
				pt[0] += wrapOffset[0];
				pt[1] += wrapOffset[1];
			}

			geom = graphic.geom;
			geom[0][self._ptIndex + 1] = pt;
			graphic.updateGeom();

			map._requestRedraw();
		}
	},

	_onDoubleClick: function(e) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var domUtil = G.DomUtil;
		var virtualMouse = self.virtualMouse;

		e.cancel();

		var i;
		for (i in virtualMouse.MOVE) {
			map.removeListener(virtualMouse.MOVE[i], self._onMove, self);
		}

		var graphic = self._graphic;
		delete self._graphic;

		map.options.doubleZoom = self._realDoubleZoom || map.options.doubleZoom;

		if (graphic) {
			// 双击会产生两次virtualclick，需要将最后的点去掉
			if (graphic.geom && graphic.geom[0] && graphic.geom[0].length > 3) {
				graphic.geom[0].splice(graphic.geom[0].length - 1);

				graphic.updateGeom();
			}
			map._requestRedraw();

			layer.fireEvent('drawEnd', {
				graphic: graphic
			});
		}
	}

});
/* global G:false */
G.DrawHandler.Polyline = G.DrawHandler.extend({

	afterOn: function() {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var virtualMouse = G.Event.virtualMouse;

		map.addListener('virtualclick', self._onClick, self);
		map.addListener('doubleclick', self._onDoubleClick, self);
	},

	afterOff: function() {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var virtualMouse = self.virtualMouse;

		for (var i in virtualMouse.MOVE) {
			map.removeListener(virtualMouse.MOVE[i], self._onMove, self);
		}

		map.removeListener('virtualclick', self._onClick, self);
		map.removeListener('doubleclick', self._onDoubleClick, self);
	},

	_onClick: function(e) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var domUtil = G.DomUtil;
		var virtualMouse = self.virtualMouse;

		e.cancel();

		var graphic = self._graphic;
		var pt = [e.mapX, e.mapY];
		var geom, i;
		if (!graphic) {
			var wrapOffset = [0, 0];
			if (map.options.wrap) {
				pt = map._calcRealCoords(pt);
				wrapOffset = [pt[0] - e.mapX, pt[1] - e.mapY];
			}

			geom = [pt, pt];
			graphic = self._graphic = (new G.Graphic.Polyline(geom, null, layer._drawOptions)).addTo(layer);

			graphic._wrapOffset = wrapOffset;

			self._ptIndex = 0;

			for (i in virtualMouse.MOVE) {
				map.addListener(virtualMouse.MOVE[i], self._onMove, self);
			}

			// 禁用DoubleZoom
			self._realDoubleZoom = map.options.doubleZoom;
			map.options.doubleZoom = false;

			map._requestRedraw();

			layer.fireEvent('drawStart', {
				graphic: graphic
			});
		} else {
			self._ptIndex++;

			if (map.options.wrap) {
				var wrapOffset = graphic._wrapOffset;
				pt[0] += wrapOffset[0];
				pt[1] += wrapOffset[1];
			}

			geom = graphic.geom;
			geom[self._ptIndex] = pt;
			graphic.updateGeom();

			map._requestRedraw();

			layer.fireEvent('draw', {
				graphic: graphic
			});
		}
	},

	_onMove: function(e) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var domUtil = G.DomUtil;
		var virtualMouse = self.virtualMouse;

		e.cancel();

		var graphic = self._graphic;
		var pt = [e.mapX, e.mapY];
		var geom, i;
		if (graphic) {
			if (map.options.wrap) {
				var wrapOffset = graphic._wrapOffset;
				pt[0] += wrapOffset[0];
				pt[1] += wrapOffset[1];
			}

			geom = graphic.geom;
			geom[self._ptIndex + 1] = pt;
			graphic.updateGeom();

			map._requestRedraw();
		}
	},

	_onDoubleClick: function(e) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var domUtil = G.DomUtil;
		var virtualMouse = self.virtualMouse;

		e.cancel();

		var i;
		for (i in virtualMouse.MOVE) {
			map.removeListener(virtualMouse.MOVE[i], self._onMove, self);
		}

		var graphic = self._graphic;
		delete self._graphic;

		map.options.doubleZoom = self._realDoubleZoom || map.options.doubleZoom;

		if (graphic) {
			// 双击会产生两次virtualclick，需要将最后的点去掉
			if (graphic.geom && graphic.geom.length > 2) {
				graphic.geom.splice(graphic.geom.length - 1);

				graphic.updateGeom();
			}
			map._requestRedraw();

			layer.fireEvent('drawEnd', {
				graphic: graphic
			});
		}
	}

});
/* global G:false */
G.DrawHandler.Rect = G.DrawHandler.extend({

	afterOn: function() {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var virtualMouse = G.Event.virtualMouse;

		map.addListener('virtualclick', self._onClick, self);
		map.addListener('doubleclick', self._onDoubleClick, self);
	},

	afterOff: function() {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var virtualMouse = self.virtualMouse;

		for (var i in virtualMouse.MOVE) {
			map.removeListener(virtualMouse.MOVE[i], self._onMove, self);
		}

		map.removeListener('virtualclick', self._onClick, self);
		map.addListener('doubleclick', self._onDoubleClick, self);
	},

	_onClick: function(e) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var domUtil = G.DomUtil;
		var virtualMouse = self.virtualMouse;

		e.cancel();

		var graphic = self._graphic;
		var pt = [e.mapX, e.mapY];
		var geom, i;
		if (!graphic) {
			var wrapOffset = [0, 0];
			if (map.options.wrap) {
				pt = map._calcRealCoords(pt);
				wrapOffset = [pt[0] - e.mapX, pt[1] - e.mapY];
			}
			self._p1 = pt;

			geom = [
				[pt, pt, pt]
			];
			graphic = self._graphic = (new G.Graphic.Polygon(geom, null, layer._drawOptions)).addTo(layer);

			graphic._wrapOffset = wrapOffset;

			for (i in virtualMouse.MOVE) {
				map.addListener(virtualMouse.MOVE[i], self._onMove, self);
			}

			// 禁用DoubleZoom
			self._realDoubleZoom = map.options.doubleZoom;
			map.options.doubleZoom = false;

			map._requestRedraw();

			layer.fireEvent('drawStart', {
				graphic: graphic
			});
		} else {
			if (map.options.wrap) {
				var wrapOffset = graphic._wrapOffset;
				pt[0] += wrapOffset[0];
				pt[1] += wrapOffset[1];
			}

			if (!self._p2) {
				self._p2 = pt;

				geom = [
					[self._p1, pt, pt]
				];
			} else {
				geom = self._genRect(self._p1, self._p2, pt);
			}

			graphic.updateGeom(geom);

			map._requestRedraw();

			layer.fireEvent('draw', {
				graphic: graphic
			});
		}
	},

	_onMove: function(e) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var domUtil = G.DomUtil;
		var virtualMouse = self.virtualMouse;

		e.cancel();

		var graphic = self._graphic;
		var pt = [e.mapX, e.mapY];
		var p1 = self._p1;
		var p2 = self._p2;
		var geom, i;
		if (graphic && p1) {
			if (map.options.wrap) {
				var wrapOffset = graphic._wrapOffset;
				pt[0] += wrapOffset[0];
				pt[1] += wrapOffset[1];
			}

			if (!p2) {
				geom = [
					[p1, pt, pt]
				];
			} else {
				geom = self._genRect(p1, p2, pt);
			}

			graphic.updateGeom(geom);

			map._requestRedraw();
		}
	},

	_onDoubleClick: function(e) {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var domUtil = G.DomUtil;
		var virtualMouse = self.virtualMouse;

		e.cancel();

		var i;
		for (i in virtualMouse.MOVE) {
			map.removeListener(virtualMouse.MOVE[i], self._onMove, self);
		}

		var graphic = self._graphic;
		delete self._graphic;

		delete self._p1;
		delete self._p2;

		map.options.doubleZoom = self._realDoubleZoom || map.options.doubleZoom;

		if (graphic) {
			layer.fireEvent('drawEnd', {
				graphic: graphic
			});
		}
	},

	_genRect: function(p1, p2, p3) {
		var self = this;
		var mathUtil = G.MathUtil;

		var d = mathUtil.calcDistance(p1, p2);
		if (d == 0) {
			return [
				[p1, p2, p3]
			];
		}

		var m = (p3[0] - p1[0]) * (p2[0] - p1[0]) + (p3[1] - p1[1]) * (p2[1] - p1[1]);
		var r = m / d / d;

		// p3到p1p2连线的垂足
		var x = p1[0] + r * (p2[0] - p1[0]);
		var y = p1[1] + r * (p2[1] - p1[1]);

		var dx = p3[0] - x;
		var dy = p3[1] - y;

		if (dx * dy == 0) {
			return [
				[p1, p2, p3]
			];
		}

		return [
			[p1, p2, [p2[0] + dx, p2[1] + dy],
				[p1[0] + dx, p1[1] + dy]
			]
		];
	}

});
/* global G:false */
G.Layer.Draw = G.Layer.Graphic.extend({

	forbidKeys: ['DoubleClick', 'Pinch', 'Drag', 'ShiftDrag'],

	startDraw: function(type, options) {
		var self = this;
		var map = self._map;

		if (self._handler) {
			self._handler.off();
		}

		self._drawOptions = G.Util.merge(options || {}, {
			clickable: false
		});

		if (type == 'circle') {
			self._handler = (new G.DrawHandler.Circle(self)).on();
		} else if (type == 'point') {
			self._handler = (new G.DrawHandler.Point(self)).on();
		} else if (type == 'polyline') {
			self._handler = (new G.DrawHandler.Polyline(self)).on();
		} else if (type == 'freepolyline') {
			self._handler = (new G.DrawHandler.Freepolyline(self)).on();
		} else if (type == 'polygon') {
			self._handler = (new G.DrawHandler.Polygon(self)).on();
		} else if (type == 'freepolygon') {
			self._handler = (new G.DrawHandler.Freepolygon(self)).on();
		} else if (type == 'rect') {
			self._handler = (new G.DrawHandler.Rect(self)).on();
		} else if (type == 'normalrect') {
			self._handler = (new G.DrawHandler.NormalRect(self)).on();
		} else if (type == 'arrow') {
			self._handler = (new G.DrawHandler.Arrow(self)).on();
		}

		if (self._drawing) {
			return self;
		}

		G.DomUtil.addClass(map._layersFrame, 'g-edit');

		self._drawing = true;

		var i, key, handler;
		var keys = self.forbidKeys;
		for (i in keys) {
			key = keys[i];
			handler = map._handlers[key];
			if (handler) {
				handler._forbidden = true;
				handler.off();
			}
		}

		return self;
	},

	endDraw: function() {
		var self = this;
		var map = self._map;

		var i, keys, key, handler;
		if (self._drawing) {
			handler = self._handler;
			if (handler) {
				handler.off(); // 这里会用_drawing判断，因此需要在设置_drawing=false之前
			}

			delete handler._graphic;
			self._drawing = false;

			keys = self.forbidKeys;
			for (i in keys) {
				key = keys[i];
				handler = map._handlers[key];
				if (handler) {
					handler._forbidden = false;
				}
			}

			map._resetHandlers();

			G.DomUtil.removeClass(map._layersFrame, 'g-edit');
		}

		return self;
	}


});