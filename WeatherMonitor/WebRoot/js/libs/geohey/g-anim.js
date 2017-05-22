/* global G:false */
G.Graphic.Anim = {

	options: {
		duration: 2, // s
		repeatCount: -1
	},

	play: function() {
		var self = this;
		var layer = self._layer;

		if (!layer) {
			return self;
		}

		if (self._playing) {
			return self;
		}
		self._playing = true;

		var durationMs = self.options.duration * 1e3;
		var repeatCount = self.options.repeatCount;
		self._startAt = +new Date(); // 动画开始的时间
		self._endAt = repeatCount > 0 ? self._startAt + durationMs * repeatCount : null; // 动画应该结束的时间

		clearTimeout(self._tid);
		self._tid = setTimeout(function() {
			self._onStep();
		}, 30);

		return self;
	},

	stop: function() {
		var self = this;

		self._playing = false;

		clearTimeout(self._tid);

		return self;
	},

	_onStep: function() {
		var self = this;
		var layer = self._layer;

		var durationMs, interpolateFactor;

		var now = +new Date();
		if (!self._playing) {
			return;
		}

		if (self._endAt && now > self._endAt) {
			self._final();
		} else {
			durationMs = self.options.duration * 1e3;
			interpolateFactor = ((now - self._startAt) % durationMs) / durationMs;
			self._interpolate(interpolateFactor);

			clearTimeout(self._tid);
			self._tid = setTimeout(function() {
				self._onStep();
			}, 30);
		}
	},

	_final: function() {
		var self = this;
		var toGraphic = self._toGraphic;

		self.updateGeom(toGraphic.geom);
		self.updateOptions(toGraphic.options);

		self._playing = false;
	},

	_interNum: function(fromNum, toNum, factor) {
		return fromNum + (toNum - fromNum) * factor;
	},

	_interArr: function(fromArr, toArr, factor) {
		if (!fromArr || !toArr) {
			return;
		}

		var arr = [];
		var count = Math.min(fromArr.length, toArr.length);
		var i, fromValue, toValue;
		for (i = 0; i < count; i++) {
			fromValue = fromArr[i];
			toValue = toArr[i];
			arr[i] = this._interNum(fromValue, toValue, factor);
		}

		return arr;
	},

	_interColor: function(fromColor, toColor, factor) {
		var colorRgbUtil = G.Util.colorRgb;

		var fromRgb = colorRgbUtil(fromColor);
		var toRgb = colorRgbUtil(toColor);
		var rgb = this._interArr(fromRgb, toRgb, factor);

		return G.Util.colorHex(rgb[0], rgb[1], rgb[2]);
	},

	_interpolate: function(factor) {}, // 需要子类实现实现，factor从0到1
	_onStartEdit: function() {}, // Fobidden edit for Graphic.Anim
	_onEndEdit: function() {}


}
/* global G:false */
G.Graphic.AnimCircle = G.Graphic.Circle.extend({
	mixins: [G.Graphic.Anim],

	init: function(fromGraphic, toGraphic, options) {
		var self = this;

		var CircleClass = G.Graphic.Circle;
		if (!(fromGraphic instanceof CircleClass && toGraphic instanceof CircleClass)) {
			throw new Error('Type error');
		}

		self.options = G.Util.merge({}, self.options, fromGraphic.options, options);

		self._fromGraphic = fromGraphic;
		self._toGraphic = toGraphic;
	},

	_interpolate: function(factor) {
		var self = this;

		var fromGraphic = self._fromGraphic;
		var toGraphic = self._toGraphic;

		var geom = self._interArr(fromGraphic.geom, toGraphic.geom, factor);

		var fromOptions = fromGraphic.options;
		var toOptions = toGraphic.options;

		var options = G.Util.merge({}, fromOptions);

		var arrFields = ['outlineDashArray', 'fillImageSize'];
		var numFields = ['outlineWidth', 'outlineOpacity', 'fillOpacity'];
		var colorField = ['outlineColor', 'fillColor'];

		var i, field;

		for (i = arrFields.length - 1; i >= 0; i--) {
			field = arrFields[i];
			if (!field) {
				continue;
			}

			options[field] = self._interArr(fromOptions[field], toOptions[field], factor);
		};

		for (i = numFields.length - 1; i >= 0; i--) {
			field = numFields[i];
			if (!field) {
				continue;
			}

			options[field] = self._interNum(fromOptions[field], toOptions[field], factor);
		};

		for (i = colorField.length - 1; i >= 0; i--) {
			field = colorField[i];
			if (!field) {
				continue;
			}

			options[field] = self._interColor(fromOptions[field], toOptions[field], factor);
		};

		self.updateGeom(geom);
		self.updateOptions(options);
	}


});
/* global G:false */
G.Graphic.AnimPoint = G.Graphic.Point.extend({
	mixins: [G.Graphic.Anim],

	init: function(fromGraphic, toGraphic, options) {
		var self = this;

		var PointClass = G.Graphic.Point;
		if (!(fromGraphic instanceof PointClass && toGraphic instanceof PointClass)) {
			throw new Error('Type error');
		}

		self.options = G.Util.merge({}, self.options, fromGraphic.options, options);

		self._fromGraphic = fromGraphic;
		self._toGraphic = toGraphic;
	},

	_interpolate: function(factor) {
		var self = this;

		var fromGraphic = self._fromGraphic;
		var toGraphic = self._toGraphic;

		var geom = self._interArr(fromGraphic.geom, toGraphic.geom, factor);

		var fromOptions = fromGraphic.options;
		var toOptions = toGraphic.options;

		var options = G.Util.merge({}, fromOptions);

		var arrFields = ['size', 'offset', 'fillImageSize'];
		var numFields = ['imageRotate', 'outlineWidth', 'outlineOpacity', 'fillOpacity'];
		var colorField = ['outlineColor', 'fillColor'];

		var i, field;

		for (i = arrFields.length - 1; i >= 0; i--) {
			field = arrFields[i];
			if (!field) {
				continue;
			}

			options[field] = self._interArr(fromOptions[field], toOptions[field], factor);
		};

		for (i = numFields.length - 1; i >= 0; i--) {
			field = numFields[i];
			if (!field) {
				continue;
			}

			options[field] = self._interNum(fromOptions[field], toOptions[field], factor);
		};

		for (i = colorField.length - 1; i >= 0; i--) {
			field = colorField[i];
			if (!field) {
				continue;
			}

			options[field] = self._interColor(fromOptions[field], toOptions[field], factor);
		};

		self.updateGeom(geom);
		self.updateOptions(options);
	}


});
/* global G:false */
G.Graphic.AnimPolygon = G.Graphic.Polygon.extend({
	mixins: [G.Graphic.Anim],

	init: function(fromGraphic, toGraphic, options) {
		var self = this;

		var PolygonClass = G.Graphic.Polygon;
		if (!(fromGraphic instanceof PolygonClass && toGraphic instanceof PolygonClass)) {
			throw new Error('Type error');
		}

		self.options = G.Util.merge({}, self.options, fromGraphic.options, options);

		self._fromGraphic = fromGraphic;
		self._toGraphic = toGraphic;
	},

	_interpolate: function(factor) {
		var self = this;

		var fromGraphic = self._fromGraphic;
		var toGraphic = self._toGraphic;

		var fromGeom = fromGraphic.geom;
		var toGeom = toGraphic.geom;

		var geom = [];

		var fromPart, toPart, part;
		var fromPt, toPt;
		var i, iLen = Math.min(fromGeom.length, toGeom.length);
		var j, jLen;
		for (i = 0; i < iLen; i++) {
			fromPart = fromGeom[i];
			toPart = toGeom[i];

			part = [];

			jLen = Math.min(fromPart.length, toPart.length);
			for (j = 0; j < jLen; j++) {
				fromPt = fromPart[j];
				toPt = toPart[j];

				part[j] = self._interArr(fromPt, toPt, factor);
			}

			geom[i] = part;
		}


		var fromOptions = fromGraphic.options;
		var toOptions = toGraphic.options;

		var options = G.Util.merge({}, fromOptions);

		var arrFields = ['outlineDashArray', 'fillImageSize'];
		var numFields = ['outlineWidth', 'outlineOpacity', 'fillOpacity'];
		var colorField = ['outlineColor', 'fillColor'];

		var i, field;

		for (i = arrFields.length - 1; i >= 0; i--) {
			field = arrFields[i];
			if (!field) {
				continue;
			}

			options[field] = self._interArr(fromOptions[field], toOptions[field], factor);
		};

		for (i = numFields.length - 1; i >= 0; i--) {
			field = numFields[i];
			if (!field) {
				continue;
			}

			options[field] = self._interNum(fromOptions[field], toOptions[field], factor);
		};

		for (i = colorField.length - 1; i >= 0; i--) {
			field = colorField[i];
			if (!field) {
				continue;
			}

			options[field] = self._interColor(fromOptions[field], toOptions[field], factor);
		};

		self.updateGeom(geom);
		self.updateOptions(options);
	}


});
/* global G:false */
G.Graphic.AnimPolyline = G.Graphic.Polyline.extend({
	mixins: [G.Graphic.Anim],

	init: function(fromGraphic, toGraphic, options) {
		var self = this;

		var PolylineClass = G.Graphic.Polyline;
		if (!(fromGraphic instanceof PolylineClass && toGraphic instanceof PolylineClass)) {
			throw new Error('Type error');
		}

		self.options = G.Util.merge({}, self.options, fromGraphic.options, options);

		self._fromGraphic = fromGraphic;
		self._toGraphic = toGraphic;
	},

	_interpolate: function(factor) {
		var self = this;

		var fromGraphic = self._fromGraphic;
		var toGraphic = self._toGraphic;

		var fromGeom = fromGraphic.geom;
		var toGeom = toGraphic.geom;

		var geom = [];
		var fromPt, toPt;
		var i, iLen = Math.min(fromGeom.length, toGeom.length);
		for (i = 0; i < iLen; i++) {
			fromPt = fromGeom[i];
			toPt = toGeom[i];
			geom[i] = self._interArr(fromPt, toPt, factor);
		}

		var fromOptions = fromGraphic.options;
		var toOptions = toGraphic.options;

		var options = G.Util.merge({}, fromOptions);

		var arrFields = ['lineDashArray'];
		var numFields = ['lineWidth', 'lineOpacity'];
		var colorField = ['lineColor'];

		var i, field;

		for (i = arrFields.length - 1; i >= 0; i--) {
			field = arrFields[i];
			if (!field) {
				continue;
			}

			options[field] = self._interArr(fromOptions[field], toOptions[field], factor);
		};

		for (i = numFields.length - 1; i >= 0; i--) {
			field = numFields[i];
			if (!field) {
				continue;
			}

			options[field] = self._interNum(fromOptions[field], toOptions[field], factor);
		};

		for (i = colorField.length - 1; i >= 0; i--) {
			field = colorField[i];
			if (!field) {
				continue;
			}

			options[field] = self._interColor(fromOptions[field], toOptions[field], factor);
		};

		self.updateGeom(geom);
		self.updateOptions(options);
	}


});