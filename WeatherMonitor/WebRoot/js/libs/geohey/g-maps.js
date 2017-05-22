/* global G:false */
G.Layer.AMap = G.Layer.Tile.extend({

	init: function(type, vars) { // street | street2 | sate | satel | traffic
		var self = this;

		var vars = vars || {};

		var options = {
			cluster: ['01', '02', '03', '04'],
			minRes: 0.59716429,
			filter: vars.filter ? vars.filter : ''
		};

		var url;
		var type = type || 'street';

		if (type == 'street') {
			url = 'http://webrd{s}.is.autonavi.com/appmaptile?size=1&scale=1&style=' + (vars.style ? vars.style : '7') + '&x={x}&y={y}&z={z}';
		} else if (type == 'street2') {
			url = 'http://webst{s}.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}';
		} else if (type == 'sate') {
			url = 'http://webst{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}';
		} else if (type == 'satel') {
			url = 'http://webst{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}';
		} else if (type == 'traffic') {
			url = function(z, x, y) {
				return 'http://tm.mapabc.com/trafficengine/mapabc/traffictile?v=' + (vars.v ? vars.v : '1.0') + '&zoom=' + (17 - z) + '&x=' + x + '&y=' + y;
			};
		}

		if (type == 'satel' || type == 'traffic') {
			options.keepResample = false;
		}

		G.Layer.Tile.prototype.init.call(self, url, options);

	}



});
/* global G:false */
G.Layer.AliMap = G.Layer.Tile.extend({

	init: function() {

		G.Layer.Tile.prototype.init.call(this, 'http://img.ditu.aliyun.com/get_png?x={x}&y={y}&z={z}', {
			crossOrigin: ''
		});

	}


});
/* global G:false */
G.Layer.BaiduMap = G.Layer.Tile.extend({

	init: function(type, vars) { // street | sate | satel | traffic
		var self = this;


		var vars = vars || {};

		var options = {
			originX: -33554432,
			originY: 33554432,
			cluster: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
			zoomReses: [
				262144,
				131072,
				65536,
				32768,
				16384,
				8192,
				4096,
				2048,
				1024,
				512,
				256,
				128,
				64,
				32,
				16,
				8,
				4,
				2,
				1,
				0.5
			],
			minRes: 0.5,
			maxRes: 32768
		};

		var type = type || 'street';

		var baiduUrl = function(z, x, y, scale) {
			var half = Math.ceil(Math.pow(2, z - 1));

			var baiduZ = z;
			var baiduX = x - half;
			var baiduY = half - y - 1;

			if (type == 'street') {
				return 'http://online{s}.map.bdimg.com/tile/?qt=tile&x=' + baiduX + '&y=' + baiduY + '&z=' + baiduZ + '&scaler=' + scale + '&styles=pl';
			} else if (type == 'satel') {
				return 'http://online{s}.map.bdimg.com/tile/?qt=tile&x=' + baiduX + '&y=' + baiduY + '&z=' + baiduZ + '&styles=sl';
			} else if (type == 'sate') {
				return 'http://shangetu{s}.map.bdimg.com/it/u=x=' + (baiduX < 0 ? 'M' : '') + Math.abs(baiduX) + ';y=' + (baiduY < 0 ? 'M' : '') + Math.abs(baiduY) + ';z=' + baiduZ + ';v=' + (vars.v ? vars.v : '009') + ';type=' + type + '&fm=' + (vars.fm ? vars.fm : '46');
			} else if (type == 'traffic') {
				return 'http://its.map.baidu.com:8002/traffic/TrafficTileService?x=' + baiduX + '&y=' + baiduY + '&level=' + baiduZ + '&v=' + (vars.v ? vars.v : '033') + '&label=' + (vars.label ? vars.label : 'web2D') + '&time=' + (+new Date());
			}
		}

		if (type == 'satel' || type == 'traffic') {
			options.keepResample = false;
		}

		G.Layer.Tile.prototype.init.call(self, baiduUrl, options);

	}



});
/* global G:false */
G.Layer.BingMap = G.Layer.Tile.extend({

	init: function(type, vars) { // street | traffic
		var self = this;

		var vars = vars || {};

		var options = {
			crossOrigin: '',
			cluster: [0, 1, 2, 3],
			filter: vars.filter ? vars.filter : ''
		};

		var type = type || 'street';

		var url = function(z, x, y) {
			var key = '',
				i;
			for (i = z; i > 0; i--) {
				var digit = '0';
				var mask = 1 << (i - 1);
				if ((x & mask) != 0) {
					digit++;
				}
				if ((y & mask) != 0) {
					digit++;
					digit++;
				}
				key += digit;
			}

			if (type == 'street') {
				return 'http://t{s}.tiles.ditu.live.com/tiles/r' + key + '.png?g=' + (vars.g ? vars.g : '2785');
			} else if (type == 'traffic') {
				return 'http://t{s}.tiles.ditu.live.com/tiles/dp/content?p=tf&a=' + key + '&tc=' + (+new Date());
			}
		}

		if (type == 'traffic') {
			options.keepResample = false;
		}

		options.minRes = 0.59716429;

		G.Layer.Tile.prototype.init.call(self, url, options);
	}



});
/* global G:false */
G.Layer.CartoMap = G.Layer.Tile.extend({

	init: function(type) { // midnight | eco | flatblue

		var options = {
			cluster: ['a', 'b', 'c', 'd']
		}

		var type = type || 'midnight';

		var url = 'http://cartocdn_{s}.global.ssl.fastly.net/base-' + type + '/{z}/{x}/{y}.png';

		G.Layer.Tile.prototype.init.call(this, url, options);

	}


});
/* global G:false */
G.Layer.GoogleCnMap = G.Layer.Tile.extend({

	init: function(type, vars) { // street | terrian | sate | satel
		var self = this;

		var vars = vars || {};

		var options = {
			cluster: ['0', '1', '2', '3'],
			filter: vars.filter ? vars.filter : '',
		};

		var url;
		var type = type || 'street';

		var traffic = vars.traffic ? ',traffic' : '';
		var scale = G.Browser.retina ? 2 : 1;

		if (type == 'street') {
			url = 'http://mt{s}.google.cn/vt/lyrs=m' + traffic + '&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&scale=' + scale;
		} else if (type == 'terrian') {
			url = 'http://mt{s}.google.cn/vt/lyrs=t,r' + traffic + '&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&scale=' + scale;
		} else if (type == 'sate') {
			url = 'http://mt{s}.google.cn/vt/lyrs=s' + traffic + '&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&scale=' + scale;
		} else if (type == 'satel') {
			url = 'http://mt{s}.google.cn/vt/lyrs=s,h' + traffic + '&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&scale=' + scale;
		}

		G.Layer.Tile.prototype.init.call(self, url, options);

	}



});
/* global G:false */
G.Layer.NasaMap = G.Layer.Tile.extend({

	init: function(layer, time, srid, resolution, format) {

		var layer = layer || 'MODIS_Terra_CorrectedReflectance_TrueColor';
		var time = time || '2014-04-09';
		var resolution = resolution || '250m';
		var format = (format == 'jpeg') ? 'jpg' : (format || 'jpg');

		var level = 9;
		if (resolution == '250m') {
			level = 9;
		} else if (resolution == '500m') {
			level = 8;
		} else if (resolution == '1km') {
			level = 7;
		} else if (resolution == '2km') {
			level = 6;
		}

		var matrixSet, minRes;
		if (srid == 4326) {
			matrixSet = 'EPSG4326_' + resolution;
			minRes = 0.002197265625 * Math.pow(2, (9 - level));
		} else if (srid == 3857) {
			matrixSet = 'GoogleMapsCompatible_Level' + level;
			minRes = 305.7481131407048 * Math.pow(2, (9 - level));
		}

		var product;
		var options = {};
		if (srid == 4326) {
			product = 'wmts-geo';
			options = {
				srid: 4326,
				originX: -180,
				originY: 90,
				minX: -179.999,
				maxX: 179.999,
				minY: -89.999,
				maxY: 89.999,
				tileSize: 512,
				cluster: ['1', '2'],
				zoomReses: [
					0.5625,
					0.28125,
					0.140625,
					0.0703125,
					0.03525625,
					0.017628125,
					0.0087890624,
					0.00439453125,
					0.002197265625
				],
				minRes: minRes,
				maxRes: 0.5625
			};
		} else if (srid == 3857) {
			product = 'wmts-webmerc';
			options = {
				srid: 3857,
				cluster: ['1', '2'],
				minRes: minRes,
				maxRes: 156543.03390625
			};
		}


		var url = 'http://map{s}.vis.earthdata.nasa.gov/' + product + '/' + layer + '/default/' + time + '/' + matrixSet + '/{z}/{y}/{x}.' + format;

		G.Layer.Tile.prototype.init.call(this, url, options);

	}


});
/* global G:false */
G.Layer.OpenStreetMap = G.Layer.Tile.extend({

	init: function(option) {

		var option = option || {};

		G.Layer.Tile.prototype.init.call(this, 'http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			cluster: ['a', 'b', 'c'],
			filter: option.filter ? option.filter : ''
		});

	}


});
/* global G:false */
G.Layer.QQMap = G.Layer.Tile.extend({

	init: function(type, option) { // street | sate | satel
		var self = this;

		var option = option || {};

		var options = {
			cluster: ['0', '1', '2', '3'],
			maxRes: 78271.516964,
			minRes: 0.59716429,
			filter: option.filter ? option.filter : ''
		};

		var type = type || 'street';

		var url = function(z, x, y) {
			var qqZ = z;
			var qqX = x;
			var qqY = Math.pow(2, z) - y - 1;
			var qqX16 = Math.floor(qqX / 16);
			var qqY16 = Math.floor(qqY / 16);

			if (type == 'street') { // tile size is 128
				qqY = Math.pow(2, z + 1) - y - 1;
				qqY16 = Math.floor(qqY / 16);
				return 'http://p{s}.map.gtimg.com/hwaptiles/' + qqZ + '/' + qqX16 + '/' + qqY16 + '/' + qqX + '_' + qqY + '.png';
			} else if (type == 'sate') {
				return 'http://p{s}.map.gtimg.com/sateTiles/' + qqZ + '/' + qqX16 + '/' + qqY16 + '/' + qqX + '_' + qqY + '.jpg';
			} else if (type == 'satel') {
				return 'http://p{s}.map.gtimg.com/sateTranTilesv3/' + qqZ + '/' + qqX16 + '/' + qqY16 + '/' + qqX + '_' + qqY + '.png';
			}
		}

		if (type == 'street') {
			options.tileSize = 128;
		}

		if (type == 'satel') {
			options.keepResample = false;
		}

		G.Layer.Tile.prototype.init.call(self, url, options);

	}



});
/* global G:false */
G.Layer.TiandituMap = G.Layer.Tile.extend({

	init: function(type, vars) { // street | streetl | sate | satel | terrain | terrainl
		var self = this;

		var vars = vars || {};

		var options = {
			srid: 4326,
			originX: -180,
			originY: 90,
			minX: -180,
			maxX: 180,
			minY: -90,
			maxY: 90,
			cluster: ['0', '1', '2', '3', '4', '5', '6', '7'],
			zoomReses: [
				1.40625,
				0.703125,
				0.3515625,
				0.17578125,
				0.087890625,
				0.0439453125,
				0.02197265625,
				0.010986328125,
				0.0054931640625,
				0.00274658203125,
				0.001373291015625,
				0.0006866455078125,
				0.00034332275390625,
				0.000171661376953125,
				0.0000858306884765629,
				0.0000429153442382814,
				0.0000214576721191407,
				0.0000107288360595703,
				0.00000536441802978515
			],
			minRes: 0.00000536441802978515,
			maxRes: 0.3515625
		};

		var url;
		var type = type || 'street';

		if (type == 'street') {
			url = 'http://t{s}.tianditu.com/DataServer?T=vec_c&x={x}&y={y}&l={z}';
		} else if (type == 'streetl') {
			url = 'http://t{s}.tianditu.com/DataServer?T=cva_c&x={x}&y={y}&l={z}';
		} else if (type == 'sate') {
			url = 'http://t{s}.tianditu.cn/img_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=c&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&format=tiles';
		} else if (type == 'satel') {
			url = 'http://t{s}.tianditu.cn/cia_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=c&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&format=tiles';
		} else if (type == 'terrain') {
			url = 'http://t{s}.tianditu.cn/ter_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=ter&tileMatrixSet=c&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&format=tiles';
		} else if (type == 'terrainl') {
			url = 'http://t{s}.tianditu.cn/cta_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cta&tileMatrixSet=c&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&format=tiles';
		}

		if (type == 'streetl' || type == 'satel' || type == 'terrainl') {
			options.keepResample = false;
		}

		if (type == 'terrain' || type == 'terrainl') {
			options.minRes = 0.0000858306884765629;
		}

		G.Layer.Tile.prototype.init.call(self, url, options);

	}



});
/*
 * Baidu CRS
 */
/* global G:false */
G.Proj.Baidu = {
	baiduFactor: Math.PI * 3000.0 / 180.0,

	// ll 百度经纬度坐标
	llBand: [75, 60, 45, 30, 15, 0],
	// mc 百度米制经纬度坐标
	mcBand: [1.289059486e7, 8362377.87, 5591021, 3481989.83, 1678043.12, 0],
	mc2ll: [
		[1.410526172116255e-8, 8.98305509648872e-6, -1.9939833816331, 200.9824383106796, -187.2403703815547, 91.6087516669843, -23.38765649603339, 2.57121317296198, -0.03801003308653, 1.73379812E7],
		[-7.435856389565537e-9, 8.983055097726239e-6, -0.78625201886289, 96.32687599759846, -1.85204757529826, -59.36935905485877, 47.40033549296737, -16.50741931063887, 2.28786674699375, 1.026014486E7],
		[-3.030883460898826e-8, 8.98305509983578e-6, 0.30071316287616, 59.74293618442277, 7.357984074871, -25.38371002664745, 13.45380521110908, -3.29883767235584, 0.32710905363475, 6856817.37],
		[-1.981981304930552e-8, 8.983055099779535e-6, 0.03278182852591, 40.31678527705744, 0.65659298677277, -4.44255534477492, 0.85341911805263, 0.12923347998204, -0.04625736007561, 4482777.06],
		[3.09191371068437e-9, 8.983055096812155e-6, 6.995724062e-5, 23.10934304144901, -2.3663490511e-4, -0.6321817810242, -0.00663494467273, 0.03430082397953, -0.00466043876332, 2555164.4],
		[2.890871144776878e-9, 8.983055095805407e-6, -3.068298e-8, 7.47137025468032, -3.53937994e-6, -0.02145144861037, -1.234426596e-5, 1.0322952773e-4, -3.23890364e-6, 826088.5]
	],
	ll2mc: [
		[-0.0015702102444, 111320.7020616939, 1704480524535203, -10338987376042340, 26112667856603880, -35149669176653700, 26595700718403920, -10725012454188240, 1800819912950474, 82.5],
		[8.277824516172526e-4, 111320.7020463578, 6.477955746671607E8, -4.082003173641316E9, 1.077490566351142E10, -1.517187553151559E10, 1.205306533862167E10, -5.124939663577472E9, 9.133119359512032E8, 67.5],
		[0.00337398766765, 111320.7020202162, 4481351.045890365, -2.339375119931662E7, 7.968221547186455E7, -1.159649932797253E8, 9.723671115602145E7, -4.366194633752821E7, 8477230.501135234, 52.5],
		[0.00220636496208, 111320.7020209128, 51751.86112841131, 3796837.749470245, 992013.7397791013, -1221952.21711287, 1340652.697009075, -620943.6990984312, 144416.9293806241, 37.5],
		[-3.441963504368392e-4, 111320.7020576856, 278.2353980772752, 2485758.690035394, 6070.750963243378, 54821.18345352118, 9540.606633304236, -2710.55326746645, 1405.483844121726, 22.5],
		[-3.218135878613132e-4, 111320.7020701615, 0.00369383431289, 823725.6402795718, 0.46104986909093, 2351.343141331292, 1.58060784298199, 8.77738589078284, 0.37238884252424, 7.45]
	],

	project: function(lon, lat) {
		var gcj = G.Proj.Gcj.project(lon, lat);

		var x = gcj[0];
		var y = gcj[1];

		var baiduFactor = G.Proj.Baidu.baiduFactor; // 不可用this，因调用的context不定
		var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * baiduFactor);
		var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * baiduFactor);
		var newX = z * Math.cos(theta) + 0.0065;
		var newY = z * Math.sin(theta) + 0.006;

		return [newX, newY];
	},

	unproject: function(bx, by) {
		var baiduFactor = G.Proj.Baidu.baiduFactor; // 不可用this，因调用的context不定
		var x = bx - 0.0065;
		var y = by - 0.006;
		var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * baiduFactor);
		var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * baiduFactor);
		var newX = z * Math.cos(theta);
		var newY = z * Math.sin(theta);

		return G.Proj.Gcj.unproject(newX, newY);
	},

	projectM: function(lon, lat) {
		var self = G.Proj.Baidu; // 不可用this，因调用的context不定

		var ll = self.project(lon, lat);

		var cl;
		var i, iLen;
		for (i = 0, iLen = self.llBand.length; i < iLen; i++) {
			if (ll[1] >= self.llBand[i]) {
				cl = self.ll2mc[i];
				break;
			}
		}

		if (!cl) {
			for (i = llBand.length - 1; i >= 0; i--) {
				if (ll[1] <= -self.llBand[i]) {
					cl = self.ll2mc[i];
					break;
				}
			}
		}

		var cm = self._convert(ll[0], ll[1], cl);

		return cm;
	},

	unprojectM: function(bx, by) {
		var self = G.Proj.Baidu; // 不可用this，因调用的context不定

		var abs = Math.abs;
		var absX = abs(bx);
		var absY = abs(by);

		var cm;
		var i, iLen;
		for (i = 0, iLen = self.mcBand.length; i < iLen; i++) {
			if (absY >= self.mcBand[i]) {
				cm = self.mc2ll[i];
				break;
			}
		}

		var t = self._convert(absX, absY, cm);

		var ll = self.unproject(t[0], t[1]);

		return ll;
	},

	_convert: function(lon, lat, cl) {
		var abs = Math.abs;
		var t = cl[0] + cl[1] * abs(lon);
		var cj = abs(lat) / cl[9];
		var cm = cl[2] + cl[3] * cj + cl[4] * cj * cj + cl[5] * cj * cj * cj + cl[6] * cj * cj * cj * cj + cl[7] * cj * cj * cj * cj * cj + cl[8] * cj * cj * cj * cj * cj * cj;
		t *= (lon < 0 ? -1 : 1);
		cm *= (lat < 0 ? -1 : 1);
		return [t, cm];
	}
};