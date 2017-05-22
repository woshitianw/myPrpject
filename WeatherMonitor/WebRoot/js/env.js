/**
 * @author haoml
 * @date 2016/7/7
 * @function 环境检测及通用事件
 */
//处理IE8以前版本不支持console.log()方法
if(!window["console"]) {
	window["console"] = {
		log: function() {}
	};
}

/*
 * Date格式化
 */
Date.prototype.Format = function(fmt) {
		var o = {
			"M+": this.getMonth() + 1, //月份 
			"d+": this.getDate(), //日 
			"h+": this.getHours(), //小时 
			"m+": this.getMinutes(), //分 
			"s+": this.getSeconds(), //秒 
			"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
			"S": this.getMilliseconds() //毫秒 
		};
		if(/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		for(var k in o)
			if(new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		return fmt;
	}

//检测用户的浏览器版本
function checkBrowder() {
	if(navigator.userAgent.indexOf("Opera") != -1) {
		alert('Opera');
	} else if(navigator.userAgent.indexOf("MSIE") != -1) {
		var ieversion = checkIEVersion();
		if(ieversion < 9) {
			alert('为了使您得到更好的用户体验，建议您使用IE9.0及以上版本的IE、火狐（Firefox）浏览器或Chrome浏览器。');
		}
	} else if(navigator.userAgent.indexOf("Firefox") != -1) {} else if(navigator.userAgent.indexOf("Netscape") != -1) {} else if(navigator.userAgent.indexOf("Chrome") != -1) {
		console.log("Chrome");
	} else if(navigator.userAgent.indexOf("Safari") != -1) {} else {
		if(isIE11()) {

		} else {
			alert('无法识别您的浏览器类型，为了使您得到更好的用户体验，建议您使用IE9.0及以上版本的IE、火狐（Firefox）浏览器或Chrome浏览器。');
		}
	}
}

function checkIEVersion() {
	var ua = navigator.userAgent;
	var b = ua.indexOf("MSIE ");
	if(b < 0) {
		return 0;
	}
	var v = parseFloat(ua.substring(b + 5, ua.indexOf(";", b)));
	return v;
}

function isIE11() {
	return("ActiveXObject" in window);
}
checkBrowder();
String.prototype.trim = function() {

	return this.replace(/(^\s*)|(\s*$)/g, '');
};
var getIndexUrl = function(app) {
	//
	var indexPath = location.protocol + "//" + location.host + app;
	return indexPath;
};

function uuid() {
	var s = [];
	var hexDigits = "0123456789abcdef";
	for(var i = 0; i < 36; i++) {
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
	s[8] = s[13] = s[18] = s[23] = "-";

	var uuid = s.join("");
	return uuid;
}

var baseUrl = getIndexUrl("/WeatherMonitor/");

require.config({
    baseUrl: baseUrl,
    packages: [
        {
            name: "core",
            location: baseUrl + "js/core"
        },
        {
            name: "jslibs",
            location: baseUrl + "js/libs"
        }, {
            name: "util",
            location: baseUrl + "js/util"
        },
        {
            name: "widgets",
            location: baseUrl + "js/widgets"
        },
        {
            name: "html",
            location: baseUrl + "html"
        },{
            name: "js",
            location: baseUrl + "js"
        }
    ],
    paths: {
        "jquery": 'js/libs/jquery',
        "jquery-svg": 'js/libs/jquery.svg.min',
        "bootstrap": "js/libs/bootstrap/js/bootstrap.min",
        "bootstrap-tree": "js/libs/bootstrap/bootstrap-treeview.min",
        "bootstrap-table": "js/libs/bootstrap/bootstrap-table",
        "bootstrap-table-zh-CN": "js/libs/bootstrap/bootstrap-table-zh-CN",
        'moment':'js/libs/jquerydatepicker/moment.min',
        "bootstrap-datepicker": "js/libs/jquerydatepicker/jquery.daterangepicker",
        "echarts": "js/libs/echarts.common.min",
        'unslider':'js/libs/unslider-min',
        'slider':'js/libs/slider/bootstrap-slider',
        'bootstrap-datepicker2':'js/libs/datepicker/js/bootstrap-datepicker.min',
        'bootstrap-datepicker2-zh-CN':'js/libs/datepicker/locales/bootstrap-datepicker.zh-CN.min',
        'dropdownlist':'js/libs/dropdownlist/dropdownlist'
    },
    shim: {
    	"jquery-svg": {"deps": ["jquery"]},
        "bootstrap": {"deps": ["jquery"]},
        "bootstrap-tree": {"deps": ["jquery", "bootstrap"]},
        "bootstrap-table": {"deps": ["jquery", "bootstrap"]},
        "bootstrap-table-zh-CN": {"deps": ["jquery", "bootstrap", "bootstrap-table"]},
        "bootstrap-datepicker": {"deps": ["jquery", "moment"]},
        "bootstrap-treegrid": {"deps": ["jquery", "bootstrap"]},
        "bootstrap-treegrid-bootstrap3": {"deps": ["jquery", "bootstrap", "bootstrap-treegrid"]},
        'unslider':{"deps":["jquery"]},
        'slider':{"deps":["jquery"]},
        "bootstrap-datepicker2": {"deps": ["jquery", "bootstrap"]},
        "bootstrap-datepicker2-zh-CN": {"deps": ["jquery", "bootstrap", "bootstrap-datepicker2"]},
        'dropdownlist':{"deps": ["jquery"]}
    }
});