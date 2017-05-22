/* global G:false */
G.ArcGISUtil = {

	toGraphics: function(feature, geometryType) {
		var geom;
		var attr = feature.attributes;

		var gs = [],
			i;
		if (geometryType == 'esriGeometryPoint') {
			var obj = feature.geometry;
			if (G.Util.isArray(obj)) {
				geom = obj;
			} else {
				geom = [obj.x, obj.y];
			}
			gs.push(new G.Graphic.Point(geom, attr));
		} else if (geometryType == 'esriGeometryPolyline') {
			var paths = feature.geometry.paths;
			for (i in paths) {
				geom = paths[i];
				gs.push(new G.Graphic.Polyline(geom, attr));
			}
		} else if (geometryType == 'esriGeometryPolygon') {
			var rings = feature.geometry.rings,
				ring;
			geom = [];
			for (i in rings) {
				ring = rings[i];
				ring.splice(ring.length - 1);
				geom.push(ring);
			}
			gs.push(new G.Graphic.Polygon(geom, attr));
		}

		return gs;
	}

};
/* global G:false */
G.Layer.ArcGISFeature = G.Layer.FeatureService.extend({

	options: {
		mode: 'tile',
		maxHandle: 1000, // 每次请求内最多处理的对象个数
		fields: '*',
		where: '1=1'
	},

	init: function(url, options) {
		var self = this;

		var func = function(extent) {
			var _url = url + '/query';

			var data = {
				f: 'json',
				where: self.options.where,
				outFields: self.options.fields,
				inSR: self._map ? self._map.options.srid : '',
				outSR: self._map ? self._map.options.srid : ''
			};

			if (self.options.mode == 'tile') {
				data.geometryType = 'esriGeometryEnvelope';
				data.geometry = extent[0] + ',' + extent[1] + ',' + extent[2] + ',' + extent[3];
			}

			var reqOptions = {
				responseType: (_url.slice(0, 4).toLowerCase() === 'http') ? 'JSONP' : 'JSON',
				data: data,
				success: function(xhr, data) {
					var geometryType = data.geometryType;
					var objectIdFieldName = data.objectIdFieldName;
					var features = data.features;
					if (!features) {
						return;
					}

					var i, maxI = features.length - 1,
						minI = Math.max(0, maxI - self.options.maxHandle),
						feature, attr, id, gs, j, g;
					for (i = maxI; i >= minI; i--) {
						feature = features[i];
						attr = feature.attributes || {};
						gs = G.ArcGISUtil.toGraphics(feature, geometryType);

						for (j in gs) {
							g = gs[j];
							if (!g) {
								continue;
							}

							id = attr[objectIdFieldName] + '_' + j;
							if (self.get(id)) {
								continue;
							} else {
								g.addTo(self, id);
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