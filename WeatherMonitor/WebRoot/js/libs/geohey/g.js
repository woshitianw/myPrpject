/**
 * @namespace G
 */
var G = {};

G.name = 'JS SDK';
G.version = '2.5.1';
G.owner = 'GeoHey.com';

window.G = G;

// 控制台打印版权信息
var cons = window.console;
if (cons && cons.log) {
	cons.log("%c", "font-size:30px; padding:15px 120px;line-height:60px;background:url('http://static.geohey.com/img/logo-all.png') no-repeat;");
	cons.log(G.name, G.version, '©', G.owner);
}


// 异步的模块加载机制
(function() {
	// 获取JS所在目录
	var scripts = document.getElementsByTagName('script');
	var core = scripts[scripts.length - 1];
	var url = core.src;
	var slash = url.lastIndexOf('/');
	G.debug = url.toLowerCase().lastIndexOf('.min.js') > 0 ? false : true;
	G.dir = (slash < 0) ? '' : url.substring(0, slash + 1);

	var head = document.getElementsByTagName('head')[0];
	var loadingUrls = {},
		loadedUrls = {};

	function loadScript(url, onLoad, onError) {
		if (url in loadedUrls) {
			if (onLoad) {
				onLoad();
			}
			return;
		}

		var queue = loadingUrls[url] || (loadingUrls[url] = []);
		if (onLoad) {
			queue.push(onLoad);
		}

		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;

		var loadCallback = function() {
			if (!script.readyState /*FF*/ ||
				script.readyState == 'loaded' || script.readyState == 'complete') {

				if (!script.success) {
					script.success = true;

					loadedUrls[url] = true;

					var queue = loadingUrls[url];
					if (queue) {
						for (var i = queue.length - 1; i >= 0; --i) {
							queue[i]();
						}
						delete loadingUrls[url];
					}
				}
			}
		};

		if ('onload' in script) {
			script.onload = loadCallback;
		} else {
			script.onreadystatechange = loadCallback;
		}

		script.onerror = function(e) {
			if (onError) {
				onError(e);
			}
		};

		head.appendChild(script);
		return script;
	}

	G.loadModule = function(name, onLoad, onError) {
		var url = G.dir + 'g-' + name + (G.debug ? '' : '.min') + '.js';
		loadScript(url, onLoad, onError);
	};

	G.loadModules = function(names, onLoad, onError) {
		var loadedCount = 0;
		var hasError = false;

		var i, name;
		for (i in names) {
			name = names[i];
			G.loadModule(name, function() {
				loadedCount++;
				if (!hasError) {
					// Check if all loaded
					if (loadedCount === names.length) {
						if (onLoad) {
							onLoad();
						}
					}
				}
			}, function() {
				hasError = true;
				if (onError) {
					onError();
				}
			});
		}
	};

})();
/* global G:false */
/* global ActiveXObject:false */
G.Util = {

	isObject: function(obj) {
		return (Object.prototype.toString.call(obj) === '[object Object]');
	},

	isArray: function(obj) {
		return (Object.prototype.toString.call(obj) === '[object Array]');
	},

	isString: function(obj) {
		return (Object.prototype.toString.call(obj) === '[object String]');
	},

	isFunction: function(obj) {
		return (Object.prototype.toString.call(obj) === '[object Function]');
	},

	merge: function(objs) { // (Object[, Object, ...])
		var sources = Array.prototype.slice.call(arguments, 1);

		var i, j, len, src;
		for (j = 0, len = sources.length; j < len; j++) {
			src = sources[j] || {};
			for (i in src) {
				if (src.hasOwnProperty(i)) {
					objs[i] = src[i];
				}
			}
		}

		return objs;
	},

	bind: function(fn, context) {
		var args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : null;
		return function() {
			return fn.apply(context, args || arguments);
		};
	},

	_stampId: 0,

	stamp: function(obj) {
		var key = '_g_id_';
		obj[key] = obj[key] || this._stampId++;
		return obj[key];
	},

	trim: function(str) {
		return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
	},

	renderString: function(template, data) { // template variable must be {A~Z|a~z|0~9|_}, not case-sensitive.
		if (!template) {
			return '';
		}

		return template.replace(/\{ *([\w]+) *\}/gi, function(template, key) {
			var value = data[key];
			return (value === undefined) ? '' : value;
		});
	},

	_requestAnimFrameFunc: (function() {
		var prefixs = ['webkit', 'moz', 'o', 'ms'];
		var func = window.requestAnimationFrame;
		for (var i = 0, len = prefixs.length; i < len && !func; i++) {
			func = window[prefixs[i] + 'RequestAnimationFrame'];
		}

		return func;
	})(),

	requestAnimFrame: function(fn, immediate, context, element) {
		var f = this.bind(fn, context);
		var request = this._requestAnimFrameFunc;
		if (request) {
			return request.call(window, f, element);
		} else {
			if (immediate) {
				f();
			} else {
				return window.setTimeout(f, 16);
			}
		}
	},

	_cancelAnimFrameFunc: (function() {
		var prefixs = ['webkit', 'moz', 'o', 'ms'];
		var func = window.cancelAnimationFrame;
		for (var i = 0, len = prefixs.length; i < len && !func; i++) {
			func = window[prefixs[i] + 'CancelAnimationFrame'] || window[prefixs[i] + 'CancelRequestAnimationFrame'];
		}

		return func;
	})(),

	cancelAnimFrame: function(id) {
		var cancel = this._cancelAnimFrameFunc;
		if (cancel) {
			cancel.call(window, id);
		} else {
			window.clearTimeout(id);
		}
	},

	setCanvasLineDash: function(ctx, lineDashArray) {
		if (!ctx || !lineDashArray) {
			return;
		}

		if (lineDashArray.length > 0) {
			if (ctx.setLineDash) {
				ctx.setLineDash(lineDashArray);
			} else if (ctx.webkitLineDash !== undefined) { // For Safari
				ctx.webkitLineDash = lineDashArray;
			} else if (ctx.mozDash !== undefined) { // For Firefox
				ctx.mozDash = lineDashArray;
			}
		}
	},

	ajax: function(url, options) {
		if (!url) {
			return;
		}

		var ajaxOptions = options || {};

		var context = ajaxOptions.context || this;

		var appendQueryParam = function(url, key, value) {
			if (key === undefined || value === undefined) {
				return url;
			}

			url += (url.match(/\?/) ? '&' : '?');
			url += (key + '=' + value);
			return url;
		};

		var trySuccess = function(req, data) {
			if (success) {
				success.call(context, req, data);
			}
		};
		var tryError = function(req) {
			if (error) {
				error.call(context, req);
			}
		};
		var tryComplete = function(req) {
			if (complete) {
				complete.call(context, req);
			}
		};

		// HTTP request parameters
		var type = (ajaxOptions.type || 'GET').toUpperCase() === 'POST' ? 'POST' : 'GET',
			contentType = ajaxOptions.contentType,
			headers = ajaxOptions.headers || {},
			data = ajaxOptions.data || {},
			responseType = (ajaxOptions.responseType || 'DATA').toUpperCase(), // DATA|TEXT|XML|JSON|JSONP
			jsonp = ajaxOptions.jsonp || '_g_jsonp_' + (this._ajaxSeq++),
			jsonpCallback = ajaxOptions.jsonpCallback || 'callback',
			success = ajaxOptions.success,
			error = ajaxOptions.error,
			complete = ajaxOptions.complete;

		var loadCallback, key, script;

		type = (responseType === 'JSONP') ? 'GET' : type; // JSONP only support GET method

		if (type === 'GET') {
			for (key in data) {
				url = appendQueryParam(url, key, data[key]);
			}

			data = null;
		} else {
			var postData = '';
			for (key in data) {
				postData = appendQueryParam(postData, key, data[key]);
			}
			if (postData[0] === '?') {
				postData = postData.slice(1);
			}

			data = postData;

			contentType = contentType || 'application/x-www-form-urlencoded; charset=UTF-8';
		}

		if (responseType === 'JSONP') {
			url = appendQueryParam(url, jsonpCallback, jsonp);

			script = document.createElement('script');　
			script.src = url;
			script._g_jsonp_ = jsonp;

			window[jsonp] = function(json) {
				script._g_jsonp_value_ = json;
				window[jsonp] = null;

				if (script.parentNode) {
					script.parentNode.removeChild(script);
				}
			};

			loadCallback = function() {
				if (script._g_abort_) {
					return;
				}

				if (!script.readyState /*FF*/ ||
					script.readyState == 'loaded' || script.readyState == 'complete') {

					if (!script.success) {
						script.success = true;

						trySuccess(script, script._g_jsonp_value_);
						tryComplete(script);
					}
				}
			};

			if ('onload' in script) {
				script.onload = loadCallback;
			} else {
				script.onreadystatechange = loadCallback;
			}

			script.onerror = function() {
				tryError(script);
				tryComplete(script);
			};

			var head = document.getElementsByTagName('head')[0];
			head.appendChild(script);
			return script;
		} else {
			var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');

			if (!xhr) {
				return;
			}

			loadCallback = function() {
				if (xhr.readyState == 4) {
					if (xhr.status == 200 || xhr.status == 304) {
						var responseData;
						if (responseType === 'TEXT') {
							responseData = xhr.responseText;
						} else if (responseType === 'XML') {
							responseData = xhr.responseXML;
						} else if (responseType === 'JSON') {
							/*jslint evil: true */
							responseData = eval('(' + xhr.responseText + ')');
						} else {
							responseData = xhr.response;
						}

						trySuccess(xhr, responseData);
					} else {
						tryError(xhr);
					}

					tryComplete(xhr);
				}
			};

			xhr.onload = loadCallback;

			xhr.onerror = function() {
				tryError(xhr);
				tryComplete(xhr);
			};

			xhr.open(type, url, true);

			if (contentType) {
				xhr.setRequestHeader('Content-Type', contentType);
			}

			for (key in headers) {
				xhr.setRequestHeader(key, headers[key]);
			}

			xhr.send(data);

			return xhr;
		}
	},

	ajaxCancel: function(req) { // XMLHttpRequest|Script
		if (!req) {
			return;
		}

		req.onload = req.onerror = null;

		if (req.abort) { // XMLHttpRequest
			req.abort();
		} else { // JSONP
			req._g_abort_ = true; // Mark abort, so in the load handler, success event will not be invoked.
			if (req.parentNode) {
				req.parentNode.removeChild(req);
			}
		}
	},

	colorHex: function(r, g, b) {
		function hex(x) {
			return ('0' + parseInt(x).toString(16)).slice(-2);
		}
		return '#' + hex(r) + hex(g) + hex(b);
	},

	colorRgb: function(hex) {
		function num(h, start, end) {
			var n = parseInt(h.substring(start, end), 16);
			if (end - start === 2) {
				return n;
			} else {
				return (256 - (16 - n) * (16 - n));
			}
		}

		if (hex.length < 5) {
			return [num(hex, 1, 2), num(hex, 2, 3), num(hex, 3, 4)];
		} else {
			return [num(hex, 1, 3), num(hex, 3, 5), num(hex, 5, 7)];
		}
	},

	_ajaxSeq: 0

};
/* global G:false */
G.MathUtil = {
	DEGREE_PER_RADIAN: 57.29577951308232,

	calcHypotenuse: function(x, y) {
		return Math.pow((x * x + y * y), 0.5);
	},

	calcTheta: function(x, y) { // return -PI ~ PI
		if (!x && !y) {
			return 0;
		}

		var r = this.calcHypotenuse(x, y);
		return Math.acos(x / r) * (y > 0 ? 1 : -1);
	},

	rotateVector: function(v, degree) {
		var x = v[0],
			y = v[1],
			r = this.calcHypotenuse(x, y),
			theta = this.calcTheta(x, y) + degree / this.DEGREE_PER_RADIAN;

		return [r * Math.cos(theta), r * Math.sin(theta)];
	},

	scaleVector: function(v, factor) {
		return this.scaleArray(v, factor);
	},

	scaleArray: function(array, factor) {
		if (!array) {
			return;
		}

		var result = [];
		var i;
		for (i in array) {
			result[i] = array[i] * factor;
		}

		return result;
	},

	limitRange: function(value, min, max) {
		return Math.min(Math.max(value, min || value), max || value);
	},

	calcDistance: function(a, b) {
		return Math.pow(((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1])), 0.5);
	}

};
/* global G:false */
G.Class = function() {};

/**
 * Base class.
 */
G.Class.extend = function(attrs) { //attrs has several predefined keywords : init[Function]/mixins[Array]/statics[Object]/options[Object]
	var NewClass = function() {
		var scope = this;
		if (scope.init) { // init() is constructor.
			scope.init.apply(scope, arguments);
		}
	};

	var mergeUtil = G.Util.merge;
	var Parent = function() {};
	Parent.prototype = this.prototype;
	var proto = new Parent();
	proto.constructor = NewClass;
	NewClass.prototype = proto;

	var i, len;

	for (i in this) {
		if (this.hasOwnProperty(i) && i !== 'prototype') {
			NewClass[i] = this[i];
		}
	}

	var options = {},
		mixin;
	if (attrs.mixins) { // methods in mixins will be merged to the new class's propotype.
		for (i = 0, len = attrs.mixins.length; i < len; i++) {
			mixin = attrs.mixins[i];
			mergeUtil(proto, mixin);

			if (mixin.options) { // options
				mergeUtil(options, mixin.options);
			}
		}
		delete attrs.mixins;
	}

	if (attrs.statics) { // statics will be merged to the new class directly.
		mergeUtil(NewClass, attrs.statics);
		delete attrs.statics;
	}

	var parentOptions = this.prototype.options;
	if (parentOptions) { // merge parent's options
		mergeUtil(options, parentOptions);
	}
	mergeUtil(options, attrs.options);
	attrs.options = options;

	// All other methods will be merged to the new class's propotype.
	mergeUtil(proto, attrs);

	NewClass.__super__ = this.prototype;

	return NewClass;
};
/* global G:false */
G.Browser = {
	getDpi: function() {
		var self = this;
		var defaultDpi = 96;
		var div;

		if (!self._dpi) {
			if (!document.body) {
				return [defaultDpi, defaultDpi]; // 正确量测DPI需要加载body后
			} else {
				div = document.createElement('div');
				div.style.cssText = 'width:1in;height:1in;position:absolute;visibility:hidden';
				document.body.appendChild(div);
				self._dpi = [parseInt(div.offsetWidth) || defaultDpi, parseInt(div.offsetHeight) || defaultDpi];
				div.parentNode.removeChild(div);
			}
		}

		return self._dpi;
	},

	getPxRatio: function() {
		var self = this;

		if (!self._pxRatio) {
			self._pxRatio = [1, 1];
			if (screen.deviceXDPI && screen.logicalXDPI) {
				// IE
				self._pxRatio = [
					screen.deviceXDPI / screen.logicalXDPI,
					screen.deviceYDPI / screen.logicalYDPI
				];
			}
		}

		return self._pxRatio;
	},

	getCanvasRatio: function() {
		var self = this;

		if (!self._canvasRatio) {
			var canvas = G.DomUtil.create('canvas', '');
			var ctx = canvas.getContext('2d');
			var devicePixelRatio = (window.devicePixelRatio && (window.devicePixelRatio >=1)) ? window.devicePixelRatio : 1;
			var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
				ctx.mozBackingStorePixelRatio ||
				ctx.msBackingStorePixelRatio ||
				ctx.oBackingStorePixelRatio ||
				ctx.backingStorePixelRatio || 1;
			var ratio = devicePixelRatio / backingStoreRatio;

			// 限制ratio与屏幕最大尺寸乘积不会太大，否则后台Canvas尺寸太大
			var screenMetric = Math.max(screen.width, screen.height);
			if (ratio > 2 && screenMetric * ratio > 1500) {
				ratio = 2;
			}

			self._canvasRatio = [ratio, ratio];
		}

		return self._canvasRatio;
	},

	getImageSrc: function(imageUrlPattern) {
		return G.Util.renderString(imageUrlPattern, this.retina ? {
			'i': '@2x'
		} : {
			'i': ''
		});
	}

};

(function() {
	var win = window,
		doc = document,
		nav = win.navigator,
		ua = nav.userAgent.toLowerCase(),
		de = doc.documentElement;

	// Mobile Devices
	var mobile = typeof win.orientation !== 'undefined',
		iphone = ua.search('iphone') > -1,
		android = ua.search('android') > -1,
		androidlt3 = ua.search('android [23]') > -1;

	// Browser types
	var ie = 'ActiveXObject' in window,
		ielt9 = ie && !doc.addEventListener,
		webkit = ua.search('webkit') > -1,
		chrome = ua.search('chrome') > -1,
		safari = ua.search('safari/') > -1 && !chrome,
		gecko = ua.search('gecko/') > -1 && !webkit && !ie,
		webkit534 = ua.search('webkit/534') > -1, // Android内置Webkit某些版本clearRect有问题，http://jimbergman.net/webkit-version-in-android-version/
		webkit533 = ua.search('webkit/533') > -1,
		mqq = ua.search('mqqbrowser/') > -1,
		mqqwebkit = mqq && ua.search('tbs/02') > -1 // 未使用Blink引擎的QQ浏览器内核（其实也对应了若干Webkit版本）;

	// Render modes
	var svg = !!doc.createElementNS && !!doc.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect,
		vml = ielt9,
		canvas = !!doc.createElement('canvas').getContext,
		webgl = (function() {
			var context;

			var element = doc.createElement('canvas');
			if (element && element.getContext) {
				var contextNames = ['webgl', 'experimental-webgl'];
				for (var i = 0, len = contextNames.length; i < len && !context; i++) {
					context = element.getContext(contextNames[i]);
				}
			}

			return !!context;
		})();

	// Canvas 
	var avoidCanvas = androidlt3 //
		|| (android && ua.search('chrome/30.0.0.0') > -1) //
	; // 避免使用没有硬件加速的Canvas

	// 3d
	var ie3d = ie && ('transition' in de.style),
		webkit3d = ('WebKitCSSMatrix' in win) && ('m11' in new win.WebKitCSSMatrix()) && !androidlt3,
		gecko3d = 'MozPerspective' in de.style,
		opera3d = 'OTransition' in de.style,
		support3d = ie3d || webkit3d || gecko3d || opera3d,
		avoid3d = !!win.G_OFF_CSS3D;

	// Touch support
	var msPointer = nav.msPointerEnabled && nav.msMaxTouchPoints && !win.PointerEvent;
	var pointer = (win.PointerEvent && nav.pointerEnabled && nav.maxTouchPoints) || msPointer;
	var touch = pointer || 'ontouchstart' in win || (win.DocumentTouch && document instanceof win.DocumentTouch);

	// Retina support	
	var devicePixelRatio = win.devicePixelRatio;
	/*jshint multistr: true */
	var retina = (devicePixelRatio >= 1.5) ||
		(win.matchMedia && win.matchMedia('(-webkit-min-device-pixel-ratio: 1.5),\
                      (-moz-min-device-pixel-ratio: 1.5),\
                      (min-device-pixel-ratio: 1.5),\
                      (min-resolution: 1.5dppx)').matches);

	G.Util.merge(G.Browser, {
		mobile: mobile,
		iphone: iphone,
		android: android,
		androidlt3: androidlt3,

		ie: ie,
		ielt9: ielt9,
		webkit: webkit,
		safari: safari,
		chrome: chrome,
		gecko: gecko,
		webkit533: webkit533,
		webkit534: webkit534,
		mqqwebkit: mqqwebkit,

		svg: svg,
		vml: vml,
		canvas: canvas,
		webgl: webgl,

		avoidCanvas: avoidCanvas,

		ie3d: ie3d,
		webkit3d: webkit3d,
		gecko3d: gecko3d,
		opera3d: opera3d,
		support3d: support3d,
		avoid3d: avoid3d,

		touch: touch,

		retina: retina
	});

}());

// IE lt 9
if (!Array.indexOf) {
	Array.prototype.indexOf = function(obj) {
		for (var i = 0, iLen = this.length; i < iLen; i++) {
			if (this[i] == obj) {
				return i;
			}
		}
		return -1;
	}
}
/* global G:false */
G.RTree = G.Class.extend({

	init: function(fan) {
		var self = this;

		// tolerance
		self._tolerance = 1e-6;

		// Maximum leafs of a node before a split
		self._fan = fan || 8;

		// Minimum leafs of a node before a merge, it is the half of fan
		self._fanHalf = Math.floor(self._fan / 2);

		// The whole tree
		self._t = {
			mbr: [],
			nodes: []
		};
	},

	insert: function(extent, obj) {
		var self = this;

		if (!extent || !obj) {
			return;
		}

		var mbr = self._getMbrByExtent(extent);
		var node = {
			mbr: mbr,
			obj: obj
		};

		return self._insertTo(node, self._t);
	},

	remove: function(extent, obj) {
		var self = this;

		if (!extent || !obj) {
			return;
		}

		var mbr = self._getMbrByExtent(extent);
		return self._removeFrom(mbr, obj, self._t);
	},

	clear: function() {
		var self = this;

		self._t.mbr = [];
		self._t.nodes = [];
	},

	search: function(extent) {
		var self = this;

		var mbr = self._getMbrByExtent(extent);
		return self._searchSubtree(mbr, false, self._t);
	},

	count: function() {
		var self = this;

		return self._countNode(self._t);
	},

	all: function() {
		var self = this;

		return self._allInNode(self._t);
	},

	_getMbrByExtent: function(extent) {
		var xmin = extent[0],
			ymin = extent[1],
			xmax = extent[2],
			ymax = extent[3];

		var mbr = [xmin, ymin, xmax - xmin, ymax - ymin];

		return mbr;
	},

	_countNode: function(node) {
		var count = 0;

		if ("nodes" in node) {
			for (var i = node.nodes.length - 1; i >= 0; i--) {
				count += this._countNode(node.nodes[i]);
			}
		} else if ("obj" in node) {
			count++;
		}

		return count;
	},

	_allInNode: function(node) {
		var list = [];

		if ("nodes" in node) {
			for (var i = node.nodes.length - 1; i >= 0; i--) {
				list = list.concat(this._allInNode(node.nodes[i]));
			}
		} else if ("obj" in node) {
			list.push(node.obj);
		}

		return list;
	},

	_insertTo: function(node, root) {
		var self = this;

		if (root.nodes.length === 0) {
			root.nodes.push(node);
			root.mbr = self._resizeMbrWithNodes(root.mbr, root.nodes);
			return;
		}

		// Find the best fitting leaf node
		// tree_stack is an array contains all tree levels,
		// including root.
		var tree_stack = self._chooseSubtree(node, root);
		var ret_obj = node; // {mbr:mbr, obj:obj};
		var bc;

		do {
			if (bc && "nodes" in bc && bc.nodes.length === 0) {
				var pbc = bc; // Past bc
				bc = tree_stack.pop();
				for (var t = 0, tLen = bc.nodes.length; t < tLen; t++) {
					if (bc.nodes[t] === pbc || bc.nodes[t].nodes.length === 0) {
						bc.nodes.splice(t, 1);
						break;
					}
				}
			} else {
				bc = tree_stack.pop();
			}

			if (ret_obj && ("obj" in ret_obj || "nodes" in ret_obj || G.Util.isArray(ret_obj))) {
				if (G.Util.isArray(ret_obj)) {
					for (var ai = 0, aiLen = ret_obj.length; ai < aiLen; ai++) {
						self._expandMbr(bc.mbr, ret_obj[ai].mbr);
					}
					bc.nodes = bc.nodes.concat(ret_obj);
				} else {
					self._expandMbr(bc.mbr, ret_obj.mbr);
					bc.nodes.push(ret_obj);
				}

				if (bc.nodes.length <= self._fan) {
					ret_obj = null;
				} else {
					ret_obj = self._split(bc.nodes);

					if (tree_stack.length < 1) {
						bc.nodes.push(ret_obj[0]);
						tree_stack.push(bc);
						ret_obj = ret_obj[1];
					}
				}
			}
		} while (tree_stack.length > 0);
	},

	_removeFrom: function(mbr, obj, root) {
		var self = this;

		var hit_stack = [];
		var count_stack = [];
		var ret_array = [];
		var current_depth = 1;

		if (!mbr || !self._mbrOverlap(mbr, root.mbr)) {
			return ret_array;
		}

		var ret_obj = {
			mbr: self._cloneMbr(mbr),
			target: obj
		};

		count_stack.push(root.nodes.length);
		hit_stack.push(root);

		var tree, i, ltree, t;
		do {
			tree = hit_stack.pop();
			i = count_stack.pop() - 1;

			if ("target" in ret_obj) {
				while (i >= 0) {
					ltree = tree.nodes[i];
					if (self._mbrOverlap(ret_obj.mbr, ltree.mbr)) {
						if ((ret_obj.target && "obj" in ltree && ltree.obj === ret_obj.target) ||
							(!ret_obj.target && ("obj" in ltree || self._mbrContain(ret_obj.mbr, ltree.mbr)))) {
							if ("nodes" in ltree) {
								tree.nodes.splice(i, 1);
								ret_array = self._searchSubtree(ltree.mbr, true, ltree);
							} else {
								ret_array = tree.nodes.splice(i, 1);
							}
							tree.mbr = self._resizeMbrWithNodes(tree.mbr, tree.nodes);
							delete ret_obj.target;
							if (tree.nodes.length < self._fanHalf) {
								ret_obj.nodes = self._searchSubtree(tree.mbr, true, tree);
							}
							break;
						} else if ("nodes" in ltree) {
							current_depth += 1;
							count_stack.push(i);
							hit_stack.push(tree);
							tree = ltree;
							i = ltree.nodes.length;
						}
					}
					i -= 1;
				}
			} else if ("nodes" in ret_obj) {
				tree.nodes.splice(i + 1, 1);
				if (tree.nodes.length > 0)
					tree.mbr = self._resizeMbrWithNodes(tree.mbr, tree.nodes);
				for (t = ret_obj.nodes.length - 1; t >= 0; t--) {
					self._insertTo(ret_obj.nodes[t], tree);
				}
				ret_obj.nodes.length = 0;
				if (hit_stack.length === 0 && tree.nodes.length <= 1) {
					ret_obj.nodes = self._searchSubtree(tree.mbr, true, tree);
					tree.nodes.length = 0;
					hit_stack.push(tree);
					count_stack.push(1);
				} else if (hit_stack.length > 0 && tree.nodes.length < self._fanHalf) {
					ret_obj.nodes = self._searchSubtree(tree.mbr, true, tree);
					tree.nodes.length = 0;
				} else {
					delete ret_obj.nodes;
				}
			} else {
				tree.mbr = self._resizeMbrWithNodes(tree.mbr, tree.nodes);
			}
			current_depth -= 1;
		} while (hit_stack.length > 0);

		return ret_array;
	},

	_chooseSubtree: function(node, root) {
		var best_choice_index = -1;
		var best_choice_stack = [];

		best_choice_stack.push(root);

		var nodes = root.nodes;
		var ltree;
		do {
			if (best_choice_index != -1) {
				best_choice_stack.push(nodes[best_choice_index]);
				nodes = nodes[best_choice_index].nodes;
				best_choice_index = -1;
			}

			for (var i = nodes.length - 1; i >= 0; i--) {
				ltree = nodes[i];
				if (ltree.obj) {
					best_choice_index = -1;
					break;
				}

				if (best_choice_index < 0) {
					best_choice_index = i;
				}
			}
		} while (best_choice_index != -1);

		return best_choice_stack;
	},

	// Split nodes into two groups
	_split: function(nodes) {
		var self = this;

		var n = self._linearPickSeeds(nodes);
		while (nodes.length > 0) {
			self._pickNext(nodes, n[0], n[1]);
		}
		return n;
	},

	// Pick best two start nodes using LinearPickSeeds algorithm
	_linearPickSeeds: function(nodes) {
		var self = this;

		var lowest_high_x = nodes.length - 1;
		var highest_low_x = 0;
		var lowest_high_y = nodes.length - 1;
		var highest_low_y = 0;
		var t1, t2;
		var node;

		for (var i = nodes.length - 2; i >= 0; i--) {
			node = nodes[i];
			if (node.mbr[0] > nodes[highest_low_x].mbr[0]) {
				highest_low_x = i;
			} else if (node.mbr[0] + node.mbr[2] < nodes[lowest_high_x].mbr[0] + nodes[lowest_high_x].mbr[2]) {
				lowest_high_x = i;
			}
			if (node.mbr[1] > nodes[highest_low_y].mbr[1]) {
				highest_low_y = i;
			} else if (node.mbr[1] + node.mbr[3] < nodes[lowest_high_y].mbr[1] + nodes[lowest_high_y].mbr[3]) {
				lowest_high_y = i;
			}
		}
		var dx = Math.abs((nodes[lowest_high_x].mbr[0] + nodes[lowest_high_x].mbr[2]) - nodes[highest_low_x].mbr[0]);
		var dy = Math.abs((nodes[lowest_high_y].mbr[1] + nodes[lowest_high_y].mbr[3]) - nodes[highest_low_y].mbr[1]);
		if (dx > dy) {
			if (lowest_high_x > highest_low_x) {
				t1 = nodes.splice(lowest_high_x, 1)[0];
				t2 = nodes.splice(highest_low_x, 1)[0];
			} else {
				t2 = nodes.splice(highest_low_x, 1)[0];
				t1 = nodes.splice(lowest_high_x, 1)[0];
			}
		} else {
			if (lowest_high_y > highest_low_y) {
				t1 = nodes.splice(lowest_high_y, 1)[0];
				t2 = nodes.splice(highest_low_y, 1)[0];
			} else {
				t2 = nodes.splice(highest_low_y, 1)[0];
				t1 = nodes.splice(lowest_high_y, 1)[0];
			}
		}
		return [{
			mbr: self._cloneMbr(t1.mbr),
			nodes: [t1]
		}, {
			mbr: self._cloneMbr(t2.mbr),
			nodes: [t2]
		}];
	},

	// Pick next object in nodes and insert into suitable node with PickNext algorithm
	_pickNext: function(nodes, a, b) {
		var self = this;

		var newMbrA, newMbrB;
		var deltaAreaA, deltaAreaB, deltaArea;
		var maxDeltaArea = 0;
		var pickIndex = -1;
		var lowerGrowOfAAndB = a;
		var node;
		for (var i = nodes.length - 1; i >= 0; i--) {
			node = nodes[i];
			newMbrA = self._cloneMbr(a.mbr);
			self._expandMbr(newMbrA, node.mbr);
			deltaAreaA = newMbrA[2] * newMbrA[3] - a.mbr[2] * a.mbr[3];

			newMbrB = self._cloneMbr(b.mbr);
			self._expandMbr(newMbrB, node.mbr);
			deltaAreaB = newMbrB[2] * newMbrB[3] - b.mbr[2] * b.mbr[3];

			deltaArea = Math.abs(deltaAreaA - deltaAreaB);

			if (deltaArea > maxDeltaArea) {
				maxDeltaArea = deltaArea;
				pickIndex = i;
				lowerGrowOfAAndB = deltaAreaA < deltaAreaB ? a : b;
			}
		}
		var pickedNode = nodes.splice(pickIndex, 1)[0];
		if (a.nodes.length + nodes.length + 1 <= self._fanHalf) {
			a.nodes.push(pickedNode);
			self._expandMbr(a.mbr, pickedNode.mbr);
		} else if (b.nodes.length + nodes.length + 1 <= self._fanHalf) {
			b.nodes.push(pickedNode);
			self._expandMbr(b.mbr, pickedNode.mbr);
		} else {
			lowerGrowOfAAndB.nodes.push(pickedNode);
			self._expandMbr(lowerGrowOfAAndB.mbr,
				pickedNode.mbr);
		}
	},

	// Search in a specified MBR, every object than overlay the MBR will be returned
	_searchSubtree: function(mbr, returnNodeOrNot, root) {
		var self = this;

		var array = [];

		if (!self._mbrOverlap(mbr, root.mbr) || !("nodes" in root))
			return array;

		var searchStack = [root.nodes];
		var nodes, node;
		while (searchStack.length > 0) {
			nodes = searchStack.pop();

			for (var i = nodes.length - 1; i >= 0; i--) {
				node = nodes[i];
				if (self._mbrOverlap(mbr, node.mbr)) {
					if ("nodes" in node) {
						searchStack.push(node.nodes);
					} else if ("obj" in node) {
						if (!returnNodeOrNot)
							array.push(node.obj);
						else
							array.push(node);
					}
				}
			}
		}

		return array;
	},

	_mbrOverlap: function(a, b) {
		var self = this;
		var t = self._tolerance;
		if (a && b && !self._mbrNoValue(a) && !self._mbrNoValue(b)) {
			return a[0] <= (b[0] + b[2] + t) && (a[0] + a[2] + t) >= b[0] && a[1] <= (b[1] + b[3] + t) && (a[1] + a[3] + t) >= b[1];
		}
	},

	_mbrContain: function(a, b) {
		var self = this;
		if (a && b && !self._mbrNoValue(a) && !self._mbrNoValue(b)) {
			return (a[0] + a[2] + t) >= (b[0] + b[2]) && a[0] <= b[0] + t && (a[1] + a[3] + t) >= (b[1] + b[3]) && a[1] <= b[1] + t;
		}
	},

	_cloneMbr: function(mbr) {
		if (mbr) {
			return [mbr[0], mbr[1], mbr[2], mbr[3]];
		}
	},

	_mbrNoValue: function(mbr) {
		return !mbr || mbr[0] === undefined || mbr[1] === undefined || mbr[2] === undefined || mbr[3] === undefined;
	},

	_expandMbr: function(dest, add) {
		var self = this;

		if (!dest || self._mbrNoValue(dest)) {
			dest = self._cloneMbr(add);
		} else {
			if (add && !self._mbrNoValue(add)) {
				var newX = Math.min(dest[0], add[0]);
				var newY = Math.min(dest[1], add[1]);
				var newW = Math.max(dest[0] + dest[2], add[0] + add[2]) - newX;
				var newH = Math.max(dest[1] + dest[3], add[1] + add[3]) - newY;
				dest[0] = newX;
				dest[1] = newY;
				dest[2] = newW;
				dest[3] = newH;
			}
		}

		return dest;
	},

	// Resize MBR with all node's MBR
	_resizeMbrWithNodes: function(mbr, nodes) {
		var self = this;

		if (nodes.length < 1) {
			return;
		}

		if (!mbr || self._mbrNoValue(mbr)) {
			mbr = self._cloneMbr(nodes[0].mbr);
		}

		for (var i = nodes.length - 1; i > 0; i--) {
			self._expandMbr(mbr, nodes[i].mbr);
		}

		return mbr;
	}


});

/**
 * RTree会创建大量MBR，这在IE7/8中效率非常低，因此要屏蔽索引直接返回所有对象
 */
if (G.Browser.ielt9) {
	G.RTree = G.RTree.extend({

		init: function(fan) {
			var self = this;

			// tolerance
			self._tolerance = 1e-6;

			self._nodes = {};
		},

		insert: function(extent, obj) {
			var self = this;

			if (!extent || !obj) {
				return;
			}

			var node = {
				ext: extent,
				obj: obj
			};

			var objStamp = G.Util.stamp(obj);
			if (!self._nodes[objStamp]) {
				self._nodes[objStamp] = node;
			}
		},

		remove: function(extent, obj) {
			var self = this;

			if (!extent || !obj) {
				return;
			}


			var objStamp = G.Util.stamp(obj);
			if (self._nodes[objStamp]) {
				delete self._nodes[objStamp];
			}
		},

		clear: function() {
			var self = this;

			self._nodes = {};
		},

		search: function(extent) {
			var self = this;

			var list = [];
			var node, ext;
			for (var i in self._nodes) {
				node = self._nodes[i];
				ext = node['ext'];

				if (self._overlaps(ext, extent, self._tolerance)) {
					list.push(self._nodes[i]['obj']);
				}
			}

			return list;
		},

		count: function() {
			var self = this;

			var count = 0;
			for (var i in self._nodes) {
				count++;
			}

			return count;
		},

		all: function() {
			var self = this;

			var list = [];
			for (var i in self._nodes) {
				list.push(self._nodes[i]['obj'])
			}

			return list;
		},

		_overlaps: function(ext1, ext2, tolerance) {
			if (!ext1 || !ext2) {
				return false;
			}

			var xmin1 = ext1[0],
				ymin1 = ext1[1],
				xmax1 = ext1[2],
				ymax1 = ext1[3],
				xmin2 = ext2[0],
				ymin2 = ext2[1],
				xmax2 = ext2[2],
				ymax2 = ext2[3];

			var t = tolerance || 0;

			if (xmin1 > xmax2 + t || xmax1 < xmin2 - t || ymin1 > ymax2 + t || ymax1 < ymin2 - t) {
				return false;
			}

			return true;
		}


	});
}
/* global G:false */
G.Event = {
	eventsKey: '_g_events_',

	virtualMouse: {
		DOWN: G.Browser.touch ? ['touchstart', 'mousedown'] : ['mousedown'],
		MOVE: {
			mousedown: 'mousemove',
			touchstart: 'touchmove',
			MSPointerDown: 'touchmove'
		},
		UP: {
			mousedown: 'mouseup',
			touchstart: 'touchend',
			MSPointerDown: 'touchend'
		}
	},

	addListener: function(type, fn, context) {
		var self = this;

		var listener = {
			action: fn,
			context: context || self
		};

		var eventsKey = self.eventsKey;
		var events = self[eventsKey] = self[eventsKey] || {};
		events[type] = events[type] || [];
		events[type].push(listener);

		self._onListenerAdded(type, fn, context);

		return self;
	},

	removeListener: function(type, fn, context) {
		var self = this;

		var eventsKey = self.eventsKey;
		var events = self[eventsKey];
		var listeners, i, removed;

		if (!events) {
			return self;
		}

		if (!fn) {
			delete events[type];
		} else {
			listeners = events[type];
			if (listeners) {
				for (i = listeners.length - 1; i >= 0; i--) {
					if ((listeners[i].action === fn) && (!context || (listeners[i].context === context))) {
						removed = listeners.splice(i, 1);
					}
				}
			}
		}

		self._onListenerRemoved(type, fn, context);

		return self;
	},

	clearListeners: function() {
		var self = this;

		var eventsKey = self.eventsKey;
		delete self[eventsKey];

		return self;
	},

	hasListeners: function(type) {
		var self = this;

		var eventsKey = self.eventsKey;
		var events = self[eventsKey];

		if (!events) {
			return false;
		}

		return (type in events) && events[type].length > 0;
	},

	_setListener: function(type, fn, context, key, value) {
		var self = this;

		var eventsKey = self.eventsKey;
		var events = self[eventsKey];

		if (events) {
			var listeners = events[type];
			var listen;

			for (var i = listeners.length - 1; i >= 0; i--) {
				listen = listeners[i];

				if ((!fn || listen.action === fn) && (!context || (listen.context === context))) {
					listen[key] = value;
				}
			}
		}

		return self;
	},

	enableListener: function(type, fn, context) {
		return this._setListener(type, fn, context, 'disabled', false);
	},

	disableListener: function(type, fn, context) {
		return this._setListener(type, fn, context, 'disabled', true);
	},

	fireEvent: function(type, data) { // Do not use key 'type' or 'target' or 'cancel' in data, they are reserved.
		var self = this;

		if (!self.hasListeners(type)) {
			return self;
		}

		var eventsKey = self.eventsKey;
		var events = self[eventsKey];
		var event = G.Util.merge({}, data, {
			type: type,
			target: self,
			cancel: function() {
				event._cancel = true;
				return event;
			}
		});

		if (events) {
			var listeners = events[type];
			var listen, fn;

			for (var i = listeners.length - 1; i >= 0; i--) { // 后添加的监听先触发
				listen = listeners[i];

				if (event._cancel) {
					break;
				}

				if (!listen['disabled']) {
					fn = listen.action;
					if (fn) {
						fn.call(listen.context || self, event);
					}
				}
			}
		}

		return self;
	},

	_onListenerAdded: function(type, fn, context) {},
	_onListenerRemoved: function(type, fn, context) {}

};

G.Event.bind = G.Event.addListener;
G.Event.unbind = G.Event.removeListener;
G.Event.listen = G.Event.enableListener;
G.Event.unlisten = G.Event.disableListener;
G.Event.fire = G.Event.fireEvent;
/* global G:false */
G.DomUtil = {
	SVG_NS: 'http://www.w3.org/2000/svg',
	XLINK_NS: 'http://www.w3.org/1999/xlink',

	create: function(tagName, className, parent) {
		var element = document.createElement(tagName);
		element.className = className || '';

		if (parent) {
			parent.appendChild(element);
		}

		return element;
	},

	remove: function(element, parent) {
		if (parent && element) {
			parent.removeChild(element);
		}
	},

	createNS: function(ns, tagName, className, parent) {
		if (!document.createElementNS) {
			return this.create(tagName, className, parent);
		}

		var element = document.createElementNS(ns, tagName);
		element.className = className;

		if (parent) {
			parent.appendChild(element);
		}

		return element;
	},

	createSVG: function(tagName, className, parent) {
		var self = this;
		return self.createNS(self.SVG_NS, tagName, className, parent);
	},

	_svgImages: {},

	_svgImageSeq: 1,

	svgImagePattern: function(defs, imageSrc, imageWidth, imageHeight) {
		var self = this;

		var id, key = imageSrc + '_' + imageWidth + '_' + imageHeight;
		if (key in self._svgImages) {
			id = self._svgImages[key];
		} else {
			id = self._svgImages[key] = self._svgImageSeq++;
		}

		var patternId = 'svg_image_' + id;
		var pattern, image;
		if (!defs.querySelector('#' + patternId)) {
			pattern = self.createSVG('pattern', '', defs);
			pattern.setAttribute('id', patternId);
			pattern.setAttribute('patternUnits', 'userSpaceOnUse');
			pattern.setAttribute('width', imageWidth);
			pattern.setAttribute('height', imageHeight);
			image = self.createSVG('image', '', pattern);
			image.setAttributeNS(self.XLINK_NS, 'href', imageSrc);
			image.setAttribute('width', imageWidth);
			image.setAttribute('height', imageHeight);
		}

		return patternId;
	},

	_svgGrads: {},

	_svgGradsSeq: 1,

	svgGradient: function(defs, color, opacity) {
		var self = this;

		var id, key = color + '_' + opacity;
		if (key in self._svgGrads) {
			id = self._svgGrads[key];
		} else {
			id = self._svgGrads[key] = self._svgGradsSeq++;
		}

		var gradientId = 'svg_grad_' + id;
		var gradient, from, to;
		if (!defs.querySelector('#' + gradientId)) {
			gradient = self.createSVG('radialGradient', '', defs);
			gradient.setAttribute('id', gradientId);
			gradient.setAttribute('gradientUnits', 'objectBoundingBox');
			gradient.setAttribute('cx', '50%');
			gradient.setAttribute('cy', '50%');
			gradient.setAttribute('r', '50%');
			from = self.createSVG('stop', '', gradient);
			from.setAttribute('offset', '0%');
			from.setAttribute('stop-color', color);
			from.setAttribute('stop-opacity', 1);
			to = self.createSVG('stop', '', gradient);
			to.setAttribute('offset', '50%');
			to.setAttribute('stop-color', color);
			to.setAttribute('stop-opacity', opacity);
		}

		return gradientId;
	},

	createVML: function(tagName, className, parent) {
		var self = this;

		if (!self._vml_init) {
			document.namespaces.add('v', 'urn:schemas-microsoft-com:vml');
			self._vml_init = true;
		}

		var element = document.createElement('<v:' + tagName + '>');
		element.className = className || '';

		if (parent && parent.appendChild) {
			parent.appendChild(element);
		}

		return element;
	},

	strokeVML: function(element, options) {
		var stroke = element._stroke;
		var names = ['color', 'dashstyle', 'endcap', 'joinstyle', 'weight', 'opacity'];
		var i, name;

		if (!options) {
			if (stroke) {
				element.removeChild(stroke);
				element._stroke = null;
			}
		} else {
			if (!stroke) {
				stroke = element._stroke = this.createVML('stroke', 'g-vml', element);
			}

			for (i in names) {
				name = names[i];
				if (name in options) {
					stroke[name] = options[name];
				}
			}
		}
	},

	fillVML: function(element, options) {
		var fill = element._fill;
		var names = ['color', 'color2', 'opacity', 'src', 'focusposition', 'type'];
		var i, name;

		if (!options) {
			if (fill) {
				element.removeChild(fill);
				element._fill = null;
			}
		} else {
			if (!fill) {
				fill = element._fill = this.createVML('fill', 'g-vml', element);
			}

			for (i in names) {
				name = names[i];
				if (name in options) {
					fill[name] = options[name];
				}
			}
		}
	},

	get: function(id) {
		return (G.Util.isString(id)) ? document.getElementById(id) : id;
	},

	getDomEventKey: function(type, fn, context) {
		return '_g_dom_event_' + type + '_' + G.Util.stamp(fn) + (context ? '_' + G.Util.stamp(context) : '');
	},

	addListener: function(element, type, fn, context) {
		var self = this,
			eventKey = G.DomUtil.getDomEventKey(type, fn, context),
			handler = element[eventKey];

		if (handler) {
			return self;
		}

		handler = function(e) {
			return fn.call(context || element, e);
		};

		if ('addEventListener' in element) {
			element.addEventListener(type, handler, false);
		} else if ('attachEvent' in element) {
			element.attachEvent('on' + type, handler);
		}

		element[eventKey] = handler;
		return self;
	},

	removeListener: function(element, type, fn, context) {
		var self = this,
			eventKey = G.DomUtil.getDomEventKey(type, fn, context),
			handler = element[eventKey];

		if (!handler) {
			return self;
		}

		if ('removeEventListener' in element) {
			element.removeEventListener(type, handler, false);
		} else if ('detachEvent' in element) {
			element.detachEvent('on' + type, handler);
		}

		element[eventKey] = null;

		return self;
	},

	getMousePosition: function(e, container) {
		var evt = e.touches ? (e.touches.length > 0 ? e.touches[0] : e.changedTouches[0]) : e,
			doc = document.documentElement,
			body = document.body,
			x = evt.pageX ? evt.pageX - body.scrollLeft - doc.scrollLeft : evt.clientX,
			y = evt.pageY ? evt.pageY - body.scrollTop - doc.scrollTop : evt.clientY;

		if (container) {
			var rect = container.getBoundingClientRect(),
				left = rect.left - container.clientLeft,
				top = rect.top - container.clientTop;

			x -= left;
			y -= top;
		}

		return [x, y];
	},

	getWheelDelta: function(e) {
		var delta = 0;

		if (e.wheelDelta) {
			delta = e.wheelDelta / 120;
		}
		if (e.detail) {
			delta = -e.detail / 3;
		}

		return delta;
	},

	stopPropagation: function(e) {
		if (e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}

		return this;
	},

	preventDefault: function(e) {
		if (e.preventDefault) {
			e.preventDefault();
		} else {
			e.returnValue = false;
		}

		return this;
	},

	getStyle: function(element, name) {
		var value = element.style[name];
		return value === 'auto' ? null : value;
	},

	hasClass: function(element, name) {
		return (element.className.length > 0) &&
			new RegExp('(^|\\s)' + name + '(\\s|$)').test(element.className);
	},

	addClass: function(element, name) {
		if (this.hasClass(element, name)) {
			return;
		}
		if (element.className) {
			element.className += ' ';
		}
		element.className += name;
	},

	removeClass: function(element, name) {
		element.className = G.Util.trim((' ' + element.className + ' ').replace(' ' + name + ' ', ' '));
	},

	getOffset: function(element) {
		var left = 0,
			top = 0;

		var self = this;

		do {
			left += element.offsetLeft || 0;
			top += element.offsetTop || 0;

			// Calculate border. 
			left += parseInt(self.getStyle(element, 'borderLeftWidth')) || 0;
			top += parseInt(self.getStyle(element, 'borderTopWidth')) || 0;

			// TODO, handle different position value.

			element = element.offsetParent;
		} while (element);


		return [left, top];
	},

	setSize: function(element, width, height) {
		var oldSize = element._size;
		if (oldSize) {
			if (oldSize[0] === width && oldSize[1] === height) {
				return;
			}
		}

		element._size = [width, height]; //Cache size, get it by getSize()

		if (width) {
			element.style.width = width + 'px';
		}
		if (height) {
			element.style.height = height + 'px';
		}
	},

	getSize: function(element) {
		return element._size;
	},

	setZIndex: function(element, z) {
		if (element) {
			element.style.zIndex = z || 0;
		}
	},

	setPosition: function(element, left, top, retainCache) {
		var oldPos = element._pos;
		if (oldPos) {
			if (oldPos[0] === left && oldPos[1] === top) {
				return;
			}
		}

		if (!retainCache) {
			element._pos = [left, top]; //Update cached position, it will be got by getPosition()
		}

		G.DomUtil.updateTransform(element);
	},

	getPosition: function(element) {
		return element._pos;
	},

	getPositionNocache: function(element) {
		var domUtil = G.DomUtil;
		var transform = domUtil.Transform;
		var matches;

		var left, top;
		var style = window.getComputedStyle ? window.getComputedStyle(element) : element.currentStyle;
		if (transform) {
			matches = style[transform].match(/([-+]?(?:\d*\.)?\d+)\D*, ([-+]?(?:\d*\.)?\d+)\D*\)/);
			if (matches) {
				left = parseFloat(matches[1]);
				top = parseFloat(matches[2]);
			} else {
				left = parseFloat(style.left);
				top = parseFloat(style.top);
			}
		} else {
			left = parseFloat(style.left);
			top = parseFloat(style.top);
		}

		return [left, top];
	},

	getSizeNocache: function(element) {
		var style = window.getComputedStyle ? window.getComputedStyle(element) : element.currentStyle;
		var w = parseFloat(style.width);
		var h = parseFloat(style.height);

		return [w, h];
	},

	updateOpacity: function(element, opacity) {
		if (!element) {
			return;
		}

		var oldOpacity = element._opacity;
		if (oldOpacity === opacity) {
			return;
		}

		var self = this;
		var style = element.style;
		style[self.Opacity] = opacity;
		style.filter = 'alpha(opacity=' + opacity * 100 + ')';
	},

	markScaleTransform: function(element, scaleX, scaleY) {
		element._scale = (scaleX && scaleY) ? [scaleX, scaleY] : null;
	},

	markPosTransform: function(element, left, top) {
		element._pos = [left, top];
	},

	markSizeTransform: function(element, width, height) {
		element._size = [width, height];
	},

	markRotateTransform: function(element, degree, originX, originY) {
		element._rotate = [degree, originX, originY];
	},

	updateTransform: function(element) {
		// Update transform information stored by element
		var scale = element._scale || [1, 1];
		var pos = element._pos;
		var size = element._size;
		var rotate = element._rotate;

		var self = this;
		var transform = self.Transform;

		var style = '';
		if (transform) {
			if (pos) {
				style += self.genTranslateStyle(pos[0] || 0, pos[1] || 0);
			}

			if (rotate) {
				var rotateStyle;

				var rotateStyleCache = element._rotateSC;
				if (rotateStyleCache //
					&& rotateStyleCache[0] == rotate[0] //
					&& rotateStyleCache[1] == rotate[1] //
					&& rotateStyleCache[2] == rotate[2]) {
					rotateStyle = rotateStyleCache[3];
				} else {
					rotateStyle = self.genRotateStyle(rotate[0], rotate[1], rotate[2]);

					element._rotateSC = [];
					element._rotateSC[0] = rotate[0];
					element._rotateSC[1] = rotate[1];
					element._rotateSC[2] = rotate[2];
					element._rotateSC[3] = rotateStyle;
				}

				style += rotateStyle;
			}

			element.style[transform] = style;
		} else {
			if (pos) {
				element.style.left = pos[0] + 'px';
				element.style.top = pos[1] + 'px';
			}
		}

		if (size) {
			element.style.width = size[0] * scale[0] + 'px';
			element.style.height = size[1] * scale[1] + 'px';
		}
	},

	genTranslateStyle: function(x, y) {
		if (!x && !y) {
			return '';
		}

		var browser = G.Browser;
		var round = Math.round;
		return (browser.support3d && !browser.avoid3d) ? //
			' translate3d(' + round(x) + 'px,' + round(y) + 'px, 0) ' //
			: ' translate(' + round(x) + 'px,' + round(y) + 'px' + ') ';
	},

	genScaleStyle: function(scale, originX, originY, offsetX, offsetY) {
		if (!scale || scale == 1) {
			return '';
		}

		var d = 1 - scale;
		var translate = G.DomUtil.genTranslateStyle(originX * d + (offsetX || 0), originY * d + (offsetY || 0));

		return translate + ' scale(' + scale + ') ';
	},

	genRotateStyle: function(degree, originX, originY) {
		if (!degree) {
			return '';
		}

		var translate = '';

		var v = G.MathUtil.rotateVector([originX, originY], degree);
		var dx = (originX - v[0]) || 0;
		var dy = (originY - v[1]) || 0;

		if (dx || dy) {
			translate += G.DomUtil.genTranslateStyle(dx, dy);
		}

		translate += ' rotate(' + degree + 'deg) ';

		return translate;
	},

	testStyle: function(names) {
		var style = document.documentElement.style;
		var i, len;
		for (i = 0, len = names.length; i < len; i++) {
			if (names[i] in style) {
				return names[i];
			}
		}

		return;
	},

	hide: function(element, duration, runAfter) {
		if (!element) {
			return;
		}

		var self = this;
		var style = element.style;

		if (style.visibility === 'hidden') {
			return;
		}

		element._oldOpacity = style[self.Opacity];

		var setFn = function() {
			style[self.Opacity] = 0;
			style.filter = 'alpha(opacity=0)';
		};

		if (!duration) {
			style.visibility = 'hidden';
			setFn();
			if (runAfter) {
				runAfter.call(element);
			}
		} else {
			element._g_hide_transition_end = element._g_hide_transition_end || function() {
				self.removeListener(element, self.TransitionEnd, element._g_hide_transition_end);
				style.visibility = 'hidden';
				if (runAfter) {
					runAfter.call(element);
				}
			};

			if (self.Transition) {
				self.addListener(element, self.TransitionEnd, element._g_hide_transition_end);
				style[self.Transition] = self.Opacity + ' ' + duration + 's linear';
				setFn();
			} else {
				style.visibility = 'hidden';
				setFn();
				if (runAfter) {
					runAfter.call(element);
				}
			}
		}

	},

	show: function(element, duration, runAfter) {
		if (!element) {
			return;
		}

		var self = this;
		var style = element.style;
		if (style.visibility !== 'hidden') {
			return;
		}

		var setFn = function() {
			style.visibility = '';

			var opacity = (element._oldOpacity > 0) ? element._oldOpacity : 1;
			style[self.Opacity] = opacity;
			style.filter = 'alpha(opacity=' + opacity * 100 + ')';
		}

		if (!duration) {
			setFn();
			if (runAfter) {
				runAfter.call(element);
			}
		} else {
			element._g_show_transition_end = element._g_show_transition_end || function() {
				self.removeListener(element, self.TransitionEnd, element._g_show_transition_end);
				if (runAfter) {
					runAfter.call(element);
				}
			};

			if (self.Transition) {
				self.addListener(element, self.TransitionEnd, element._g_show_transition_end);
				style[self.Transition] = self.Opacity + ' ' + duration + 's linear';
				setFn();
			} else {
				setFn();
				if (runAfter) {
					runAfter.call(element);
				}
			}

		}
	},

	getImgElement: function(src, onLoad, onError, crossOrigin) {
		var self = this;
		var imgs = self._imgs = self._imgs || {};

		var img = imgs[src];

		if (!img) {
			img = imgs[src] = self.create('img');

			if (crossOrigin) {
				img.crossOrigin = crossOrigin;
			}

			img.onload = function() {
				img._loaded = true;
				if (onLoad) {
					onLoad();
				}
			};

			img.onerror = function() {
				img._loaded = false;
				if (onError) {
					onError();
				}
			};

			img.src = src;
		}

		return img;
	},

	disableTextSelection: function() {
		var self = this;
		var us = self.UserSelect;
		self.addListener(window, 'selectstart', self.preventDefault);
		if (us) {
			var style = document.documentElement.style;
			self._userSelect = style[us];
			style[us] = 'none';
		}
	},

	enableTextSelection: function() {
		var self = this;
		var us = self.UserSelect;
		self.removeListener(window, 'selectstart', self.preventDefault);
		if (us) {
			var style = document.documentElement.style;
			style[us] = self._userSelect;
			delete self._userSelect;
		}
	},

	disableImageDrag: function() {
		var self = this;
		self.addListener(window, 'dragstart', self.preventDefault);
	},

	enableImageDrag: function() {
		var self = this;
		self.removeListener(window, 'dragstart', self.preventDefault);
	}

};


G.DomUtil.Opacity = G.DomUtil.testStyle(['opacity', 'webkitOpacity', 'MozOpacity']);

G.DomUtil.UserSelect = G.DomUtil.testStyle(['userSelect', 'webkitUserSelect', 'OUserSelect', 'MozUserSelect', 'msUserSelect']);

G.DomUtil.Transform = G.DomUtil.testStyle(['transform', 'webkitTransform', 'OTransform', 'MozTransform', 'msTransform']);

G.DomUtil.Transition = G.DomUtil.testStyle(['webkitTransition', 'transition', 'OTransition', 'MozTransition', 'msTransition']);

G.DomUtil.TransitionEnd = G.DomUtil.Transition === 'webkitTransition' || G.DomUtil.Transition === 'OTransition' ?
	G.DomUtil.Transition + 'End' : 'transitionend';
/* global G:false */
G.DomClickable = G.Class.extend({
	mixins: [G.Event],

	options: {
		doubleDuration: 0.2 // s
	},

	init: function(element, options) {
		var self = this;

		self._element = element;

		self.options = G.Util.merge({}, self.options, options);
	},

	on: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var virtualMouse = self.virtualMouse;

		var i;

		if (!self._enabled) {
			for (i in virtualMouse.DOWN) {
				domUtil.addListener(self._element, virtualMouse.DOWN[i], self._onDown, self);
			}
			for (i in virtualMouse.UP) {
				domUtil.addListener(self._element, virtualMouse.UP[i], self._onUp, self);
			}

			self._enabled = true;
		}
		return self;
	},

	off: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var virtualMouse = self.virtualMouse;

		var i;

		if (self._enabled) {
			for (i in virtualMouse.DOWN) {
				domUtil.removeListener(self._element, virtualMouse.DOWN[i], self._onDown, self);
			}
			for (i in virtualMouse.UP) {
				domUtil.removeListener(self._element, virtualMouse.UP[i], self._onUp, self);
			}

			self._enabled = false;
		}

		self._dragged = false;

		return self;
	},

	_onDown: function(e) {
		var self = this;

		if (!e || (e.touches && e.touches.length !== 1)) {
			return;
		}

		self._lastDown = e.touches ? e.touches[0] : e;
		self._lastTime = +new Date();
	},

	_onUp: function(e) {
		var self = this;
		var domUtil = G.DomUtil;
		var abs = Math.abs;

		var now = +new Date();
		var lastDown = self._lastDown;
		var lastTime = self._lastTime;
		var nowUp = e.changedTouches ? e.changedTouches[0] : e;

		var lastPt, nowPt, dx, dy;
		if (lastDown) {
			if (now - lastTime > 1e3) { // TODO, Long click?
				// console.log('test, long click?');
			} else {
				lastPt = domUtil.getMousePosition(lastDown);
				nowPt = domUtil.getMousePosition(nowUp);

				dx = abs(lastPt[0] - nowPt[0]);
				dy = abs(lastPt[1] - nowPt[1]);

				if (dx < 3 && dy < 3) {
					self._virtualClick(lastPt);
				}
			}
		}

		self._lastDown = null;
	},

	_virtualClick: function(p) {
		var self = this;

		var now = +new Date();
		var duration = self.options.doubleDuration * 1e3;

		if (self._lastClick) {
			if (now - self._lastClickTime < duration) { // Double click
				self._realDoubleClick();
			} else {
				self._lastClick = p;
				self._realClick();
			}
		} else {
			self._lastClick = p;
			self._clickTimeout = setTimeout(G.Util.bind(self._realClick, self), duration);
		}

		self._lastClickTime = now;
	},

	_realClick: function() {
		var self = this;

		clearTimeout(self._clickTimeout);

		var mouseScreen = self._lastClick;

		self._lastClick = null;
		self._lastClickTime = +new Date();

		self.fireEvent('click', {
			x: mouseScreen[0],
			y: mouseScreen[1]
		});
	},

	_realDoubleClick: function() {
		var self = this;

		clearTimeout(self._clickTimeout);

		var mouseScreen = self._lastClick;

		self._lastClick = null;
		self._lastClickTime = +new Date();

		self.fireEvent('doubleclick', {
			x: mouseScreen[0],
			y: mouseScreen[1]
		});
	}

});
/* global G:false */
G.DomDraggable = G.Class.extend({
	mixins: [G.Event],

	init: function(element, dragStartTarget, dragEdge) {
		var self = this;

		self._element = element;
		self._dragStartTarget = dragStartTarget || element;
		self._dragEdge = dragEdge || 0;
	},

	on: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var virtualMouse = self.virtualMouse;

		if (!self._enabled) {
			for (var i in virtualMouse.DOWN) {
				domUtil.addListener(self._dragStartTarget, virtualMouse.DOWN[i], self._onDown, self);
			}

			self._enabled = true;
		}
		return self;
	},

	off: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var virtualMouse = self.virtualMouse;

		if (self._enabled) {
			for (var i in virtualMouse.DOWN) {
				domUtil.removeListener(self._dragStartTarget, virtualMouse.DOWN[i], self._onDown, self);
			}

			self._enabled = false;
		}

		self._dragged = false;

		return self;
	},

	_onDown: function(e) {
		if (e.shiftKey || ((e.which !== 1) && (e.button !== 1) && !e.touches)) {
			return;
		}

		var self = this,
			domUtil = G.DomUtil;

		if (G.DomDraggable.forbidden || self._dragging) {
			return;
		}

		// 屏蔽在Popup中的操作
		var current = e || e.touches[0];
		var target = current.target;
		while (target) {
			if (target.className == 'g-popup') {
				return;
			}

			target = target.parentElement;
		}

		var evt = e.touches ? e.touches[0] : e;
		var x = evt.clientX;
		var y = evt.clientY;

		// 防止在手机上手指从屏幕切入的时候误操作地图
		var dragTarget = self._dragStartTarget;
		var dragEdge = self._dragEdge;
		var mousePostion = domUtil.getMousePosition(e, dragTarget);
		var cx = mousePostion[0];
		var cy = mousePostion[1];
		var size = domUtil.getSizeNocache(dragTarget);
		var maxNumber = Number.MAX_VALUE;
		var w = size[0] || maxNumber;
		var h = size[1] || maxNumber;
		if (cx < dragEdge || cx > w - dragEdge) {
			return;
		}
		if (cy < dragEdge || cy > h - dragEdge) {
			return;
		}

		domUtil.stopPropagation(e);
		domUtil.preventDefault(e);

		domUtil.disableImageDrag();
		domUtil.disableTextSelection();

		self._dragged = false;

		self._startClientX = x;
		self._startClientY = y;

		//var pos = domUtil.getPosition(self._element);
		var pos = [0, 0]; // Make sure call Map._mergeFramePos before drag
		self._startX = self._newX = pos[0];
		self._startY = self._newY = pos[1];

		var virtualMouse = self.virtualMouse;
		domUtil.addListener(document, virtualMouse.MOVE[e.type], self._onMove, self);
		domUtil.addListener(document, virtualMouse.UP[e.type], self._onUp, self);
	},

	_onMove: function(e) {
		if (e.touches && e.touches.length > 1) {
			return;
		}

		var self = this,
			util = G.Util,
			domUtil = G.DomUtil;

		var evt = (e.touches && e.touches.length === 1 ? e.touches[0] : e),
			dx = evt.clientX - self._startClientX,
			dy = evt.clientY - self._startClientY;

		if (!dx && !dy) {
			return;
		}

		var dLeft, dDown, dRight, dUp;
		if (self._dLimit && self._dLimit.length == 4) {
			dLeft = Math.min(self._dLimit[0], 0); // -
			dDown = Math.max(self._dLimit[1], 0); // +
			dRight = Math.max(self._dLimit[2], 0); // +
			dUp = Math.min(self._dLimit[3], 0); // -

			dx = Math.min(Math.max(dx, dLeft), dRight);
			dy = Math.min(Math.max(dy, dUp), dDown);
		}

		domUtil.stopPropagation(e);
		domUtil.preventDefault(e);

		if (!self._dragged) {
			self._dragged = true;
			self.fireEvent('dragStart');

			domUtil.addClass(document.body, 'g-dragging');
			if (G.Browser.ie) { // IE issue
				//document.body.style.cursor = 'wait';
			}
		}

		self._newX = self._startX + dx;
		self._newY = self._startY + dy;
		self._dragging = true;

		util.cancelAnimFrame(self._animRequest);
		self._animRequest = util.requestAnimFrame(self._updatePosition, true, self, self._dragStartTarget);
	},

	_updatePosition: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var element = self._element;

		domUtil.markPosTransform(element, self._newX, self._newY);
		domUtil.updateTransform(element);

		self.fireEvent('drag');
	},

	_onUp: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var virtualMouse = self.virtualMouse;

		domUtil.removeClass(document.body, 'g-dragging');

		for (var i in virtualMouse.MOVE) {
			domUtil.removeListener(document, virtualMouse.MOVE[i], self._onMove, self);
			domUtil.removeListener(document, virtualMouse.UP[i], self._onUp, self);
		}

		domUtil.enableImageDrag();
		domUtil.enableTextSelection();

		if (self._dragging) {
			self._dragging = false;
			G.Util.cancelAnimFrame(self._animRequest);
			self.fireEvent('dragEnd');
		}

	}

});
/* global G:false */
G.DomPinchable = G.Class.extend({
	mixins: [G.Event],

	init: function(element, pinchStartTarget) {
		this._element = element;
		this._pinchStartTarget = pinchStartTarget || element;
	},

	on: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var virtualMouse = self.virtualMouse;

		if (!self._enabled) {
			for (var i in virtualMouse.DOWN) {
				domUtil.addListener(self._pinchStartTarget, virtualMouse.DOWN[i], self._onDown, self);
			}

			self._enabled = true;
		}

		return self;
	},

	off: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var virtualMouse = self.virtualMouse;

		if (self._enabled) {
			for (var i in virtualMouse.DOWN) {
				domUtil.removeListener(self._pinchStartTarget, virtualMouse.DOWN[i], self._onDown, self);
			}

			self._enabled = false;
		}

		return self;
	},

	_onDown: function(e) {
		if (!e.touches || e.touches.length !== 2) {
			return;
		}

		var self = this,
			domUtil = G.DomUtil;

		if (G.DomPinchable.forbidden || self._pinching) {
			return;
		}

		domUtil.stopPropagation(e);
		domUtil.preventDefault(e);

		domUtil.disableImageDrag();
		domUtil.disableTextSelection();

		var virtualMouse = self.virtualMouse;
		domUtil.addListener(document, virtualMouse.MOVE[e.type], self._onMove, self);
		domUtil.addListener(document, virtualMouse.UP[e.type], self._onUp, self);

		domUtil.addClass(document.body, 'g-pinching');
		self._pinching = true;

		var evt1 = e.touches[0];
		var evt2 = e.touches[1];
		self.fireEvent('pinchStart', {
			originTouch1: evt1,
			originTouch2: evt2
		});
	},

	_onMove: function(e) {
		if (!e.touches || e.touches.length !== 2 || !this._pinching) {
			return;
		}

		var self = this,
			domUtil = G.DomUtil;

		domUtil.stopPropagation(e);
		domUtil.preventDefault(e);

		self._touches = e.touches;

		G.Util.cancelAnimFrame(self._animRequest);
		self._animRequest = G.Util.requestAnimFrame(self._updatePosition, true, self, self._pinchStartTarget);
	},

	_updatePosition: function() {
		var self = this;

		var touches = self._touches;
		var evt1 = touches[0];
		var evt2 = touches[1];
		self.fireEvent('pinch', {
			originTouch1: evt1,
			originTouch2: evt2
		});
	},

	_onUp: function(e) {
		var self = this;
		var domUtil = G.DomUtil;
		var virtualMouse = self.virtualMouse;

		for (var i in virtualMouse.MOVE) {
			domUtil.removeListener(document, virtualMouse.MOVE[i], self._onMove, self);
			domUtil.removeListener(document, virtualMouse.UP[i], self._onUp, self);
		}

		domUtil.stopPropagation(e);
		domUtil.preventDefault(e);

		domUtil.enableImageDrag();
		domUtil.enableTextSelection();

		var evt1 = e.touches[0];
		var evt2 = e.touches[1];
		if (self._pinching) {
			G.Util.cancelAnimFrame(self._animRequest);

			self.fireEvent('pinchEnd', {
				originTouch1: evt1,
				originTouch2: evt2
			});
		}

		domUtil.removeClass(document.body, 'g-pinching');
		self._pinching = false;
	}

});
/* global G:false */
G.ExtentUtil = {

	overlaps: function(ext1, ext2, tolerance) { // Extent: [xmin, ymin, xmax, ymax]
		if (!ext1 || !ext2) {
			return false;
		}

		var xmin1 = ext1[0],
			ymin1 = ext1[1],
			xmax1 = ext1[2],
			ymax1 = ext1[3],
			xmin2 = ext2[0],
			ymin2 = ext2[1],
			xmax2 = ext2[2],
			ymax2 = ext2[3];

		var t = tolerance || 0;

		if (xmin1 > xmax2 + t || xmax1 < xmin2 - t || ymin1 > ymax2 + t || ymax1 < ymin2 - t) {
			return false;
		}

		return true;
	},

	contains: function(ext, p, tolerance) { // Extent: [xmin, ymin, xmax, ymax]
		if (!ext || !p) {
			return false;
		}

		var xmin = ext[0],
			ymin = ext[1],
			xmax = ext[2],
			ymax = ext[3];
		var x = p[0],
			y = p[1];

		var t = tolerance || 0;
		if (x - xmax > t || xmin - x > t || y - ymax > t || ymin - y > t) {
			return false;
		}

		return true;
	},

	intersect: function(ext1, ext2) {
		var min = Math.min,
			max = Math.max;

		if (ext1 && ext2) {
			var xmin = max(ext1[0], ext2[0]);
			var ymin = max(ext1[1], ext2[1]);
			var xmax = min(ext1[2], ext2[2]);
			var ymax = min(ext1[3], ext2[3]);
			if (xmin >= xmax || ymin >= ymax) {
				return;
			} else {
				return [xmin, ymin, xmax, ymax];
			}
		} else if (!ext1 && !ext2) {
			return;
		} else {
			return ext1 ? ext1 : ext2;
		}
	},

	union: function(ext1, ext2) {
		var min = Math.min,
			max = Math.max;

		if (ext1 && ext2) {
			var xmin = min(ext1[0], ext2[0]);
			var ymin = min(ext1[1], ext2[1]);
			var xmax = max(ext1[2], ext2[2]);
			var ymax = max(ext1[3], ext2[3]);
			return [xmin, ymin, xmax, ymax];
		} else if (!ext1 && !ext2) {
			return;
		} else {
			return ext1 ? ext1 : ext2;
		}
	},

	equals: function(ext1, ext2, tolerance) { // Extent: [xmin, ymin, xmax, ymax]
		var xmin1 = ext1[0],
			ymin1 = ext1[1],
			xmax1 = ext1[2],
			ymax1 = ext1[3],
			xmin2 = ext2[0],
			ymin2 = ext2[1],
			xmax2 = ext2[2],
			ymax2 = ext2[3];

		var abs = Math.abs;
		var t = tolerance || 0;

		if (abs(xmin1 - xmin2) <= t && abs(xmax1 - xmax2) <= t && abs(ymin1 - ymin2) <= t && abs(ymax1 - ymax2) <= t) {
			return true;
		}

		return false;
	}

};
/* global G:false */
G.GeodeticUtil = {
	RADIUS: 6378137,

	/*
	 * Calculate distance between WGS84 points on the sphere surface, unit of result is meter.
	 */
	sphereDistance: function(p1, p2) {
		var cos = Math.cos,
			sin = Math.sin,
			pow = Math.pow;
		var dpr = G.MathUtil.DEGREE_PER_RADIAN;
		var lon1 = p1[0] / dpr,
			lat1 = p1[1] / dpr;
		var lon2 = p2[0] / dpr,
			lat2 = p2[1] / dpr;
		var dlon = lon2 - lon1;
		var cosDlon = cos(dlon),
			sinDlon = sin(dlon);
		var cosLat1 = cos(lat1),
			sinLat1 = sin(lat1);
		var cosLat2 = cos(lat2),
			sinLat2 = sin(lat2);
		var a1 = pow(cosLat2 * sinDlon, 2);
		var a2 = pow(cosLat1 * sinLat2 - sinLat1 * cosLat2 * cosDlon, 2);
		var a = Math.sqrt(a1 + a2);
		var b = sinLat1 * sinLat2 + cosLat1 * cosLat2 * cosDlon;
		return this.RADIUS * Math.atan2(a, b);
	}

};
/* global G:false */
G.GeomUtil = {

	/*
	 * Test the object's geometry type
	 * Return undefined | Extent | circle | Point | Polyline | Polygon | MultiPoint | MultiPolyline | MultiPolygon
	 */
	geomType: function(obj) {
		var self = this;
		var util = G.Util;
		var array;

		if (util.isArray(obj)) {
			return self._singleGeomType(obj);
		} else {
			array = obj['m'];
			if (array && util.isArray(array[0])) {
				return 'Multi' + self._singleGeomType(array[0]);
			}
		}
	},

	centroid: function(geom) {
		var self = this;
		var type = self.geomType(geom);

		var xSum = 0,
			ySum = 0,
			sum = 0;
		var i, iLen, p1, p2, dis;
		var j, jLen, part, ct, area;
		var m, mLen, mGeom;

		if (type == 'Extent') {
			return [(geom[0] + geom[2]) / 2, (geom[1] + geom[3]) / 2];
		} else if (type == 'Point' || type == 'Circle') {
			return [geom[0], geom[1]];
		} else if (type == 'Polyline') {
			for (i = 0, iLen = geom.length; i < iLen - 1; i++) {
				p1 = geom[i];
				p2 = geom[i + 1];
				dis = G.MathUtil.calcHypotenuse(p1[0] - p2[0], p1[1] - p2[1]);

				xSum += (p1[0] + p2[0]) / 2 * dis;
				ySum += (p1[1] + p2[1]) / 2 * dis;
				sum += dis;
			}

			return [xSum / sum, ySum / sum];
		} else if (type == 'Polygon') {
			for (j = 0, jLen = geom.length; j < jLen; j++) {
				part = geom[j];

				ct = self._islandCentroid(part);
				area = self._islandArea(part) * (j == 0 ? 1 : -1);

				xSum += ct[0] * area;
				ySum += ct[1] * area;
				sum += area;
			}

			return [xSum / sum, ySum / sum];
		} else if (type == 'MultiPoint') {
			for (m = 0, mLen = geom['m'].length; m < mLen; m++) {
				p1 = geom['m'][m];

				xSum += p1[0];
				ySum += p1[1];
				sum += 1;
			}

			return [xSum / sum, ySum / sum];
		} else if (type == 'MultiPolyline') {
			for (m = 0, mLen = geom['m'].length; m < mLen; m++) {
				mGeom = geom['m'][m];

				for (i = 0, iLen = mGeom.length; i < iLen - 1; i++) {
					p1 = mGeom[i];
					p2 = mGeom[i + 1];
					dis = G.MathUtil.calcHypotenuse(p1[0] - p2[0], p1[1] - p2[1]);

					xSum += (p1[0] + p2[0]) / 2 * dis;
					ySum += (p1[1] + p2[1]) / 2 * dis;
					sum += dis;
				}
			}

			return [xSum / sum, ySum / sum];
		} else if (type == 'MultiPolygon') {
			for (m = 0, mLen = geom['m'].length; m < mLen; m++) {
				mGeom = geom['m'][m];

				for (j = 0, jLen = mGeom.length; j < jLen; j++) {
					part = mGeom[j];

					ct = self._islandCentroid(part);
					area = self._islandArea(part) * (j == 0 ? 1 : -1);

					xSum += ct[0] * area;
					ySum += ct[1] * area;
					sum += area;
				}
			}

			return [xSum / sum, ySum / sum];
		}
	},

	labelPoint: function(geom) {
		var self = this;
		var type = self.geomType(geom);

		var centroid = self.centroid(geom);
		var m, mLen, mValue, mMaxValue = 0,
			mMaxIdx = 0;

		if (type == 'Extent') {
			return centroid;
		} else if (type == 'Point' || type == 'Circle') {
			return centroid;
		} else if (type == 'Polyline') {
			if (self._hitPolyline(centroid, geom)) {
				return centroid;
			} else {
				return self._nearestOfPolyline(centroid, geom);
			}
		} else if (type == 'Polygon') {
			if (self._hitPolygon(centroid, geom)) {
				return centroid;
			} else {
				return self._nearestOfPolyline(centroid, geom.length > 1 ? geom[1] : geom[0]);
			}
		} else if (type == 'MultiPoint') {
			return self._nearestOfPoints(centroid, geom['m']);
		} else if (type == 'MultiPolyline') {
			for (m = 0, mLen = geom['m'].length; m < mLen; m++) {
				mGeom = geom['m'][m];
				mValue = self._polylineLength(mGeom);
				if (mValue > mMaxValue) {
					mMaxIdx = m;
					mMaxValue = mValue;
				}
			}

			mGeom = geom['m'][mMaxIdx];

			if (self._hitPolyline(centroid, mGeom)) {
				return centroid;
			} else {
				return self._nearestOfPolyline(centroid, mGeom);
			}
		} else if (type == 'MultiPolygon') {
			for (m = 0, mLen = geom['m'].length; m < mLen; m++) {
				mGeom = geom['m'][m];
				mValue = self._polygonArea(mGeom);
				if (mValue > mMaxValue) {
					mMaxIdx = m;
					mMaxValue = mValue;
				}
			}

			mGeom = geom['m'][mMaxIdx];

			if (self._hitPolygon(centroid, mGeom)) {
				return centroid;
			} else {
				return self._nearestOfPolyline(centroid, mGeom.length > 1 ? mGeom[1] : mGeom[0]);
			}
		}
	},

	_singleGeomType: function(array) {
		var util = G.Util;

		if (!util.isArray(array[0])) {
			if (array.length == 4) {
				return 'Extent';
			} else if (array.length == 3) {
				return 'Circle';
			} else if (array.length == 2) {
				return 'Point';
			}
		} else {
			if (!util.isArray(array[0][0])) {
				return 'Polyline';
			} else {
				return 'Polygon';
			}
		}
	},

	/*
	 * Return middle point of two points
	 */
	_middlePoint: function(p1, p2) {
		var x = (p1[0] + p2[0]) / 2;
		var y = (p1[1] + p2[1]) / 2;

		return [x, y];
	},

	/*
	 * Return closest point in line to a point
	 */
	_closestToPoint: function(p, p1, p2) {
		var x = p1[0],
			y = p1[1];
		var dx = p2[0] - x,
			dy = p2[1] - y;
		var sqr = dx * dx + dy * dy;
		var delta;

		if (sqr > 0) {
			delta = ((p[0] - x) * dx + (p[1] - y) * dy) / sqr;

			if (delta > 1) {
				x = p2[0];
				y = p2[1];
			} else if (delta > 0) {
				x += dx * delta;
				y += dy * delta;
			} // When delta<=0, return p1
		}

		return [x, y];
	},

	_nearestOfPoints: function(pt, points) {
		var self = this;
		var p, nearestP;
		var minSqrDis = Number.MAX_VALUE;

		for (var i = 0, len = points.length; i < len; i++) {
			p = points[i];
			sqrDis = self._sqrDist(pt, p);
			if (sqrDis < minSqrDis) {
				nearestP = p;
				minSqrDis = sqrDis;
			}
		}

		return nearestP || points[0];
	},

	_nearestOfPolyline: function(pt, geom) {
		var self = this;
		var p1, p2, nearestPair;
		var minSqrDis = Number.MAX_VALUE;

		for (var i = 0, len = geom.length - 1; i < len; i++) {
			p1 = geom[i];
			p2 = geom[i + 1];
			sqrDis = self._sqrDistToPoint(pt, p1, p2);
			if (sqrDis < minSqrDis) {
				nearestPair = [p1, p2];
				minSqrDis = sqrDis;
			}
		}

		if (nearestPair) {
			return self._closestToPoint(pt, nearestPair[0], nearestPair[1]);
		} else {
			return geom[0];
		}
	},

	_sqrDist: function(p1, p2) {
		var dx = p1[0] - p2[0],
			dy = p1[1] - p2[1];
		return dx * dx + dy * dy;
	},

	/*
	 * Return the distance's square
	 */
	_sqrDistToPoint: function(p, p1, p2) {
		var self = this;
		var closest = self._closestToPoint(p, p1, p2);
		return self._sqrDist(p, closest);
	},

	/*
	 * Length of polyline
	 */
	_polylineLength: function(polyline) {
		var self = this;
		var p1, p2;
		var i,
			iLen = polyline.length;

		var length = 0;

		if (iLen < 2) {
			return 0;
		}

		for (i = 0; i < iLen - 1; i++) {
			p1 = polyline[i];
			p2 = polyline[i + 1];
			length += Math.pow(self._sqrDist(p1, p2), 0.5);
		}

		return length;
	},

	_polygonArea: function(polygon) {
		var self = this;
		var j, jLen, part, area = 0;

		for (j = 0, jLen = polygon.length; j < jLen; j++) {
			part = polygon[j];

			area += self._islandArea(part) * (j == 0 ? 1 : -1);
		}

		return area;
	},

	_hitPolyline: function(pt, geom, maxDis) {
		var self = this;
		var p1, p2, sqrDis;

		var maxSqrDis = (maxDis || 0) * (maxDis || 0);

		for (var i = 0, len = geom.length - 1; i < len; i++) {
			p1 = geom[i];
			p2 = geom[i + 1];
			sqrDis = self._sqrDistToPoint(pt, p1, p2);
			if (sqrDis <= maxSqrDis) {
				return true;
			}
		}

		return false;
	},

	_hitPolygon: function(pt, geom) {
		var hit = false;

		var i, j, part, p1, p2;
		for (i = 0, iLen = geom.length; i < iLen; i++) {
			part = geom[i];

			for (j = 0, jLen = part.length; j < jLen; j++) {
				p1 = part[j];
				if (p1[0] === pt[0] && p1[1] === pt[1]) {
					return true;
				}

				p2 = (j === jLen - 1) ? part[0] : part[j + 1];

				if (((p1[1] > pt[1]) !== (p2[1] > pt[1])) &&
					(pt[0] < (p2[0] - p1[0]) * (pt[1] - p1[1]) / (p2[1] - p1[1]) + p1[0])) {
					hit = !hit;
				}
			}
		}

		return hit;
	},

	/*
	 * Centroid of island without hole
	 */
	_islandCentroid: function(island) {
		var self = this;

		var xSum = 0,
			ySum = 0,
			sum = 0;

		var i, iLen, pt;
		for (i = 0, iLen = island.length; i < iLen; i++) {
			pt = island[i];
			xSum += pt[0];
			ySum += pt[1];
			sum++;
		}

		return [xSum / sum, ySum / sum];
	},

	/*
	 * Area of island without hole
	 */
	_islandArea: function(island) {
		var self = this;
		var p1, p2;
		var i,
			iLen = island.length;

		var area = 0;

		if (iLen < 3) {
			return 0;
		}

		for (i = 0; i < iLen - 1; i++) {
			p1 = island[i];
			p2 = island[i + 1];
			area += self._vectorArea(p1, p2);
		}
		area += self._vectorArea(island[iLen - 1], island[0]);

		return Math.abs(area);
	},

	_vectorArea: function(p1, p2) { // May be negative value
		var mathUtil = G.MathUtil;
		var α = mathUtil.calcTheta(p1[0], p1[1]) - G.MathUtil.calcTheta(p2[0], p2[1]);
		var d1 = mathUtil.calcHypotenuse(p1[0], p1[1]);
		var d2 = mathUtil.calcHypotenuse(p2[0], p2[1]);
		return d1 * d2 * Math.sin(α) / 2;
	}

};
/* global G:false */
G.Graphic = G.Class.extend({
	mixins: [G.Event],

	options: {
		clickable: false, // 是否可点击
		allowPan: false, // 当clickable为true时，是否允许地图拖动
		vertexSize: 16,
		vertexShape: 'circle', // circle | rect
		vertexColor: '#fff',
		vertexOutlineWidth: 2,
		vertexDashArray: [6, 2], // [10, 5 ...]
		vertexFillColor: '#ff0',
		lineHighlightColor: '#0ff',
		lineHighlightWiden: 2
	},

	addTo: function(layer, id, noRedraw) { // 可指定该Graphic的ID
		var self = this;
		var same;
		var style;

		if (!(layer instanceof G.Layer.Graphic)) { // Graphic must be added to Graphic Layer
			return;
		}

		if (self._layer) { // Graphic has already been added to one layer
			return self._layer === layer ? layer : null;
		}
		self._layer = layer;

		if (id) { // Graphic with appointed id should check if it exists already
			same = layer._graphics[id];
			if (same) {
				return same;
			}
		}

		self._id = id ? id : (layer._idSeq++);
		self._index = layer._indexSeq++;
		self._addAt = +new Date();
		layer._graphics[self._id] = self;
		layer._tree.insert(self.bbox, self); // Spatial index

		layer.addListener('update', self._onUpdate, self);

		style = layer._calcStyle(self);
		G.Util.merge(self.options, style);

		var map = layer._map;
		if (map) {
			map.addListener('viewChanged', self._onViewChanged, self);
			map.addListener('zoomStart', self._onZoomStart, self);
			map.addListener('zoomUpdate', self._onZoomUpdate, self);
			map.addListener('zoomEnd', self._onZoomEnd, self);
		}

		self._onAdded();

		if (map && !noRedraw) {
			map._requestRedraw();
		}

		if (!self._isVertex) {
			layer.fireEvent('graphicAdded', {
				'graphic': self
			});
		}

		return self;
	},

	remove: function(noRedraw) {
		var self = this;
		var layer = self._layer;

		if (!layer) {
			return;
		}

		self.endEdit(); // May be in edit status

		layer.removeListener('update', self._onUpdate, self);
		layer._tree.remove(self.bbox, self); // Spatial index

		self._onRemoved();

		delete layer._graphics[self._id];
		delete self._id;
		delete self._layer; // Must after _onRemoved()

		var map = layer._map;
		if (map) {
			map.removeListener('viewChanged', self._onViewChanged, self);
			map.removeListener('zoomStart', self._onZoomStart, self);
			map.removeListener('zoomUpdate', self._onZoomUpdate, self);
			map.removeListener('zoomEnd', self._onZoomEnd, self);

			if (!noRedraw) {
				map._requestRedraw();
			}
		}

		if (!self._isVertex) {
			layer.fireEvent('graphicRemoved', {
				'graphic': self
			});
		}

		return self;
	},

	id: function() {
		return this._id;
	},

	updateOptions: function(options, forbidRedraw) {
		var self = this;
		var layer = self._layer;
		var map;

		if (options) {
			G.Util.merge(self.options, options);
		}

		self._updateStyles();

		if (layer) {
			if (!forbidRedraw) {
				map = layer._map;
				if (map) {
					map._requestRedraw();
				}
			}

			if (!self._isVertex) {
				layer.fireEvent('graphicOptionsUpdated', {
					'graphic': self
				});
			}
		}

		return self;
	},

	updateGeom: function(geom, forbidRedraw) {
		var self = this;
		var layer = self._layer;
		var map;

		// 必须在更新geom之前移除空间索引，因为空间索引使用geom的bbox进行检索，更新geom后无法移除原有索引
		if (layer) {
			layer._tree.remove(self.bbox, self);
		}

		self._updateGeom(geom);

		if (layer) {
			layer._tree.insert(self.bbox, self);

			if (!forbidRedraw) {
				map = layer._map;
				if (map) {
					map._requestRedraw();
				}
			}

			if (!self._isVertex) {
				layer.fireEvent('graphicGeomUpdated', {
					'graphic': self
				});
			}
		}

		return self;
	},

	updateAttrs: function(attrs, forbidRedraw) {
		var self = this;
		var layer = self._layer;
		var style;

		if (attrs) {
			G.Util.merge(self.attrs, attrs);
		}

		if (layer) {
			style = layer._calcStyle(self);
			if (style) { // 如有style和attrs挂钩的，需要更新图形选项并更新
				self.updateOptions(style, forbidRedraw);
			}

			if (!self._isVertex) {
				layer.fireEvent('graphicAttrUpdated', {
					'graphic': self
				});
			}
		}

		return self;
	},

	bringToTop: function() {
		var self = this;

		var layer = self._layer;
		if (!layer) {
			return self;
		}
		self._index = layer._indexSeq++;

		var map = layer._map;
		if (!map) {
			return self;
		}

		var i, vertex;
		var parent, dom;
		var browser = G.Browser;

		if (map._mode == 'canvas' || map._mode == 'webgl') {
			map._requestRedraw();
		} else if (map._mode == 'svg' && !browser.ie) { // 除IE外SVG模式下需要重新appendChild对象，这种方法IE下会丢失事件监听
			dom = self._dom;
			if (dom) {
				parent = dom.parentNode;
				if (parent) {
					parent.appendChild(dom);
				}
			}
		} else if ((map._mode == 'svg' || map._mode == 'vml') && browser.ie) { // IE的SVG和VML模式下需要重新调整z-index值，注意dom对象的position必须是absolute
			dom = self._dom;
			if (dom) {
				G.DomUtil.setZIndex(dom, self._index);
			}
		}

		for (i in self._vertexes) {
			vertex = self._vertexes[i];
			vertex.bringToTop();
		}

		for (i in self._midvertexes) {
			vertex = self._midvertexes[i];
			vertex.bringToTop();
		}

		if (!self._isVertex) {
			layer.fireEvent('graphicToTop', {
				'graphic': self
			});
		}

		return self;
	},

	startEdit: function(options) {
		var self = this;
		var layer = self._layer;

		G.Util.merge(self.options, options);

		if (!self._editing && !self._isVertex) {
			self._editing = true;
			self._onStartEdit();

			if (layer) {
				layer.fireEvent('graphicStartEdit', {
					'graphic': self
				});
			}
		}

		return self;
	},

	endEdit: function() {
		var self = this;
		var layer = self._layer;

		if (self._editing && !self._isVertex) {
			self._onEndEdit();
			self._editing = false;

			if (layer) {
				layer.fireEvent('graphicEndEdit', {
					'graphic': self
				});

				var map = layer._map;
				if (map) {
					G.DomUtil.removeClass(map._layersFrame, 'g-edit');
				}
			}
		}

		return self;
	},

	isEditing: function() {
		return !!this._editing;
	},

	_updateBbox: function(bbox) {
		var self = this;
		var layer = self._layer;

		// 必须在更新geom之前移除空间索引，因为空间索引使用geom的bbox进行检索，更新geom后无法移除原有索引
		if (layer) {
			layer._tree.remove(self.bbox, self);

			self.bbox = bbox;

			layer._tree.insert(self.bbox, self);
		}
	},

	_hitPoint: function(p, res, rotate, tol) {
		var self = this;

		var hit = self._hitPointNowrap(p, res, rotate, tol);
		if (hit) {
			return true;
		}

		var map;
		if (self._layer && self._layer._map) {
			map = self._layer._map;
		}
		if (!hit && map && map.options.wrap) {
			var pt = [p[0], p[1]];

			var range = map._calcWrapPointRange(p);
			var maxExtent = map.options.maxExtent;
			var mapWidth = maxExtent[2] - maxExtent[0];
			for (var i = range[0]; i <= range[1]; i++) {
				pt[0] = p[0] + i * mapWidth;
				hit = self._hitPointNowrap(pt, res, rotate, tol);
				if (hit) {
					return true;
				}
			}
		}

		return false;
	},

	_searchVertex: function(mapPoint) {
		var self = this;
		var map = self._layer._map;
		var res = map._res;
		var touchTol = map.options.touchTol;
		var tol = G.Browser.touch ? touchTol : 0;

		var vertex;

		for (var i in self._vertexes) {
			vertex = self._vertexes[i];
			if (vertex._hitPoint(mapPoint, res, map._rotate, tol)) {
				return vertex;
			}
		}

		for (var i in self._midvertexes) {
			vertex = self._midvertexes[i];
			if (vertex._hitPoint(mapPoint, res, map._rotate, tol)) {
				return vertex;
			}
		}
	},

	_removeVertexes: function() {
		var self = this;
		var map = self._layer._map;

		var i, vertex;

		for (i in self._vertexes) {
			vertex = self._vertexes[i];
			vertex.remove(true);
		}
		self._vertexes = {};

		for (i in self._midvertexes) {
			vertex = self._midvertexes[i];
			vertex.remove(true);
		}
		self._midvertexes = {};

		map._requestRedraw();
	},

	_onVertexMouseOver: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			dragHandler.off();
		}

		G.DomUtil.addClass(map._layersFrame, 'g-edit');
	},

	_onVertexMouseOut: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			dragHandler.on();
		}

		G.DomUtil.removeClass(map._layersFrame, 'g-edit');
	},

	/**
	 * These methods may be overrided by sub class.
	 */
	clone: function() {},
	_draw: function() {},
	_updateStyles: function() {}, // SVG | VML
	_erase: function() { // SVG | VML
		var self = this;
		var domUtil = G.DomUtil;
		var dom = self._dom;
		if (dom && dom.parentNode) {
			dom.parentNode.removeChild(dom);
		}
	},
	_updateGeom: function(geom) {},
	_hitPointNowrap: function(p, res, rotate, tol) {},
	_onMouseOver: function() {},
	_onMouseOut: function() {},
	_onStartEdit: function() {},
	_onEndEdit: function() {},
	_onViewChanged: function(e) {}, //This method will be invoked when map's viewport changed.
	_onUpdate: function(e) {}, //This method will be invoked when layer's content should be updated.
	_onAdded: function() {}, //This method will be invoked when the layer is added to a map.
	_onRemoved: function() {}, //This method will be invoked when the layer is removed from a map.
	_onGeomUpdated: function() {},
	_onZoomStart: function(e) {},
	_onZoomUpdate: function(e) {},
	_onZoomEnd: function(e) {}


});
/* global G:false */
G.Graphic.Point = G.Graphic.extend({

	options: {
		shape: 'circle', // circle | rect | image | text
		size: [12, 12], // circle use the first value, rect/image/text use the first and second value
		offset: [0, 0], // Offset, in pixels
		image: '', // Image URL
		imageRotate: 0,
		imageGravity: true,
		text: '',
		textFont: 'Arial',
		textStyle: 'normal', // normal | italic | bold
		textAlign: 'center', // center | left | right
		outline: false,
		outlineColor: '#000',
		outlineDashArray: [], // [10, 5 ...]
		outlineWidth: 2,
		outlineOpacity: 1.0,
		fill: true,
		fillColor: '#3dc0fd',
		fillImage: '',
		fillImageSize: [24, 24],
		fillOpacity: 1.0,
		gradual: false // effective when shape is circle or rect
	},

	init: function(geom, attrs, options) { // geom's format: [x1, y1]
		var self = this;

		if (geom && geom.length > 1) {
			self._updateGeom(geom);
		}
		self.attrs = attrs || {};
		self.options = G.Util.merge({}, self.options, options);
	},

	clone: function() {
		var self = this;

		var x = self.geom[0];
		var y = self.geom[1];

		return new G.Graphic.Point([x, y], G.Util.merge({}, self.attrs), G.Util.merge({}, self.options));
	},

	_updateGeom: function(newGeom) {
		var self = this;
		var geom = newGeom || self.geom;
		var x, y;
		var xmin, xmax, ymin, ymax;

		x = geom[0];
		y = geom[1];
		xmin = xmax = x;
		ymin = ymax = y;

		self.geom = geom;
		self.bbox = [xmin, ymin, xmax, ymax];

		self._onGeomUpdated();
	},

	_hitPointNowrap: function(p, res, rotate, tol) {
		var self = this;
		var abs = Math.abs;
		var options = self.options;

		var shape = options.shape;
		var size = options.size;
		var w = size[0],
			h = size[1];

		var tolPx = tol || 0;
		var offset = options.offset;
		var outlineWidth = self._mouseOver ? options.outlineWidth + options.lineHighlightWiden : (options.outline ? options.outlineWidth : 0);
		outlineWidth += 2 * tolPx;
		var halfOutlineWidth = outlineWidth / 2;

		var imageRotate = options.imageRotate;
		if (shape === 'image' && imageRotate) {
			rotate -= imageRotate;
		}

		var x = p[0];
		var y = p[1];

		var map;
		if (self._layer && self._layer._map) {
			map = self._layer._map;

			if (shape === 'image' && !options.imageGravity) {
				rotate -= map._rotate;
			}
		}

		var textAlign = options.textAlign;

		var geom = self.geom;
		var v = [x - geom[0], y - geom[1]];
		v = G.MathUtil.rotateVector(v, -(rotate || 0));
		var dx = v[0] / res - offset[0],
			dy = -v[1] / res - offset[1];

		if (shape === 'circle') {
			if (G.MathUtil.calcHypotenuse(dx, dy) <= w / 2 + halfOutlineWidth) {
				return true;
			}
		} else if (shape === 'rect') {
			if (abs(dx) <= w / 2 + halfOutlineWidth && abs(dy) <= h / 2 + halfOutlineWidth) {
				return true;
			}
		} else if (shape === 'image') {
			if (dx >= -tolPx && dx <= w + tolPx && dy >= -tolPx && dy <= h + tolPx) {
				return true;
			}
		} else if (shape === 'text') {
			var xmin, xmax;
			if (textAlign == 'left') {
				xmin = -tolPx;
				xmax = (self._textMeasureWidth || w) + tolPx;
			} else if (textAlign == 'right') {
				xmin = -(self._textMeasureWidth || w) - tolPx;
				xmax = tolPx;
			} else { // center
				xmin = -(self._textMeasureWidth || w) / 2 - tolPx;
				xmax = -xmin;
			}

			if (dx >= xmin && dx <= xmax && abs(dy) <= w / 2 + tolPx) {
				return true;
			}
		}

		return false;
	},

	_refreshVertexes: function() {
		var graphic = this;
		var geom = graphic.geom;
		var ptCount = geom.length;
		var map = graphic._layer._map;
		var options = graphic.options;

		graphic._removeVertexes();

		var vertex = graphic._vertexes[0] = new G.Graphic.Point(geom, null, {
			shape: options.vertexShape,
			size: [options.vertexSize, options.vertexSize],
			outline: true,
			outlineColor: options.vertexColor,
			outlineDashArray: options.vertexDashArray,
			outlineWidth: options.vertexOutlineWidth,
			outlineOpacity: 1.0,
			fill: true,
			fillColor: options.vertexFillColor,
			fillOpacity: 1.0,
			clickable: true
		});
		vertex._isVertex = true; // 标识为vertex，不会触发graphicClicked等事件
		vertex._idVertex = 0;
		vertex._graphic = graphic;
		vertex.addTo(graphic._layer);

		map._requestRedraw();
	},

	_onVertexDragStart: function(e) {
		var self = this;
		var map = self._layer._map;
		var mapPoint = [e.mapX, e.mapY];
		var virtualMouse = self.virtualMouse;
		var domUtil = G.DomUtil;

		var vertex = self._searchVertex(mapPoint);
		if (vertex) {
			var clickHandler = map._handlers.Click;
			if (clickHandler) {
				clickHandler.off();
			}

			var pt = [vertex.geom[0], vertex.geom[1]];

			var wrapOffset = [0, 0];
			if (map.options.wrap) {
				var real = map._calcRealCoords(mapPoint);
				wrapOffset[0] = real[0] - mapPoint[0];
				wrapOffset[1] = real[1] - mapPoint[1];

				pt = [real[0] + wrapOffset[0], real[1] + wrapOffset[1]];
			}

			self._drag = {
				'vertex': vertex,
				'wrapOffset': wrapOffset,
				'startAt': +new Date()
			};

			domUtil.stopPropagation(e);
			domUtil.preventDefault(e);

			map._handlers.Drag.off();

			map.addListener(virtualMouse.MOVE[e.type], self._onVertexDrag, self);
			map.addListener(virtualMouse.UP[e.type], self._onVertexDragEnd, self);
		}
	},

	_onVertexDrag: function(e) {
		var self = this;
		var map = self._layer._map;

		var drag = self._drag;
		var vertex, pt;

		if (drag) {
			vertex = drag.vertex;

			if (vertex) {
				wrapOffset = drag.wrapOffset || [0, 0];

				var real = map._calcRealCoords([e.mapX, e.mapY]);
				pt = [real[0] + wrapOffset[0], real[1] + wrapOffset[1]];

				self.geom = vertex.geom = pt;
				self.updateGeom();
				vertex.updateGeom();
			}
		}
	},

	_onVertexDragEnd: function(e) {
		var self = this;
		var map = self._layer._map;
		var virtualMouse = self.virtualMouse;
		var domUtil = G.DomUtil;

		var clickHandler = map._handlers.Click;
		if (clickHandler) {
			clickHandler.on();
		}

		var drag = self._drag;
		var vertex;
		if (drag) {
			domUtil.stopPropagation(e);
			domUtil.preventDefault(e);

			map._handlers.Drag.on();

			vertex = drag.vertex;
			if (vertex) {
				vertex.updateGeom(); // 更新节点空间索引
			}
		}

		map.removeListener(virtualMouse.MOVE[e.type], self._onVertexDrag, self);
		map.removeListener(virtualMouse.UP[e.type], self._onVertexDragEnd, self);

		self._drag = null;
	}


});
/* global G:false */
G.Graphic.Polyline = G.Graphic.extend({

	options: {
		lineColor: '#ff941b',
		lineDashArray: [], // [10, 5, ...]
		lineCap: 'butt', // butt | square | round
		lineJoin: 'round', //miter | round | bevel
		lineWidth: 4,
		lineOpacity: 1.0
	},

	init: function(geom, attrs, options) { // geom's format: [[x1, y1],...]
		var self = this;

		if (geom && geom.length > 0) {
			self._updateGeom(geom);
		}

		self.attrs = attrs || {};
		self.options = G.Util.merge({}, self.options, options);
	},

	clone: function() {
		var self = this;

		var geom = self.geom;
		var newGeom = [];

		for (var i = 0; i < geom.length; i++) {
			pt = geom[i];

			newGeom[i] = [pt[0], pt[1]];
		}

		return new G.Graphic.Polyline(newGeom, G.Util.merge({}, self.attrs), G.Util.merge({}, self.options));
	},

	_updateGeom: function(newGeom) {
		var self = this;
		var geom = newGeom || self.geom;
		var pt, x, y;
		var xmin, xmax, ymin, ymax;
		for (var i = 0, len = geom.length; i < len; i++) {
			pt = geom[i];
			x = pt[0];
			y = pt[1];
			xmin = (xmin === undefined) ? x : Math.min(xmin, x);
			xmax = (xmax === undefined) ? x : Math.max(xmax, x);
			ymin = (ymin === undefined) ? y : Math.min(ymin, y);
			ymax = (ymax === undefined) ? y : Math.max(ymax, y);
		}

		self.geom = geom;
		self.bbox = [xmin, ymin, xmax, ymax];

		self._onGeomUpdated();
	},

	_hitPointNowrap: function(p, res, rotate, tol) {
		var self = this;
		var options = self.options;

		var lineWidth = self._mouseOver ? options.lineWidth + options.lineHighlightWiden : options.lineWidth;
		var halfWidth = lineWidth / 2 + (tol || 0);
		var maxDis = halfWidth * res;

		return G.GeomUtil._hitPolyline(p, self.geom, maxDis);
	},

	_refreshVertexes: function() {
		var graphic = this;
		var geom = graphic.geom;
		var ptCount = geom.length;
		var map = graphic._layer._map;
		var options = graphic.options;

		graphic._removeVertexes();

		var i, vertex, pt;
		for (i = 0; i < ptCount; i++) {
			vertex = graphic._vertexes[i] = new G.Graphic.Point(geom[i], null, {
				shape: options.vertexShape,
				size: [options.vertexSize, options.vertexSize],
				outline: true,
				outlineColor: options.vertexColor,
				outlineDashArray: options.vertexDashArray,
				outlineWidth: options.vertexOutlineWidth,
				outlineOpacity: 1.0,
				fill: true,
				fillColor: options.vertexFillColor,
				fillOpacity: 1.0,
				clickable: true
			});
			vertex._isVertex = true; // 标识为vertex，不会触发graphicClicked等事件
			vertex._idVertex = i;
			vertex._graphic = graphic;
			vertex.addTo(graphic._layer);

			if (i > 0) {
				pt = G.GeomUtil._middlePoint(geom[i - 1], geom[i]);
				vertex = graphic._midvertexes[i] = new G.Graphic.Point(pt, null, {
					shape: options.vertexShape,
					size: [options.vertexSize, options.vertexSize],
					outline: true,
					outlineColor: options.vertexColor,
					outlineDashArray: options.vertexDashArray,
					outlineWidth: options.vertexOutlineWidth,
					outlineOpacity: 1.0,
					fill: false,
					clickable: true
				});
				vertex._isVertex = true; // 标识为vertex，不会触发graphicClicked等事件
				vertex._idVertex = i;
				vertex._isMid = true;
				vertex._graphic = graphic;
				vertex.addTo(graphic._layer);
			}
		}

		map._requestRedraw();
	},

	_onVertexDragStart: function(e) {
		var self = this;
		var map = self._layer._map;
		var mapPoint = [e.mapX, e.mapY];
		var virtualMouse = self.virtualMouse;
		var domUtil = G.DomUtil;

		var vertex = self._searchVertex(mapPoint);
		if (vertex) {
			var clickHandler = map._handlers.Click;
			if (clickHandler) {
				clickHandler.off();
			}

			var pt = [vertex.geom[0], vertex.geom[1]];
			var id = vertex._idVertex;

			if (vertex._isMid) {
				var geom = self.geom.slice(0, id);
				geom = geom.concat([pt]);
				geom = geom.concat(self.geom.slice(id));
				self.geom = geom;

				self._refreshVertexes();
				vertex = self._searchVertex(mapPoint); // 刷新节点后需要重新检索编辑节点
			}

			self._drag = {
				'vertex': vertex,
				'startAt': +new Date()
			};

			domUtil.stopPropagation(e);
			domUtil.preventDefault(e);

			map._handlers.Drag.off();

			map.addListener(virtualMouse.MOVE[e.type], self._onVertexDrag, self);
			map.addListener(virtualMouse.UP[e.type], self._onVertexDragEnd, self);
		}
	},

	_onVertexDrag: function(e) {
		var self = this;
		var map = self._layer._map;

		var drag = self._drag;
		var vertex, pt, id, midvertex, mid;

		if (drag) {
			vertex = drag.vertex;

			if (vertex) {
				pt = [e.mapX, e.mapY]

				id = vertex._idVertex;
				self.geom[id] = vertex.geom = pt;
				self.updateGeom();
				vertex.updateGeom();

				for (mid = id; mid <= id + 1; mid++) {
					midvertex = self._midvertexes[mid];
					if (midvertex) {
						midvertex.geom = G.GeomUtil._middlePoint(self.geom[mid - 1], self.geom[mid]);
						midvertex.updateGeom();
					}
				}
			}
		}
	},

	_onVertexDragEnd: function(e) {
		var self = this;
		var map = self._layer._map;
		var virtualMouse = self.virtualMouse;
		var domUtil = G.DomUtil;

		var clickHandler = map._handlers.Click;
		if (clickHandler) {
			clickHandler.on();
		}

		var drag = self._drag;
		var vertex, deltaTime, id;
		if (drag) {
			domUtil.stopPropagation(e);
			domUtil.preventDefault(e);

			map._handlers.Drag.on();

			vertex = drag.vertex;
			if (vertex) {
				id = vertex._idVertex;
				deltaTime = +new Date() - drag['startAt'];
				if (deltaTime < 200 && !vertex._isMid && self.geom.length > 2) { // 在节点上点击删除
					var geom = self.geom.slice(0, id);
					geom = geom.concat(self.geom.slice(id + 1));
					self.geom = geom;
					self.updateGeom();

					self._refreshVertexes();
				} else {
					vertex.updateGeom(); // 更新节点空间索引
				}
			}
		}

		map.removeListener(virtualMouse.MOVE[e.type], self._onVertexDrag, self);
		map.removeListener(virtualMouse.UP[e.type], self._onVertexDragEnd, self);

		self._drag = null;
	}


});
/* global G:false */
G.Graphic.Polygon = G.Graphic.extend({

	options: {
		outline: true,
		outlineColor: '#ff2e6c',
		outlineDashArray: [], // [10, 5, ...]
		outlineCap: 'round', // butt | square | round
		outlineJoin: 'round', //miter | round | bevel
		outlineWidth: 2,
		outlineOpacity: 1.0,
		fill: true,
		fillColor: '#000',
		fillImage: '',
		fillImageSize: [24, 24],
		fillOpacity: 0.6
	},

	init: function(geom, attrs, options) { // geom's format: [[[x1, y1],...]]
		var self = this;

		if (geom && geom.length > 0) {
			self._updateGeom(geom);
		}
		self.attrs = attrs || {};
		self.options = G.Util.merge({}, self.options, options);
	},

	clone: function() {
		var self = this;

		var geom = self.geom;
		var newGeom = [];

		for (var i = 0, iLen = geom.length; i < iLen; i++) {
			part = geom[i];
			newGeom[i] = newGeom[i] || [];

			for (var j = 0, jLen = part.length; j < jLen; j++) {
				pt = part[j];

				newGeom[i][j] = [pt[0], pt[1]];
			}
		}

		return new G.Graphic.Polygon(newGeom, G.Util.merge({}, self.attrs), G.Util.merge({}, self.options));
	},

	_updateGeom: function(newGeom) {
		var self = this;
		var geom = newGeom || self.geom;
		var island = geom[0];
		var pt, x, y;
		var xmin, xmax, ymin, ymax;
		for (var i = 0, len = island.length; i < len; i++) {
			pt = island[i];
			x = pt[0];
			y = pt[1];
			xmin = (xmin === undefined) ? x : Math.min(xmin, x);
			xmax = (xmax === undefined) ? x : Math.max(xmax, x);
			ymin = (ymin === undefined) ? y : Math.min(ymin, y);
			ymax = (ymax === undefined) ? y : Math.max(ymax, y);
		}

		self.geom = geom;
		self.bbox = [xmin, ymin, xmax, ymax];

		self._onGeomUpdated();
	},

	_hitPointNowrap: function(p, res, rotate, tol) {
		var self = this;
		var options = self.options;

		var x = p[0];
		var y = p[1];

		var pt = [x, y];

		var tolPx = tol || 0;
		var outlineWidth = self._mouseOver ? options.outlineWidth + options.lineHighlightWiden : (options.outline ? options.outlineWidth : 0);
		outlineWidth += 2 * tolPx;
		var outlineMapWidth = outlineWidth * res;
		var halfOutlineMapWidth = outlineMapWidth / 2;
		var bbox;
		if (self.bbox) {
			bbox = [self.bbox[0] - halfOutlineMapWidth, self.bbox[1] - halfOutlineMapWidth, //
				self.bbox[2] + halfOutlineMapWidth, self.bbox[3] + halfOutlineMapWidth
			];

			if (!G.ExtentUtil.contains(bbox, pt)) {
				return false;
			}
		}

		var geom = self.geom;
		var i, iLen, j, jLen;
		var part, part2, boundary, boundary2;
		var lineHitMethod = G.Graphic.Polyline.prototype._hitPointNowrap;

		// Check inside
		if (G.GeomUtil._hitPolygon(pt, geom)) {
			return true;
		}

		// Check boundary
		if (options.outline || self._mouseOver) {
			for (i = 0, iLen = geom.length; i < iLen; i++) {
				part = geom[i];
				part2 = [part[part.length - 1], part[0]];

				boundary = {
					geom: part,
					options: {
						lineWidth: outlineWidth
					}
				};

				boundary2 = {
					geom: part2,
					options: {
						lineWidth: outlineWidth
					}
				};

				if (lineHitMethod.call(boundary, pt, res) || lineHitMethod.call(boundary2, pt, res)) {
					return true;
				}
			}
		}

		return false;
	},

	_refreshVertexes: function() {
		var graphic = this;
		var geom = graphic.geom;
		var ptCount = geom.length;
		var map = graphic._layer._map;
		var options = graphic.options;

		graphic._removeVertexes();

		var i, iLen, j, jLen;
		var part, vertex, pt;
		for (i = 0, iLen = geom.length; i < iLen; i++) {
			part = geom[i];
			for (j = 0, jLen = part.length; j < jLen; j++) {
				vertex = graphic._vertexes[i + ',' + j] = new G.Graphic.Point(part[j], null, {
					shape: options.vertexShape,
					size: [options.vertexSize, options.vertexSize],
					outline: true,
					outlineColor: options.vertexColor,
					outlineDashArray: options.vertexDashArray,
					outlineWidth: options.vertexOutlineWidth,
					outlineOpacity: 1.0,
					fill: true,
					fillColor: options.vertexFillColor,
					fillOpacity: 1.0,
					clickable: true
				});
				vertex._isVertex = true; // 标识为vertex，不会触发graphicClicked等事件
				vertex._idVertex = [i, j];
				vertex._graphic = graphic;
				vertex.addTo(graphic._layer);

				if (j == 0) {
					pt = G.GeomUtil._middlePoint(part[jLen - 1], part[0]);
				} else {
					pt = G.GeomUtil._middlePoint(part[j - 1], part[j]);
				}
				vertex = graphic._midvertexes[i + ',' + j] = new G.Graphic.Point(pt, null, {
					shape: options.vertexShape,
					size: [options.vertexSize, options.vertexSize],
					outline: true,
					outlineColor: options.vertexColor,
					outlineDashArray: options.vertexDashArray,
					outlineWidth: options.vertexOutlineWidth,
					outlineOpacity: 1.0,
					fill: false,
					clickable: true
				});
				vertex._isVertex = true; // 标识为vertex，不会触发graphicClicked等事件
				vertex._idVertex = [i, j];
				vertex._isMid = true;
				vertex._graphic = graphic;
				vertex.addTo(graphic._layer);
			}
		}

		map._requestRedraw();
	},

	_onVertexDragStart: function(e) {
		var self = this;
		var map = self._layer._map;
		var mapPoint = [e.mapX, e.mapY];
		var virtualMouse = self.virtualMouse;
		var domUtil = G.DomUtil;

		var vertex = self._searchVertex(mapPoint);
		if (vertex) {
			var clickHandler = map._handlers.Click;
			if (clickHandler) {
				clickHandler.off();
			}

			var pt = [vertex.geom[0], vertex.geom[1]];
			var id = vertex._idVertex;
			var i = id[0],
				j = id[1];

			if (vertex._isMid) {
				var geom = self.geom[i].slice(0, j);
				geom = geom.concat([pt]);
				geom = geom.concat(self.geom[i].slice(j));
				self.geom[i] = geom;

				self._refreshVertexes();
				vertex = self._searchVertex(mapPoint); // 刷新节点后需要重新检索编辑节点
			}

			self._drag = {
				'vertex': vertex,
				'startAt': +new Date()
			};

			domUtil.stopPropagation(e);
			domUtil.preventDefault(e);

			map._handlers.Drag.off();

			map.addListener(virtualMouse.MOVE[e.type], self._onVertexDrag, self);
			map.addListener(virtualMouse.UP[e.type], self._onVertexDragEnd, self);
		}
	},

	_onVertexDrag: function(e) {
		var self = this;
		var map = self._layer._map;

		var drag = self._drag;
		var vertex, pt, id, i, j, midvertex, mid, mid1, mid2;

		if (drag) {
			vertex = drag.vertex;

			if (vertex) {
				pt = [e.mapX, e.mapY];

				id = vertex._idVertex;
				i = id[0];
				j = id[1];
				self.geom[i][j] = vertex.geom = pt;
				self.updateGeom();
				vertex.updateGeom();

				for (mid = j; mid <= j + 1; mid++) {
					mid1 = (mid > 0) ? mid - 1 : self.geom[i].length - 1;
					mid2 = (mid >= self.geom[i].length) ? 0 : mid;
					midvertex = self._midvertexes[i + ',' + mid2];
					if (midvertex) {
						midvertex.geom = G.GeomUtil._middlePoint(self.geom[i][mid1], self.geom[i][mid2]);
						midvertex.updateGeom();
					}
				}
			}
		}
	},

	_onVertexDragEnd: function(e) {
		var self = this;
		var map = self._layer._map;
		var virtualMouse = self.virtualMouse;
		var domUtil = G.DomUtil;

		var clickHandler = map._handlers.Click;
		if (clickHandler) {
			clickHandler.on();
		}

		var drag = self._drag;
		var vertex, deltaTime, id, i, j;
		if (drag) {
			domUtil.stopPropagation(e);
			domUtil.preventDefault(e);

			map._handlers.Drag.on();

			vertex = drag.vertex;
			if (vertex) {
				id = vertex._idVertex;
				i = id[0];
				j = id[1];
				deltaTime = +new Date() - drag['startAt'];
				if (deltaTime < 200 && !vertex._isMid && self.geom[i].length > 3) { // 在节点上点击删除
					var geom;
					if (j == 0) {
						geom = self.geom[i].slice(1, self.geom[i].length);
					} else if (j == self.geom[i].length - 1) {
						geom = self.geom[i].slice(0, j);
					} else {
						geom = self.geom[i].slice(0, j);
						geom = geom.concat(self.geom[i].slice(j + 1));
					}
					self.geom[i] = geom;
					self.updateGeom();

					self._refreshVertexes();
				} else {
					vertex.updateGeom(); // 更新节点空间索引
				}
			}
		}

		map.removeListener(virtualMouse.MOVE[e.type], self._onVertexDrag, self);
		map.removeListener(virtualMouse.UP[e.type], self._onVertexDragEnd, self);

		self._drag = null;
	}


});
/* global G:false */
G.Graphic.MultiPoint = G.Graphic.extend({

	options: {
		shape: 'circle', // circle | rect | image | text
		size: [12, 12], // circle use the first value, rect/image/text use the first and second value
		offset: [0, 0], // Offset, in pixels
		image: '', // Image URL
		imageRotate: 0,
		imageGravity: true,
		text: '',
		textFont: 'Arial',
		textStyle: 'normal', // normal | italic | bold
		textAlign: 'center', // center | left | right
		outline: false,
		outlineColor: '#000',
		outlineDashArray: [], // [10, 5 ...]
		outlineWidth: 2,
		outlineOpacity: 1.0,
		fill: true,
		fillColor: '#3dc0fd',
		fillImage: '',
		fillImageSize: [24, 24],
		fillOpacity: 1.0,
		gradual: false // effective when shape is circle or rect
	},

	init: function(geom, attrs, options) { // geom's format: {"m": [[x1, y1], [x2, y2], [xn, yn]]}
		var self = this;

		if (geom && geom['m'] && geom['m'].length > 0) {
			self._updateGeom(geom);
		}

		self.attrs = attrs || {};
		self.options = G.Util.merge({}, self.options, options);
	},

	clone: function() {
		var self = this;
		var geom = self.geom;

		var points = geom['m'];
		var ptCount = points.length;
		var newPoints = [];

		var i, pt;
		for (i = 0; i < ptCount; i++) {
			pt = points[i];

			newPoints[i] = [pt[0], pt[1]];
		}

		return new G.Graphic.MultiPoint({
			"m": newPoints
		}, G.Util.merge({}, self.attrs), G.Util.merge({}, self.options));
	},

	_updateGeom: function(newGeom) {
		var self = this;
		var geom = newGeom || self.geom;

		var points = geom['m'];

		var pt, x, y;
		var xmin, xmax, ymin, ymax;
		for (var i = 0, len = points.length; i < len; i++) {
			pt = points[i];
			x = pt[0];
			y = pt[1];
			xmin = (xmin === undefined) ? x : Math.min(xmin, x);
			xmax = (xmax === undefined) ? x : Math.max(xmax, x);
			ymin = (ymin === undefined) ? y : Math.min(ymin, y);
			ymax = (ymax === undefined) ? y : Math.max(ymax, y);
		}

		self.geom = geom;
		self.bbox = [xmin, ymin, xmax, ymax];

		self._onGeomUpdated();
	},

	_hitPointNowrap: function(p, res, rotate, tol) {
		var self = this;
		var abs = Math.abs;
		var options = self.options;

		var shape = options.shape;
		var size = options.size;
		var w = size[0],
			h = size[1];

		var tolPx = tol || 0;
		var offset = options.offset;
		var outlineWidth = self._mouseOver ? options.outlineWidth + options.lineHighlightWiden : (options.outline ? options.outlineWidth : 0);
		outlineWidth += 2 * tolPx;
		var halfOutlineWidth = outlineWidth / 2;

		var imageRotate = options.imageRotate;
		if (shape === 'image' && imageRotate) {
			rotate -= imageRotate;
		}

		var x = p[0];
		var y = p[1];

		var map;
		if (self._layer && self._layer._map) {
			map = self._layer._map;

			if (shape === 'image' && !options.imageGravity) {
				rotate -= map._rotate;
			}
		}

		var textAlign = options.textAlign;

		var geom = self.geom;
		var points = geom['m'];

		var pt;
		for (var i = 0, len = points.length; i < len; i++) {
			pt = points[i];

			var v = [x - pt[0], y - pt[1]];
			v = G.MathUtil.rotateVector(v, -(rotate || 0));
			var dx = v[0] / res - offset[0],
				dy = -v[1] / res - offset[1];

			if (shape === 'circle') {
				if (G.MathUtil.calcHypotenuse(dx, dy) <= w / 2 + halfOutlineWidth) {
					return true;
				}
			} else if (shape === 'rect') {
				if (abs(dx) <= w / 2 + halfOutlineWidth && abs(dy) <= h / 2 + halfOutlineWidth) {
					return true;
				}
			} else if (shape === 'image') {
				if (dx >= -tolPx && dx <= w + tolPx && dy >= -tolPx && dy <= h + tolPx) {
					return true;
				}
			} else if (shape === 'text') {
				var xmin, xmax;
				if (textAlign == 'left') {
					xmin = -tolPx;
					xmax = (self._textMeasureWidth || w) + tolPx;
				} else if (textAlign == 'right') {
					xmin = -(self._textMeasureWidth || w) - tolPx;
					xmax = tolPx;
				} else { // center
					xmin = -(self._textMeasureWidth || w) / 2 - tolPx;
					xmax = -xmin;
				}

				if (dx >= xmin && dx <= xmax && abs(dy) <= w / 2 + tolPx) {
					return true;
				}
			}
		}

		return false;
	},

	_refreshVertexes: function() {
		var graphic = this;
		var geom = graphic.geom;
		var points = geom['m'];
		var ptCount = points.length;
		var map = graphic._layer._map;
		var options = graphic.options;

		graphic._removeVertexes();

		var i, vertex, pt;
		for (i = 0; i < ptCount; i++) {
			vertex = graphic._vertexes[i] = new G.Graphic.Point(points[i], null, {
				shape: options.vertexShape,
				size: [options.vertexSize, options.vertexSize],
				outline: true,
				outlineColor: options.vertexColor,
				outlineDashArray: options.vertexDashArray,
				outlineWidth: options.vertexOutlineWidth,
				outlineOpacity: 1.0,
				fill: true,
				fillColor: options.vertexFillColor,
				fillOpacity: 1.0,
				clickable: true
			});
			vertex._isVertex = true; // 标识为vertex，不会触发graphicClicked等事件
			vertex._idVertex = i;
			vertex._graphic = graphic;
			vertex.addTo(graphic._layer);
		}

		map._requestRedraw();
	},

	_onVertexDragStart: function(e) {
		var self = this;
		var map = self._layer._map;
		var mapPoint = [e.mapX, e.mapY];
		var virtualMouse = self.virtualMouse;
		var domUtil = G.DomUtil;

		var vertex = self._searchVertex(mapPoint);
		if (vertex) {
			var clickHandler = map._handlers.Click;
			if (clickHandler) {
				clickHandler.off();
			}

			var pt = [vertex.geom[0], vertex.geom[1]];

			var wrapOffset = [0, 0];
			if (map.options.wrap) {
				var real = map._calcRealCoords(mapPoint);
				wrapOffset[0] = real[0] - mapPoint[0];
				wrapOffset[1] = real[1] - mapPoint[1];

				pt = [real[0] + wrapOffset[0], real[1] + wrapOffset[1]];
			}

			self._drag = {
				'vertex': vertex,
				'wrapOffset': wrapOffset,
				'startAt': +new Date()
			};

			domUtil.stopPropagation(e);
			domUtil.preventDefault(e);

			map._handlers.Drag.off();

			map.addListener(virtualMouse.MOVE[e.type], self._onVertexDrag, self);
			map.addListener(virtualMouse.UP[e.type], self._onVertexDragEnd, self);
		}
	},

	_onVertexDrag: function(e) {
		var self = this;
		var map = self._layer._map;

		var drag = self._drag;
		var vertex, pt, id;

		if (drag) {
			vertex = drag.vertex;

			if (vertex) {
				wrapOffset = drag.wrapOffset || [0, 0];

				var real = map._calcRealCoords([e.mapX, e.mapY]);
				pt = [real[0] + wrapOffset[0], real[1] + wrapOffset[1]];

				id = vertex._idVertex;
				self.geom['m'][id] = vertex.geom = pt;
				self.updateGeom();
				vertex.updateGeom();
			}
		}
	},

	_onVertexDragEnd: function(e) {
		var self = this;
		var map = self._layer._map;
		var virtualMouse = self.virtualMouse;
		var domUtil = G.DomUtil;

		var clickHandler = map._handlers.Click;
		if (clickHandler) {
			clickHandler.on();
		}

		var drag = self._drag;
		var vertex, id;
		if (drag) {
			domUtil.stopPropagation(e);
			domUtil.preventDefault(e);

			map._handlers.Drag.on();

			vertex = drag.vertex;
			if (vertex) {
				id = vertex._idVertex;
				vertex.updateGeom(); // 更新节点空间索引
			}
		}

		map.removeListener(virtualMouse.MOVE[e.type], self._onVertexDrag, self);
		map.removeListener(virtualMouse.UP[e.type], self._onVertexDragEnd, self);

		self._drag = null;
	}


});
/* global G:false */
G.Graphic.MultiPolyline = G.Graphic.extend({

	options: {
		lineColor: '#ff941b',
		lineDashArray: [], // [10, 5, ...]
		lineCap: 'butt', // butt | square | round
		lineJoin: 'round', //miter | round | bevel
		lineWidth: 4,
		lineOpacity: 1.0
	},

	init: function(geom, attrs, options) { // geom's format: {"m": [[[x1, y1],...], [...]]}
		var self = this;

		if (geom && geom['m'] && geom['m'].length > 0) {
			self._updateGeom(geom);
		}

		self.attrs = attrs || {};
		self.options = G.Util.merge({}, self.options, options);
	},

	clone: function() {
		var self = this;
		var geom = self.geom;

		var polylines = geom['m'];
		var plCount = polylines.length;
		var newPolylines = [];

		var i, j, pl, pt;
		for (j = 0; j < plCount; j++) {
			pl = polylines[j];

			newPolylines[j] = [];
			for (i = 0; i < pl.length; i++) {
				pt = pl[i];

				newPolylines[j][i] = [pt[0], pt[1]];
			}
		}

		return new G.Graphic.MultiPolyline({
			"m": newPolylines
		}, G.Util.merge({}, self.attrs), G.Util.merge({}, self.options));
	},

	_updateGeom: function(newGeom) {
		var self = this;
		var geom = newGeom || self.geom;

		var polylines = geom['m'];

		var pl, pt, x, y;
		var xmin, xmax, ymin, ymax;
		for (var j = 0, jLen = polylines.length; j < jLen; j++) {
			pl = polylines[j];

			for (var i = 0, iLen = pl.length; i < iLen; i++) {
				pt = pl[i];

				x = pt[0];
				y = pt[1];
				xmin = (xmin === undefined) ? x : Math.min(xmin, x);
				xmax = (xmax === undefined) ? x : Math.max(xmax, x);
				ymin = (ymin === undefined) ? y : Math.min(ymin, y);
				ymax = (ymax === undefined) ? y : Math.max(ymax, y);
			}
		}

		self.geom = geom;
		self.bbox = [xmin, ymin, xmax, ymax];

		self._onGeomUpdated();
	},

	_hitPointNowrap: function(p, res, rotate, tol) {
		var self = this;
		var options = self.options;

		var lineWidth = self._mouseOver ? options.lineWidth + options.lineHighlightWiden : options.lineWidth;
		var halfWidth = lineWidth / 2 + (tol || 0);
		var maxDis = halfWidth * res;

		var polylines = self.geom['m'];

		var pl;
		for (var i = 0, iLen = polylines.length; i < iLen; i++) {
			pl = polylines[i];

			if (G.GeomUtil._hitPolyline(p, pl, maxDis)) {
				return true;
			}
		}

		return false;
	},

	_refreshVertexes: function() {
		var graphic = this;
		var geom = graphic.geom;
		var polylines = geom['m'];
		var map = graphic._layer._map;
		var options = graphic.options;

		graphic._removeVertexes();

		var i, iLen, j, jLen;
		var pl, pt, vertex;
		for (i = 0, iLen = polylines.length; i < iLen; i++) {
			pl = polylines[i];

			for (j = 0, jLen = pl.length; j < jLen; j++) {
				vertex = graphic._vertexes[i + ',' + j] = new G.Graphic.Point(pl[j], null, {
					shape: options.vertexShape,
					size: [options.vertexSize, options.vertexSize],
					outline: true,
					outlineColor: options.vertexColor,
					outlineDashArray: options.vertexDashArray,
					outlineWidth: options.vertexOutlineWidth,
					outlineOpacity: 1.0,
					fill: true,
					fillColor: options.vertexFillColor,
					fillOpacity: 1.0,
					clickable: true
				});
				vertex._isVertex = true; // 标识为vertex，不会触发graphicClicked等事件
				vertex._idVertex = [i, j];
				vertex._graphic = graphic;
				vertex.addTo(graphic._layer);

				if (j > 0) {
					pt = G.GeomUtil._middlePoint(pl[j - 1], pl[j]);
					vertex = graphic._midvertexes[i + ',' + j] = new G.Graphic.Point(pt, null, {
						shape: options.vertexShape,
						size: [options.vertexSize, options.vertexSize],
						outline: true,
						outlineColor: options.vertexColor,
						outlineDashArray: options.vertexDashArray,
						outlineWidth: options.vertexOutlineWidth,
						outlineOpacity: 1.0,
						fill: false,
						clickable: true
					});
					vertex._isVertex = true; // 标识为vertex，不会触发graphicClicked等事件
					vertex._idVertex = [i, j];
					vertex._isMid = true;
					vertex._graphic = graphic;
					vertex.addTo(graphic._layer);
				}
			}
		}

		map._requestRedraw();
	},

	_onVertexDragStart: function(e) {
		var self = this;
		var map = self._layer._map;
		var mapPoint = [e.mapX, e.mapY];
		var virtualMouse = self.virtualMouse;
		var domUtil = G.DomUtil;

		var vertex = self._searchVertex(mapPoint);
		if (vertex) {
			var clickHandler = map._handlers.Click;
			if (clickHandler) {
				clickHandler.off();
			}

			var pt = [vertex.geom[0], vertex.geom[1]];
			var id = vertex._idVertex;
			var i = id[0],
				j = id[1];

			if (vertex._isMid) {
				var geom = self.geom['m'][i].slice(0, j);
				geom = geom.concat([pt]);
				geom = geom.concat(self.geom['m'][i].slice(j));
				self.geom['m'][i] = geom;

				self._refreshVertexes();
				vertex = self._searchVertex(mapPoint); // 刷新节点后需要重新检索编辑节点
			}

			self._drag = {
				'vertex': vertex,
				'startAt': +new Date()
			};

			domUtil.stopPropagation(e);
			domUtil.preventDefault(e);

			map._handlers.Drag.off();

			map.addListener(virtualMouse.MOVE[e.type], self._onVertexDrag, self);
			map.addListener(virtualMouse.UP[e.type], self._onVertexDragEnd, self);
		}
	},

	_onVertexDrag: function(e) {
		var self = this;
		var map = self._layer._map;

		var drag = self._drag;
		var vertex, pt, id, i, j, midvertex, mid, mid1, mid2;

		if (drag) {
			vertex = drag.vertex;

			if (vertex) {
				pt = [e.mapX, e.mapY];

				id = vertex._idVertex;
				i = id[0];
				j = id[1];
				self.geom['m'][i][j] = vertex.geom = pt;
				self.updateGeom();
				vertex.updateGeom();

				for (mid = j; mid <= j + 1; mid++) {
					mid1 = (mid > 0) ? mid - 1 : self.geom['m'][i].length - 1;
					mid2 = (mid >= self.geom['m'][i].length) ? 0 : mid;
					midvertex = self._midvertexes[i + ',' + mid2];
					if (midvertex) {
						midvertex.geom = G.GeomUtil._middlePoint(self.geom['m'][i][mid1], self.geom['m'][i][mid2]);
						midvertex.updateGeom();
					}
				}
			}
		}
	},

	_onVertexDragEnd: function(e) {
		var self = this;
		var map = self._layer._map;
		var virtualMouse = self.virtualMouse;
		var domUtil = G.DomUtil;

		var clickHandler = map._handlers.Click;
		if (clickHandler) {
			clickHandler.on();
		}

		var drag = self._drag;
		var vertex, deltaTime, id, i, j;
		if (drag) {
			domUtil.stopPropagation(e);
			domUtil.preventDefault(e);

			map._handlers.Drag.on();

			vertex = drag.vertex;
			if (vertex) {
				id = vertex._idVertex;
				i = id[0];
				j = id[1];
				deltaTime = +new Date() - drag['startAt'];
				if (deltaTime < 200 && !vertex._isMid && self.geom['m'][i].length > 2) { // 在节点上点击删除
					var geom;
					if (j == 0) {
						geom = self.geom['m'][i].slice(1, self.geom['m'][i].length);
					} else if (j == self.geom['m'][i].length - 1) {
						geom = self.geom['m'][i].slice(0, j);
					} else {
						geom = self.geom['m'][i].slice(0, j);
						geom = geom.concat(self.geom['m'][i].slice(j + 1));
					}
					self.geom['m'][i] = geom;
					self.updateGeom();

					self._refreshVertexes();
				} else {
					vertex.updateGeom(); // 更新节点空间索引
				}
			}
		}

		map.removeListener(virtualMouse.MOVE[e.type], self._onVertexDrag, self);
		map.removeListener(virtualMouse.UP[e.type], self._onVertexDragEnd, self);

		self._drag = null;
	}


});
/* global G:false */
G.Graphic.MultiPolygon = G.Graphic.extend({

	options: {
		outline: true,
		outlineColor: '#ff2e6c',
		outlineDashArray: [], // [10, 5, ...]
		outlineCap: 'round', // butt | square | round
		outlineJoin: 'round', //miter | round | bevel
		outlineWidth: 2,
		outlineOpacity: 1.0,
		fill: true,
		fillColor: '#000',
		fillImage: '',
		fillImageSize: [24, 24],
		fillOpacity: 0.6
	},

	init: function(geom, attrs, options) { // geom's format: {"m": [[[[x1, y1],...]], [...]]}
		var self = this;

		if (geom && geom['m'] && geom['m'].length > 0) {
			self._updateGeom(geom);
		}

		self.attrs = attrs || {};
		self.options = G.Util.merge({}, self.options, options);
	},

	clone: function() {
		var self = this;
		var geom = self.geom;

		var polygons = geom['m'];
		var pgCount = polygons.length;
		var newPolygons = [];

		var i, j, k, pg, pt;
		var part, newPart;
		for (i = 0; i < pgCount; i++) {
			pg = polygons[i];

			newPolygons[i] = [];
			for (j = 0; j < pg.length; j++) {
				part = pg[j];

				newPolygons[i][j] = [];
				for (k = 0; k < part.length; k++) {
					pt = part[k];

					newPolygons[i][j][k] = [pt[0], pt[1]];
				}
			}
		}

		return new G.Graphic.MultiPolygon({
			"m": newPolygons
		}, G.Util.merge({}, self.attrs), G.Util.merge({}, self.options));
	},

	_updateGeom: function(newGeom) {
		var self = this;
		var geom = newGeom || self.geom;

		var polygons = geom['m'];

		var pg, island, pt, x, y;
		var xmin, xmax, ymin, ymax;

		for (var j = 0, jLen = polygons.length; j < jLen; j++) {
			pg = polygons[j];

			island = pg[0];
			for (var i = 0, iLen = island.length; i < iLen; i++) {
				pt = island[i];
				x = pt[0];
				y = pt[1];
				xmin = (xmin === undefined) ? x : Math.min(xmin, x);
				xmax = (xmax === undefined) ? x : Math.max(xmax, x);
				ymin = (ymin === undefined) ? y : Math.min(ymin, y);
				ymax = (ymax === undefined) ? y : Math.max(ymax, y);
			}
		}

		self.geom = geom;
		self.bbox = [xmin, ymin, xmax, ymax];

		self._onGeomUpdated();
	},

	_hitPointNowrap: function(p, res, rotate, tol) {
		var self = this;
		var options = self.options;

		var x = p[0];
		var y = p[1];

		var pt = [x, y];

		var tolPx = tol || 0;
		var outlineWidth = self._mouseOver ? options.outlineWidth + options.lineHighlightWiden : (options.outline ? options.outlineWidth : 0);
		outlineWidth += 2 * tolPx;
		var outlineMapWidth = outlineWidth * res;
		var halfOutlineMapWidth = outlineMapWidth / 2;
		var bbox;
		if (self.bbox) {
			bbox = [self.bbox[0] - halfOutlineMapWidth, self.bbox[1] - halfOutlineMapWidth, //
				self.bbox[2] + halfOutlineMapWidth, self.bbox[3] + halfOutlineMapWidth
			];

			if (!G.ExtentUtil.contains(bbox, pt)) {
				return false;
			}
		}

		var polygons = self.geom['m'];

		var pg;
		var m, mLen, i, iLen, j, jLen;
		var part, part2, boundary, boundary2;
		var lineHitMethod = G.Graphic.Polyline.prototype._hitPointNowrap;
		for (m = 0, mLen = polygons.length; m < mLen; m++) {
			pg = polygons[m];

			// Check inside
			if (G.GeomUtil._hitPolygon(pt, pg)) {
				return true;
			}

			// Check boundary
			if (options.outline || self._mouseOver) {
				for (i = 0, iLen = pg.length; i < iLen; i++) {
					part = pg[i];
					part2 = [part[part.length - 1], part[0]];

					boundary = {
						geom: part,
						options: {
							lineWidth: outlineWidth
						}
					};

					boundary2 = {
						geom: part2,
						options: {
							lineWidth: outlineWidth
						}
					};

					if (lineHitMethod.call(boundary, pt, res) || lineHitMethod.call(boundary2, pt, res)) {
						return true;
					}
				}
			}
		}

		return false;
	},

	_refreshVertexes: function() {
		var graphic = this;
		var geom = graphic.geom;
		var polygons = geom['m'];
		var map = graphic._layer._map;
		var options = graphic.options;

		graphic._removeVertexes();

		var m, mLen, i, iLen, j, jLen;
		var pg, part, vertex, pt;
		for (m = 0, mLen = polygons.length; m < mLen; m++) {
			pg = polygons[m];

			for (i = 0, iLen = pg.length; i < iLen; i++) {
				part = pg[i];

				for (j = 0, jLen = part.length; j < jLen; j++) {
					vertex = graphic._vertexes[m + ',' + i + ',' + j] = new G.Graphic.Point(part[j], null, {
						shape: options.vertexShape,
						size: [options.vertexSize, options.vertexSize],
						outline: true,
						outlineColor: options.vertexColor,
						outlineDashArray: options.vertexDashArray,
						outlineWidth: options.vertexOutlineWidth,
						outlineOpacity: 1.0,
						fill: true,
						fillColor: options.vertexFillColor,
						fillOpacity: 1.0,
						clickable: true
					});
					vertex._isVertex = true; // 标识为vertex，不会触发graphicClicked等事件
					vertex._idVertex = [m, i, j];
					vertex._graphic = graphic;
					vertex.addTo(graphic._layer);

					if (j == 0) {
						pt = G.GeomUtil._middlePoint(part[jLen - 1], part[0]);
					} else {
						pt = G.GeomUtil._middlePoint(part[j - 1], part[j]);
					}
					vertex = graphic._midvertexes[m + ',' + i + ',' + j] = new G.Graphic.Point(pt, null, {
						shape: options.vertexShape,
						size: [options.vertexSize, options.vertexSize],
						outline: true,
						outlineColor: options.vertexColor,
						outlineDashArray: options.vertexDashArray,
						outlineWidth: options.vertexOutlineWidth,
						outlineOpacity: 1.0,
						fill: false,
						clickable: true
					});
					vertex._isVertex = true; // 标识为vertex，不会触发graphicClicked等事件
					vertex._idVertex = [m, i, j];
					vertex._isMid = true;
					vertex._graphic = graphic;
					vertex.addTo(graphic._layer);
				}
			}
		}

		map._requestRedraw();
	},

	_onVertexDragStart: function(e) {
		var self = this;
		var map = self._layer._map;
		var mapPoint = [e.mapX, e.mapY];
		var virtualMouse = self.virtualMouse;
		var domUtil = G.DomUtil;

		var vertex = self._searchVertex(mapPoint);
		if (vertex) {
			var clickHandler = map._handlers.Click;
			if (clickHandler) {
				clickHandler.off();
			}

			var pt = [vertex.geom[0], vertex.geom[1]];
			var id = vertex._idVertex;
			var m = id[0],
				i = id[1],
				j = id[2];

			if (vertex._isMid) {
				var geom = self.geom['m'][m][i].slice(0, j);
				geom = geom.concat([pt]);
				geom = geom.concat(self.geom['m'][m][i].slice(j));
				self.geom['m'][m][i] = geom;

				self._refreshVertexes();
				vertex = self._searchVertex(mapPoint); // 刷新节点后需要重新检索编辑节点
			}

			self._drag = {
				'vertex': vertex,
				'startAt': +new Date()
			};

			domUtil.stopPropagation(e);
			domUtil.preventDefault(e);

			map._handlers.Drag.off();

			map.addListener(virtualMouse.MOVE[e.type], self._onVertexDrag, self);
			map.addListener(virtualMouse.UP[e.type], self._onVertexDragEnd, self);
		}
	},

	_onVertexDrag: function(e) {
		var self = this;
		var map = self._layer._map;

		var drag = self._drag;
		var vertex, pt, id, m, i, j, midvertex, mid, mid1, mid2;

		if (drag) {
			vertex = drag.vertex;

			if (vertex) {
				pt = [e.mapX, e.mapY];

				id = vertex._idVertex;
				m = id[0];
				i = id[1];
				j = id[2];
				self.geom['m'][m][i][j] = vertex.geom = pt;
				self.updateGeom();
				vertex.updateGeom();

				for (mid = j; mid <= j + 1; mid++) {
					mid1 = (mid > 0) ? mid - 1 : self.geom['m'][m][i].length - 1;
					mid2 = (mid >= self.geom['m'][m][i].length) ? 0 : mid;
					midvertex = self._midvertexes[m + ',' + i + ',' + mid2];
					if (midvertex) {
						midvertex.geom = G.GeomUtil._middlePoint(self.geom['m'][m][i][mid1], self.geom['m'][m][i][mid2]);
						midvertex.updateGeom();
					}
				}
			}
		}
	},

	_onVertexDragEnd: function(e) {
		var self = this;
		var map = self._layer._map;
		var virtualMouse = self.virtualMouse;
		var domUtil = G.DomUtil;

		var clickHandler = map._handlers.Click;
		if (clickHandler) {
			clickHandler.on();
		}

		var drag = self._drag;
		var vertex, deltaTime, id, m, i, j;
		if (drag) {
			domUtil.stopPropagation(e);
			domUtil.preventDefault(e);

			map._handlers.Drag.on();

			vertex = drag.vertex;
			if (vertex) {
				id = vertex._idVertex;
				m = id[0];
				i = id[1];
				j = id[2];
				deltaTime = +new Date() - drag['startAt'];
				if (deltaTime < 200 && !vertex._isMid && self.geom['m'][m][i].length > 3) { // 在节点上点击删除
					var geom;
					if (j == 0) {
						geom = self.geom['m'][m][i].slice(1, self.geom['m'][m][i].length);
					} else if (j == self.geom['m'][m][i].length - 1) {
						geom = self.geom['m'][m][i].slice(0, j);
					} else {
						geom = self.geom['m'][m][i].slice(0, j);
						geom = geom.concat(self.geom['m'][m][i].slice(j + 1));
					}
					self.geom['m'][m][i] = geom;
					self.updateGeom();

					self._refreshVertexes();
				} else {
					vertex.updateGeom(); // 更新节点空间索引
				}
			}
		}

		map.removeListener(virtualMouse.MOVE[e.type], self._onVertexDrag, self);
		map.removeListener(virtualMouse.UP[e.type], self._onVertexDragEnd, self);

		self._drag = null;
	}


});
/* global G:false */
G.Graphic.Circle = G.Graphic.extend({

	options: {
		outline: true,
		outlineColor: '#fff',
		outlineDashArray: [], // [10, 5 ...]
		outlineWidth: 2,
		outlineOpacity: 1.0,
		fill: true,
		fillColor: '#000',
		fillImage: '',
		fillImageSize: [24, 24],
		fillOpacity: 0.6,
		gradual: false
	},

	init: function(geom, attrs, options) { // geom's format: [cx, cy, r]
		var self = this;

		if (geom && geom.length == 3) {
			self._updateGeom(geom);
		}
		self.attrs = attrs || {};
		self.options = G.Util.merge({}, self.options, options);
	},

	clone: function() {
		var self = this;

		var cx = self.geom[0];
		var cy = self.geom[1];
		var r = self.geom[2];
		return new G.Graphic.Circle([cx, cy, r], G.Util.merge({}, self.attrs), G.Util.merge({}, self.options));
	},

	_updateGeom: function(newGeom) {
		var self = this;
		var geom = newGeom || self.geom;
		var cx, cy, r;
		var xmin, xmax, ymin, ymax;
		cx = geom[0];
		cy = geom[1];
		r = geom[2];
		xmin = cx - r;
		xmax = cx + r;
		ymin = cy - r;
		ymax = cy + r;

		self.geom = geom;
		self.bbox = [xmin, ymin, xmax, ymax];

		self._onGeomUpdated();
	},

	_hitPointNowrap: function(p, res, rotate, tol) {
		var self = this;
		var options = self.options;

		var outlineWidth = (options.outline ? options.outlineWidth : 0) + (self._mouseOver ? options.lineHighlightWiden : 0);

		var geom = self.geom;
		var cx = geom[0];
		var cy = geom[1];
		var r = geom[2];

		var x = p[0];
		var y = p[1];

		var dx = (x - cx) / res,
			dy = -(y - cy) / res;
		var dr = r / res;

		return G.MathUtil.calcHypotenuse(dx, dy) < (dr + outlineWidth / 2 + (tol || 0));
	},

	_refreshVertexes: function() {
		var graphic = this;
		var geom = graphic.geom;
		var ptCount = geom.length;
		var map = graphic._layer._map;
		var options = graphic.options;

		graphic._removeVertexes();

		var vertex;
		var vertexOptions = {
			shape: options.vertexShape,
			size: [options.vertexSize, options.vertexSize],
			outline: true,
			outlineColor: options.vertexColor,
			outlineDashArray: options.vertexDashArray,
			outlineWidth: options.vertexOutlineWidth,
			outlineOpacity: 1.0,
			fill: true,
			fillColor: options.vertexFillColor,
			fillOpacity: 1.0,
			clickable: true
		};

		var cPoint = [geom[0], geom[1]];
		var v = [geom[2], 0];
		v = G.MathUtil.rotateVector(v, map._rotate);
		var rPoint = [geom[0] + v[0], geom[1] + v[1]];

		vertex = graphic._vertexes[0] = new G.Graphic.Point(cPoint, null, vertexOptions);
		vertex._isVertex = true; // 标识为vertex，不会触发graphicClicked等事件
		vertex._idVertex = 0;
		vertex._graphic = graphic;
		vertex.addTo(graphic._layer);

		var vertex = graphic._vertexes[1] = new G.Graphic.Point(rPoint, null, vertexOptions);
		vertex._isVertex = true; // 标识为vertex，不会触发graphicClicked等事件
		vertex._idVertex = 1;
		vertex._graphic = graphic;
		vertex.addTo(graphic._layer);

		map._requestRedraw();
	},

	_onVertexDragStart: function(e) {
		var self = this;
		var map = self._layer._map;
		var mapPoint = [e.mapX, e.mapY];
		var virtualMouse = self.virtualMouse;
		var domUtil = G.DomUtil;

		var vertex = self._searchVertex(mapPoint);
		if (vertex) {
			var clickHandler = map._handlers.Click;
			if (clickHandler) {
				clickHandler.off();
			}

			var pt = [vertex.geom[0], vertex.geom[1]];

			var wrapOffset = [0, 0];
			if (map.options.wrap) {
				var real = map._calcRealCoords(mapPoint);
				wrapOffset[0] = real[0] - mapPoint[0];
				wrapOffset[1] = real[1] - mapPoint[1];

				pt = [real[0] + wrapOffset[0], real[1] + wrapOffset[1]];
			}

			self._drag = {
				'vertex': vertex,
				'wrapOffset': wrapOffset,
				'startAt': +new Date()
			};

			domUtil.stopPropagation(e);
			domUtil.preventDefault(e);

			map._handlers.Drag.off();

			map.addListener(virtualMouse.MOVE[e.type], self._onVertexDrag, self);
			map.addListener(virtualMouse.UP[e.type], self._onVertexDragEnd, self);
		}
	},

	_onVertexDrag: function(e) {
		var self = this;
		var map = self._layer._map;

		var drag = self._drag;
		var vertex, pt, vertex2, v;

		if (drag) {
			vertex = drag.vertex;

			if (vertex) {
				wrapOffset = drag.wrapOffset || [0, 0];

				var real = map._calcRealCoords([e.mapX, e.mapY]);
				pt = [real[0] + wrapOffset[0], real[1] + wrapOffset[1]];

				vertex.updateGeom(pt);

				if (vertex._idVertex) { // 边缘点
					vertex2 = self._vertexes[0]; // 中心点

					self.geom[2] = G.MathUtil.calcDistance(vertex2.geom, pt);
				} else { // 中心点
					vertex2 = self._vertexes[1]; // 边缘点

					v = [self.geom[2], 0];
					v = G.MathUtil.rotateVector(v, map._rotate);
					vertex2.updateGeom([self.geom[0] + v[0], self.geom[1] + v[1]]);

					self.geom[0] = pt[0];
					self.geom[1] = pt[1];
				}
				self.updateGeom();
			}
		}
	},

	_onVertexDragEnd: function(e) {
		var self = this;
		var map = self._layer._map;
		var virtualMouse = self.virtualMouse;
		var domUtil = G.DomUtil;

		var clickHandler = map._handlers.Click;
		if (clickHandler) {
			clickHandler.on();
		}

		var drag = self._drag;
		var vertex;
		if (drag) {
			domUtil.stopPropagation(e);
			domUtil.preventDefault(e);

			map._handlers.Drag.on();

			vertex = drag.vertex;
			if (vertex) {
				vertex.updateGeom(); // 更新节点空间索引
			}
		}

		map.removeListener(virtualMouse.MOVE[e.type], self._onVertexDrag, self);
		map.removeListener(virtualMouse.UP[e.type], self._onVertexDragEnd, self);

		self._drag = null;
	}


});
/* global G:false */
G.Graphic.Arrow = G.Graphic.Polygon.extend({

	options: {
		headSize: 30, // 箭头斜边长
		headAngle: 30, // 箭头开角，指整个箭头处角度的一半
		neckSize: 25, // 颈处斜边长
		neckAngle: 15, // 颈处开角
		tailSize: 0, // 尾部斜边长
		tailAngle: 60, // 尾部开角
		// 下面是Polygon属性，必须保留，否则可能和继承的Polygon冲突
		outline: true,
		outlineColor: '#ff2e6c',
		outlineDashArray: [], // [10, 5, ...]
		outlineCap: 'round', // butt | square | round
		outlineJoin: 'round', //miter | round | bevel
		outlineWidth: 2,
		outlineOpacity: 1.0,
		fill: true,
		fillColor: '#000',
		fillImage: '',
		fillImageSize: [24, 24],
		fillOpacity: 0.6
	},

	init: function(geom, attrs, options) { // geom's format: [[x1, y1],...]
		var self = this;

		if (geom && geom.length > 0) {
			self._updateGeom(geom);
		}
		self.attrs = attrs || {};
		self.options = G.Util.merge({}, self.options, options);
	},

	clone: function() {
		var self = this;

		var geom = self.geom;
		var newGeom = [];

		for (var i = 0; i < geom.length; i++) {
			pt = geom[i];

			newGeom[i] = [pt[0], pt[1]];
		}

		return new G.Graphic.Arrow(newGeom, G.Util.merge({}, self.attrs), G.Util.merge({}, self.options));
	},

	_updateGeom: function(newGeom) {
		var self = this;
		var geom = newGeom || self.geom;
		var pt, x, y;
		var xmin, xmax, ymin, ymax;
		var length = 0;
		for (var i = 0, len = geom.length; i < len; i++) {
			pt = geom[i];
			x = pt[0];
			y = pt[1];
			xmin = (xmin === undefined) ? x : Math.min(xmin, x);
			xmax = (xmax === undefined) ? x : Math.max(xmax, x);
			ymin = (ymin === undefined) ? y : Math.min(ymin, y);
			ymax = (ymax === undefined) ? y : Math.max(ymax, y);

			if (i > 0) {
				length += G.MathUtil.calcDistance(geom[i], geom[i - 1]);
			}
		}

		self.length = length;

		self.geom = geom;
		self.bbox = [xmin, ymin, xmax, ymax];

		self._onGeomUpdated();
	},

	_onGeomUpdated: function() {
		var self = this;
		var layer = self._layer;
		if (!layer) {
			return;
		}

		var map = layer._map;
		if (!map) {
			return;
		}

		self._resDraw = null;
		self._updateGeomDraw(map._res);
	},

	_updateGeomDraw: function(res) { // 更新在某个分辨率下的绘图几何点，应该为一个Polygon
		var self = this;
		var options = self.options;
		var mathUtil = G.MathUtil;
		var sin = Math.sin;
		var cos = Math.cos;
		var max = Math.max;
		var min = Math.min;
		var PI = Math.PI;

		var layer = self._layer;
		if (!layer) {
			return;
		}

		if (res > 0 && self._resDraw == res) {
			return;
		}

		var geom = self.geom;
		var ptCount = geom.length;
		var lastLength = mathUtil.calcDistance(geom[ptCount - 1], geom[ptCount - 2]) / res;

		var arrowScale = lastLength > options.headSize * 2 ? 1 : lastLength / options.headSize / 2; // 防止箭头与箭头线相比太大
		var headSize = options.headSize * res * arrowScale;
		var headRadian = options.headAngle / mathUtil.DEGREE_PER_RADIAN;
		var neckSize = options.neckSize * res * arrowScale;
		var neckRadian = options.neckAngle / mathUtil.DEGREE_PER_RADIAN;
		var tailSize = options.tailSize * res;
		var tailRadian = options.tailAngle / mathUtil.DEGREE_PER_RADIAN;

		var lengthNoHead = self.length - neckSize * cos(neckRadian);
		var neckWidth = neckSize * sin(neckRadian);
		var tailWidth = tailSize * sin(tailRadian);

		var pt, x, y;
		var pts1 = [],
			pts2 = [];

		var widthDelta = neckWidth - tailWidth;
		var ptPrev, ptThis, ptNext;
		var theta, dTheta, theta1, theta2, vSrc, vDest, width, scale;
		var linearFactor = 0;
		for (var i = 0, iLen = ptCount - 1; i < iLen; i++) { // 除head外的节点
			ptThis = geom[i];
			ptNext = geom[i + 1];

			if (i == 0) { // tail
				theta = mathUtil.calcTheta(ptThis[0] - ptNext[0], ptThis[1] - ptNext[1]);
				dTheta = options.tailAngle / mathUtil.DEGREE_PER_RADIAN;

				vDest = [tailSize * cos(theta - dTheta), tailSize * sin(theta - dTheta)];
				pts1.push([ptThis[0] + vDest[0], ptThis[1] + vDest[1]]);
				vDest = [tailSize * cos(theta + dTheta), tailSize * sin(theta + dTheta)];
				pts2.push([ptThis[0] + vDest[0], ptThis[1] + vDest[1]]);
			} else {
				// 除去tail和head，确保节点有pre和next节点
				ptPrev = geom[i - 1];

				width = tailWidth + widthDelta * linearFactor;

				theta1 = mathUtil.calcTheta(ptThis[0] - ptPrev[0], ptThis[1] - ptPrev[1]);
				theta2 = mathUtil.calcTheta(ptNext[0] - ptThis[0], ptNext[1] - ptThis[1]);
				theta = (theta1 + theta2) / 2 + PI / 2;
				dTheta = (theta1 - theta2) / 2;
				scale = cos(dTheta);
				width /= (Math.abs(scale) < 0.1 ? 0.1 * (scale > 0 ? 1 : -1) : scale);

				vDest = [width * cos(theta), width * sin(theta)];
				pts1.push([ptThis[0] + vDest[0], ptThis[1] + vDest[1]]);
				vDest = [width * cos(theta + PI), width * sin(theta + PI)];
				pts2.push([ptThis[0] + vDest[0], ptThis[1] + vDest[1]]);
			}

			linearFactor += mathUtil.calcDistance(ptThis, ptNext) / lengthNoHead;
		}

		// head
		ptThis = geom[ptCount - 1];
		ptPrev = geom[ptCount - 2];

		theta = mathUtil.calcTheta(ptPrev[0] - ptThis[0], ptPrev[1] - ptThis[1]);
		dTheta = options.neckAngle / mathUtil.DEGREE_PER_RADIAN;

		vDest = [neckSize * cos(theta - dTheta), neckSize * sin(theta - dTheta)];
		pts1.push([ptThis[0] + vDest[0], ptThis[1] + vDest[1]]);
		vDest = [neckSize * cos(theta + dTheta), neckSize * sin(theta + dTheta)];
		pts2.push([ptThis[0] + vDest[0], ptThis[1] + vDest[1]]);

		dTheta = options.headAngle / mathUtil.DEGREE_PER_RADIAN;
		vDest = [headSize * cos(theta - dTheta), headSize * sin(theta - dTheta)];
		pts1.push([ptThis[0] + vDest[0], ptThis[1] + vDest[1]]);
		vDest = [headSize * cos(theta + dTheta), headSize * sin(theta + dTheta)];
		pts2.push([ptThis[0] + vDest[0], ptThis[1] + vDest[1]]);


		var pts = [];
		pts.push(geom[0]);
		pts = pts.concat(pts1);
		pts.push(geom[ptCount - 1]);
		pts = pts.concat(pts2.reverse());

		var xmin, xmax, ymin, ymax;
		for (var i = 0, len = pts.length; i < len; i++) {
			pt = pts[i];
			x = pt[0];
			y = pt[1];
			xmin = (xmin === undefined) ? x : min(xmin, x);
			xmax = (xmax === undefined) ? x : max(xmax, x);
			ymin = (ymin === undefined) ? y : min(ymin, y);
			ymax = (ymax === undefined) ? y : max(ymax, y);
		}

		self._geomDraw = [pts];
		self._resDraw = res;

		self._updateBbox([xmin, ymin, xmax, ymax]);
	},

	_hitPointNowrap: function(p, res, rotate, tol) {
		var self = this;
		var options = self.options;

		self._updateGeomDraw(res);

		var x = p[0];
		var y = p[1];

		var pt = [x, y];

		var tolPx = tol || 0;
		var outlineWidth = self._mouseOver ? options.outlineWidth + options.lineHighlightWiden : (options.outline ? options.outlineWidth : 0);
		outlineWidth += 2 * tolPx;
		var outlineMapWidth = outlineWidth * res;
		var halfOutlineMapWidth = outlineMapWidth / 2;
		var bbox;
		if (self.bbox) {
			bbox = [self.bbox[0] - halfOutlineMapWidth, self.bbox[1] - halfOutlineMapWidth, //
				self.bbox[2] + halfOutlineMapWidth, self.bbox[3] + halfOutlineMapWidth
			];

			if (!G.ExtentUtil.contains(bbox, pt)) {
				return false;
			}
		}

		var geom = self._geomDraw;
		var i, iLen, j, jLen;
		var part, part2, boundary, boundary2;
		var lineHitMethod = G.Graphic.Polyline.prototype._hitPointNowrap;

		// Check boundary first
		if (options.outline || self._mouseOver) {
			for (i = 0, iLen = geom.length; i < iLen; i++) {
				part = geom[i];
				part2 = [part[part.length - 1], part[0]];

				boundary = {
					geom: part,
					options: {
						lineWidth: outlineWidth
					}
				};

				boundary2 = {
					geom: part2,
					options: {
						lineWidth: outlineWidth
					}
				};

				if (lineHitMethod.call(boundary, pt, res) || lineHitMethod.call(boundary2, pt, res)) {
					return true;
				}
			}
		}

		// Check inside
		return G.GeomUtil._hitPolygon(pt, geom);
	},

	_refreshVertexes: function() {
		var graphic = this;
		var geom = graphic.geom;
		var ptCount = geom.length;
		var map = graphic._layer._map;
		var options = graphic.options;

		graphic._removeVertexes();

		var i, vertex, pt;
		for (i = 0; i < ptCount; i++) {
			vertex = graphic._vertexes[i] = new G.Graphic.Point(geom[i], null, {
				shape: options.vertexShape,
				size: [options.vertexSize, options.vertexSize],
				outline: true,
				outlineColor: options.vertexColor,
				outlineDashArray: options.vertexDashArray,
				outlineWidth: options.vertexOutlineWidth,
				outlineOpacity: 1.0,
				fill: true,
				fillColor: options.vertexFillColor,
				fillOpacity: 1.0,
				clickable: true
			});
			vertex._isVertex = true; // 标识为vertex，不会触发graphicClicked等事件
			vertex._idVertex = i;
			vertex._graphic = graphic;
			vertex.addTo(graphic._layer);

			if (i > 0) {
				pt = G.GeomUtil._middlePoint(geom[i - 1], geom[i]);
				vertex = graphic._midvertexes[i] = new G.Graphic.Point(pt, null, {
					shape: options.vertexShape,
					size: [options.vertexSize, options.vertexSize],
					outline: true,
					outlineColor: options.vertexColor,
					outlineDashArray: options.vertexDashArray,
					outlineWidth: options.vertexOutlineWidth,
					outlineOpacity: 1.0,
					fill: false,
					clickable: true
				});
				vertex._isVertex = true; // 标识为vertex，不会触发graphicClicked等事件
				vertex._idVertex = i;
				vertex._isMid = true;
				vertex._graphic = graphic;
				vertex.addTo(graphic._layer);
			}
		}

		map._requestRedraw();
	},

	_onVertexDragStart: function(e) {
		var self = this;
		var map = self._layer._map;
		var mapPoint = [e.mapX, e.mapY];
		var virtualMouse = self.virtualMouse;
		var domUtil = G.DomUtil;

		var vertex = self._searchVertex(mapPoint);
		if (vertex) {
			var clickHandler = map._handlers.Click;
			if (clickHandler) {
				clickHandler.off();
			}

			var pt = [vertex.geom[0], vertex.geom[1]];
			var id = vertex._idVertex;

			var wrapOffset = [0, 0];
			if (map.options.wrap) {
				var real = map._calcRealCoords(mapPoint);
				wrapOffset[0] = real[0] - mapPoint[0];
				wrapOffset[1] = real[1] - mapPoint[1];

				pt = [real[0] + wrapOffset[0], real[1] + wrapOffset[1]];
			}

			if (vertex._isMid) {
				var geom = self.geom.slice(0, id);
				geom = geom.concat([pt]);
				geom = geom.concat(self.geom.slice(id));
				self.geom = geom;

				self._refreshVertexes();
				vertex = self._searchVertex(mapPoint); // 刷新节点后需要重新检索编辑节点
			}

			self._drag = {
				'vertex': vertex,
				'wrapOffset': wrapOffset,
				'startAt': +new Date()
			};

			domUtil.stopPropagation(e);
			domUtil.preventDefault(e);

			map._handlers.Drag.off();

			map.addListener(virtualMouse.MOVE[e.type], self._onVertexDrag, self);
			map.addListener(virtualMouse.UP[e.type], self._onVertexDragEnd, self);
		}
	},

	_onVertexDrag: function(e) {
		var self = this;
		var map = self._layer._map;

		var drag = self._drag;
		var vertex, pt, id, midvertex, mid;

		if (drag) {
			vertex = drag.vertex;

			if (vertex) {
				wrapOffset = drag.wrapOffset || [0, 0];

				var real = map._calcRealCoords([e.mapX, e.mapY]);
				pt = [real[0] + wrapOffset[0], real[1] + wrapOffset[1]];

				id = vertex._idVertex;
				self.geom[id] = vertex.geom = pt;
				self.updateGeom();
				vertex.updateGeom();

				for (mid = id; mid <= id + 1; mid++) {
					midvertex = self._midvertexes[mid];
					if (midvertex) {
						midvertex.geom = G.GeomUtil._middlePoint(self.geom[mid - 1], self.geom[mid]);
						midvertex.updateGeom();
					}
				}
			}
		}
	},

	_onVertexDragEnd: function(e) {
		var self = this;
		var map = self._layer._map;
		var virtualMouse = self.virtualMouse;
		var domUtil = G.DomUtil;

		var clickHandler = map._handlers.Click;
		if (clickHandler) {
			clickHandler.on();
		}

		var drag = self._drag;
		var vertex, deltaTime, id;
		if (drag) {
			domUtil.stopPropagation(e);
			domUtil.preventDefault(e);

			map._handlers.Drag.on();

			vertex = drag.vertex;
			if (vertex) {
				id = vertex._idVertex;
				deltaTime = +new Date() - drag['startAt'];
				if (deltaTime < 200 && !vertex._isMid && self.geom.length > 2) { // 在节点上点击删除
					var geom = self.geom.slice(0, id);
					geom = geom.concat(self.geom.slice(id + 1));
					self.geom = geom;
					self.updateGeom();

					self._refreshVertexes();
				} else {
					vertex.updateGeom(); // 更新节点空间索引
				}
			}
		}

		map.removeListener(virtualMouse.MOVE[e.type], self._onVertexDrag, self);
		map.removeListener(virtualMouse.UP[e.type], self._onVertexDragEnd, self);

		self._drag = null;
	}


});
/* global G:false */
G.Graphic.Group = G.Graphic.extend({

	options: {},

	init: function(graphics, attrs, options) {
		var self = this;

		self.options = G.Util.merge({}, self.options, options);

		self.attrs = attrs || {};
		self.bbox = null;
		self._graphics = [];

		var i, iLen, g;
		if (graphics && graphics.length) {
			for (i = 0, iLen = graphics.length; i < iLen; i++) {
				g = graphics[i];
				g._parentGraphic = self;
				self._append(g);
			}
		}
	},

	clone: function() {
		var self = this;
		return new G.Graphic.Group(self._graphics, G.Util.merge({}, self.attrs), G.Util.merge({}, self.options));
	},

	child: function(id) {
		return this._graphics[id];
	},

	children: function() {
		return this._graphics;
	},

	_onAdded: function() {
		var self = this;

		var graphics = self._graphics;
		var i, iLen, g;
		if (graphics && graphics.length) {
			for (i = 0, iLen = graphics.length; i < iLen; i++) {
				g = graphics[i];
				g._layer = self._layer;

				g._onAdded();
			}
		}
	},

	_onRemoved: function() {
		var self = this;

		var graphics = self._graphics;
		var i, iLen, g;
		if (graphics && graphics.length) {
			for (i = 0, iLen = graphics.length; i < iLen; i++) {
				g = graphics[i];

				g._onRemoved();

				g._layer = null;
			}
		}
	},

	_append: function(graphic) {
		var self = this;

		if (!(graphic instanceof G.Graphic)) {
			return;
		}

		graphic._layer = self._layer;
		graphic.options.clickable = self.options.clickable;
		graphic.options.allowPan = self.options.allowPan;

		self._graphics.push(graphic);

		self.bbox = G.ExtentUtil.union(self.bbox, graphic.bbox);
	},

	_draw: function() {
		var self = this;

		var graphics = self._graphics;
		var i, iLen, g;
		if (graphics && graphics.length) {
			for (i = 0, iLen = graphics.length; i < iLen; i++) {
				g = graphics[i];

				if (g._draw && g._layer) {
					g._draw();
				}
			}
		}
	},

	_erase: function() {
		var self = this;

		var graphics = self._graphics;
		var i, iLen, g;
		if (graphics && graphics.length) {
			for (i = 0, iLen = graphics.length; i < iLen; i++) {
				g = graphics[i];

				if (g._erase && g._layer) {
					g._erase();
				}
			}
		}
	},

	_hitPointNowrap: function(p, res, rotate, tol) {
		var self = this;

		var graphics = self._graphics;
		var i, iLen, g;
		if (graphics && graphics.length) {
			for (i = 0, iLen = graphics.length; i < iLen; i++) {
				g = graphics[i];
				if (g._hitPointNowrap && g._hitPointNowrap(p, res, rotate, tol)) {
					return true;
				}
			}
		}

		return false;
	},

	startEdit: function(options) {
		var self = this;

		var graphics = self._graphics;
		var i, iLen, g;
		if (graphics && graphics.length) {
			for (i = 0, iLen = graphics.length; i < iLen; i++) {
				g = graphics[i];

				if (g.startEdit) {
					g.startEdit(options);
				}
			}
		}

		self._editing = true;
	},

	endEdit: function() {
		var self = this;

		var graphics = self._graphics;
		var i, iLen, g;
		if (graphics && graphics.length) {
			for (i = 0, iLen = graphics.length; i < iLen; i++) {
				g = graphics[i];

				if (g.endEdit) {
					g.endEdit();
				}
			}
		}

		self._editing = false;
	}


});
/* global G:false */
G.Layer = G.Class.extend({
	mixins: [G.Event],

	options: {
		//maxRes: 9783.939621,
		//minRes: 152.874057,
	},

	addTo: function(map) {
		var self = this,
			id;

		if (self._map && self._id !== undefined) { // Layer has already been added to one map.
			return self._map === map ? self : null;
		}

		self._map = map;

		id = self._id = (map._layerIdSeq++);
		map._layers[id] = self;
		map._layerOrder.push(id);

		self._zIndex = map._layerOrder.length - 1;

		map.addListener('resize', self._onResize, self);
		map.addListener('viewChanged', self._onViewChanged, self);
		map.addListener('zoomStart', self._onZoomStart, self);
		map.addListener('zoomUpdate', self._onZoomUpdate, self);
		map.addListener('zoom', self._onZoom, self);
		map.addListener('zoomEnd', self._onZoomEnd, self);
		map.addListener('moveStart', self._onMoveStart, self);
		map.addListener('move', self._onMove, self);
		map.addListener('moveEnd', self._onMoveEnd, self);
		map.addListener('rotateStart', self._onRotateStart, self);
		map.addListener('rotate', self._onRotate, self);
		map.addListener('rotateEnd', self._onRotateEnd, self);
		map.addListener('pinchStart', self._onPinchStart, self);
		map.addListener('pinch', self._onPinch, self);
		map.addListener('pinchEnd', self._onPinchEnd, self);

		self._onAdded();

		map.fireEvent('layerAdded', {
			layer: self
		});

		map._requestUpdate();

		return self;
	},

	remove: function() {
		var self = this;

		if (!(self._map && self._id !== undefined)) {
			return;
		}

		var map = self._map;
		var i, id, count = map._layerOrder.length;
		for (i = count - 1; i >= 0; i--) {
			id = map._layerOrder[i];
			if (id == self._id) {
				map._layerOrder.splice(i, 1);
			}
		}

		delete map._layers[self._id];
		delete self._id;

		map.removeListener('resize', self._onResize, self);
		map.removeListener('viewChanged', self._onViewChanged, self);
		map.removeListener('zoomStart', self._onZoomStart, self);
		map.removeListener('zoomUpdate', self._onZoomUpdate, self);
		map.removeListener('zoom', self._onZoom, self);
		map.removeListener('zoomEnd', self._onZoomEnd, self);
		map.removeListener('moveStart', self._onMoveStart, self);
		map.removeListener('move', self._onMove, self);
		map.removeListener('moveEnd', self._onMoveEnd, self);
		map.removeListener('rotateStart', self._onRotateStart, self);
		map.removeListener('rotate', self._onRotate, self);
		map.removeListener('rotateEnd', self._onRotateEnd, self);
		map.removeListener('pinchStart', self._onPinchStart, self);
		map.removeListener('pinch', self._onPinch, self);
		map.removeListener('pinchEnd', self._onPinchEnd, self);

		self._onRemoved();

		map.fireEvent('layerRemoved', {
			layer: self
		});

		map._requestRedraw();

		return self;
	},

	getOrder: function() {
		var self = this,
			map = self._map;

		var i;
		for (i in map._layerOrder) {
			if (map._layerOrder[i] == self._id) {
				return i;
			}
		}

		return -1;
	},

	bringToOrder: function(order) {
		var self = this,
			map = self._map;

		var layerCount = map._layerOrder.length;
		var currentOrder = -1;
		for (var i = 0; i < layerCount; i++) {
			if (map._layerOrder[i] == self._id) {
				currentOrder = i;
				break;
			}
		}

		var toOrder = order || 0;

		if (toOrder < 0) {
			toOrder = 0;
		}

		if (toOrder > layerCount - 1) {
			toOrder = layerCount - 1;
		}

		map._layerOrder.splice(i, 1);
		map._layerOrder.splice(toOrder, 0, self._id);

		self._afterReorder();

		map._requestRedraw();

		return self;
	},

	bringToTop: function() {
		var self = this,
			map = self._map;

		var layerCount = map._layerOrder.length;
		for (var i = 0; i < layerCount; i++) {
			if (map._layerOrder[i] == self._id) {
				map._layerOrder.splice(i, 1);
				break;
			}
		}
		map._layerOrder.push(self._id);

		self._afterReorder();

		map._requestRedraw();

		return self;
	},

	bringToBottom: function() {
		var self = this,
			map = self._map;

		var layerCount = map._layerOrder.length;
		for (var i = 0; i < layerCount; i++) {
			if (map._layerOrder[i] == self._id) {
				map._layerOrder.splice(i, 1);
				break;
			}
		}
		map._layerOrder = [self._id].concat(map._layerOrder);

		self._afterReorder();

		map._requestRedraw();

		return self;
	},

	bringUp: function(delta) {
		var self = this,
			map = self._map;

		var layerCount = map._layerOrder.length;
		var currentOrder = -1;
		for (var i = 0; i < layerCount; i++) {
			if (map._layerOrder[i] == self._id) {
				currentOrder = i;
				break;
			}
		}

		var toOrder = currentOrder + (delta || 1);
		if (toOrder > layerCount - 1) {
			toOrder = layerCount - 1;
		}

		map._layerOrder.splice(i, 1);
		map._layerOrder.splice(toOrder, 0, self._id);

		self._afterReorder();

		map._requestRedraw();

		return self;
	},

	bringDown: function(delta) {
		var self = this,
			map = self._map;

		var layerCount = map._layerOrder.length;
		var currentOrder = -1;
		for (var i = 0; i < layerCount; i++) {
			if (map._layerOrder[i] == self._id) {
				currentOrder = i;
				break;
			}
		}

		var toOrder = currentOrder - (delta || 1);
		if (toOrder < 0) {
			toOrder = 0;
		}

		map._layerOrder.splice(i, 1);
		map._layerOrder.splice(toOrder, 0, self._id);

		self._afterReorder();

		map._requestRedraw();

		return self;
	},

	hide: function() {
		var self = this,
			map = self._map;

		if (self._hidden) {
			return self;
		}

		self._hidden = true;

		if (self._erase) {
			self._erase();
		}

		if (map) {
			map._requestRedraw();
		}

		return self;
	},

	show: function() {
		var self = this,
			map = self._map;

		if (!self._hidden) {
			return self;
		}

		self._hidden = false;

		if (map) {
			map._requestRedraw();
			map._requestUpdate(); // Update after show
		}

		return self;
	},

	isVisible: function() {
		var self = this,
			map = self._map;

		if (self._hidden) {
			return false;
		}

		if (!map) {
			return false;
		}

		var options = self.options,
			minRes = options.minRes,
			maxRes = options.maxRes,
			res = map._res;

		if (maxRes && maxRes < res) {
			return false;
		}

		if (minRes && minRes > res) {
			return false;
		}

		return true;
	},

	_afterReorder: function() { // 对图层重新排序后，需要更新其它图层的zIndex，为SVG与VML模式所用
		var self = this,
			map = self._map;

		var i, index, id, layer;
		for (i in map._layerOrder) {
			index = parseInt(i);
			id = map._layerOrder[index];
			layer = map._layers[id];
			if (layer) {
				layer._zIndex = index;
			}
		}
	},



	/**
	 * These methods may be overrided by sub class.
	 */
	clear: function() {
		return this
	},
	_onClear: function() {},
	_update: function() {},
	_draw: function() {},
	_erase: function() {},
	_onResize: function(e) {},
	_onViewChanged: function(e) {}, //This method will be invoked when map's viewport changed.
	_onAdded: function() {}, //This method will be invoked when the layer is added to a map.
	_onRemoved: function() {}, //This method will be invoked when the layer is removed from a map.
	_onZoomStart: function(e) {},
	_onZoomUpdate: function(e) {},
	_onZoom: function(e) {},
	_onZoomEnd: function(e) {},
	_onMoveStart: function(e) {},
	_onMove: function(e) {},
	_onMoveEnd: function(e) {},
	_onRotateStart: function(e) {},
	_onRotate: function(e) {},
	_onRotateEnd: function(e) {},
	_onPinchStart: function(e) {},
	_onPinch: function(e) {},
	_onPinchEnd: function(e) {}


});
/* global G:false */
G.Layer.Filter = {

	setFilters: function(fields, conditions) {
		var self = this;
		var map = self._map;

		var count, i, key;
		var field, condition;
		if (fields && conditions) {
			count = Math.min(fields.length, conditions.length);

			if (count > 0) {
				var filters = self._filters = {};

				for (i = 0; i < count; i++) {
					field = fields[i];
					condition = conditions[i];
					key = field + ',' + condition;
					filters[key] = [field, condition];
				}

				self._dirty = true;
			}
		}

		if (map) {
			map._requestRedraw();
		}

		return self;
	},

	clearFilters: function() {
		var self = this;
		var map = self._map;

		self._filters = null;
		self._dirty = true;

		if (map) {
			map._requestRedraw();
		}

		return self;
	},

	_calcFilter: function(attrs) {
		var self = this,
			filters = self._filters;

		if (!filters || !attrs) {
			return true;
		}

		var field, condition, match;
		for (key in filters) {
			if (!filters[key]) {
				continue;
			}

			field = filters[key][0];
			condition = filters[key][1];

			/*jslint evil: true */
			match = eval('"' + attrs[field] + '"' + condition);
			if (!match) {
				return false;
			} else {
				continue;
			}
		}

		return true;
	}

};
/* global G:false */
G.Layer.LOD = {

	/*
	 * It will be mixed into a layer which should zoom by LOD, make sure the object has _map and some necessary options about LOD.
	 *
	 * options:{tileSize,originX,originY,zoomReses}
	 *
	 */


	options: {
		originX: -20037508.342784,
		originY: 20037508.342784,
		minX: -20037508.342784,
		maxX: 20037508.342784,
		minY: -20037508.342784,
		maxY: 20037508.342784,
		tileSize: 256,
		zoomReses: [ // Default is Google style
			156543.033928,
			78271.516964,
			39135.758482,
			19567.879241,
			9783.9396205,
			4891.96981025,
			2445.984905125,
			1222.9924525625,
			611.49622628125,
			305.748113140625,
			152.8740565703125,
			76.43702828515625,
			38.21851414257813,
			19.10925707128906,
			9.554628535644531,
			4.777314267822266,
			2.388657133911133,
			1.194328566955567,
			0.597164283477783,
			0.298582141738892
		],
		maxRes: 156543.033928,
		minRes: 0.298582141738892
	},

	_calcVisTileInfos: function(up) {
		var self = this,
			map = self._map,
			size = map.getSize(),
			center = map.getCenter(),
			options = self.options,
			mapOptions = map.options,
			rotate = map._rotate,
			theta = Math.PI * rotate / 180,
			tileSize = options.tileSize,
			zoom = self._calcNearestZoom(up),
			zoomRes = options.zoomReses[zoom],
			tileMapSize = tileSize * zoomRes,
			scale = zoomRes / map._res,
			scaledTileSize = tileSize * scale,
			abs = Math.abs,
			sin = Math.sin,
			cos = Math.cos,
			w = abs(size[0] * cos(theta)) + abs(size[1] * sin(theta)),
			h = abs(size[0] * sin(theta)) + abs(size[1] * cos(theta)),
			xLen = Math.ceil(w / scaledTileSize / 2),
			yLen = Math.ceil(h / scaledTileSize / 2),
			centerTileIndex = self._calcTileIndex(center[0], center[1], zoom),
			ixMin = centerTileIndex[0] - xLen,
			ixMax = centerTileIndex[0] + xLen,
			iyMin = centerTileIndex[1] - yLen,
			iyMax = centerTileIndex[1] + yLen,
			tol = -Math.max(map.options.tolerance || 0, map._res / 10), // 负数，表示如果切片在外部且离边缘十分近（即使在边缘内部）也将其忽略
			hasBoundary = options.minX !== undefined && options.minY !== undefined && options.maxX !== undefined && options.maxY !== undefined,
			tileInfos = [],
			layerExtent = [options.minX, options.minY, options.maxX, options.maxY],
			mapExtent = map.options.maxExtent,
			limitExtent = G.ExtentUtil.intersect(layerExtent, mapExtent),
			extentOverlaps = G.ExtentUtil.overlaps;

		var ix, xmin, xmax, ymin, ymax;
		for (var i = ixMin; i <= ixMax; i++) {
			xmin = options.originX + i * tileMapSize;
			xmax = xmin + tileMapSize;
			ix = i;

			if (mapOptions.wrap) {
				var realCoord = map._calcRealCoords([xmin, 0]);
				xmin = realCoord[0];
				xmax = xmin + tileMapSize;
				ix = Math.round((xmin - options.originX) / tileMapSize);
			}

			for (var j = iyMin; j <= iyMax; j++) {
				if (hasBoundary) {
					// Check if tile in boundary.
					ymin = options.originY - (j + 1) * tileMapSize;
					ymax = options.originY - j * tileMapSize;

					if (!G.ExtentUtil.overlaps([xmin, ymin, xmax, ymax], limitExtent, tol)) {
						continue;
					}
				}

				tileInfos.push([ix, j, zoom]);
			}
		}

		return tileInfos;
	},

	_sortTileInfos: function(tileInfos, centerIdxX, centerIdxY) {
		var d1, d2;
		tileInfos.sort(function(a, b) {
			d1 = Math.pow((a[0] - centerIdxX), 2) + Math.pow((a[1] - centerIdxY), 2);
			d2 = Math.pow((b[0] - centerIdxX), 2) + Math.pow((b[1] - centerIdxY), 2);
			return Math.abs(d1 - d2);
		});
	},

	_calcNearestZoom: function(greater) {
		var self = this,
			map = self._map;

		var res = map._res,
			resTol = res / 100, // 允许百分之一的误差
			zoomReses = self.options.zoomReses,
			zoomRes, lastZoom = 0;
		for (var i = 0, len = zoomReses.length; i < len; i++) {
			zoomRes = zoomReses[i];
			if (res > zoomRes + resTol) {
				return greater ? i : lastZoom;
			} else if (res <= zoomRes + resTol && res > zoomRes - resTol) {
				return i;
			} else {
				lastZoom = i;
			}
		}

		return 0;
	},

	_calcTileIndex: function(x, y, zoom) {
		var options = this.options;

		var res = Number(options.zoomReses[zoom]);
		if (!res) {
			return [-1, -1];
		}

		var tileMapSize = options.tileSize * res;
		var dx = x - options.originX;
		var dy = options.originY - y;
		var idxX = Math.floor(dx / tileMapSize);
		var idxY = Math.floor(dy / tileMapSize);

		return [idxX, idxY];
	},

	_calcTileExtent: function(idxX, idxY, zoom) {
		var options = this.options;

		var res = Number(options.zoomReses[zoom]);
		if (!res) {
			return;
		}

		var tileMapSize = options.tileSize * res;
		var dx = tileMapSize * idxX;
		var dy = tileMapSize * idxY;
		var x = dx + options.originX;
		var y = options.originY - dy;

		return [x, y - tileMapSize, x + tileMapSize, y];
	},

	_getTileName: function(idxX, idxY, zoom) {
		return idxX + ',' + idxY + ',' + zoom;
	},

	_getTileUrl: function(idxX, idxY, zoom, options) {
		var self = this,
			url = self.url,
			util = G.Util,
			cluster = self.options.cluster;

		if (!url) {
			return;
		}

		var scale = options ? options.scale || 1 : 1;

		var tileUrlPattern;
		if (util.isFunction(url)) {
			tileUrlPattern = url(zoom, idxX, idxY, scale);
		} else {
			tileUrlPattern = url;
		}

		var server;
		if (util.isArray(cluster) && cluster.length > 0) {
			var i = Math.abs(idxX + idxY) % cluster.length;
			server = cluster[i];
		}

		var tileUrl = util.renderString(tileUrlPattern, G.Util.merge({
			s: server,
			z: zoom,
			x: idxX,
			y: idxY,
			i: scale > 1 ? '@2x' : ''
		}, options));

		return tileUrl;
	},

	_tileOverlap: function(tileInfo1, tileInfo2) {
		var self = this;

		var extent1 = self._calcTileExtent(tileInfo1[0], tileInfo1[1], tileInfo1[2]);
		var extent2 = self._calcTileExtent(tileInfo2[0], tileInfo2[1], tileInfo2[2]);

		return G.ExtentUtil.overlaps(extent1, extent2);
	}

};

G.Layer.LOD.calcNearestZoom = G.Layer.LOD._calcNearestZoom;
G.Layer.LOD.calcTileIndex = G.Layer.LOD._calcTileIndex;
G.Layer.LOD.calcTileExtent = G.Layer.LOD._calcTileExtent;
/* global G:false */
G.Layer.Tile = G.Layer.extend({
	mixins: [G.Layer.LOD],

	options: {
		cluster: [], // ['server1', 'server2']
		errorTileUrl: '',
		opacity: 1.0,
		tileLiveMs: 600000, // ms
		tileEnlarge: true,
		keepResample: true,
		filter:'' , //'dark'||'gray'||'negative'
		retryTimes: 3,
		crossOrigin: '*'
	},

	statics: {
		EMPTY_TILE: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3FpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoxOWUzZTA0YS1lOWFjLTljNDctODI5ZS0yMjM3YTQ3YzU3MzciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MUU5MjRFQkZCOTQxMTFFMzlDQjA5NkM1REQ1MEUwODciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MUU5MjRFQkVCOTQxMTFFMzlDQjA5NkM1REQ1MEUwODciIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmU5MjNlNDE0LWNlOTktMzk0My1hZjRjLTgwZjhiOGY1MjY0NCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoxOWUzZTA0YS1lOWFjLTljNDctODI5ZS0yMjM3YTQ3YzU3MzciLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz54esASAAAAEElEQVR42mL4//8/A0CAAQAI/AL+26JNFgAAAABJRU5ErkJggg=='
	},

	init: function(url, options) {
		var self = this;

		self.url = url;
		self.options = G.Util.merge({}, self.options, options);

		self._tiles = {};
		self._idleTiles = [];
	},

	setUrl: function(url) {
		var self = this;

		self.url = url;

		self.clear();

		return self;
	},

	clear: function() {
		var self = this,
			map = self._map;

		var tiles = self._tiles,
			tile;

		for (var i = 0, len = tiles.length; i < len; i++) {
			tile = tiles[i];
			self._stopLoadingTile(tile);
		}

		self._tiles = {};
		self._idleTiles = [];

		self._onClear();

		if (map) {
			map._requestUpdate();
		}

		return self;
	},

	_tileInfoExist: function(tileInfo, tileInfos) {
		var info;
		for (var i = 0, len = tileInfos.length; i < len; i++) {
			info = tileInfos[i];
			if (info[0] === tileInfo[0] && info[1] === tileInfo[1] && info[2] === tileInfo[2]) {
				return true;
			}
		}
		return false;
	},

	_onAdded: function() {
		var self = this,
			map = self._map;

		if (!self._container) {
			self._initContainer();
		}

		map._zoomReses = self.options.zoomReses;
	},


	_onRemoved: function() {
		var self = this,
			map = self._map;

		if (self._container) {
			self._destroyContainer();
		}

		var tileLayerLeft;
		var layer;
		for (var i = 0, len = map._layers.length; i < len; i++) {
			layer = map._layers[i];
			if (layer instanceof G.Layer.Tile) {
				tileLayerLeft = layer;
				break;
			}
		}
		if (!tileLayerLeft) {
			delete map._zoomReses;
		}
	},

	_stopLoadingTiles: function(container) {
		var tiles = container.getElementsByTagName('img'),
			tile;

		for (var i = 0, len = tiles.length; i < len; i++) {
			tile = tiles[i];
			this._stopLoadingTile(tile);
		}
	},

	_stopLoadingTile: function(tile) {
		if (!tile) {
			return;
		}

		if (!tile.complete) {
			var browser = G.Browser;
			if (!browser.android) {
				tile.onload = null;
				tile.onerror = null;
				tile.src = '';
			}

			var parent = tile.parentNode;
			if (parent) {
				parent.removeChild(tile);
			}
		}
	},

	_removeTile: function(key) {
		var self = this,
			tile = self._tiles[key];

		if (!tile) {
			return;
		}

		self._stopLoadingTile(tile);

		if (tile._wraps) {
			for (var j in tile._wraps) {
				var wrapTile = tile._wraps[j];
				if (wrapTile && wrapTile.parentNode) {
					wrapTile.parentNode.removeChild(wrapTile);
				}
			}

			tile._wraps = {};
		}

		var parent = tile.parentNode;
		if (parent) {
			parent.removeChild(tile);
		}

		self._onTileRemoved(tile);

		G.DomUtil.removeClass(tile, 'g-tile-loaded');
		self._idleTiles.push(tile);
		delete self._tiles[key];
	},

	_resetTile: function(tile) {
		tile._loaded = false;
		tile._responseTime = null;
		tile._retried = 0;
		tile.src = '';
	},

	_getIdleTile: function() {
		var self = this;
		if (self._idleTiles.length > 0) {
			var tile = self._idleTiles.pop();
			self._resetTile(tile);
			return tile;
		}

		return self._createTile();
	},

	_createTile: function() {
		var options = this.options;
		var tile = G.DomUtil.create('img', 'g-tile'),
			tileSize = options.tileSize;
		var pr = G.Browser.getPxRatio();
		G.DomUtil.setSize(tile, tileSize / pr[0], tileSize / pr[1]);
		tile._retried = 0;

		// 如果crossOrigin内容为空，则不能给tile添加crossOrigin属性，而非仅仅将其值设为空
		if (options.crossOrigin) {
			tile.crossOrigin = options.crossOrigin;
		}

		return tile;
	},

	_placeTile: function(tile, idxX, idxY, tileZoom, zIndex) {
		var self = this,
			pr = G.Browser.getPxRatio(),
			prX = pr[0],
			prY = pr[1],
			map = self._map,
			rotate = map._rotate,
			size = map.getSize(),
			mapCenter = map.getCenter(),
			mapRes = map._res,
			options = self.options,
			mapOptions = map.options,
			tileSize = options.tileSize,
			zoomRes = options.zoomReses[tileZoom],
			tileMapSize = tileSize * zoomRes,
			tileEnlarge = options.tileEnlarge && (!!(rotate % 90) || G.Browser.gecko || G.Browser.safari),
			scaledTileSize = Math.ceil(tileMapSize / mapRes) + (tileEnlarge ? 2 : 0), // 尝试消除锯齿边缘
			tx = (options.originX + idxX * tileMapSize - mapCenter[0]) / mapRes / prX + size[0] / 2,
			ty = -(options.originY - idxY * tileMapSize - mapCenter[1]) / mapRes / prY + size[1] / 2,
			domUtil = G.DomUtil;

		domUtil.markScaleTransform(tile, 1 / prX, 1 / prY);
		domUtil.markPosTransform(tile, tx, ty);
		domUtil.markSizeTransform(tile, scaledTileSize, scaledTileSize);
		domUtil.updateTransform(tile);
		domUtil.updateOpacity(tile, options.opacity);

		if (zIndex === undefined) {
			var maxZoom = options.zoomReses.length;
			var zoom = self._calcNearestZoom(true);
			zIndex = tileZoom == zoom ? maxZoom + 1 : tileZoom;
		}
		domUtil.setZIndex(tile, zIndex);

		var wrapTile;
		if (mapOptions.wrap && !tile._isWrap) {
			var iMax = 0,
				iMin = 0;

			var maxExtent = mapOptions.maxExtent;
			var redrawExtent = self._redrawExtent;
			if (redrawExtent && maxExtent) {
				var mapWidth = maxExtent[2] - maxExtent[0];
				iMin = Math.floor((redrawExtent[0] - options.minX) / mapWidth) - 1;
				iMax = Math.ceil((redrawExtent[2] - options.maxX) / mapWidth) + 1;
			}

			tile._wraps = tile._wraps || {};

			for (var j in tile._wraps) {
				if (j > iMax || j < iMin) {
					wrapTile = tile._wraps[j];
					if (wrapTile && wrapTile.parentNode) {
						wrapTile.parentNode.removeChild(wrapTile);
						delete tile._wraps[j];
					}
				}
			}

			for (var i = iMin; i <= iMax; i++) {
				if (i == 0) {
					continue;
				}

				wrapTile = tile._wraps[i];
				if (!wrapTile) {
					wrapTile = tile._wraps[i] = G.DomUtil.create('img', 'g-tile');

					wrapTile._isWrap = true;
					domUtil.addClass(wrapTile, 'g-tile-wrap');

					wrapTile.crossOrigin = tile.crossOrigin;
					wrapTile.src = tile.src;
					wrapTile._info = tile._info;
					wrapTile._loaded = true;
					domUtil.addClass(wrapTile, 'g-tile-loaded');

					self._onNewWrapTile(tile, i);
				}

				tx = (options.originX + idxX * tileMapSize - mapCenter[0] + i * mapWidth) / mapRes / prX + size[0] / 2;
				domUtil.markScaleTransform(wrapTile, 1 / prX, 1 / prY);
				domUtil.markPosTransform(wrapTile, tx, ty);
				domUtil.markSizeTransform(wrapTile, scaledTileSize, scaledTileSize);
				domUtil.updateTransform(wrapTile);
				domUtil.updateOpacity(wrapTile, options.opacity);
				domUtil.setZIndex(wrapTile, zIndex);
			}
		}

	},

	_checkAllHandled: function() {
		var self = this;

		if (self._numLoad == self._numLoadSuccess + self._numLoadError) {
			var tile, size, scale;

			var maxScale = 4;
			var minScale = 1 / 8;
			for (var key in self._tiles) {
				tile = self._tiles[key];
				size = G.DomUtil.getSize(tile);
				scale = size[0] / self.options.tileSize;
				if (scale > maxScale || scale < minScale) {
					self._removeTile(key);
				}
			}

			//if (G.Browser.touch) {
			self._clearBgBuffer();
			//}

			self.fireEvent('allLoaded');
		}
	},

	_loadTile: function(tile, idxX, idxY, zoom, isRetry) { // 重试时不触发tileStart事件
		var self = this;

		tile._layer = self;
		tile._info = [idxX, idxY, zoom];
		tile._loaded = false;
		tile.onload = function () {
			self._onTileLoad(tile);
		};
		tile.onerror = self._onTileError;

		tile._canvas = null;

		if (!isRetry) {
			tile._retried = 0;
			self.fireEvent('tileStart', {
				tile: tile,
				url: tile.src
			});
		}

		tile.src = self._getTileUrl(idxX, idxY, zoom, {
			scale: G.Browser.retina ? 2 : 1
		});
	},

	_onTileLoad: function(tile) {
		var layer = tile._layer;

		tile._responseTime = +new Date();

		var errorUrl = layer.options.errorTileUrl || G.Layer.Tile.EMPTY_TILE;

		var tileInfo, idxX, idxY, tileZoom;
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

				tileInfo = tile._info;
				idxX = parseInt(tileInfo[0]);
				idxY = parseInt(tileInfo[1]);
				tileZoom = parseInt(tileInfo[2]);
				layer._placeTile(tile, idxX, idxY, tileZoom);

				layer._numLoadSuccess++;
				layer.fireEvent('tileSuccess', {
					tile: tile,
					url: tile.src
				});
			}

			layer._checkAllHandled();
		}
	},

	_onTileError: function() {
		var tile = this,
			layer = tile._layer;

		tile._responseTime = +new Date();

		var errorUrl = layer.options.errorTileUrl || G.Layer.Tile.EMPTY_TILE;

		var errorSrc = tile.src;
		var tileInfo, idxX, idxY, tileZoom;
		if (tile.src !== errorUrl) {
			if (tile._retried++ < layer.options.retryTimes) {
				tileInfo = tile._info;
				idxX = parseInt(tileInfo[0]);
				idxY = parseInt(tileInfo[1]);
				tileZoom = parseInt(tileInfo[2]);
				layer._loadTile(tile, idxX, idxY, tileZoom, true);
			} else {
				tile.src = errorUrl;

				layer._numLoadError++;
				layer.fireEvent('tileError', {
					tile: tile,
					url: errorSrc
				});

				layer._checkAllHandled();
			}
		}
	},

	_onTileRemoved: function(tile) {},

	_onNewWrapTile: function(tile, wrapId) {}


});
/* global G:false */
G.Layer.Graphic = G.Layer.extend({

	options: {
		clickable: true
	},

	init: function(options) {
		var self = this;

		self.options = G.Util.merge({}, self.options, options);

		self._idSeq = 0;
		self._indexSeq = 0;
		self._graphics = {};

		self._styles = {};

		self._tree = new G.RTree();
	},

	add: function(graphic, id, noRedraw) {
		var self = this;

		if (graphic instanceof G.Graphic) {
			graphic.addTo(self, id, noRedraw);
			return graphic._id;
		}
	},

	get: function(id) {
		return this._graphics[id];
	},

	all: function() {
		var self = this;
		var all = self._tree.all();

		var list = [];
		var i, g;
		for (i in all) {
			g = all[i];

			if (!g._isVertex) {
				list.push(g);
			}
		}

		return list;
	},

	query: function(extent) {
		var self = this;
		var searched = self._tree.search(extent);

		var list = [],
			i, g, bbox;
		for (i in searched) {
			g = searched[i];
			bbox = g.bbox;

			if (G.ExtentUtil.overlaps(bbox, extent) && !g._isVertex /*Canvas vertex*/ ) {
				list.push(g);
			}
		}

		return list;
	},

	count: function() {
		var self = this;
		var all = self._tree.all();

		var count = 0;
		var i, g;
		for (i in all) {
			g = all[i];

			if (!g._isVertex) {
				count++;
			}
		}

		return count;
	},

	clear: function() {
		var self = this;
		var map = self._map;
		var domUtil = G.DomUtil;

		for (var i in self._graphics) {
			self._graphics[i].endEdit(true); // May be in edit status
		}

		self._graphics = {};

		self._tree.clear();

		if (map) {
			domUtil.removeClass(map._layersFrame, 'g-clickable');
			domUtil.removeClass(map._layersFrame, 'g-edit');
		}

		self._onClear();

		if (map) {
			map._requestRedraw();
		}


		return self;
	},

	setStyle: function(fields, conditions, options) { // Ensure no ',' or ';' in every field and condition 
		var self = this;
		var map = self._map;
		var styles = self._styles;
		var graphics = self._graphics;

		var i, g, style;
		var field, condition;

		var count, key, keys = [];
		if (!fields || !conditions) {
			styles[''] = options;
		} else {
			count = Math.min(fields.length, conditions.length);
			for (i = 0; i < count; i++) {
				field = fields[i];
				condition = conditions[i];
				key = field + ',' + condition;
				keys.push(key);
			}
			styles[keys.join(';')] = options;
		}

		// Update current graphics
		for (i in graphics) {
			g = graphics[i];
			style = self._calcStyle(g);
			g.updateOptions(style, true);
		}

		if (map) {
			map._requestRedraw();
		}

		return self;
	},

	clearStyles: function(options) {
		var self = this;
		var map = self._map;
		var graphics = self._graphics;

		self._styles = {};

		// Update current graphics
		for (i in graphics) {
			g = graphics[i];
			g.updateOptions(options, true);
		}

		if (map) {
			map._requestRedraw();
		}

		return self;
	},

	calcDataExtent: function(expand) {
		var graphics = this._graphics;

		var extent, cx, cy, hw, hh;
		var i, g, bbox;
		for (i in graphics) {
			g = graphics[i];
			bbox = g.bbox;

			if (!extent) {
				extent = [bbox[0], bbox[1], bbox[2], bbox[3]];
			} else {
				extent[0] = bbox[0] < extent[0] ? bbox[0] : extent[0];
				extent[1] = bbox[1] < extent[1] ? bbox[1] : extent[1];
				extent[2] = bbox[2] > extent[2] ? bbox[2] : extent[2];
				extent[3] = bbox[3] > extent[3] ? bbox[3] : extent[3];
			}
		}

		if (extent && expand) {
			cx = (extent[0] + extent[2]) / 2;
			cy = (extent[1] + extent[3]) / 2;
			hw = (extent[2] - extent[0]) / 2 * expand;
			hh = (extent[3] - extent[1]) / 2 * expand;
			extent[0] = cx - hw;
			extent[1] = cy - hh;
			extent[2] = cx + hw;
			extent[3] = cy + hh;
		}

		return extent;
	},

	_calcStyle: function(graphic) {
		var self = this,
			styles = self._styles;

		var attrs = graphic.attrs;
		var options = styles[''];

		if (!attrs) {
			return options;
		}

		var key, strs, str, i, idx, field, condition, match;
		for (key in styles) {
			if (!key) {
				continue;
			}

			strs = key.split(';');
			for (i in strs) {
				str = strs[i];
				if (!str || !str.indexOf || !str.substring) { // ielt9 时有时候会获取其它类型的str
					continue;
				}

				idx = str.indexOf(',');
				field = str.substring(0, idx);
				condition = str.substring(idx + 1);

				/*jslint evil: true */
				match = eval('"' + attrs[field] + '"' + condition);
				if (!match) {
					break;
				}
			}

			if (match) {
				options = styles[key];
				break;
			} else {
				continue;
			}
		}

		return options;
	},

	_initContainer: function() {}, // Different implements

	_destroyContainer: function() {
		var self = this;

		self._container.parentNode.removeChild(self._container);
		delete self._container;
	},

	_onAdded: function() {
		var self = this;

		if (!self._container) {
			self._initContainer();
		}

		var map = self._map;
		map.addListener('mousemove', self._onMouseMove, self);
		map.addListener('click', self._onClick, self);
	},

	_onRemoved: function() {
		var self = this;

		if (self._container) {
			self._destroyContainer();
		}

		var map = self._map;
		map.removeListener('mousemove', self._onMouseMove, self);
		map.removeListener('click', self._onClick, self);
	},

	_onListenerAdded: function(type, fn, context) {
		var self = this;
		var map = self._map;

		// 每次添加新的监听，都确保Layer的click事件监听处于最先触发状态
		// 因为graphicClicked事件与Map的click事件应该互斥，否则可能先触发Map的click事件监听
		if (map && type == 'graphicClicked') {
			map.removeListener('click', self._onClick, self);
			map.addListener('click', self._onClick, self);
		}
	},

	_onClear: function() {},

	_onZoomStart: function() {},

	_onZoomUpdate: function() {},

	_onZoomEnd: function() {},

	_vacuum: function() {
		var self = this;
		var map = self._map;

		if (!map) {
			return;
		}

		var center = map.getCenter(),
			res = map._res,
			drawSize = map.getDrawSize(),
			w = drawSize[0],
			h = drawSize[1],
			xmin = center[0] - w * res / 2,
			xmax = center[0] + w * res / 2,
			ymin = center[1] - h * res / 2,
			ymax = center[1] + h * res / 2,
			extentRedraw = [xmin, ymin, xmax, ymax];

		var extent = extentRedraw;
		var searched = self._tree.search(extent);

		var removeIds = {};
		var i, g;
		var graphics = self._graphics;

		for (i in graphics) {
			removeIds[i] = true;
		}

		for (i in searched) {
			g = searched[i];
			delete removeIds[g._id];
		}

		for (i in removeIds) {
			g = graphics[i];
			g.remove();
		}

		return removeIds.length;
	},

	_sortIndex: function(g1, g2) {
		if (g1 && g2) {
			return (g1._index - g2._index) || 0;
		}

		return 0;
	},

	_onMouseMove: function(e) {
		var layer = this;
		var map = layer._map;
		var focusGraphic = layer._focusGraphic; // 可能是真实的Graphic对象，也可能是节点

		if (!layer.options.clickable) {
			return;
		}

		if (focusGraphic && !focusGraphic._layer) { // focusGraphic可能已经通过remove()方法被移除了
			focusGraphic._mouseOver = false;
			layer._focusGraphic = null;
			return;
		}

		var dragHandler = map._handlers.Drag;
		if (dragHandler && dragHandler._dragging) {
			return;
		}

		if (!layer.isVisible()) {
			return;
		}

		var extent = map.getRedrawExtent();
		var searched = layer._tree.search(extent).sort(layer._sortIndex).reverse();

		var mapPoint = [e.mapX, e.mapY];

		var i, len;
		var g, options, hit;
		for (i = 0, len = searched.length; i < len; i++) {
			g = searched[i];
			options = g.options;

			if (!g._layer || !options.clickable) {
				continue;
			}

			hit = g._hitPoint(mapPoint, map._res, map._rotate);

			if (hit && g._mouseOver) {
				break;
			} else if (hit && !g._mouseOver) {
				if (focusGraphic) {
					focusGraphic._mouseOver = false;

					if (focusGraphic._onMouseOut) {
						focusGraphic._onMouseOut();
					}

					if (focusGraphic._isVertex) {
						focusGraphic._graphic._onVertexMouseOut();
					} else {
						layer.fireEvent('graphicOut', {
							graphic: focusGraphic
						});
					}
				}

				g._mouseOver = true;
				layer._focusGraphic = g;

				if (g._onMouseOver) {
					g._onMouseOver();
				}

				if (g._isVertex) {
					g._graphic._onVertexMouseOver();
				} else {
					layer.fireEvent('graphicOver', {
						graphic: g
					});
				}

				break;
			} else if (!hit && g._mouseOver) {
				g._mouseOver = false;

				if (g._onMouseOut) {
					g._onMouseOut();
				}

				if (g._isVertex) {
					g._graphic._onVertexMouseOut();
				} else {
					layer.fireEvent('graphicOut', {
						graphic: focusGraphic
					});
				}

				focusGraphic = layer._focusGraphic = null;
			}
		}

		if (map._focusGraphic) {
			if (dragHandler && !dragHandler._dragging && !map._focusGraphic.options.allowPan) {
				//dragHandler.off();
			}
		} else {
			if (dragHandler && !dragHandler._dragging) {
				//dragHandler.on();
			}
		}

		if (G.Browser.ielt9) {
			if (!G.DomUtil.hasClass(map._layersFrame, 'g-clickable') && //
				!G.DomUtil.hasClass(map._layersFrame, 'g-edit')) {
				map._layersFrame.style.cursor = 'default';
			} else {
				map._layersFrame.style.cursor = '';
			}
		}
	},

	_onClick: function(e) {
		var layer = this;
		var map = layer._map;
		var domUtil = G.DomUtil;

		if (!layer.isVisible() || !layer.options.clickable) {
			return;
		}

		var extent = map.getRedrawExtent();
		var searched = layer._tree.search(extent).sort(layer._sortIndex).reverse();

		//var mouseScreen = domUtil.getMousePosition(e, map._container);
		//var mapPoint = map.toMap(mouseScreen);
		var mapPoint = [e.mapX, e.mapY];
		var touchTol = map.options.touchTol;
		var tol = G.Browser.touch ? touchTol : 0;

		var g, i, options;
		for (i = 0; i < searched.length; i++) {
			g = searched[i];
			options = g.options;

			if (!g._layer || //
				!options.clickable || //
				!g._hitPoint(mapPoint, map._res, map._rotate, tol) || //
				g._isVertex) {
				continue;
			}

			e.cancel();

			layer.fireEvent('graphicClicked', {
				graphic: g
			});

			break;
		}

	}



});
/* global G:false */
G.Layer.Html = G.Layer.extend({

	init: function(url, options) {
		var self = this;

		self.options = G.Util.merge({}, self.options, options);

		self._idSeq = 0;
		self._htmls = {};
	},

	addHtml: function(html, x, y) {
		var self = this;
		var map = self._map;
		var same;

		var htmlDiv = G.DomUtil.create('div', 'g-html', self._container);
		htmlDiv.innerHTML = html;
		htmlDiv._id = (self._idSeq++);
		htmlDiv._addAt = +new Date();
		self._htmls[htmlDiv._id] = htmlDiv;

		htmlDiv.geom = [x, y];
		htmlDiv.bbox = [x, y, x, y];

		if (map) {
			map._requestRedraw();
		}

		return htmlDiv._id;
	},

	getHtml: function(id) {
		return this._htmls[id];
	},

	removeHtml: function(id) {
		var self = this;
		var htmlDiv = self._htmls[id];

		if (!htmlDiv) {
			return;
		}

		var parent = htmlDiv.parentNode;
		if (parent) {
			parent.removeChild(htmlDiv);
		}

		delete self._htmls[id];

		return self;
	},

	clear: function() {
		var self = this;
		var map = self._map;

		var id, htmlDiv, parent;
		for (id in self._htmls) {
			htmlDiv = self._htmls[id];

			parent = htmlDiv.parentNode;
			if (parent) {
				parent.removeChild(htmlDiv);
			}
		}

		self._htmls = {};

		self._onClear();

		if (map) {
			map._requestRedraw();
		}

		return self;
	},

	_initContainer: function() {
		var self = this;
		var map = self._map;
		var domUtil = G.DomUtil;

		var container = self._container = domUtil.create('div', 'g-layer g-html-container');
		map._layersFrame.appendChild(self._container);

		domUtil.setZIndex(container, self._zIndex);
	},

	_destroyContainer: function() {
		var self = this;

		self._container.parentNode.removeChild(self._container);
		delete self._container;
	},

	_onAdded: function() {
		var self = this,
			map = self._map;

		if (!self._container) {
			self._initContainer();
		}
	},

	_onRemoved: function() {
		var self = this,
			map = self._map;

		if (self._container) {
			self._destroyContainer();
		}
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
		var self = this;
		var domUtil = G.DomUtil;

		domUtil.show(self._container);
		domUtil.setZIndex(self._container, self._zIndex);

		var htmls = self._htmls;
		var i, htmlDiv;
		for (i in htmls) {
			htmlDiv = htmls[i];

			self._placeHtml(htmlDiv);
		}
	},

	_erase: function() {
		var self = this;
		var domUtil = G.DomUtil;

		domUtil.hide(self._container);
	},

	_placeHtml: function(htmlDiv) {
		var self = this;
		var map = self._map;

		var pr = G.Browser.getPxRatio(),
			prX = pr[0],
			prY = pr[1],
			map = self._map,
			size = map.getSize(),
			rotate = map._rotate,
			mapCenter = map.getCenter(),
			mapRes = map._res,
			domUtil = G.DomUtil;

		var pt = htmlDiv.geom;
		var x = pt[0],
			y = pt[1];

		var tx = (x - mapCenter[0]) / mapRes / prX + size[0] / 2;
		var ty = -(y - mapCenter[1]) / mapRes / prY + size[1] / 2;

		domUtil.markPosTransform(htmlDiv, tx, ty);
		domUtil.markRotateTransform(htmlDiv, -rotate);
		domUtil.updateTransform(htmlDiv);
	},

	_onZoomStart: function(e) {
		var self = this,
			map = self._map,
			mapFrame = map._mapFrame,
			size = map.getSize(),
			rotate = map._rotate,
			domUtil = G.DomUtil,
			transition = domUtil.Transition;

		if (!self._zooming) {
			self._zooming = true;
		}

		var centerScreen = [size[0] / 2, size[1] / 2];
		var aroundScreen = e.aroundScreen || centerScreen;
		var dx = centerScreen[0] - aroundScreen[0],
			dy = centerScreen[1] - aroundScreen[1];

		self._aroundScreen = aroundScreen;

		self._scale = e.scale;

		self._zoomStartRes = map._res;
		self._zoomStartScale = e.scale;

		var ignoreAnim = map._zoomAnim && map._zoomAnim._params.ignoreAnim;

		var delta = 1 / e.scale - 1;

		var htmls = self._htmls;
		var i, htmlDiv;
		var pos, x, y;
		for (i in htmls) {
			htmlDiv = htmls[i];

			pos = htmlDiv._zoomStartPos = domUtil.getPosition(htmlDiv);
			if (!pos) {
				continue;
			}

			x = pos[0];
			y = pos[1];

			dx = (x - aroundScreen[0]) * delta;
			dy = (y - aroundScreen[1]) * delta;

			domUtil.markPosTransform(htmlDiv, x + dx, y + dy);
			domUtil.updateTransform(htmlDiv);

			if (!ignoreAnim) {
				htmlDiv.style[transition] = mapFrame.style[transition];
			}
		}
	},

	_onZoomUpdate: function(e) {
		var self = this,
			map = self._map,
			rotate = map._rotate,
			domUtil = G.DomUtil;

		if (!self._zooming) {
			return;
		}

		self._tempScale = e.scale;

		var aroundScreen = self._aroundScreen;

		var delta = 1 / e.scale - 1 / self._scale;
		var htmls = self._htmls;
		var i, htmlDiv;
		var pos, x, y;
		for (i in htmls) {
			htmlDiv = htmls[i];

			pos = htmlDiv._zoomStartPos;
			if (!pos) {
				continue;
			}

			x = pos[0];
			y = pos[1];

			dx = (x - aroundScreen[0]) * delta;
			dy = (y - aroundScreen[1]) * delta;

			domUtil.markPosTransform(htmlDiv, x + dx, y + dy);
			domUtil.updateTransform(htmlDiv);
		}
	},

	_onZoomEnd: function() {
		var self = this,
			domUtil = G.DomUtil,
			transition = domUtil.Transition;

		self._scale = 1;

		var htmls = self._htmls;
		var i, htmlDiv;
		var pos, x, y;
		for (i in htmls) {
			htmlDiv = htmls[i];

			htmlDiv.style[transition] = '';
		}

		self._zooming = false;
	}


});
/* global G:false */
G.Layer.Image = G.Layer.extend({

	options: {
		errorImageUrl: '',
		opacity: 1.0,
		retryTimes: 3,
		crossOrigin: '*'
	},

	statics: {
		EMPTY_TILE: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3FpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoxOWUzZTA0YS1lOWFjLTljNDctODI5ZS0yMjM3YTQ3YzU3MzciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MUU5MjRFQkZCOTQxMTFFMzlDQjA5NkM1REQ1MEUwODciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MUU5MjRFQkVCOTQxMTFFMzlDQjA5NkM1REQ1MEUwODciIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmU5MjNlNDE0LWNlOTktMzk0My1hZjRjLTgwZjhiOGY1MjY0NCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoxOWUzZTA0YS1lOWFjLTljNDctODI5ZS0yMjM3YTQ3YzU3MzciLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz54esASAAAAEElEQVR42mL4//8/A0CAAQAI/AL+26JNFgAAAABJRU5ErkJggg=='
	},

	init: function(urlOrOptions /*原始的接口设计，向下兼容*/ , options) {
		var self = this;

		if (G.Util.isString(urlOrOptions)) {
			self.options = G.Util.merge({}, self.options, options);
		} else {
			self.options = G.Util.merge({}, self.options, urlOrOptions);
		}

		self._idSeq = 0;
		self._images = {};
	},

	addImage: function(imageUrl, xmin, ymin, xmax, ymax) {
		var self = this;
		var map = self._map;

		var image = G.DomUtil.create('img', 'g-image', self._container);
		var pr = G.Browser.getPxRatio();
		var res = map._res;
		var width = (xmax - xmin) / res;
		var height = (ymax - ymin) / res;
		G.DomUtil.setSize(image, width / pr[0], height / pr[1]);

		image._id = (self._idSeq++);
		image._addAt = +new Date();
		self._images[image._id] = image;

		image.geom = image.bbox = [xmin, ymin, xmax, ymax];

		image._src = imageUrl;
		self._loadImage(image);

		if (map) {
			map._requestRedraw();
		}

		return image._id;
	},

	getImage: function(id) {
		return this._images[id];
	},

	removeImage: function(id) {
		var self = this;
		var image = self._images[id];

		if (!image) {
			return;
		}

		var parent = image.parentNode;
		if (parent) {
			parent.removeChild(image);
		}

		delete self._images[id];

		if (map) {
			map._requestRedraw();
		}

		return self;
	},

	clear: function() {
		var self = this,
			map = self._map;

		var images = self._images,
			image;

		for (var i = 0, len = images.length; i < len; i++) {
			image = images[i];
			self._stopLoadingImage(image);
		}

		self._images = {};

		self._onClear();

		if (map) {
			map._requestUpdate();
		}

		return self;
	},

	_initContainer: function() {
		var self = this;
		var map = self._map;
		var domUtil = G.DomUtil;

		var container = self._container = domUtil.create('div', 'g-layer g-image-container');
		map._layersFrame.appendChild(self._container);

		domUtil.setZIndex(container, self._zIndex);
	},

	_destroyContainer: function() {
		var self = this;

		self._container.parentNode.removeChild(self._container);
		delete self._container;
	},

	_onAdded: function() {
		var self = this,
			map = self._map;

		if (!self._container) {
			self._initContainer();
		}
	},

	_onRemoved: function() {
		var self = this,
			map = self._map;

		if (self._container) {
			self._destroyContainer();
		}
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
		var self = this;
		var domUtil = G.DomUtil;

		domUtil.show(self._container);
		domUtil.setZIndex(self._container, self._zIndex);

		var images = self._images;
		var i, image;
		for (i in images) {
			image = images[i];

			self._placeImage(image);
		}
	},

	_erase: function() {
		var self = this;
		var domUtil = G.DomUtil;

		domUtil.hide(self._container);
	},

	_placeImage: function(image) {
		var self = this,
			domUtil = G.DomUtil,
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
			ty = pt[1] - imageHeight;

		domUtil.markScaleTransform(image, 1 / prX, 1 / prY);
		domUtil.markPosTransform(image, tx, ty);
		domUtil.markSizeTransform(image, imageWidth, imageHeight);
		domUtil.updateTransform(image);
		domUtil.updateOpacity(image, self.options.opacity);
	},

	_stopLoadingImages: function(container) {
		var images = container.getElementsByTagName('img'),
			image;

		for (var i = 0, len = images.length; i < len; i++) {
			image = images[i];
			this._stopLoadingImage(image);
		}
	},

	_stopLoadingImage: function(image) {
		if (!image) {
			return;
		}

		if (!image.complete) {
			var browser = G.Browser;
			if (!browser.android) {
				image.onload = null;
				image.onerror = null;
				image.src = '';
			}

			var parent = image.parentNode;
			if (parent) {
				parent.removeChild(image);
			}
		}
	},

	_loadImage: function(image, isRetry) { // 重试时不触发imageStart事件
		var self = this;

		image._layer = self;
		image._loaded = false;
		image.onload = self._onImageLoad;
		image.onerror = self._onImageError;

		if (!isRetry) {
			image._retried = 0;
			self.fireEvent('imageStart', {
				image: image,
				url: image.src
			});
		}

		image.src = image._src;
	},

	_onImageLoad: function() {
		var image = this,
			layer = image._layer;

		image._responseTime = +new Date();

		var errorUrl = layer.options.errorTileUrl || G.Layer.Tile.EMPTY_TILE;

		var tileInfo, idxX, idxY, tileZoom;
		if (image.src !== errorUrl) { // 图片加载成功并不意味加载正确，有可能加载了一个404页面

			if (('naturalWidth' in image) && !image.naturalWidth) { // HTML5支持的判断
				var errorSrc = image.src;
				image.src = errorUrl;

				layer.fireEvent('imageError', {
					image: image,
					url: errorSrc
				});
			} else {
				G.DomUtil.addClass(image, 'g-image-loaded');
				image._loaded = true;

				layer._placeImage(image);

				layer.fireEvent('imageSuccess', {
					image: image,
					url: image.src
				});
			}
		}
	},

	_onImageError: function() {
		var image = this,
			layer = image._layer;

		image._responseTime = +new Date();

		var errorUrl = layer.options.errorImageUrl || G.Layer.Image.EMPTY_TILE;

		var errorSrc = image.src;
		var tileInfo, idxX, idxY, tileZoom;
		if (image.src !== errorUrl) {
			if (image._retried++ < layer.options.retryTimes) {
				layer._loadImage(image, true);
			} else {
				image.src = errorUrl;

				layer.fireEvent('imageError', {
					image: image,
					url: errorSrc
				});
			}
		}
	},

	_onImageRemoved: function(tile) {},

	_onNewWrapImage: function(image, wrapId) {},

	_onZoomStart: function(e) {
		var self = this,
			map = self._map,
			mapFrame = map._mapFrame,
			size = map.getSize(),
			rotate = map._rotate,
			domUtil = G.DomUtil,
			transition = domUtil.Transition;

		if (!self._zooming) {
			self._zooming = true;
		}

		var centerScreen = [size[0] / 2, size[1] / 2];
		var aroundScreen = e.aroundScreen || centerScreen;
		var dx = centerScreen[0] - aroundScreen[0],
			dy = centerScreen[1] - aroundScreen[1];

		if (rotate && dx && dy) {
			var v = G.MathUtil.rotateVector([dx, dy], -rotate);

			aroundScreen = [centerScreen[0] - v[0], centerScreen[1] - v[1]];
		}

		self._aroundScreen = aroundScreen;

		self._scale = e.scale;

		var ignoreAnim = map._zoomAnim && map._zoomAnim._params.ignoreAnim;

		var delta = 1 / e.scale - 1;

		var images = self._images;
		var pos, x, y;
		var i, image;
		for (i in images) {
			image = images[i];

			pos = image._zoomStartPos = domUtil.getPosition(image);
			image._zoomStartSize = domUtil.getSize(image);
			x = pos[0];
			y = pos[1];

			dx = (x - aroundScreen[0]) * delta;
			dy = (y - aroundScreen[1]) * delta;

			domUtil.markPosTransform(image, x + dx, y + dy);
			domUtil.updateTransform(image);

			if (!ignoreAnim) {
				image.style[transition] = mapFrame.style[transition];
			}
		}
	},

	_onZoomUpdate: function(e) {
		var self = this,
			domUtil = G.DomUtil;

		if (!self._zooming) {
			return;
		}

		var aroundScreen = self._aroundScreen;

		var scale = self._scale = e.scale;

		var delta = 1 / e.scale - 1;
		var images = self._images;
		var pos, x, y;
		var i, image;
		for (i in images) {
			image = images[i];

			pos = image._zoomStartPos;
			if (!pos) {
				continue;
			}

			x = pos[0];
			y = pos[1];

			dx = (x - aroundScreen[0]) * delta;
			dy = (y - aroundScreen[1]) * delta;

			size = image._zoomStartSize;
			domUtil.markSizeTransform(image, size[0] / scale, size[1] / scale);

			domUtil.markPosTransform(image, x + dx, y + dy);
			domUtil.updateTransform(image);
		}
	},

	_onZoomEnd: function() {
		var self = this;

		self._scale = 1;

		var images = self._images;
		var i, image;
		for (i in images) {
			image = images[i];

			self._placeImage(image);
		}

		self._zooming = false;
	}


});
/* global G:false */
G.Anim = G.Class.extend({
	mixins: [G.Event],

	init: function(map) {
		var self = this;
		self._map = map;
		self._playing = false;
		return self;
	},

	// To be override by sub class.
	start: function() {},
	update: function() {}, // Animations can be update during playing
	stop: function() {}

});
/* global G:false */
G.Anim.Pan = G.Anim.extend({

	start: function(params) {
		var self = this,
			map = self._map,
			mapFrame = map._mapFrame,
			domUtil = G.DomUtil;

		if (self._playing) {
			return;
		}

		if (!params || !params.duration || !params.ease) {
			return;
		}

		G.DomDraggable.forbidden = G.DomPinchable.forbidden = true;

		self._playing = true;

		self._params = params;

		domUtil.addClass(mapFrame, 'g-pan-anim');

		var pos = domUtil.getPosition(mapFrame);
		self._srcX = pos[0];
		self._srcY = pos[1];
		self._destX = self._srcX + params.offsetX;
		self._destY = self._srcY - params.offsetY;

		clearTimeout(self._timer);
		self._timer = setTimeout(G.Util.bind(self._onTimer, self), params.duration * 1000);

		if (domUtil.Transition) {
			domUtil.addListener(mapFrame, domUtil.TransitionEnd, self._onTransitionEnd, self);
			mapFrame.style[domUtil.Transition] = 'all ' + params.duration + 's cubic-bezier(0,0,' + params.ease + ',1)';
		}

		domUtil.markPosTransform(mapFrame, self._destX, self._destY);
		domUtil.updateTransform(mapFrame);
		map.fireEvent('moveStart');

		G.Util.cancelAnimFrame(self._animFrame);
		self._animFrame = G.Util.requestAnimFrame(self._onStep, false, self);
	},

	_onStep: function() {
		var self = this,
			map = self._map;

		map.fireEvent('move');

		self._animFrame = G.Util.requestAnimFrame(self._onStep, false, self);
	},

	_onTimer: function() {
		this._final();
	},

	_final: function() {
		var self = this,
			map = self._map,
			mapFrame = map._mapFrame,
			domUtil = G.DomUtil;

		if (!self._playing) {
			return;
		}
		self._playing = false;

		clearTimeout(self._timer);
		G.Util.cancelAnimFrame(self._animFrame);

		mapFrame.style[domUtil.Transition] = '';

		domUtil.removeClass(mapFrame, 'g-pan-anim');
		map._mergeFramePos();
		map._updateUrl();

		map.fireEvent('moveEnd');

		map._checkView();

		map._requestUpdate();

		G.DomDraggable.forbidden = G.DomPinchable.forbidden = false;
	},

	_onTransitionEnd: function() {
		var self = this,
			map = self._map,
			mapFrame = map._mapFrame,
			domUtil = G.DomUtil;

		domUtil.removeListener(mapFrame, domUtil.TransitionEnd, self._onTransitionEnd, self);

		self._final();
	}

});
/* global G:false */
G.Anim.Rotate = G.Anim.extend({

	start: function(params) {
		var self = this,
			map = self._map,
			mapFrame = map._mapFrame,
			compass = map._compass,
			domUtil = G.DomUtil,
			util = G.Util;

		if (self._playing) {
			return;
		}

		if (!params || !params.duration) {
			return;
		}

		G.DomDraggable.forbidden = G.DomPinchable.forbidden = true;

		self._playing = true;

		self._params = params;

		map.fireEvent('rotateStart');

		domUtil.addClass(mapFrame, 'g-rotate-anim');

		if (domUtil.Transition) {
			domUtil.addListener(compass, domUtil.TransitionEnd, self._onTransitionEnd, self);
			compass.style[domUtil.Transition] = 'all ' + params.duration + 's linear';
		}

		if (map._isCanvasRelMode()) {
			util.cancelAnimFrame(self._animFrame);
			self._animFrame = util.requestAnimFrame(self._onStep, true, self);
		} else {
			if (domUtil.Transition) {
				domUtil.addListener(mapFrame, domUtil.TransitionEnd, self._onTransitionEnd, self);
				mapFrame.style[domUtil.Transition] = 'all ' + params.duration + 's linear';
				map._rawRotateTo(params.to);
			} else {
				self._final();
			}
		}

		self._startAt = +new Date();
		self._startRotate = map._rotate;
	},

	_onStep: function() { // Only useful in canvas mode
		var self = this,
			map = self._map;

		var startRotate = self._startRotate;

		var params = self._params;
		var dt = +new Date() - self._startAt;
		var duration = params.duration * 1e3;

		var rotate;
		if (dt < duration) {
			rotate = startRotate + (params.to - startRotate) * dt / duration;

			map._rawRotateTo(rotate);
			map._requestRedraw();

			map.fireEvent('rotate');

			self._animFrame = G.Util.requestAnimFrame(self._onStep, true, self);
		} else {
			self._final();
		}
	},

	_final: function() {
		var self = this,
			map = self._map,
			mapFrame = map._mapFrame,
			params = self._params,
			domUtil = G.DomUtil;

		if (!self._playing) {
			return;
		}
		self._playing = false;

		domUtil.removeClass(mapFrame, 'g-rotate-anim');
		map._rawRotateTo(params.to);
		map._updateUrl();

		map.fireEvent('rotateEnd');

		G.DomDraggable.forbidden = G.DomPinchable.forbidden = false;

		map._checkView();

		map._requestUpdate();
	},

	_onTransitionEnd: function() {
		var self = this,
			map = self._map,
			mapFrame = map._mapFrame,
			compass = map._compass,
			domUtil = G.DomUtil;

		domUtil.removeListener(mapFrame, domUtil.TransitionEnd, self._onTransitionEnd, self);
		domUtil.removeListener(compass, domUtil.TransitionEnd, self._onTransitionEnd, self);

		mapFrame.style[domUtil.Transition] = '';
		compass.style[domUtil.Transition] = '';

		self._final();
	}

});
/* global G:false */
G.Anim.Zoom = G.Anim.extend({

	start: function(params) {
		var self = this,
			map = self._map,
			mapFrame = map._mapFrame,
			domUtil = G.DomUtil,
			util = G.Util;

		if (self._playing) {
			return;
		}

		if (!params || !params.center || !params.width || !params.height) {
			return;
		}

		G.DomDraggable.forbidden = G.DomPinchable.forbidden = true;

		self._playing = true;

		self._params = params;

		var center = params.center,
			width = params.width,
			height = params.height,
			size = map.getSize(),
			res = map._res,
			newRes = map._calcResByViewport(center, width, height),
			scale = newRes / res,
			currentCenter = map.getCenter(),
			newCenterX = center[0],
			newCenterY = center[1],
			mx = (newRes * currentCenter[0] - res * newCenterX) / (newRes - res),
			my = (newRes * currentCenter[1] - res * newCenterY) / (newRes - res), // Map point which does not move
			am = [mx, my],
			as = map.toScreen(am);

		domUtil.addClass(mapFrame, 'g-zoom-anim');

		if (!params.ignoreAnim) {
			clearTimeout(self._timer);
			self._timer = setTimeout(G.Util.bind(self._onTimer, self), params.duration * 1000);

			if (map._isCanvasRelMode()) {
				util.cancelAnimFrame(self._animFrame);
				self._animFrame = util.requestAnimFrame(self._onStep, true, self);
			} else {
				if (domUtil.Transition) {
					domUtil.addListener(mapFrame, domUtil.TransitionEnd, self._onTransitionEnd, self);
					mapFrame.style[domUtil.Transition] = 'all ' + params.duration + 's linear';
				} else {
					self._final();
				}
			}
		}

		self._startAt = +new Date();
		self._startCenter = map.getCenter();
		self._startMapSize = [size[0] * res, size[1] * res];
		self._startRes = res;

		map.fireEvent('zoomStart', {
			aroundMap: am,
			aroundScreen: as,
			scale: scale
		});

		if (params.ignoreAnim && params.fireEnd) {
			self._final(!params.fireEnd);
		}
	},

	update: function(params) {
		var self = this,
			map = self._map,
			mapFrame = map._mapFrame,
			domUtil = G.DomUtil,
			util = G.Util;

		if (!self._playing) {
			return;
		}

		self._params = params;

		var center = params.center,
			width = params.width,
			height = params.height,
			res = self._startRes,
			newRes = map._calcResByViewport(center, width, height),
			scale = newRes / res,
			currentCenter = map.getCenter(),
			newCenterX = center[0],
			newCenterY = center[1],
			mx = newRes === res ? newCenterX : (newRes * currentCenter[0] - res * newCenterX) / (newRes - res),
			my = newRes === res ? newCenterY : (newRes * currentCenter[1] - res * newCenterY) / (newRes - res), // Map point which does not move
			am = [mx, my],
			as = map.toScreen(am);

		if (!params.ignoreAnim) {
			clearTimeout(self._timer);
			self._timer = setTimeout(G.Util.bind(self._onTimer, self), params.duration * 1e3);

			if (map._isCanvasRelMode()) {
				util.cancelAnimFrame(self._animFrame);
				self._animFrame = util.requestAnimFrame(self._onStep, true, self);
			} else {
				if (domUtil.Transition) {
					mapFrame.style[domUtil.Transition] = 'all ' + params.duration + 's linear';
				} else {
					self._final();
				}
			}
		} else {
			if (map._isCanvasRelMode()) {
				map._rawZoomTo(params.center, params.width, params.height);
				map._requestRedraw();
			}
		}

		map.fireEvent('zoomUpdate', {
			aroundMap: am,
			aroundScreen: as,
			scale: scale
		});
		map.fireEvent('zoom');

		if (params.ignoreAnim) {
			self._final();
		}
	},

	_onTimer: function() {
		this._final();
	},

	_onStep: function() { // Only useful in canvas mode
		var self = this,
			map = self._map;

		var startCenter = self._startCenter;
		var startMapSize = self._startMapSize;

		var params = self._params;
		var dt = +new Date() - self._startAt;
		var duration = params.duration * 1e3;

		var d, x, y, w, h;
		if (dt < duration) {
			d = dt / duration;
			x = startCenter[0] + (params.center[0] - startCenter[0]) * d;
			y = startCenter[1] + (params.center[1] - startCenter[1]) * d;
			w = startMapSize[0] + (params.width - startMapSize[0]) * d;
			h = startMapSize[1] + (params.height - startMapSize[1]) * d;

			map._rawZoomTo([x, y], w, h);
			map._requestRedraw();

			map.fireEvent('zoom');

			self._animFrame = G.Util.requestAnimFrame(self._onStep, true, self);
		} else {
			self._final();
		}
	},

	_final: function(ignoreFireEnd) {
		var self = this,
			map = self._map,
			mapFrame = map._mapFrame,
			params = self._params,
			domUtil = G.DomUtil;

		if (params.fireEnd) {
			if (!self._playing) {
				return;
			}
			self._playing = false;

			domUtil.removeClass(mapFrame, 'g-zoom-anim');
			map._rawZoomTo(params.center, params.width, params.height);
			map._updateUrl();

			if (!ignoreFireEnd) {
				map.fireEvent('zoomEnd');
			}

			map._checkView();

			map._requestUpdate();
		}

		G.DomDraggable.forbidden = G.DomPinchable.forbidden = false;
	},

	_onTransitionEnd: function() {
		var self = this,
			map = self._map,
			mapFrame = map._mapFrame,
			domUtil = G.DomUtil;

		domUtil.removeListener(mapFrame, domUtil.TransitionEnd, self._onTransitionEnd, self);
		mapFrame.style[domUtil.Transition] = '';

		self._final();
	}

});
/* global G:false */
G.Handler = G.Class.extend({

	init: function(map) {
		var self = this;

		self._map = map;
		self._enabled = false;

		return self;
	},

	on: function(ignoreForbidden) {
		var self = this;

		if (self._forbidden && !ignoreForbidden) {
			return self;
		}

		if (!self._enabled) {
			self._enabled = true;
			self.afterOn();
		}

		return self;
	},

	off: function() {
		var self = this;

		if (self._enabled) {
			self._enabled = false;
			self.afterOff();
		}

		return self;
	},

	// To be override by sub class.
	afterOn: function() {},
	afterOff: function() {}


});
/* global G:false */
G.Handler.Click = G.Handler.extend({

	afterOn: function() {
		var self = this,
			map = self._map;
		var domUtil = G.DomUtil;

		var virtualMouse = G.Event.virtualMouse;
		var i;
		for (i in virtualMouse.DOWN) {
			domUtil.addListener(map._mapFrame, virtualMouse.DOWN[i], self._onDown, self);
		}
		for (i in virtualMouse.UP) {
			domUtil.addListener(map._mapFrame, virtualMouse.UP[i], self._onUp, self);
		}
	},

	afterOff: function() {
		var self = this,
			map = self._map;
		var domUtil = G.DomUtil;

		var virtualMouse = G.Event.virtualMouse;
		var i;
		for (i in virtualMouse.DOWN) {
			domUtil.removeListener(map._mapFrame, virtualMouse.DOWN[i], self._onDown, self);
		}
		for (i in virtualMouse.UP) {
			domUtil.removeListener(map._mapFrame, virtualMouse.UP[i], self._onUp, self);
		}
	},

	_onDown: function(e) {
		var self = this;
		var map = self._map;
		var domUtil = G.DomUtil;
		domUtil.hide(map._spark);

		// If panning or rotating, ingore double click
		if (map.isZooming() || map.isPanning() || map.isRotating()) {
			return;
		}

		if (!e || (e.touches && e.touches.length < 1)) {
			return;
		}

		self._touchesCount = e.touches ? e.touches.length : 0;

		self._lastDown = e.touches ? e.touches[0] : e;
		if (e.touches && e.touches.length >= 2) { // 多指触摸可能不会触发up事件
			var newX = (self._lastDown.pageX + e.touches[1].pageX) / 2;
			var newY = (self._lastDown.pageY + e.touches[1].pageY) / 2;
			self._lastDown.pageX = newX;
			self._lastDown.pageY = newY;

			var mapFramePos = map._mapFrame._pos;
			var lastPt = domUtil.getMousePosition(self._lastDown, map._container);
			self._virtualClick(lastPt, self._lastDown);
		}

		self._lastTime = +new Date();
	},

	_onUp: function(e) {
		var self = this;
		var map = self._map;
		var domUtil = G.DomUtil;
		var abs = Math.abs;
		var touchTol = map.options.touchTol;

		// 屏蔽在Popup中的操作
		var current = e || e.touches[0];
		var target = current.target;
		while (target) {
			if (target.className == 'g-popup') {
				return;
			}

			target = target.parentElement;
		}

		var lastDown = self._lastDown;
		var nowUp = e.changedTouches ? e.changedTouches[0] : e;

		var mapFramePos, lastPt, nowPt, dx, dy;
		if (lastDown) { // 需要通过坐标点偏移和持续时间判断是否是一次虚拟点击，在有些移动设备上，拖动操作有可能造成lastDown和nowUp的坐标一样
			mapFramePos = map._mapFrame._pos;
			lastPt = domUtil.getMousePosition(lastDown, map._container);
			nowPt = domUtil.getMousePosition(nowUp, map._container);

			dx = abs(lastPt[0] - nowPt[0] - mapFramePos[0]);
			dy = abs(lastPt[1] - nowPt[1] - mapFramePos[1]);

			if (dx < touchTol && dy < touchTol && (+new Date()) - self._lastTime < 200) {
				self._virtualClick(lastPt, e);
			}
		}

		self._lastDown = null;
	},

	_virtualClick: function(p, originEvent) {
		var self = this;
		var map = self._map;

		var mouseScreen = p;
		var mouseMap = map.toMap(mouseScreen);
		map.fireEvent('virtualclick', { // virtualclick事件 和 click事件 的区别在于双击的时候会触发两次 virtualclick事件，而不会触发 click事件
			mapX: mouseMap[0],
			mapY: mouseMap[1],
			screenX: mouseScreen[0],
			screenY: mouseScreen[1]
		});

		if (map.options.spark) {
			self._showSpark(mouseMap, mouseScreen);
		}

		var now = +new Date();
		var duration = map.options.doubleDuration * 1e3;

		if (self._lastClick) {
			if (now - self._lastClickTime < duration) { // Double click
				clearTimeout(self._clickTimeout);

				self._lastClick = null;
				self._realDoubleClick(p, originEvent);
			} else {
				if ((originEvent.touches && self._touchesCount < 2) || (originEvent.which === 1) || (originEvent.button === 1)) {
					self._lastClick = p;
					self._realClick();
				}
			}
		} else {
			if ((originEvent.touches && self._touchesCount < 2) || (originEvent.which === 1) || (originEvent.button === 1)) {
				self._lastClick = p;
				self._clickTimeout = setTimeout(G.Util.bind(self._realClick, self), duration);
			}
		}

		self._lastClickTime = now;
	},

	_realDoubleClick: function(mouseScreen, originEvent) {
		var self = this;
		var map = self._map;

		var mouseMap = map.toMap(mouseScreen);

		var left;
		if (map.options.doubleZoom) {
			left = (originEvent.touches && self._touchesCount < 2) || (originEvent.which === 1) || (originEvent.button === 1);

			self._doubleZoom(mouseMap, !left);
		}

		map.fireEvent('doubleclick', {
			mapX: mouseMap[0],
			mapY: mouseMap[1],
			screenX: mouseScreen[0],
			screenY: mouseScreen[1]
		});
	},

	_doubleZoom: function(aroundMapPoint, up) {
		var self = this,
			map = self._map;

		if (!map.options.doubleZoom) {
			return;
		}

		var size = map.getSize(),
			res = map._res,
			newRes = G.MathUtil.limitRange(map._calcNearestRes(up), map.options.minRes, map.options.maxRes);

		if (Math.abs(newRes - res) < res / 1e2) {
			return;
		}

		var scale = newRes / res,
			w = size[0] * newRes,
			h = size[1] * newRes,
			center = map.getCenter(),
			x = aroundMapPoint[0],
			y = aroundMapPoint[1],
			newCenterX = x + (center[0] - x) * scale,
			newCenterY = y + (center[1] - y) * scale;

		map.zoomTo([newCenterX, newCenterY], w, h);
	},

	_realClick: function() {
		var self = this;
		var map = self._map;

		clearTimeout(self._clickTimeout);

		var mouseScreen = self._lastClick;
		var mouseMap = map.toMap(mouseScreen);

		self._lastClick = null;
		self._lastClickTime = +new Date();

		map.fireEvent('click', {
			mapX: mouseMap[0],
			mapY: mouseMap[1],
			screenX: mouseScreen[0],
			screenY: mouseScreen[1]
		});
	},

	_showSpark: function(mapPoint, screenPoint) {
		var self = this;
		var map = self._map;
		var domUtil = G.DomUtil;

		// If panning or rotating, ingore
		if (map.isZooming() || map.isPanning() || map.isRotating()) {
			return;
		}

		var offset = map.options.sparkOffset || [0, 0];
		var duration = map.options.sparkDuration || 1;


		var x = screenPoint[0] + offset[0];
		var y = screenPoint[1] + offset[1];

		var spark = map._spark;
		spark.geom = mapPoint;

		domUtil.markPosTransform(spark, x, y);
		domUtil.updateTransform(spark);

		var showDuration = duration / 4;
		var hideDuration = duration / 4 * 3;

		domUtil.show(spark, showDuration, function() {
			domUtil.show(spark); // 连续点击时，此时可能并没有恢复到全显示状态
			domUtil.hide(spark, hideDuration);
		});
	}

});
/* global G:false */
G.Handler.DoubleClick = G.Handler.extend({

	afterOn: function() {
		var self = this,
			map = self._map;

		G.Util.merge(map.options, {
			doubleZoom: true
		});

		map.addListener('dblclick', self._onDoubleClick, self);

		if (G.Browser.touch) {
			var virtualMouse = G.Event.virtualMouse;
			for (var i in virtualMouse.DOWN) {
				G.DomUtil.addListener(map._mapFrame, virtualMouse.DOWN[i], self._onDown, self);
			}
		}
	},

	afterOff: function() {
		var self = this,
			map = self._map;

		map.removeListener('dblclick', self._onDoubleClick, self);

		if (G.Browser.touch) {
			var virtualMouse = G.Event.virtualMouse;
			for (var i in virtualMouse.DOWN) {
				G.DomUtil.removeListener(map._mapFrame, virtualMouse.DOWN[i], self._onDown, self);
			}
		}
	},

	_onDown: function(e) {
		var self = this,
			map = self._map,
			domUtil = G.DomUtil;

		if (!e.touches) {
			return;
		}

		var dt, p, mp;
		if (self._lastTouch && self._lastTime) {
			dt = +new Date() - self._lastTime;
			if (dt < map.options.doubleDuration * 1e3) {
				// Double click
				p = domUtil.getMousePosition(self._lastTouch, map._container);
				mp = map.toMap(p);
				self._doubleZoom(mp, e.touches.length == 2 ? true : false); // 双指双击zoom out

				domUtil.stopPropagation(e);
				domUtil.preventDefault(e);

				self._lastTouch = null;
				self._lastTime = 0;

				map.fireEvent('doubleclick', {
					mapX: mp[0],
					mapY: mp[1],
					screenX: p[0],
					screenY: p[1]
				});
				return;
			}
		}

		self._lastTouch = e.touches[0];
		self._lastTime = +new Date();
	},

	_onDoubleClick: function(e) {
		var self = this;
		var map = self._map;

		// If panning or rotating, ingore double click
		if (map.isZooming() || map.isPanning() || map.isRotating()) {
			return;
		}

		map.fireEvent('doubleclick', {
			mapX: e.mapX,
			mapY: e.mapY,
			screenX: e.screenX,
			screenY: e.screenY
		});

		self._doubleZoom([e.mapX, e.mapY]);
	},

	_doubleZoom: function(aroundMapPoint, up) {
		var self = this,
			map = self._map;

		if (!map.options.doubleZoom) {
			return;
		}

		var size = map.getSize(),
			res = map._res,
			newRes = G.MathUtil.limitRange(map._calcNearestRes(up), map.options.minRes, map.options.maxRes);

		if (Math.abs(newRes - res) < res / 1e2) {
			return;
		}

		var scale = newRes / res,
			w = size[0] * newRes,
			h = size[1] * newRes,
			center = map.getCenter(),
			x = aroundMapPoint[0],
			y = aroundMapPoint[1],
			newCenterX = x + (center[0] - x) * scale,
			newCenterY = y + (center[1] - y) * scale;

		map.zoomTo([newCenterX, newCenterY], w, h);
	}

});
/* global G:false */
G.Handler.Drag = G.Handler.extend({

	afterOn: function() {
		var self = this,
			map = self._map;

		if (!self._draggable) {
			self._draggable = new G.DomDraggable(map._mapFrame, map._container, map.options.dragEdge);

			self._draggable.addListener('dragStart', self._onDragStart, self);
			self._draggable.addListener('drag', self._onDrag, self);
			self._draggable.addListener('dragEnd', self._onDragEnd, self);

			self._draggable.on();
		}
	},

	afterOff: function() {
		var self = this;

		if (self._draggable) {
			self._draggable.off();

			self._draggable.removeListener('dragStart', self._onDragStart, self);
			self._draggable.removeListener('drag', self._onDrag, self);
			self._draggable.removeListener('dragEnd', self._onDragEnd, self);

			delete self._draggable;
		}
	},

	_onDragStart: function(e) {
		var self = this;
		var map = self._map;
		var domUtil = G.DomUtil;
		var mapFrame = map._mapFrame;
		var mapOptions = map.options;

		if (map._panAnim) {
			map._panAnim.stop();
		}

		// If zooming or panning or rotating, ingore drag
		if (map.isZooming() || map.isPanning() || map.isRotating()) {
			return;
		}

		if (self._dragging) {
			return;
		}
		self._dragging = true;

		domUtil.preventDefault(e);
		domUtil.stopPropagation(e);

		mapFrame.style[domUtil.Transition] = '';

		if (mapOptions.panAnim) {
			self._poses = [];
			self._times = [];
		}

		self._mergedFramePos = [0, 0];


		var size, screenExtent, res, center;
		var hw, hh, rotate, theta, newHw, newHh;
		var maxDrawExtent;
		var abs = Math.abs,
			sin = Math.sin,
			cos = Math.cos,
			round = Math.round;
		var dLeft, dDown, dRight, dUp;
		var maxExtent = mapOptions.maxExtent;
		if (maxExtent) { // Max extent limit
			size = map.getSize();
			screenExtent = [0, 0, size[0], size[1]];
			res = map._res;

			hw = (maxExtent[2] - maxExtent[0]) / 2 / res;
			hh = (maxExtent[3] - maxExtent[1]) / 2 / res;

			rotate = map._rotate;
			if (rotate) {
				theta = rotate / G.MathUtil.DEGREE_PER_RADIAN;
				newHw = abs(hw * cos(theta)) + abs(hh * sin(theta));
				newHh = abs(hw * sin(theta)) + abs(hh * cos(theta));
			} else {
				newHw = hw;
				newHh = hh;
			}

			center = map.toScreen([(maxExtent[2] + maxExtent[0]) / 2, //
				(maxExtent[3] + maxExtent[1]) / 2
			]);

			maxDrawExtent = [round(center[0] - newHw), //
				round(center[1] - newHh), //
				round(center[0] + newHw), //
				round(center[1] + newHh)
			];

			if (maxDrawExtent[0] > screenExtent[0]) {
				dLeft = (screenExtent[0] - maxDrawExtent[0]);
			} else {
				dLeft = (screenExtent[2] - maxDrawExtent[2]);
			}

			if (maxDrawExtent[3] < screenExtent[3]) {
				dDown = (screenExtent[3] - maxDrawExtent[3]);
			} else {
				dDown = (screenExtent[1] - maxDrawExtent[1]);
			}

			if (maxDrawExtent[2] < screenExtent[2]) {
				dRight = (screenExtent[2] - maxDrawExtent[2]);
			} else {
				dRight = (screenExtent[0] - maxDrawExtent[0]);
			}

			if (maxDrawExtent[1] > screenExtent[1]) {
				dUp = (screenExtent[1] - maxDrawExtent[1]);
			} else {
				dUp = (screenExtent[3] - maxDrawExtent[3]);
			}

			if (mapOptions.wrap) {
				dLeft = -Number.MAX_VALUE;
				dRight = Number.MAX_VALUE;
			}

			self._draggable._dLimit = [dLeft, dDown, dRight, dUp]; // - + + -
		}

		map.fireEvent('moveStart');
	},

	_onDrag: function(e) {
		var self = this,
			map = self._map;
		var domUtil = G.DomUtil;

		if (!self._dragging) {
			return;
		}

		domUtil.preventDefault(e);
		domUtil.stopPropagation(e);

		clearTimeout(self._timeout);
		self._timeout = setTimeout(G.Util.bind(self._checkStay, self), 500);

		if (map.options.panAnim) {
			var time = self._lastTime = +new Date();
			var pos = self._lastPos = [self._draggable._newX, self._draggable._newY];

			self._poses.push(pos);
			self._times.push(time);

			if (time - self._times[0] > 40) { // ~= 1000/24
				self._poses.shift();
				self._times.shift();
			}
		}

		map.fireEvent('move');
	},

	_onDragEnd: function(e) {
		var self = this,
			map = self._map,
			options = map.options,
			delay = +new Date() - self._lastTime;
		var domUtil = G.DomUtil;

		if (!self._dragging) {
			return;
		}
		self._dragging = false;

		domUtil.preventDefault(e);
		domUtil.stopPropagation(e);

		clearTimeout(self._timeout);

		if (!options.panAnim || delay > 100 || !self._poses[0] || G.Browser.ielt9) {
			self._final();
		} else {
			var directionX = self._lastPos[0] - self._poses[0][0],
				directionY = self._lastPos[1] - self._poses[0][1],
				secs = (self._lastTime + delay - self._times[0]) / 1e3,
				ease = options.panAnimEase,
				speedX = directionX * ease / secs,
				speedY = directionY * ease / secs,
				speed = Math.pow(speedX * speedX + speedY * speedY, 0.5),
				limitSpeed = Math.min(options.panAnimMaxSpeed, speed),
				scale = limitSpeed / speed,
				limitSpeedX = speedX * scale,
				limitSpeedY = speedY * scale,
				duration = options.panAnimDuration,
				offsetX = limitSpeedX * duration,
				offsetY = -limitSpeedY * duration;

			if (!offsetX && !offsetY) {
				self._final();
			} else {
				var dLimit = self._draggable._dLimit;
				if (dLimit) {
					var dLeft = Math.min(dLimit[0], 0); // -
					var dDown = Math.max(dLimit[1], 0); // +
					var dRight = Math.max(dLimit[2], 0); // +
					var dUp = Math.min(dLimit[3], 0); // -

					var mapFramePos = map._mapFrame._pos;
					var dOffsetX = offsetX + mapFramePos[0];
					var dOffsetY = -offsetY + mapFramePos[1];
					dOffsetX = Math.min(Math.max(dOffsetX, dLeft), dRight);
					dOffsetY = Math.min(Math.max(dOffsetY, dUp), dDown);

					offsetX = dOffsetX - mapFramePos[0];
					offsetY = mapFramePos[1] - dOffsetY;
				}

				map.panBy(offsetX, offsetY, {
					duration: duration,
					ease: ease
				});
			}
		}
	},

	_final: function() {
		var self = this,
			map = self._map;

		map._mergeFramePos();
		map._updateUrl();
		map.fireEvent('moveEnd');

		map._checkView();

		map._requestUpdate();
	},

	_checkStay: function() {
		var self = this,
			map = self._map;

		//var domUtil = G.DomUtil;
		//var mapFrame = map._mapFrame;
		//var mapFramePos = domUtil.getPosition(mapFrame);
		//var draggable = self._draggable;

		//map._mergeFramePos();

		//draggable._startX -= mapFramePos[0];
		//draggable._startY -= mapFramePos[1];

		if (map.options.panAnim) {
			self._poses = [];
			self._times = [];
		}

		//map._requestUpdate();
	}

});
/* global G:false */
G.Handler.ScrollWheel = G.Handler.extend({

	afterOn: function() {
		var self = this,
			map = self._map,
			domUtil = G.DomUtil;

		G.Util.merge(map.options, {
			scrollWheelZoom: true
		});

		self._toDelta = 0;

		map.addListener('mousewheel', self._onMouseWheel, self);
		domUtil.addListener(map._container, 'MozMousePixelScroll', domUtil.preventDefault);
	},

	afterOff: function() {
		var self = this,
			map = self._map,
			domUtil = G.DomUtil;

		map.removeListener('mousewheel', self._onMouseWheel, self);
		domUtil.removeListener(map._container, 'MozMousePixelScroll', domUtil.preventDefault);
	},

	_onMouseWheel: function(e) {
		var self = this,
			map = self._map,
			options = map.options,
			domUtil = G.DomUtil;

		if (!map._isLoaded() || !options.scrollWheelZoom) {
			return;
		}

		// If panning or rotating, ingore scroll wheel
		if (map.isPanning() || map.isRotating()) {
			return;
		}

		domUtil.preventDefault(e);
		domUtil.stopPropagation(e);

		var delta = domUtil.getWheelDelta(e.originEvent);

		if (G.Browser.ielt9 || !map.options.continuouslyZoom) {
			self._mouseMap = [e.mapX, e.mapY];

			if (self._toDelta * delta < 0) {
				self._toDelta = 0;
			}

			self._toDelta += delta;
			if (self._toDelta > 3) {
				self._toDelta = 0;
				self._zoomByLod();
			} else if (self._toDelta < -3) {
				self._toDelta = 0;
				self._zoomByLod(1);
			}

			return;
		}

		var zoomAnim = map._zoomAnim;
		if (zoomAnim && zoomAnim._playing) {
			// Is zooming now
			self._toDelta += delta;

			var duration = options.zoomAnimDuration > 0 ? options.zoomAnimDuration * 1000 : 500;
			clearTimeout(self._timer);
			self._timer = setTimeout(G.Util.bind(self._onTimer, self), duration);

		} else {
			self._mouseMap = [e.mapX, e.mapY];
			self._toDelta = delta;

			self._startRes = map._res;
			self._startCenter = map.getCenter();

		}

		self._toDelta = G.MathUtil.limitRange(self._toDelta, -80, 80);
		self._tempZoom();
	},

	_onTimer: function() {
		this._finalZoom();
	},

	_calcScale: function(delta) {
		return Math.pow(2, delta / -20);
	},

	_zoomByLod: function(up) {
		var self = this,
			map = self._map,
			options = map.options,
			minRes = options.minRes,
			maxRes = options.maxRes;

		var size = map.getSize(),
			res = map._res,
			newRes = G.MathUtil.limitRange(map._calcNearestRes(up), minRes, maxRes);

		if (Math.abs(newRes - res) < res / 1e4) {
			return;
		}

		scale = newRes / res;

		var w = size[0] * newRes,
			h = size[1] * newRes,
			currentCenter = map.getCenter(),
			mapX = self._mouseMap[0],
			mapY = self._mouseMap[1],
			newCenterX = mapX + (currentCenter[0] - mapX) * scale,
			newCenterY = mapY + (currentCenter[1] - mapY) * scale;

		self._newCenter = [newCenterX, newCenterY];
		self._newWidth = w;
		self._newHeight = h;

		map.zoomTo(self._newCenter, self._newWidth, self._newHeight, {
			fireEnd: true
		});
	},

	_tempZoom: function() {
		var self = this,
			map = self._map,
			options = map.options,
			minRes = options.minRes,
			maxRes = options.maxRes;

		var size = map.getSize(),
			res = self._startRes,
			scale = self._calcScale(self._toDelta),
			newRes = G.MathUtil.limitRange(scale * res, minRes, maxRes);

		scale = newRes / res;

		var w = size[0] * newRes,
			h = size[1] * newRes,
			currentCenter = self._startCenter,
			mapX = self._mouseMap[0],
			mapY = self._mouseMap[1],
			newCenterX = mapX + (currentCenter[0] - mapX) * scale,
			newCenterY = mapY + (currentCenter[1] - mapY) * scale;

		self._newCenter = [newCenterX, newCenterY];
		self._newWidth = w;
		self._newHeight = h;

		if (newRes == self._lastRes) {
			clearTimeout(self._timer);
			self._timer = setTimeout(G.Util.bind(self._onTimer, self), 250); // 连续滚动鼠标之间有一个缓冲时间
			return;
		}

		self._lastRes = newRes;

		map.zoomTo(self._newCenter, self._newWidth, self._newHeight, {
			ignoreAnim: true,
			fireEnd: false
		});
	},

	_finalZoom: function() {
		var self = this,
			map = self._map;

		map.zoomTo(self._newCenter, self._newWidth, self._newHeight, {
			ignoreAnim: true
		});
	}

});
/* global G:false */
G.Handler.ShiftDrag = G.Handler.extend({

	afterOn: function() {
		var self = this,
			map = self._map;

		G.Util.merge(map.options, {
			dragZoom: true
		});

		map.addListener('mousedown', self._onMouseDown, self);
	},

	afterOff: function() {
		var self = this,
			map = self._map;

		map.removeListener('mousedown', self._onMouseDown, self);
	},

	_onMouseDown: function(e) {
		var oe = e.originEvent;
		if (!oe || !oe.shiftKey || ((oe.which !== 1) && (oe.button !== 1))) {
			return false;
		}

		var self = this,
			map = self._map,
			domUtil = G.DomUtil,
			addDomListener = domUtil.addListener;

		domUtil.preventDefault(e);
		domUtil.stopPropagation(e);

		domUtil.disableTextSelection();
		domUtil.disableImageDrag();

		var startScreen = self._startScreen = [e.screenX, e.screenY];

		var box = self._box = {
			lt: domUtil.create('div', 'g-zoom-box', map._mapFrame),
			rt: domUtil.create('div', 'g-zoom-box', map._mapFrame),
			lb: domUtil.create('div', 'g-zoom-box', map._mapFrame),
			rb: domUtil.create('div', 'g-zoom-box', map._mapFrame),
			l: domUtil.create('div', 'g-zoom-box g-zoom-box-left', map._mapFrame),
			r: domUtil.create('div', 'g-zoom-box g-zoom-box-right', map._mapFrame),
			t: domUtil.create('div', 'g-zoom-box g-zoom-box-top', map._mapFrame),
			b: domUtil.create('div', 'g-zoom-box g-zoom-box-bottom', map._mapFrame)
		};

		for (var key in box) {
			domUtil.setPosition(box[key], startScreen[0], startScreen[1]);
			domUtil.setZIndex(box[key], map.options.topZIndex);
		}

		var computedStyle = window.getComputedStyle;
		var computedStyleL = computedStyle(box.l),
			computedStyleR = computedStyle(box.r),
			computedStyleT = computedStyle(box.t),
			computedStyleB = computedStyle(box.b);

		self._boxBorders = computedStyle ? {
			l: parseInt(computedStyleL['border-right-width'] || computedStyleL.borderRightWidth) || 0,
			r: parseInt(computedStyleR['border-left-width'] || computedStyleR.borderLeftWidth) || 0,
			t: parseInt(computedStyleT['border-bottom-width'] || computedStyleT.borderBottomWidth) || 0,
			b: parseInt(computedStyleB['border-top-width'] || computedStyleB.borderTopWidth) || 0
		} : {
			l: parseInt(box.l.currentStyle['border-right-width']) || 0,
			r: parseInt(box.r.currentStyle['border-left-width']) || 0,
			t: parseInt(box.t.currentStyle['border-bottom-width']) || 0,
			b: parseInt(box.b.currentStyle['border-top-width']) || 0
		};

		map._container.style.cursor = 'crosshair';

		addDomListener(document, 'mousemove', self._onMouseMove, self);
		addDomListener(document, 'mouseup', self._onMouseUp, self);

		map.fireEvent('shiftDragStart');
	},

	_onMouseMove: function(e) {
		var self = this,
			map = self._map,
			rotate = map._rotate,
			size = map.getSize(),
			drawSize = map.getDrawSize(),
			isCanvasRel = map._isCanvasRelMode(),
			w = isCanvasRel ? size[0] : drawSize[0],
			h = isCanvasRel ? size[1] : drawSize[1],
			domUtil = G.DomUtil,
			setDomPosition = domUtil.setPosition,
			setDomSize = domUtil.setSize,
			min = Math.min,
			max = Math.max,
			abs = Math.abs,
			box = self._box,
			boxBorders = self._boxBorders,
			startScreen = self._startScreen,
			currentPoint = domUtil.getMousePosition(e, map._container),
			offsetX = max(0, abs(currentPoint[0] - startScreen[0]) - boxBorders.l - boxBorders.r),
			offsetY = max(0, abs(currentPoint[1] - startScreen[1]) - boxBorders.t - boxBorders.b),
			minX = min(currentPoint[0], startScreen[0]),
			minY = min(currentPoint[1], startScreen[1]);

		var x = 0,
			y = 0;
		if (!isCanvasRel) {
			var center = map.getCenter();
			var res = map._res;
			var pt = map.toScreen([center[0] - res * drawSize[0] / 2, center[1] + res * drawSize[1] / 2], 0, 0, true);
			x = pt[0];
			y = pt[1];

			minX -= (drawSize[0] - size[0]) / 2;
			minY += (drawSize[1] - size[1]) / 2;
		}

		x = parseInt(x);
		y = parseInt(y);

		offsetX = parseInt(offsetX);
		offsetY = parseInt(offsetY);
		minX = parseInt(minX);
		minY = parseInt(minY);

		domUtil.preventDefault(e);
		domUtil.stopPropagation(e);

		if (minX < 0) {
			offsetX += minX;
			minX = 0;
		}
		if (minY < 0) {
			offsetY += minY;
			minY = 0;
		}
		var offsetXMax = w - minX - boxBorders.l - boxBorders.r,
			offsetYMax = h - minY - boxBorders.t - boxBorders.b;

		offsetX = offsetX > offsetXMax ? offsetXMax : offsetX;
		offsetY = offsetY > offsetYMax ? offsetYMax : offsetY;

		setDomPosition(box.lt, x, y);
		setDomSize(box.lt, minX, minY);

		setDomPosition(box.rt, x + minX + offsetX, y);
		setDomSize(box.rt, w - minX - offsetX, minY);

		setDomPosition(box.lb, x, y + minY + offsetY);
		setDomSize(box.lb, minX, h - minY - offsetY);

		setDomPosition(box.rb, x + minX + offsetX, y + minY + offsetY);
		setDomSize(box.rb, w - minX - offsetX, h - minY - offsetY);

		setDomPosition(box.l, x, y + minY);
		setDomSize(box.l, minX, offsetY);

		setDomPosition(box.r, x + minX + offsetX, y + minY);
		setDomSize(box.r, w - minX - offsetX, offsetY);

		setDomPosition(box.t, x + minX, y);
		setDomSize(box.t, offsetX, minY);

		setDomPosition(box.b, x + minX, y + minY + offsetY);
		setDomSize(box.b, offsetX, h - minY - offsetY);
	},

	_onMouseUp: function(e) {
		var self = this,
			map = self._map,
			res = map._res,
			rotate = map._rotate,
			rotateRadian = rotate / G.MathUtil.DEGREE_PER_RADIAN,
			domUtil = G.DomUtil,
			removeDomListener = domUtil.removeListener,
			startScreen = self._startScreen,
			endPoint = domUtil.getMousePosition(e, map._container);

		domUtil.preventDefault(e);
		domUtil.stopPropagation(e);

		for (var key in self._box) {
			map._mapFrame.removeChild(self._box[key]);
		}

		map._container.style.cursor = '';

		domUtil.enableTextSelection();
		domUtil.enableImageDrag();

		removeDomListener(document, 'mousemove', self._onMouseMove, self);
		removeDomListener(document, 'mouseup', self._onMouseUp, self);

		var max = Math.max,
			abs = Math.abs,
			boxBorders = self._boxBorders,
			offsetX = endPoint[0] - startScreen[0] - boxBorders.l - boxBorders.r,
			offsetY = endPoint[1] - startScreen[1] - boxBorders.t - boxBorders.b;

		if (offsetX === 0 && offsetX === 0) {
			return;
		}

		map.fireEvent('shiftDragEnd');

		var toScreenCenter = [startScreen[0] + offsetX / 2, startScreen[1] + offsetY / 2];
		var toCenter = map.toMap(toScreenCenter);

		var width = abs(offsetX) * res,
			height = abs(offsetY) * res;
		if (rotate) {
			width *= Math.cos(rotateRadian);
			height *= Math.cos(rotateRadian);
		}

		map.zoomTo(toCenter, width, height);
	}

});
/* global G:false */
G.Handler.Pinch = G.Handler.extend({

	afterOn: function() {
		var self = this,
			map = self._map;

		if (!self._pinchable) {
			self._pinchable = new G.DomPinchable(map._mapFrame, map._container);

			self._pinchable.addListener('pinchStart', self._onPinchStart, self);
			self._pinchable.addListener('pinch', self._onPinch, self);
			self._pinchable.addListener('pinchEnd', self._onPinchEnd, self);

			self._pinchable.on();
		}
	},

	afterOff: function() {
		var self = this;

		if (self._pinchable) {
			self._pinchable.off();

			self._pinchable.removeListener('pinchStart', self._onPinchStart, self);
			self._pinchable.removeListener('pinch', self._onPinch, self);
			self._pinchable.removeListener('pinchEnd', self._onPinchEnd, self);

			delete self._pinchable;
		}
	},

	_onPinchStart: function(e) {
		var self = this;
		var map = self._map;
		var mathUtil = G.MathUtil;

		if (map._zoomAnim) {
			map._zoomAnim.stop();
		}

		if (self._pinching) {
			return;
		}
		self._pinching = true;

		map.fireEvent('pinchStart');

		var mousePos1 = G.DomUtil.getMousePosition(e.originTouch1, map._container);
		var mousePos2 = G.DomUtil.getMousePosition(e.originTouch2, map._container);
		var x1 = mousePos1[0],
			y1 = mousePos1[1],
			x2 = mousePos2[0],
			y2 = mousePos2[1];
		var x = x1 - x2,
			y = y1 - y2;

		self._pinchStart = [(x1 + x2) / 2, (y1 + y2) / 2];
		self._pinchStartMap = map.toMap(self._pinchStart);
		self._pinchStartDis = mathUtil.calcHypotenuse(x, y);
		self._pinchStartRotate = mathUtil.calcTheta(x, y);
		self._pinchRotateIdle = 0; // 旋转空程

		self._startRes = map._res;
		self._startRotate = map._rotate;
		self._startCenter = map._center;

		self._rotating = false; // If pinch an amount degree, enter rotating mode
		self._zooming = false; // If pinch an amount scale, enter zooming mode

		//map.fireEvent('zoomStart');

		map._handlers.Click._lastDown = null; // Make sure no click event invoked by pinch

		var mode = map._mode;
		if (mode != 'webgl' && mode != 'canvas') {
			map._mapFrame.style[G.DomUtil.Transition] = '';
		}
	},

	_onPinch: function(e) {
		var self = this;
		var map = self._map;

		if (!self._pinching) {
			return;
		}

		self._temp(e);
		map.fireEvent('pinch');
	},

	_onPinchEnd: function() {
		var self = this;
		var map = self._map;
		var options = map.options;
		var minRes = options.minRes;
		var maxRes = options.maxRes;

		if (!self._pinching) {
			return;
		}
		self._pinching = false;

		map.fireEvent('pinchEnd');

		self._final();

		if (!map.options.continuouslyZoom) {
			var startRes = self._startRes;
			var res = map._res;
			if (Math.abs(startRes - res) < res / 1e4) {
				return;
			}

			var up = res > startRes;
			var newRes = G.MathUtil.limitRange(map._calcNearestRes(up), minRes, maxRes);

			if (Math.abs(newRes - res) < res / 1e4) {
				return;
			}

			var scale = newRes / res;

			var size = map.getSize();
			var w = size[0] * newRes,
				h = size[1] * newRes,
				currentCenter = map.getCenter(),
				mapX = self._pinchStartMap[0],
				mapY = self._pinchStartMap[1],
				newCenterX = mapX + (currentCenter[0] - mapX) * scale,
				newCenterY = mapY + (currentCenter[1] - mapY) * scale;

			self._newCenter = [newCenterX, newCenterY];
			self._newWidth = w;
			self._newHeight = h;

			map.zoomTo(self._newCenter, self._newWidth, self._newHeight, {
				fireEnd: true
			});
		}
	},

	_temp: function(e) {
		var self = this,
			map = self._map,
			options = map.options,
			minRes = options.minRes,
			maxRes = options.maxRes,
			size = map.getSize();

		var mathUtil = G.MathUtil;
		var abs = Math.abs;
		var max = Math.max;

		var mousePos1 = G.DomUtil.getMousePosition(e.originTouch1, map._container);
		var mousePos2 = G.DomUtil.getMousePosition(e.originTouch2, map._container);
		var nowX1 = mousePos1[0],
			nowY1 = mousePos1[1],
			nowX2 = mousePos2[0],
			nowY2 = mousePos2[1];

		var pinchNow = [(nowX1 + nowX2) / 2, (nowY1 + nowY2) / 2];
		var pinchDis = mathUtil.calcHypotenuse(nowX1 - nowX2, nowY1 - nowY2);

		var pinchRotate, deltaRotate = 0;
		if (options.pinchRotate) {
			pinchRotate = mathUtil.calcTheta(nowX1 - nowX2, nowY1 - nowY2);
			deltaRotate = pinchRotate - self._pinchStartRotate;

			if (!self._rotating && abs(deltaRotate) > 0.4) { // 旋转空程，防止手指捏合的时候太容易旋转
				self._pinchRotateIdle = deltaRotate;

				self._rotating = 1;
				map.fireEvent('rotateStart');

				// 旋转开始时，先应用当前的缩放，后面的操作重新计算
				var pinchStartDis = self._pinchStartDis;
				var deltaBase = max(max(size[0] / 2, size[1] / 2), pinchStartDis);
				var deltaDis = pinchDis - pinchStartDis;
				var scale = Math.pow(2, -deltaDis / deltaBase);
				var newRes = mathUtil.limitRange(scale * self._startRes, minRes, maxRes);
				var pinchStartMap = self._pinchStartMap;
				var x = nowX1 - nowX2,
					y = nowY1 - nowY2;
				var v = [pinchNow[0] - size[0] / 2, pinchNow[1] - size[1] / 2];
				v = mathUtil.rotateVector(v, -map._rotate);
				map._rawZoomTo([pinchStartMap[0] - v[0] * newRes, pinchStartMap[1] + v[1] * newRes], size[0] * newRes, size[1] * newRes);

				self._pinchStart = pinchNow;
				self._pinchStartMap = map.toMap(self._pinchStart);
				self._pinchStartDis = mathUtil.calcHypotenuse(x, y);

				self._startRes = map._res;
				self._startRotate = map._rotate;
				self._startCenter = map._center;
			}

			if (self._rotating) {
				deltaRotate -= self._pinchRotateIdle;
			} else {
				deltaRotate = 0;
			}

			self._newRotate = self._startRotate + deltaRotate * mathUtil.DEGREE_PER_RADIAN;

			map._rawRotateTo(self._newRotate);
		}

		var newRes = self._startRes;
		if (options.pinchZoom) {
			if (!self._zooming) {
				self._zooming = 1;
				map.fireEvent('zoomStart');
			}

			if (self._zooming) {
				var pinchStartDis = self._pinchStartDis;
				var deltaBase = max(max(size[0] / 2, size[1] / 2), pinchStartDis);
				var deltaDis = pinchDis - pinchStartDis;
				var scale = Math.pow(2, -deltaDis / deltaBase);

				newRes = mathUtil.limitRange(scale * self._startRes, minRes, maxRes);
			}

			var v = [pinchNow[0] - size[0] / 2, pinchNow[1] - size[1] / 2];
			var pinchStartMap = self._pinchStartMap;
			self._newCenter = [pinchStartMap[0] - v[0] * newRes, pinchStartMap[1] + v[1] * newRes];
			self._newWidth = size[0] * newRes;
			self._newHeight = size[1] * newRes;

			map._rawZoomTo(self._newCenter, self._newWidth, self._newHeight);
		}

		if (self._rotating) {
			map.fireEvent('rotate');
		}
		if (self._zooming) {
			map.fireEvent('zoom');
		}

		map._requestRedraw();
	},

	_final: function() {
		var self = this,
			map = self._map;

		if (self._rotating) {
			map.fireEvent('rotateEnd');

			self._rotating = 0;
		}

		if (self._zooming) {
			map.fireEvent('zoomEnd');

			self._zooming = 0;
		}

		map._checkView();

		map._requestUpdate();
	}

});
/* global G:false */
G.Map = G.Class.extend({
	mixins: [G.Event],

	options: { // Default options
		srid: 3857, //spatial reference
		wrap: true,
		minRes: 0.298582141738892,
		maxRes: 156543.033928,
		maxExtent: [-20037508.342784, -20037508.342784, 20037508.342784, 20037508.342784], //Extent: [xmin, ymin, xmax, ymax]
		scrollPage: false,
		zoomAnim: true,
		zoomAnimDuration: 0.3, // s
		panAnim: true, // Inertia
		panAnimMaxSpeed: 1e3, // px/s
		panAnimDuration: 0.3, // s
		panAnimEase: 0.3,
		rotateAnim: true,
		rotateAnimDuration: 0.3, // s
		tolerance: 1e-5,
		topZIndex: 100,
		doubleDuration: 0.3, // s
		hideLogo: false,
		doubleZoom: true,
		pinchZoom: true,
		pinchRotate: true,
		dragPan: true,
		shiftZoom: true,
		scrollZoom: true,
		continuouslyZoom: true,
		touchTol: 8, // px
		dragEdge: 8, // px，在手机上经常有从屏幕边缘切入的操作，这个参数用于避免在手机上进行切入操作但是同时平移了地图的现象
		recordStatus: true,
		mask: false,
		maskColor: '#000',
		maskOpacity: 1.0,
		spark: true,
		sparkOffset: [-24, -24],
		sparkDuration: 1, // s
		canvasAnimRedraw: false, // Canvas模式下显示动画时是否重绘数据，默认不重绘，重绘效果更加连续但是对性能会有影响
		canvasExpandFactor: 0.25, // Canvas地图扩展显示的比例，使得Canvas地图拖动不会出现空白
		glColor: '#fff', // WebGL背景色，其余模式下背景均为透明，WebGL无法使背景透明，必须指定颜色
		initStatus: {
			center: [0, 0],
			res: 156543.033928,
			rotate: 0
		} //{Map center, Resolution, Rotate} 		
	},

	init: function(containerId, options) {
		var map = this;

		var container = map._container = G.DomUtil.get(containerId);
		map.options = G.Util.merge({}, map.options, options);

		if (!container) {
			throw new Error('No map container!');
		}

		if (container._initBy !== G.name) {
			map._initLayout();
			map._initListeners();
			map._initHandlers();
			map._initAddition();

			container._initBy = G.name;

			map._onResize()
			map.fireEvent('resize');
		}


		map._center = map.options.initStatus.center || [0, 0]; // Map center
		map._res = map.options.initStatus.res || 156543.033928; // Resolution
		map._rotate = map.options.initStatus.rotate || 0; // Rotate angle in degree

		map._extent = [];
		map._layerIdSeq = 0;
		map._layers = {};
		map._layerOrder = [];

		map._masks = [];

		if (map._rotate) {
			map._updateCompass(map._rotate);
			map._updateDrawSize();
		}

		map._ensureViewByUrl();
	},

	resize: function() {
		var map = this;
		var container = map._container;
		var w = container.offsetWidth,
			h = container.offsetHeight;

		map._size = [w, h];

		map.view(map._center, map._width, map._height, map._rotate);

		map._onResize();
		map.fireEvent('resize');

		return map;
	},

	redraw: function() {
		var self = this;
		self._requestRedraw();
		return self;
	},

	update: function() {
		var self = this;
		self._requestUpdate();
		return self;
	},

	getExtent: function(expandDis) {
		var self = this,
			size = self.getSize(),
			center = self.getCenter(),
			res = self._res;

		var dis = expandDis || 0;
		var hw = size[0] * res / 2 + dis,
			hh = size[1] * res / 2 + dis;

		return [center[0] - hw, center[1] - hh, center[0] + hw, center[1] + hh];
	},

	getRedrawExtent: function(expandDis) {
		var self = this,
			drawSize = self.getDrawSize(),
			center = self.getCenter(),
			res = self._res;

		var mapOptions = self.options;

		var sizeFactor = self._isCanvasRelMode() ? 1 + 2 * mapOptions.canvasExpandFactor : 1;

		var dis = expandDis || 0;
		var hw = (drawSize[0] * res / 2 + dis) * sizeFactor,
			hh = (drawSize[1] * res / 2 + dis) * sizeFactor;

		var xmin = center[0] - hw,
			ymin = center[1] - hh,
			xmax = center[0] + hw,
			ymax = center[1] + hh;

		var extent = [xmin, ymin, xmax, ymax];

		if (mapOptions.wrap) {
			var maxExtent = mapOptions.maxExtent;
			var maxExtentXmin = maxExtent[0];
			var maxExtentXmax = maxExtent[2];
			if (xmin < maxExtentXmin) {
				extent[2] = Math.max(xmax, maxExtentXmax + maxExtentXmin - xmin);
			}

			if (xmax > maxExtentXmax) {
				extent[0] = Math.min(xmin, maxExtentXmin + maxExtentXmax - xmax);
			}
		}

		return extent;
	},

	getRotate: function() {
		return this._rotate;
	},

	getSize: function() {
		var self = this;

		if (!self._size) {
			var container = self._container;
			if (container) {
				self._size = [container.offsetWidth, container.offsetHeight];
			}
		}

		return self._size;
	},

	getDrawSize: function() {
		var self = this;

		if (!self._drawSize) {
			self._updateDrawSize();
		}

		return self._drawSize;
	},

	getLayers: function() {
		return this._layers;
	},

	getLayer: function(id) {
		return this._layers[id];
	},

	addLayer: function(layer) {
		var self = this;

		if (layer instanceof G.Layer) {
			layer.addTo(self);
			return layer._id;
		}
	},

	addMask: function(graphic) {
		var self = this;

		if (graphic instanceof G.Graphic.Polygon || graphic instanceof G.Graphic.Circle) {
			graphic._map = self;
			self._masks.push(graphic);
			self._requestRedraw();
		}

		return self;
	},

	clearMask: function() {
		var self = this;

		self._masks = [];
		self._requestRedraw();

		return self;
	},

	view: function(center, width, height, rotate) {
		var self = this;

		self._rawView(center, width, height, rotate);
		self._updateUrl();

		self._checkView();

		self._requestUpdate();

		return self;
	},

	centerAt: function(center, options) {
		var self = this;

		var currentCenter = self._center;
		var res = self._res;
		var offsetX = (currentCenter[0] - center[0]) / res;
		var offsetY = (currentCenter[1] - center[1]) / res;

		return self.panBy(offsetX, offsetY, options);
	},

	zoomTo: function(center, width, height, options) {
		var self = this,
			mapOptions = self.options;

		var size = self._size;
		var maxRes = mapOptions.maxRes;
		var minRes = mapOptions.minRes;
		var maxWidth = maxRes ? size[0] * maxRes : width;
		var minWidth = minRes ? size[0] * minRes : width;
		var maxHeight = maxRes ? size[1] * maxRes : height;
		var minHeight = minRes ? size[1] * minRes : height;

		var params = {
			center: center,
			width: G.MathUtil.limitRange(width, minWidth, maxWidth),
			height: G.MathUtil.limitRange(height, minHeight, maxHeight),
			duration: (options && options.duration !== undefined) ? options.duration : mapOptions.zoomAnimDuration,
			fireEnd: (options && options.fireEnd !== undefined) ? options.fireEnd : true,
			ignoreAnim: (options && options.ignoreAnim !== undefined) ? options.ignoreAnim : false
		};

		if (mapOptions.zoomAnim && !G.Browser.ielt9) {
			self._zoomAnim = self._zoomAnim || new G.Anim.Zoom(self);

			if (!self._zoomAnim._playing) {
				self._zoomAnim.start(params);
			} else {
				self._zoomAnim.update(params);
			}
		} else {
			self.fireEvent('zoomStart');

			self._rawZoomTo(center, width, height);
			self._updateUrl();

			self.fireEvent('zoomEnd');

			self._checkView();

			self._requestUpdate();
		}

		return self;
	},

	zoomRes: function(center, res, options) {
		var map = this;

		if (!res) {
			return map;
		}

		var size = map.getSize();
		var w = size[0] * res;
		var h = size[1] * res;

		return map.zoomTo(center, w, h, options);
	},

	zoomExtent: function(extent, options) {
		var map = this;
		var mapOptions = map.options;

		if (!extent) {
			return map;
		}

		var size = map.getSize();

		var cx = (extent[0] + extent[2]) / 2;
		var cy = (extent[1] + extent[3]) / 2;
		var w = extent[2] - extent[0];
		var h = extent[3] - extent[1];

		var realRes = Math.max(w / size[0], h / size[1]);
		var res = realRes;

		var zoomRes, zoomReses = map._zoomReses;
		if (!mapOptions.continuouslyZoom && zoomReses) {
			for (var i = 0, len = zoomReses.length; i < len; i++) {
				zoomRes = zoomReses[i];
				if (zoomRes < realRes) {
					break;
				} else {
					res = zoomRes;
				}
			}

			return map.zoomRes([cx, cy], res, options);
		}

		if (!w || !h) {
			res = map._res;

			w = size[0] * res;
			h = size[1] * res;
		}

		return map.zoomTo([cx, cy], w, h, options);
	},

	zoomIn: function(options) {
		var map = this;

		var size = map.getSize(),
			res = map._res,
			newRes = G.MathUtil.limitRange(map._calcNearestRes(), map.options.minRes, map.options.maxRes);

		if (Math.abs(newRes - res) < res / 1e4) {
			return;
		}

		var w = size[0] * newRes,
			h = size[1] * newRes,
			center = map.getCenter();

		return map.zoomTo(center, w, h, options);
	},

	zoomOut: function(options) {
		var map = this;

		var size = map.getSize(),
			res = map._res,
			newRes = G.MathUtil.limitRange(map._calcNearestRes(1), map.options.minRes, map.options.maxRes);

		if (Math.abs(newRes - res) < res / 1e4) {
			return;
		}

		var w = size[0] * newRes,
			h = size[1] * newRes,
			center = map.getCenter();

		return map.zoomTo(center, w, h, options);
	},

	panBy: function(offsetX, offsetY, options) {
		var self = this,
			mapOptions = self.options;

		if (mapOptions.panAnim && !G.Browser.ielt9) {
			if (!self._panAnim) {
				self._panAnim = new G.Anim.Pan(self);
			}

			var params = {
				offsetX: offsetX || 0,
				offsetY: offsetY || 0,
				duration: (options && options.duration !== undefined) ? options.duration : mapOptions.panAnimDuration,
				ease: (options && options.ease !== undefined) ? options.ease : mapOptions.panAnimEase
			};

			self._panAnim.start(params);
		} else {
			self.fireEvent('moveStart');

			self._rawPanBy(offsetX, offsetY);
			self._updateUrl();

			self.fireEvent('moveEnd');

			self._checkView();

			self._requestUpdate();
		}

		return self;
	},

	rotateTo: function(degree, options) {
		var self = this,
			mapOptions = self.options;

		if (mapOptions.rotateAnim && !G.Browser.ielt9) {
			if (!self._rotateAnim) {
				self._rotateAnim = new G.Anim.Rotate(self);
			}

			var params = {
				to: degree || 0,
				duration: (options && options.duration !== undefined) ? options.duration : mapOptions.rotateAnimDuration
			};

			self._rotateAnim.start(params);
		} else {
			self.fireEvent('rotateStart');

			self._rawRotateTo(degree || 0);
			self._updateUrl();

			self.fireEvent('rotateEnd');

			self._checkView();

			self._requestUpdate();
		}

		return self;
	},

	isZooming: function() {
		var anim = this._zoomAnim;
		return anim && anim._playing;
	},

	isPanning: function() {
		var anim = this._panAnim;
		return anim && anim._playing;
	},

	isRotating: function() {
		var anim = this._rotateAnim;
		return anim && anim._playing;
	},

	isDragging: function() {
		var handler = this._handlers.Drag;
		return handler && handler._dragging;
	},

	isPinching: function() {
		var handler = this._handlers.Pinch;
		return handler && handler._pinching;
	},

	getCenter: function() {
		return this._center;
	},

	getResolution: function() {
		return this._res;
	},

	toScreen: function(mapPoint, zoomAround, zoomScale, ignoreRotate) {
		var self = this;
		var size = self.getSize();
		var center = self.getCenter();
		var res = self._res;
		var rotate = self._rotate;
		var hw = size[0] / 2,
			hh = size[1] / 2;
		var pr = G.Browser.getPxRatio(),
			prX = pr[0],
			prY = pr[1];

		var x = hw + (mapPoint[0] - center[0]) / res / prX,
			y = hh - (mapPoint[1] - center[1]) / res / prY;

		var zoomDelta;
		if (zoomAround && zoomScale && zoomScale !== 1) {
			zoomDelta = 1 / zoomScale - 1;
			x += (x - zoomAround[0]) * zoomDelta;
			y += (y - zoomAround[1]) * zoomDelta;
		}

		var dx = x - hw,
			dy = y - hh;

		if (rotate && dx && dy && !ignoreRotate) {
			var v = G.MathUtil.rotateVector([dx, dy], rotate);
			x = v[0] + hw;
			y = v[1] + hh;
		}

		return [x, y];
	},

	toMap: function(screenPoint, ignoreRotate) {
		var self = this;
		var size = self.getSize();
		var center = self.getCenter();
		var res = self._res;
		var rotate = self._rotate;
		var hw = size[0] / 2,
			hh = size[1] / 2;
		var pr = G.Browser.getPxRatio(),
			prX = pr[0],
			prY = pr[1];

		var x = screenPoint[0],
			y = screenPoint[1];

		var v;
		var dx = x - hw,
			dy = y - hh;

		if (rotate && dx && dy && !ignoreRotate) {
			v = G.MathUtil.rotateVector([dx, dy], -rotate);

			dx = v[0];
			dy = v[1];
		}

		var mx = dx * res * prX + center[0];
		var my = -dy * res * prY + center[1];

		return [mx, my];
	},

	showPopup: function(mapPoint, html, offsetX, offsetY) {
		var map = this;
		var domUtil = G.DomUtil;

		if (html) {
			map._popupContentWrapper.innerHTML = html;
		}

		var popup = map._popup;
		popup._mapPoint = mapPoint;
		popup._offsetX = offsetX || 0;
		popup._offsetY = offsetY || 0;

		map._updatePopupPos();

		domUtil.show(popup);

		map.fireEvent('popupShown');

		return map;
	},

	hidePopup: function(clearContent) {
		var map = this;
		var popup = map._popup;
		popup._mapPoint = null;
		G.DomUtil.hide(popup);

		if (clearContent) {
			map._popupContentWrapper.innerHTML = '';
		}

		map.fireEvent('popupHidden');

		return map;
	},

	isPrintable: function() {
		var self = this;

		if (self._mode != 'canvas' && self._mode != 'webgl') {
			return false;
		}

		var i, layer, crossOrigin;
		for (i in self._layers) {
			layer = self._layers[i];

			if (!layer) {
				continue;
			}

			crossOrigin = layer.options.crossOrigin
			if (crossOrigin !== undefined && crossOrigin !== '*') {
				return false;
			}
		}

		return true;
	},

	destroy: function() {
		var self = this;
		var container = self._container;
		var domUtil = G.DomUtil;
		var removeDomListener = G.DomUtil.removeListener;

		var i, len;

		for (i in self._layers) {
			self._layers[i].remove();
		}

		var mouseEvents = self._mouseEvents;
		for (i = 0, len = mouseEvents.length; i < len; i++) {
			removeDomListener(container, mouseEvents[i], self._onMouseEvent, self);
		}

		removeDomListener(self._popup, 'mouseenter', domUtil.stopPropagation);
		removeDomListener(self._popup, 'mousemove', domUtil.stopPropagation);
		removeDomListener(self._popup, 'mouseleave', domUtil.stopPropagation);
		removeDomListener(self._popup, 'mousedown', domUtil.stopPropagation);

		removeDomListener(self._popupClose, 'click', self._onPopupCloseDown, self);
		removeDomListener(self._popupClose, 'mousedown', self._onPopupCloseDown, self);
		removeDomListener(self._popupClose, 'touchstart', self._onPopupCloseDown, self);

		removeDomListener(self._compass, 'click', self._onCompassDown, self);
		removeDomListener(self._compass, 'mousedown', self._onCompassDown, self);
		removeDomListener(self._compass, 'touchstart', self._onCompassDown, self);

		removeDomListener(window, 'contextmenu', self._onWinContextMenu, self);
		removeDomListener(window, 'resize', self._onWinResize, self);
		removeDomListener(window, 'hashchange', self._onWinHashChange, self);

		domUtil.removeClass(container, 'g-container');

		domUtil.remove(self._mapFrame, container);
		domUtil.remove(self._panelFrame, container);

		container._initBy = undefined;

		return this;
	},

	_initLayout: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var browser = G.Browser;

		// Container
		domUtil.addClass(self._container, 'g-container');
		if (browser.retina) {
			domUtil.addClass(self._container, 'retina');
		}
		if (browser.ielt9) {
			domUtil.addClass(self._container, 'ielt9');
		}

		// Frame contains whole map, its postion will be changed by dragging.
		self._mapFrame = domUtil.create('div', 'g-map-frame', self._container);

		// Frame contains layers and popup.
		self._layersFrame = domUtil.create('div', 'g-layers-frame', self._mapFrame);
		var popup = self._popup = domUtil.create('div', 'g-popup', self._mapFrame);
		var popupWrapper = domUtil.create('div', 'g-popup-wrapper', popup);
		self._popupClose = domUtil.create('div', 'g-popup-close', popupWrapper);
		var popupContent = domUtil.create('div', 'g-popup-content', popupWrapper);
		self._popupContentWrapper = domUtil.create('div', 'g-popup-content-wrapper', popupContent);
		self._popupPointer = domUtil.create('div', 'g-popup-pointer', popup);
		domUtil.hide(popup);
		self._maskFrame = domUtil.create('div', 'g-mask-frame', self._mapFrame);

		// 必须支持 pointer-events 才能开启spark功能，否则用一个空div代替
		self._spark = domUtil.create('div', G.DomUtil.testStyle(['pointer-events']) ? 'g-spark' : '', self._mapFrame);

		// Frame contains all panels
		self._panelFrame = domUtil.create('div', 'g-panel-frame', self._container);
		if (browser.ielt9) {
			var vml = domUtil.createVML('group', '', self._panelFrame);
			self._compass = domUtil.createVML('image', 'g-vml g-compass', vml);
		} else {
			self._compass = domUtil.create('div', 'g-compass', self._panelFrame);
		}
		domUtil.hide(self._compass);

		// Logo
		if (!self.options.hideLogo) {
			var brand = self._brand = domUtil.create('div', 'g-brand', self._panelFrame);
			var brandStyle = brand.style;
			brandStyle.left = '8px';
			brandStyle.bottom = '8px';
			brandStyle.position = 'absolute';
			brandStyle.background = '#fff';
			brandStyle.border = '1px solid #ddd';
			brandStyle.borderRadius = brandStyle['-moz-border-radius'] = brandStyle['-webkit-border-radius'] = brandStyle['-o-border-radius'] = '13px';

			var brandImg = self._brandImg = domUtil.create('img', '', brand);
			var brandImgStyle = brandImg.style;
			brandImgStyle.verticalAlign = 'middle';
			brandImgStyle.width = '24px';
			brandImgStyle.height = '24px';
			brandImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3NpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo4MDk4YTdlNC03ZGFmLTQ1MzctODRhNy0yYmVhYWFhMzgxYjQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6N0ZCNEU1MTNENjY1MTFFNUI0N0JCRTI4MDZCREI0RTgiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6N0ZCNEU1MTJENjY1MTFFNUI0N0JCRTI4MDZCREI0RTgiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6ZTdmYzZiYjctYzk5YS00ZDBkLWI1NWYtNzkyZTY0ODg2ZmMwIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjgwOThhN2U0LTdkYWYtNDUzNy04NGE3LTJiZWFhYWEzODFiNCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PjwgStUAAApESURBVHja7FlrTJTpFT5zY4AZZrgPVhgUAYsyOKLbjZcsdjXa1CZeahNNNU0bo25a/2xMf3jpj66aNO0Pk6ahVmpa1xRb29Wtl9h1q6XuqlUpWgsIAjLcGRhGZoa5MZee55VPh0EYQLbtZn2TLzPffO/3vufynOec844sHA7T53nI6XM+Xivwvx7K6B8GBgb+74VOTU19DaEvrgKgbblcTlqtltRqNb0qjcv/24KnpaVRcnIy9fb2UigUEvdQBN9nJIg/K8GlwHv06BFVVlbSgwcPKCsrizZs2EBlZWWUnp5OLpeLvF6vmD/ZIYt24UyxkCR4SkqKuG9sbKTr169TfX093bt3jzQaDQUCASH44sWLaeXKlbR06VKKj48nm81GMplsUiw0owpgrcTERCF4XFycEKK2tpZu3rwpLD48PCys3tDQQD6fT8yZPXu2eM/hcFBOTg5t2rSJTCYT2e32cZWYtAL79u2jogVFZOmy8ExIGCK1SkOhcDxZ7f0ciDpK0CbRvz+9TkpZkHSGWRSQqcpaGxt+qNXp/5yZZbgeCIb1LqfrLoVY+IxMGpYrKC0lmfyD/eRwuYUCer1eeKOzs5MyMzPp0KFDpFAoyOPxxFRgWjEQYqUVSiWxkKxTiDTpBpqbn0effnz1SEN97X45KxufoPm6pSneFQoGg/MXLSlJSExsS0zU0LBCyc8SyGsPjfIcLijT3d1Nt2/fpjVr1pDb7Z4QSlNWIDyymUajpQHXoLHh4f3FWp3uQx0r0N1r+5aluWl/UpKOVAwNKBYMBLQBhk1PR+tvEzXaG3arVRtWKHuyDJnV6XrNX8ntHbNHUlISVVVVUWlpqYgTKDF9BUbQpVQpSC6TM9UFSKdPZny6MqquXKhxDthSl65c9WV7f92WtpbGw3Hxap4b94zb2XLwUhxTZF9X9yqXc3CVQqWi3PyCOp6UkZqs6wQpRccQFOjo6KBbt27R+vXraWhoaEIvTKiATP7sRZvNwbqESMnu9/h66JNrNz5w9PenJiWnUHN97X2vx6OMi4PwqjGJyetxM2Ti+94oe/v7anXC3/QZqX2mErPG0WnROJ4+HQtP9hxiAjBasWJFTC9MSLiAgUqp4gBTktPFKsi09KCmdmf7k8crU9IzSM6B5vf74llwJaw9JqvyvY953bxs2cFla9ae5Xf63EMuilMqhlL0eqvEVMJY/Cld8AIC+u7du4JWJ8rWEyoALOv1Olo0v4DyMg00x5BJDOy3FKyUyJwIZvaKJMThw4dp3bp1zzcMC/ipmKl0Ld3tbWS3WcnvG6ZLZ05vOXr0SDXnhF8iK8PisHTkBboF9Q4ODlICB/20INTV1aVoamoOOpmjw3IlBWUhpk7NnXAovANCR1rm5MmTtHr1atqxYwcdOHCATp8+LRRDTrhXVfWzBSWLzaBi15CbWh7VnWFYKCwWS+mlS5f+wKXENdDoKMvye7w/zZs3T+QGZOgpe6Cmpib864oKuvLRR+QPhjnVuynDMOvjBLYQs+OoucCsNJqamp5/V8cn0ICtd5F9oO+d9AyDqH2USuVZ8Dxb1s0QaQaUUA9FXjAO+B7JbaI6aUIPsBVCHg7CrOwcDl4/DXB2ZEg80iUn/8tht5eAYaRx/PhxkYVRJoBBIplDwcmrv7/vKwa3q9zr81J+sXlbprXrT2zVGi41LIBIpAdg/ZaWFtqyZYsoL56+JNgnx0IshJYzbW7uXHZViC/OARxUxty8I3c6qn6PGJGh8GJrYe6xY8eev/ci6YUEFZYa57YUziskx+CIMHn5f6y+VSVKCvbIKI/6/X4RByj0MPBsPCqdUAFYBXBJ5RJAxcEo54AFl38px3g1K9tYa7f1LyQRB1wDcXKLjAlsCMYBjRYsNP1q6ZtvvmfMmU3utJTnc+58cm2MYBL2IXxRUZGw/rTzgHyE1poeNwhLQlguDYgTln152VeLa2v++fOng/a1Kanpt1oa678DvENRzgsE6Bnz8m8bc/N/pE5IvOp1uzifWLmgC4xSMnrA+oDUxo0bY1o/diYeYZpwKCiElyzs8/rI7XBS8aJF7yoS44eD3gB53ENJ1p7uzUMuJ2Ubc2vSMg1Hk5LT/jInb76z4eFD8mcheFUs0IuARMaFl8H7Ugzgt127dpHZbI5p/UnXQnCrVHBJZQJKY7lCPowQaG+zUJG59Jsp7e3fs3Z2mJi53j3x/u/C7a1tNNBnFRldJpO/qE1Gxt69e4XHwELS2k6nk7Zu3SqYB0rFam4mVACJBBZAU1JeXk4nTpygOXPmPNss4CVbT7eYl6BWku+pjUJ+z8ntO75NGRkZ1GtpoQUF+bRz506RVZFRQbVvmE1iDVAlLA+IRMIE38FmKKVjWX/SDQ0WxLw9e/ZQXV3dqHpcGtgYQkmbMxSKOVm9zx2XArjGYOv62OrfyM/P74WlMQ+WjhQUVsdea9euFYZ4WU8w5X4Am2Gxbdu20blz50SaH+NKpkJky9bWVvGdMRw8f/68+fHjx8KD6LCQxNrb2wNo6AFBlBCAUGSikhTAJ9aZkaYe7ocAWBi1DjaNHjqdjh5ysEKw5cuXwxv17I23Tp069XcIwu8MHzx4MJ9LZNvly5eForAy1kYuiBy4h1KS517pWEWq0cHNfX19QvjIgJYuQAiCGgwGAUM0JSzsDRbyB1B+9+7dX+Naqe3ixYvU3NwsrA/h8V70Wghc9MhQAiXHK3kAmGa309mzZwVEsOnLBrj7yZMnhYzZUsb4GTTuhYWFwGsoLKpWRQAFXk9PD82aNQvN/nZOVFfYOP3RHsDAEQtgVFJSMmE/EFMBUByOOSAQlBmPGZD6GdsLGPeVzDLblyxZUl5ZWWlmWB0G9isqKqqys7PfMZlMnRcuXPgJl9JFfD+f++B+lBrRA97GQC2EQB6vJ4jJQhAYsEGCQTCP12Cgroen9u/ff6i6uvrHeA8WLC4urmDlfspUWs6weBvQAGw2b978XYbVb+DV6FIaA0rhvCg3N3eMB6bEQhIOARFUiFAA92NaRxYEm7LL3+Pnv2BomDige5iBGqAY4381W9XMBkriNf+xcOFCP9ZAoEZ7FRaH19hD4/YBkw5iLA6MYkFg1yPqHM9L58GywC57bIAtVwXhwUp4H884cO8bjcYbKHkwD88kI+GCQvgNzyA88kp03zEtGpUW4eAU7gOPA2oQWh3RE0TOhzcguNTnSrQoUWS08hAeguMTVSgUiHUiMWkFJOticZycIalZrVZxCIWeFc8RxFMdknAQHAPrFhQUiAMuKTZm7GBLshICCjwNvsfBLBgKimBDXNGlAe5fVjJgLVgY6wGaqI/wibXxe/T8GTtej1QEwQyPID5wj01RAiNRIalBOQQ/YIZkBtgBRmA0wARGwAWLQ3CsIRV2kxF+Rk6npcyJHIHNmUJFSQG2QkCiKUfsWCwWwWIS/sHvSFIQdCoW/8yO1yW6lf4PmMzAXuGRfnq6/1LO2D80UtMzVQNMVfiYEHr9L+VrBb5gCvxHgAEA/sHRcrWRKMYAAAAASUVORK5CYII=';

			var brandInfo = self._brandInfo = domUtil.create('div', '', brand);
			var brandInfoStyle = brandInfo.style;
			brandInfoStyle.color = '#999';
			brandInfoStyle.verticalAlign = 'middle';
			brandInfoStyle.fontSize = '12px';
			brandInfoStyle.margin = '0px 12px 0px 4px';
			brandInfoStyle.display = 'none';
			brandInfo.innerHTML = "Powered by <a style='color:#009BAE' href='http://geohey.com' target='_blank'>GeoHey</a>";
		}

		domUtil.markPosTransform(self._mapFrame, 0, 0);
		domUtil.updateTransform(self._mapFrame);
	},

	_initListeners: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var addDomListener = G.DomUtil.addListener;

		var mouseEvents = self._mouseEvents = ['click', //
			'dblclick', // IE8，其余dblclick均在click中处理
			'mousedown', 'mousemove', 'mouseup', //
			'mouseenter', 'mouseleave', //
			'mousewheel', 'DOMMouseScroll', //
			'touchstart', 'touchmove', 'touchend'
		];
		for (var i = 0, len = mouseEvents.length; i < len; i++) {
			addDomListener(self._container, mouseEvents[i], self._onMouseEvent, self);
		}

		addDomListener(self._popup, 'mouseenter', domUtil.stopPropagation);
		addDomListener(self._popup, 'mousemove', domUtil.stopPropagation);
		addDomListener(self._popup, 'mouseleave', domUtil.stopPropagation);
		addDomListener(self._popup, 'mousedown', domUtil.stopPropagation);

		addDomListener(self._popupClose, 'click', self._onPopupCloseDown, self);
		addDomListener(self._popupClose, 'mousedown', self._onPopupCloseDown, self);
		addDomListener(self._popupClose, 'touchstart', self._onPopupCloseDown, self);

		addDomListener(self._compass, 'click', self._onCompassDown, self);
		addDomListener(self._compass, 'mousedown', self._onCompassDown, self);
		addDomListener(self._compass, 'touchstart', self._onCompassDown, self);

		if (self._brand) {
			addDomListener(self._brand, 'mousemove', self._onBrandMouseMove, self);
		}

		if (self._brandImg) {
			addDomListener(self._brandImg, 'mousedown', self._onBrandImgDown, self);
			addDomListener(self._brandImg, 'touchstart', self._onBrandImgDown, self);
		}

		addDomListener(window, 'contextmenu', self._onWinContextMenu, self);
		addDomListener(window, 'resize', self._onWinResize, self);
		addDomListener(window, 'hashchange', self._onWinHashChange, self);


		//self.addListener('resize', self._onResize, self);
		self.addListener('zoomStart', self._onZoomStart, self);
		self.addListener('zoomUpdate', self._onZoomUpdate, self);
		self.addListener('zoom', self._onZoom, self);
		self.addListener('zoomEnd', self._onZoomEnd, self);
		self.addListener('moveStart', self._onMoveStart, self);
		self.addListener('move', self._onMove, self);
		self.addListener('moveEnd', self._onMoveEnd, self);
		self.addListener('rotateStart', self._onRotateStart, self);
		self.addListener('rotate', self._onRotate, self);
		self.addListener('rotateEnd', self._onRotateEnd, self);
		self.addListener('pinchStart', self._onPinchStart, self);
		self.addListener('pinch', self._onPinch, self);
		self.addListener('pinchEnd', self._onPinchEnd, self);
	},

	_initHandlers: function() {
		var self = this;
		var mapOptions = self.options;

		self._handlers = {};

		self._handlers.Click = new G.Handler.Click(self); // 除IE8的dblclick事件会在click中处理
		if (mapOptions.doubleZoom && G.Browser.ielt9) { // IE8的dblclick事件会屏蔽click事件
			self._handlers.DoubleClick = new G.Handler.DoubleClick(self);
		}
		if (mapOptions.pinchZoom) {
			self._handlers.Pinch = new G.Handler.Pinch(self);
		}
		if (mapOptions.dragPan) {
			self._handlers.Drag = new G.Handler.Drag(self);
		}
		if (mapOptions.shiftZoom) {
			self._handlers.ShiftDrag = new G.Handler.ShiftDrag(self);
		}
		if (mapOptions.scrollZoom) {
			self._handlers.ScrollWheel = new G.Handler.ScrollWheel(self);
		}

		self._resetHandlers();
	},

	_resetHandlers: function() {
		var self = this;
		var mapOptions = self.options;

		self._handlers.Click.on(1);
		if (mapOptions.doubleZoom && G.Browser.ielt9) {
			self._handlers.DoubleClick.on(1);
		}
		if (mapOptions.pinchZoom) {
			self._handlers.Pinch.on(1);
		}
		if (mapOptions.dragPan) {
			self._handlers.Drag.on(1);
		}
		if (mapOptions.shiftZoom) {
			self._handlers.ShiftDrag.on(1);
		}
		if (mapOptions.scrollZoom) {
			self._handlers.ScrollWheel.on(1);
		}
	},

	_initAddition: function() {},

	_isCanvasRelMode: function() {
		var self = this;
		return self._mode == 'canvas' || self._mode == 'webgl';
	},

	_isLoaded: function() {
		var self = this;
		return (self._center && self._res > 0);
	},

	_updateCompass: function(degree) {
		var domUtil = G.DomUtil;
		var compass = this._compass;

		domUtil.markRotateTransform(compass, degree);
		domUtil.updateTransform(compass);

		if (G.Browser.ielt9) { // for VML
			compass.style.rotation = degree;
			var src = compass.currentStyle.src;
			compass.src = src.substring(1, src.length - 1); // 从CSS中获取的src值还包括首尾的引号，需去除
		}

		if (degree) {
			domUtil.show(compass, this.options.rotateAnimDuration);
		} else {
			domUtil.hide(compass, 0.5); // The number 0.5 is useless, this duration is detemined by rotate animation
		}
	},

	_updateDrawSize: function() {
		var map = this;

		var size = map.getSize();
		if (!size || size.length != 2) {
			return;
		}

		var w = size[0],
			h = size[1];

		var abs = Math.abs,
			sin = Math.sin,
			cos = Math.cos;

		var rotate = map._rotate;
		var theta, newW, newH;
		if (rotate) {
			theta = rotate / G.MathUtil.DEGREE_PER_RADIAN;
			newW = abs(w * cos(theta)) + abs(h * sin(theta));
			newH = abs(w * sin(theta)) + abs(h * cos(theta));
		} else {
			newW = w;
			newH = h;
		}

		map._drawSize = [newW, newH];
	},

	_onMouseEvent: function(e) {
		var self = this;
		var domUtil = G.DomUtil;

		if (self._isLoaded()) {
			var type = e.type,
				mouseScreen = G.DomUtil.getMousePosition(e, self._container),
				mouseMap = self.toMap(mouseScreen);

			if (type == 'click' && !G.Browser.chromelite) { // Android Chromelite
				return;
			}

			// 屏蔽在Popup中的操作
			var current = e || e.touches[0];
			var target = current.target;
			while (target) {
				if (target.className == 'g-popup') {
					return;
				}

				target = target.parentElement;
			}

			if (type == 'DOMMouseScroll') { // Firefox
				type = 'mousewheel';
			}

			if (!(type == 'mousewheel' && self.options.scrollPage)) {
				domUtil.preventDefault(e);
			}

			// Change to map mouse event
			self.fireEvent(type, {
				mapX: mouseMap[0],
				mapY: mouseMap[1],
				screenX: mouseScreen[0],
				screenY: mouseScreen[1],
				originEvent: e
			});
		}
	},

	_onPopupCloseDown: function(e) {
		var domUtil = G.DomUtil;

		domUtil.stopPropagation(e);
		domUtil.preventDefault(e);

		this.hidePopup(true);
	},

	_onCompassDown: function(e) {
		var domUtil = G.DomUtil;

		domUtil.stopPropagation(e);
		domUtil.preventDefault(e);

		this.rotateTo(0);
	},

	_onBrandMouseMove: function(e) {
		var domUtil = G.DomUtil;

		domUtil.stopPropagation(e);
		domUtil.preventDefault(e);
	},

	_onBrandImgDown: function(e) {
		var self = this;
		var domUtil = G.DomUtil;

		domUtil.stopPropagation(e);
		domUtil.preventDefault(e);

		var brandInfo = self._brandInfo;

		if (brandInfo.style.display == 'none') {
			brandInfo.style.display = 'inline-block';
		} else {
			brandInfo.style.display = 'none';
		}
	},

	_onWinContextMenu: function(e) {
		G.DomUtil.preventDefault(e);
	},

	_onWinResize: function() {
		this.resize();
	},

	_onWinHashChange: function() {
		var self = this,
			mapOptions = self.options;

		if (mapOptions.recordStatus) {
			self._ensureViewByUrl();
		}
	},

	_requestRedraw: function() {
		var map = this;
		var util = G.Util;

		util.cancelAnimFrame(map._redrawAnimFrame);
		map._redrawAnimFrame = util.requestAnimFrame(map._redraw, true, map);
	},

	_redraw: function() {
		var map = this;

		var i, id, layer;
		for (i in map._layerOrder) {
			id = map._layerOrder[i];
			layer = map._layers[id];

			if (!layer) {
				continue;
			}

			if (layer.isVisible()) {
				layer._draw();
			} else {
				layer._erase();
			}
		}

		map._drawMask();

		map.fireEvent('redraw');
	},

	_requestUpdate: function() {
		var map = this;
		var util = G.Util;

		util.cancelAnimFrame(map._updateAnimFrame);
		map._updateAnimFrame = util.requestAnimFrame(map._update, true, map);
	},

	_update: function() {
		var map = this;

		var i, layer;
		for (i in map._layers) {
			layer = map._layers[i];

			if (layer.isVisible()) {
				layer._update();
			}
		}

		map._drawMask();

		map.fireEvent('update');
	},

	_onResize: function() {
		var map = this;

		map._updateDrawSize();

		map._requestUpdate();
	},

	/**
	 * 检查当前view是否有变化，如有变化则触发viewChanged事件
	 */
	_checkView: function() {
		var self = this;

		var lastView = self._lastView || {};

		var lastRes = lastView['res'];
		var lastCenter = lastView['center'] || [];
		var lastRotate = lastView['rotate'];

		var res = self._res;
		var center = self._center || [];
		var rotate = self._rotate;

		if (res !== lastRes || //
			center[0] !== lastCenter[0] || center[1] !== lastCenter || //
			rotate !== lastRotate) {
			self._lastView = {
				res: res,
				center: center,
				rotate: rotate
			}

			self.fireEvent('viewChanged', {
				from: {
					res: lastRes,
					center: lastCenter,
					rotate: lastRotate
				},
				to: self._lastView
			});
		}
	},

	_rawZoomTo: function(center, width, height) {
		var map = this;

		var realCenter = map._center = map._calcRealCoords(center);
		if (width && height) {
			map._res = map._calcResByViewport(realCenter, width, height);
		}

		map._updatePopupPos();
	},

	_rawPanBy: function(offsetX, offsetY) {
		var map = this,
			domUtil = G.DomUtil,
			mapFrame = map._mapFrame,
			mapFramePos = domUtil.getPosition(mapFrame);

		//domUtil.setPosition(mapFrame, mapFramePos[0] - offsetX, mapFramePos[1] - offsetY);
		domUtil.markPosTransform(mapFrame, -mapFramePos[0] + offsetX, mapFramePos[1] - offsetY);
		domUtil.updateTransform(mapFrame);

		map._updatePopupPos();
	},

	_rawRotateTo: function(degree, aroundScreen) {
		var map = this,
			domUtil = G.DomUtil,
			size = map.getSize();

		var mapFrame = map._mapFrame;

		while (degree > 180) {
			degree -= 360;
		}
		while (degree < -180) {
			degree += 360;
		}

		var around = aroundScreen;
		if (!around && mapFrame._rotate) {
			around = [mapFrame._rotate[1], mapFrame._rotate[2]];
		}
		if (!around) {
			around = [size[0] / 2, size[1] / 2];
		}

		map._rotate = degree;

		var mode = map._mode;
		if (mode != 'webgl' && mode != 'canvas') { // If canvas's container rotate, images will be blur
			domUtil.markRotateTransform(mapFrame, degree, around[0], around[1]);
			domUtil.updateTransform(mapFrame);
		}

		map._updateCompass(degree);
		map._updateDrawSize();

		map._updatePopupPos();
	},

	_rawView: function(center, width, height, rotate) { // Use map units.
		var self = this;

		self._rawRotateTo(rotate || 0);
		self._rawZoomTo(center, width, height);
	},

	_updatePopupPos: function() {
		var self = this;
		var domUtil = G.DomUtil;
		var popup = self._popup;

		var mapPoint = popup._mapPoint;
		if (!mapPoint) {
			return;
		}

		var screenPoint = self.toScreen(mapPoint);
		var popupSize = domUtil.getSizeNocache(popup);
		var pointerSize = domUtil.getSizeNocache(self._popupPointer); // popupSize does not include pointer's size

		var x = screenPoint[0] - popupSize[0] / 2 + popup._offsetX;
		var y = screenPoint[1] - popupSize[1] - pointerSize[1] + popup._offsetY;

		domUtil.markPosTransform(popup, x, y);
		domUtil.updateTransform(popup);
	},

	_mergeFramePos: function() {
		var map = this,
			res = map._res,
			center = map._center,
			rotate = map._rotate,
			domUtil = G.DomUtil,
			mapFrame = map._mapFrame,
			mapFramePos = domUtil.getPosition(mapFrame);

		var dx = mapFramePos[0] * res,
			dy = mapFramePos[1] * res,
			x = center[0] - dx,
			y = center[1] + dy;

		var v;

		if (rotate !== 0 && dx !== 0 && dy !== 0) {
			v = G.MathUtil.rotateVector([dx, dy], -rotate);

			x = center[0] - v[0];
			y = center[1] + v[1];
		}

		map._center = map._calcRealCoords([x, y]);

		G.Util.requestAnimFrame(function() { // Ensure they invoked together
			map._beforeMergeFramePos();
			domUtil.markPosTransform(mapFrame, 0, 0);
			domUtil.updateTransform(mapFrame);
			map._updatePopupPos();
		}, true, map);
	},

	_beforeMergeFramePos: function() {}, // Canvas will do somethine before mapFrame merged

	_calcWrapPointRange: function(pt) { // 计算可能出现在wrap地图中的左右镜像序列
		var map = this;

		var iMax = 0,
			iMin = 0;

		var x = pt[0];

		var extent = map.getExtent();
		var mapOptions = map.options;
		var maxExtent = mapOptions.maxExtent;
		if (mapOptions.wrap && maxExtent) {
			var mapWidth = maxExtent[2] - maxExtent[0];
			iMin = Math.floor((extent[0] - x) / mapWidth);
			iMax = Math.ceil((extent[2] - x) / mapWidth);
		}

		return [iMin, iMax];
	},

	_calcRealCoords: function(pt) { // 计算wrap地图中的点的真实地图坐标
		if (!pt) {
			return;
		}

		var real = pt;

		var map = this;
		var mapOptions = map.options;
		var maxExtent = mapOptions.maxExtent;
		var w = 0;
		if (mapOptions.wrap && maxExtent) {
			w = maxExtent[2] - maxExtent[0];

			while (real[0] <= maxExtent[0]) {
				real[0] += w;
			}
			while (real[0] >= maxExtent[2]) {
				real[0] -= w;
			}
		}

		return real;
	},

	_calcResByViewport: function(center, width, height) {
		var self = this,
			size = self.getSize(),
			cw = size[0],
			ch = size[1];

		// TODO For now it is for flat map
		var resW = width / cw,
			resH = height / ch;

		return Math.max(resW, resH);
	},

	_calcNearestRes: function(up) {
		var self = this,
			res = self._res,
			zoomReses = self._zoomReses,
			zoomRes;
		if (zoomReses) {
			var lastZoom = 0,
				nextZoom;
			for (var i = 0, len = zoomReses.length; i < len; i++) {
				zoomRes = zoomReses[i];
				if (Math.abs(zoomRes - res) < res / 1e2) {
					nextZoom = i + 1 >= len ? len - 1 : i + 1;
					return up ? zoomReses[lastZoom] : zoomReses[nextZoom];
				} else if (zoomRes < res) {
					return up ? zoomReses[lastZoom] : zoomRes;
				} else {
					lastZoom = i;
				}
			}
		}

		return up ? res * 2 : res / 2;
	},

	_ensureViewByUrl: function() {
		var hash = window.location.hash,
			self = this;
		if (hash) {
			var idx = hash.indexOf('!g_vs=');
			if (idx < 0) {
				return;
			}

			var value = hash.substring(idx + 6);
			var strs = value.split('!');
			if (strs && strs.length > 4) {
				var x = Number(strs[1]),
					y = Number(strs[2]),
					res = Number(strs[3]),
					rotate = Number(strs[4]),
					size = self.getSize();

				self.view([x, y], size[0] * res, size[1] * res, rotate);
			}
		}
	},

	_updateUrl: function() {
		var self = this,
			mapOptions = self.options;

		if (mapOptions.recordStatus) {
			var res = self._res,
				center = self.getCenter(),
				rotate = self._rotate;

			if (isNaN(center[0]) || isNaN(center[1]) || res <= 0) {
				return;
			}

			var hash = window.location.hash || '#';
			var idx = hash.indexOf('!g_vs=');
			var start = idx > 0 ? hash.substring(0, idx) : hash;

			var uri = start + '!g_vs=!' + center[0] + '!' + center[1] + '!' + res + '!' + rotate;

			var lastUri;
			var history = window.history;
			if (history && history.pushState) {
				lastUri = history.state ? history.state.uri : null;
				if (uri != lastUri) {
					try {
						history.pushState({
							uri: uri
						}, null, uri);
					} catch (e) {}
				}
			} else {
				lastUri = window.location.href;
				if (uri != lastUri) {
					window.location.href = uri;
				}
			}
		}
	},


	print: function() {},
	_drawMask: function() {},
	_onZoomStart: function(e) {},
	_onZoomUpdate: function(e) {},
	_onZoom: function(e) {},
	_onZoomEnd: function(e) {},
	_onMoveStart: function(e) {},
	_onMove: function(e) {},
	_onMoveEnd: function(e) {},
	_onRotateStart: function(e) {},
	_onRotate: function(e) {},
	_onRotateEnd: function(e) {},
	_onPinchStart: function(e) {},
	_onPinch: function(e) {},
	_onPinchEnd: function(e) {}

});
/* global G:false */
G.Proj = {};
/*
 * EPSG:3857
 */
/* global G:false */
G.Proj.WebMercator = {
	a: 6378137,
	max: 20037507.842788246,

	project: function(lon, lat) {
		var self = G.Proj.WebMercator, // 不可用this，因调用的context不定
			f = G.MathUtil.DEGREE_PER_RADIAN,
			r = self.a,
			x = lon / f * r,
			sine = Math.sin(lat / f),
			y = r / 2 * Math.log((1 + sine) / (1 - sine));

		if (y === Infinity) {
			y = self.max;
		} else if (y === -Infinity) {
			y = -self.max;
		}

		return [x, y];
	},

	unproject: function(x, y) {
		var self = G.Proj.WebMercator, // 不可用this，因调用的context不定
			f = G.MathUtil.DEGREE_PER_RADIAN,
			r = self.a,
			xRad = x / r,
			PI = Math.PI,
			lonR = xRad - (Math.floor(xRad / PI / 2 + 0.5) * PI * 2),
			latR = PI / 2 - (Math.atan(Math.exp(-y / r)) * 2);
		return [lonR * f, latR * f];
	}
};
/* global G:false */
G.Proj.Gcj = {
	a: 6378245,
	ee: 0.006693421622965823,

	project: function(lon, lat) {
		var self = G.Proj.Gcj; // 不可用this，因调用的context不定
		if (!self._isInChina(lon, lat)) {
			return [lon, lat];
		}

		var PI = Math.PI;
		var dLon = self._lonToGcj02(lon - 105, lat - 35);
		var dLat = self._latToGcj02(lon - 105, lat - 35);
		var radLat = lat / 180 * PI;
		var magic = Math.sin(radLat);
		magic = 1 - self.ee * magic * magic;
		var sqrtMagic = Math.sqrt(magic);
		dLon = (dLon * 180) / (self.a / sqrtMagic * Math.cos(radLat) * PI);
		dLat = (dLat * 180) / ((self.a * (1 - self.ee)) / (magic * sqrtMagic) * PI);

		return [lon + dLon, lat + dLat];
	},

	unproject: function(x, y) {
		var self = G.Proj.Gcj; // 不可用this，因调用的context不定
		var lon = x;
		var lat = y;

		var test = self.project(lon, lat);
		var dx = test[0] - x;
		var dy = test[1] - y;
		while (Math.abs(dx) > 1e-6 || Math.abs(dy) > 1e-6) {
			lon -= dx / 2;
			lat -= dy / 2;

			test = self.project(lon, lat);
			dx = test[0] - x;
			dy = test[1] - y;
		}

		return [lon, lat];
	},

	_isInChina: function(lon, lat) {
		return lon >= 72.004 && lon <= 137.8347 && lat >= 0.8293 && lat <= 55.8271;
	},

	_latToGcj02: function(x, y) {
		var PI = Math.PI;
		var sin = Math.sin;
		var ret = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
		ret += (20 * sin(6 * x * PI) + 20 * sin(2 * x * PI)) * 2 / 3;
		ret += (20 * sin(y * PI) + 40 * sin(y / 3 * PI)) * 2 / 3;
		ret += (160 * sin(y / 12 * PI) + 320 * sin(y * PI / 30)) * 2 / 3;
		return ret;
	},

	_lonToGcj02: function(x, y) {
		var PI = Math.PI;
		var sin = Math.sin;
		var ret = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
		ret += (20 * sin(6 * x * PI) + 20 * sin(2 * x * PI)) * 2 / 3;
		ret += (20 * sin(x * PI) + 40 * sin(x / 3 * PI)) * 2 / 3;
		ret += (150 * sin(x / 12 * PI) + 300 * sin(x / 30 * PI)) * 2 / 3;
		return ret;
	}

};
/* global G:false */
G.ProjUtil = {

	projectPoint: function(geom, projFunc) {
		var x = geom[0];
		var y = geom[1];

		return projFunc(x, y);
	},

	projectPolyline: function(geom, projFunc) {
		var x = geom[0];
		var y = geom[1];

		var i, iLen, pt, x, y;

		var newPolyline = [];
		for (i = 0, iLen = geom.length; i < iLen; i++) {
			pt = geom[i];
			x = pt[0];
			y = pt[1];

			newPolyline[i] = projFunc(x, y);
		}

		return newPolyline;
	},

	projectPolygon: function(geom, projFunc) {
		var x = geom[0];
		var y = geom[1];

		var i, iLen;
		var j, jLen;
		var part, pt, x, y;

		var newPolygon = [],
			newPart;
		for (i = 0, iLen = geom.length; i < iLen; i++) {
			part = geom[i];

			newPart = [];
			for (j = 0, jLen = part.length; j < jLen; j++) {
				pt = part[j];
				x = pt[0];
				y = pt[1];

				newPart[j] = projFunc(x, y);
			}
			newPolygon[i] = newPart;
		}

		return newPolygon;
	}


};
/* global G:false */
(function() {
	var win = window;
	var head = document.getElementsByTagName('head')[0];
	var browser = G.Browser;

	// 默认设置viewport，主要针对移动平台
	if (!win.G_NOT_SET_VIEWPORT) {
		var meta = document.createElement('meta');
		meta.name = 'viewport';
		meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
		head.appendChild(meta);
	}

	G.ready = function(func) {
		var f = G._readyFunc = func;
		if (G._needExecReady && f) {
			G._needExecReady = false;
			f();
		}
	};

	var impl = browser.ielt9 ? 'vml' : 'svg';

	if (!win.G_OFF_CANVAS && !browser.avoidCanvas ) {
		impl = browser.canvas ? 'canvas' : impl;
	}

	if (win.G_ON_WEBGL) {
		impl = browser.webgl ? 'webgl' : impl;
	}


	G.loadModule(impl, function() {
		G._needExecReady = true;
		var f = G._readyFunc;
		if (f) {
			G._needExecReady = false;
			f();
		}
	}, function() {
		throw new Error('Core library load error!');
	}); // 核心库与渲染实现必须加载

})();