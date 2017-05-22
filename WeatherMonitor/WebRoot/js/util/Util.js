/**
 * @author haoml
 * @date 2016/7/12
 * @function 图层管理
 */
define([], function () {
    return {
        uuid:function(){
        	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },
        getQueryString:function(name) { 
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
			var r = window.location.search.substr(1).match(reg); 
			if (r != null) return unescape(r[2]); return null; 
		},
		/**
		 * 判断点是否在面里面。
		 * usage:
		 * var polygon = [ [ 1, 1 ], [ 1, 2 ], [ 2, 2 ], [ 2, 1 ] ];
		 * inside([ 1.5, 1.5 ], polygon); // true
		 * @param {Object} point
		 * @param {Object} vs
		 */
		inside:function(point, vs) {
		    var x = point[0], y = point[1];
		    var inside = false;
		    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
		        var xi = vs[i][0], yi = vs[i][1];
		        var xj = vs[j][0], yj = vs[j][1];
		
		        var intersect = ((yi > y) != (yj > y))
		            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
		        if (intersect) inside = !inside;
		    }

		    return inside;
		},
		
		random:function(min, max) {
			return parseInt(Math.random() * (max - min + 1) + min, 10);
		},
		isNum:function (str) {
            var pattern = /^\d+$/;
            return pattern.test(str);
       },
       randomFloat:function(min,max){
       	  return Math.random()*(max-min+1)+min;
       }
       
    }
});