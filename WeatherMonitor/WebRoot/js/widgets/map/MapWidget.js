/**
 * @author haoml
 * @date 2016/4/18
 * @function 地图widget
 */
define([
	"jquery",
	'jslibs/hitch',
	'jslibs/text!html/popuptemplate.html',
	'jslibs/text!html/qypopuptemplate.html',
	'jslibs/text!html/cwpopuptemplate.html',
	'jslibs/text!html/legendtemplate.html',
	'core/AppEvent',
	'core/GlobalParams',
	'js/ConfigData',
	'js/util/Util'
], function($,
	hitch,
	popuptemplate,
	qypopuptemplate,
	cwpopuptemplate,
	legendtemplate,
	AppEvent,
	Global,
	config,
	util) {
	return {
		_map: null,
		_stationInfoGraphicLayer: null,
		qxGraphicLayer: null,
		graphicLayer: null,
		oceanLayer: null,
		weatherGraphicLayer: null,
		isFirstAddWeaherDatas: true,
		_alertLayer: null,
		screenPoint: [],
		_qyGraphicLayer: null,
		_gTable: {},
		_qyBuffer: null,
		_showInfoLabelStationGraphics:[],//需要显示站点数值的站点ID
		_stationValueLayers:null,//用来显示某个站点某个指标值的图层
		_radarLayer:null,//雷达图图层
		_radarHeighlightLayer:null,//雷达报警图层
		
		_contourlineLayer:null,//等值线图层
		_contourlineLegendLayer:null,//等值线图例图层
		_isAddContourLineLegend:false,
		/**
		 * 是否自动取完阈值以后更新当前地图的报警点样式，因为有时处于某些情况下是不用更新符号显示的
		 */
		_autoShowAlertSymbol: true,
		
		_radarWarnIconFlashHandler:null,
		_radarWarnIconFlashFlag:0,
		geoHeyReadyHandler: function() {

			this._map = new G.Map('mapcontentClass', {
				initStatus: {
					center: config.mapcenter,
					res: config.mapres
				},
				recordStatus: false,
				hideLogo: true
			});
			
			

			//获取鼠标在地图中点击时的坐标信息，并存储到数组中，用于graphic被点击事件
			$("#mapcontentClass").click($.hitch(this, function(event) {
				var evt = event || window.event;
				this.screenPoint = [];
				this.screenPoint.push(evt.clientX);
				this.screenPoint.push(evt.clientY);
				var pt = this._map.toMap(this.screenPoint);
				//console.log(G.Proj.WebMercator.unproject(pt[0],pt[1]));
				console.log(pt);
			}));

			AppEvent.addAppEventListener(AppEvent.HIDE_POPUP, $.hitch(this, function(topic, data) {
				this._map.hidePopup();
			}));

			//雷达图
			this._radarLayer =  (new G.Layer.Image()).addTo(this._map);
			this._radarLayer.hide();
			
			//等值线图
			this._contourlineLayer = (new G.Layer.Image()).addTo(this._map);
			this._contourlineLayer.hide();
			
			this.graphicLayer = (new G.Layer.Graphic()).addTo(this._map);

			$.getJSON(config.geodataServices.xiangzhen, $.hitch(this, function(result) {
				var m = [];

				for(var feature in result.features) {
					var m = result.features[feature].geometry.coordinates;
					var g = new G.Graphic.MultiPolygon({
						"m": m
					}, result.features[feature].properties, {
						outlineColor: "#BCDBF9",
						outlineWidth: 1,
						outlineOpacity: 0.5,
						fill: false,
						clickable: true
					});
					g.addTo(this.graphicLayer);
				}
			}));
			
			this.graphicLayer.bind("graphicClicked", $.hitch(this, function(evt) {
				var graphic = evt.graphic;
				var htmlStr = "<div class='xzName-popup'>" + graphic.attrs.NAME + "</div>"
				this._map.showPopup(this._map.toMap(this.screenPoint), htmlStr, 0, 0);
				$(".g-popup-pointer").css('background', "url(assets/xz-arrow.png) no-repeat");
				$(".g-popup-pointer").css('margin', "-5px 0 0 0");
				$(".g-group-pointer").css("width", "26px");
				$(".g-group-pointer").css("height", "21px");
			}));

			//海岸线图层
			this.oceanLayer = (new G.Layer.Graphic()).addTo(this._map);

			$.getJSON(config.geodataServices.ocean, $.hitch(this, function(result) {
				var m = [];
				for(var feature in result.features) {
					var m = result.features[feature].geometry.coordinates;
					var g = new G.Graphic.MultiPolyline({
						"m": m
					}, "", {
						lineColor: "#16bcf2",
						outlineWidth: 2
					});
					g.addTo(this.oceanLayer);
				}
			}));

			this.qxGraphicLayer = (new G.Layer.Graphic()).addTo(this._map);
			this.setGraphicLayerStyle(this.qxGraphicLayer, ["*"], [], {
				outlineWidth: 2,
				outlineColor: "#BCDBF9",
				fill: false
			});
			this.qxGraphicLayer.bind("graphicClicked", $.hitch(this, this.qxGraphicClickedHandler));

			$.getJSON(config.geodataServices.quxian, $.hitch(this, function(result) {
				var m = [];
				for(var feature in result.features) {
					var m = result.features[feature].geometry.coordinates;
					var g = new G.Graphic.MultiPolygon({
						"m": m
					}, result.features[feature].properties);
					g.addTo(this.qxGraphicLayer);
				}
			}));
			this._contourlineLegendLayer = (new G.Layer.Graphic()).addTo(this._map);
			
			this._contourlineLegendLayer.hide();
			this._radarHeighlightLayer = (new G.Layer.Graphic()).addTo(this._map);
			this._radarHeighlightLayer.hide();
			var radarFlag=0;
			//雷达报警闪烁效果
			setInterval($.hitch(this,function(){
				if(this._radarHeighlightLayer.isVisible()){
					var opt = {};
					var allGraphics = this._radarHeighlightLayer.all();
					if(radarFlag % 2 == 0){
						opt = {
								outline:false,
								fillColor:'#000000',
								fillOpacity:0.6
							}
						for(var i=0;i<allGraphics.length;i++){
							var g = allGraphics[i];
							g.updateOptions(opt);
						}
					}
					else{
						for(var i=0;i<allGraphics.length;i++){
							var g = allGraphics[i];
							g.updateOptions({
								outline:false,
								fillColor:this.getRadarColor(g.attrs.v),
								fillOpacity:1
							});
						}
						
					}
					radarFlag++;
				}
			}),1000);
			this.addRadarImage();
			
			//控制区县图层
			li = $("<li></li>", {
				class: "layerSwitch-li",
				id: "qx-checkbox"
			});
			$("#layer-switch-content").append(li);
			li.css("background", "url(assets/unchecked.png) left center no-repeat");
			li.append($("<div></div>"));
			$("#qx-checkbox > div").css("background", this.graphicLayer.isVisible() ? "url(assets/checked.png)" : "");

			//			this.weatherGraphicLayer = (new G.Layer.Graphic()).addTo(this._map);
			//			this.weatherGraphicLayer.hide();

			//企业信息图层
			this._qyGraphicLayer = (new G.Layer.Graphic()).addTo(this._map);
			this._qyGraphicLayer.hide();
			this._qyGraphicLayer.bind("graphicClicked", $.hitch(this, this.qyGraphicClickedHandler));

			this._stationInfoGraphicLayer = (new G.Layer.Graphic()).addTo(this._map);
			this._alertLayer = new G.Layer.Html();
			this._alertLayer.addTo(this._map);
			this._stationInfoGraphicLayer.bind("graphicClicked", $.hitch(this, this.graphicClickedHandler));
			
			this._stationValueLayers = new G.Layer.Html();
			this._stationValueLayers.addTo(this._map);

			//加载站点基本信息
			$.getJSON(config.services.stationBasicInfo, $.hitch(this, this.getBasicStationsHandler));

			this.weatherGraphicLayer = (new G.Layer.Html()).addTo(this._map);
			this.weatherGraphicLayer.hide();
			AppEvent.addAppEventListener(AppEvent.ADD_WEATHER_DATAS, $.hitch(this, this.addWeatherDatas));

			AppEvent.addAppEventListener(AppEvent.SWITCH_LAYER_VISIBLE, $.hitch(this, this.switchLayerVisible));
			AppEvent.addAppEventListener(AppEvent.CHANGE_LAYER_CLICKABLE, $.hitch(this, this.changeLayerClickable));
			AppEvent.addAppEventListener(AppEvent.ALERT_STATIONS, $.hitch(this, this.alertStations));

			AppEvent.addAppEventListener(AppEvent.CANCLE_ALERT_STATIONS, $.hitch(this, this.cancleAlertStations));
			AppEvent.addAppEventListener(AppEvent.POPUP_AND_CENTER_STATION, $.hitch(this, this.popupStation));
			AppEvent.addAppEventListener(AppEvent.SHOW_QY_LAYER, $.hitch(this, this.shwoQyLayer));
			AppEvent.addAppEventListener(AppEvent.SHOW_ALL_STATION, $.hitch(this, this.shwoAllStation));
			AppEvent.addAppEventListener(AppEvent.RELATE_QY_STATIONS, $.hitch(this, this.relateQySite));
			AppEvent.addAppEventListener(AppEvent.SHOW_STATION_SINGLE_VALUE, $.hitch(this, this.showStationSingleValueLabel));
			AppEvent.addAppEventListener(AppEvent.PRINT_ISONLINE_MAP, $.hitch(this, this.printIsonlineMap));
			AppEvent.addAppEventListener(AppEvent.SWITCH_IFRAME, $.hitch(this, function() {
				this._map.hidePopup(true);
			}));
			
			AppEvent.addAppEventListener(AppEvent.VIEW_CONTOURLINE,$.hitch(this, this.viewContourLine));
			
			AppEvent.addAppEventListener(AppEvent.ZOOM_TO_TANGGU,$.hitch(this,function(){
				var extent = config.tangguextent;
				this._map.zoomExtent(extent);
			}));
			
			AppEvent.addAppEventListener(AppEvent.CLEAR_YQZZ,$.hitch(this,function(){
				this.clearContourLine();
			}));
			
			//控制海岸线图层
			li = $("<li></li>", {
				class: "layerSwitch-li",
				id: "ocean-checkbox"
			});
			$("#layer-switch-content").append(li);
			li.css("background", "url(assets/unchecked.png) left center no-repeat");
			li.append($("<div></div>"));
			$("#ocean-checkbox > div").css("background", this.graphicLayer.isVisible() ? "url(assets/checked.png)" : "");
			
			//控制乡镇图层
			li = $("<li></li>", {
				class: "layerSwitch-li",
				id: "xz-checkbox"
			});
			$("#layer-switch-content").append(li);
			li.css("background", "url(assets/unchecked.png) left center no-repeat");
			li.append($("<div></div>"));
			$("#xz-checkbox > div").css("background", this.graphicLayer.isVisible() ? "url(assets/checked.png)" : "");
			
			//控制等值线图层
			li = $("<li></li>", {
				class: "layerSwitch-li",
				id: "yqzz-checkbox"
			});
			$("#layer-switch-content").append(li);
			li.css("background", "url(assets/unchecked.png) left center no-repeat");
			li.append($("<div style='display:inline-block'></div>"));
			li.append($("<span class='glyphicon glyphicon-arrow-up layerswitch-up'></span>"));
			li.append($("<span class='glyphicon glyphicon-arrow-down layerswitch-down'></span>"));
			$("#yqzz-checkbox > div").css("background", this._contourlineLayer.isVisible() ? "url(assets/checked.png)" : "");

			//控制雷达图层
			li = $("<li></li>", {
				class: "layerSwitch-li",
				id: "radar-checkbox"
			});
			$("#layer-switch-content").append(li);
			li.css("background", "url(assets/unchecked.png) left center no-repeat");
			li.append($("<div style='display:inline-block'></div>"));
			li.append($("<span class='glyphicon glyphicon-arrow-up layerswitch-up'></span>"));
			li.append($("<span class='glyphicon glyphicon-arrow-down layerswitch-down'></span>"));
			$("#radar-checkbox > div").css("background", this._radarLayer.isVisible() ? "url(assets/checked.png)" : "");
			
			//单击图层管理器中图层改变图层显隐
			$(".layerSwitch-li").click($.hitch(this, function(evt) {
				var id = evt.currentTarget.id;
				var name = id.split("-")[0];
				if(name == "xz") {
					AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, [name, !this.graphicLayer.isVisible()]);
					if(!this.graphicLayer.isVisible()) {
						AppEvent.dispatchAppEvent(AppEvent.HIDE_POPUP);
						AppEvent.dispatchAppEvent(AppEvent.CHANGE_LAYER_CLICKABLE, ['qx', true]);
					} else {
						AppEvent.dispatchAppEvent(AppEvent.HIDE_POPUP);
						AppEvent.dispatchAppEvent(AppEvent.CHANGE_LAYER_CLICKABLE, ['qx', false]);
					}
					$("#xz-checkbox > div").css("background", this.graphicLayer.isVisible() ? "url(assets/checked.png)" : "");
				} else if(name == "qx") {
					AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, [name, !this.qxGraphicLayer.isVisible()]);
					if(!this.qxGraphicLayer.isVisible()) {
						AppEvent.dispatchAppEvent(AppEvent.HIDE_POPUP);
						AppEvent.dispatchAppEvent(AppEvent.CHANGE_LAYER_CLICKABLE, ['qx', false]);
					}
					$("#qx-checkbox > div").css("background", this.qxGraphicLayer.isVisible() ? "url(assets/checked.png)" : "");
				} else if(name == "ocean") {
					AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, [name, !this.oceanLayer.isVisible()]);
					$("#ocean-checkbox > div").css("background", this.oceanLayer.isVisible() ? "url(assets/checked.png)" : "");
				}
				else if(name == "radar") {
					AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, [name, !this._radarLayer.isVisible()]);
					$("#radar-checkbox > div").css("background", this._radarLayer.isVisible() ? "url(assets/checked.png)" : "");
				}
				else if(name == "yqzz"){
					AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, [name, !this._contourlineLayer.isVisible()]);
					$("#yqzz-checkbox > div").css("background", this._contourlineLayer.isVisible() ? "url(assets/checked.png)" : "");
				}
			}));
			
			$('.layerswitch-up').click($.hitch(this,function(evt){
				evt.stopPropagation();
				var parentli = $(evt.currentTarget).parent();
				var preli = $(parentli).prev();
				var tagName = $(preli).get(0).tagName 
				if(preli == null || tagName.toLowerCase() != 'li'){
					return;
				}
				$(preli).before(parentli);
				
				var id = $(parentli).attr('id');
				var name = id.split("-")[0];
				if(name == 'yqzz'){
					this._contourlineLayer.bringUp(1);
				}
				else if(name =='radar'){
					this._radarLayer.bringUp(1);
				}
			}));
			
			$('.layerswitch-down').click($.hitch(this,function(evt){
				
				evt.stopPropagation();
				var parentli = $(evt.currentTarget).parent();
				var nextli = $(parentli).next()[0];
				//var tagName = $(nextli).get(0).tagName 
				if(nextli == null){
					return;
				}
				var tagName = $(nextli).get(0).tagName;
				if(tagName.toLowerCase() != 'li')
				{
					return;
				}
				$(nextli).after(parentli);
				if(name == 'yqzz'){
					this._contourlineLayer.bringDown(1);
				}
				else if(name =='radar'){
					this._radarLayer.bringUp(1);
				}
			}));


			this.weatherGraphicLayer.bind("graphicOver", $.hitch(this, function(evt) {
				var graphic = evt.graphic;
				var htmlStr = "<div class='weatherName-popup'>" + config.tqbm[graphic.attrs.ja] + "</div>"
				this._map.showPopup(graphic.geom, htmlStr, 0, 0);
				$(".g-popup-pointer").css('background', "url(assets/tq-arrow-1.png) no-repeat");
				$(".g-popup-pointer").css('margin', "-2px 0 0 0");
				$(".g-group-pointer").css("width", "13px");
				$(".g-group-pointer").css("height", "17px");
			}));

			this.weatherGraphicLayer.bind("graphicOut", $.hitch(this, function(evt) {
				$(".g-popup-pointer").css('background', "");
				$(".g-popup-pointer").css('margin', "-2px 0 0 0");
				$(".g-group-pointer").css("width", "");
				$(".g-group-pointer").css("height", "");
				this._map.hidePopup(true);
			}));
			
			$('.radar-warn').click($.hitch(this,function(){
				AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['radar', !this._radarLayer.isVisible()]);
				$("#radar-checkbox > div").css("background", this._radarLayer.isVisible() ? "url(assets/checked.png)" : "");
			}));
		},
		
		printIsonlineMap:function(topic,handler){
			AppEvent.dispatchAppEvent(AppEvent.ZOOM_TO_TANGGU);
			AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['station', false]);
			//AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['xz', true]);
			AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['ocean', false]);
			
			var graphics = this.qxGraphicLayer.all();
			var qxGraphics = this.graphicLayer.all();
			for(var i = 0;i<graphics.length;i++){
				var g = graphics[i];
				if(g.attrs['COUNTRY'] == '大港' || g.attrs['COUNTRY'] == '汉沽' || g.attrs['COUNTRY'] == '塘沽'){
					g.updateOptions({
						outlineWidth: 2,
						outlineColor: "#CCCC00",
						fill: false
					});
				}
				else{
					g.updateOptions({
						outlineWidth: 2,
						outlineColor: "#CCCC00",
						fill: false,
						outlineOpacity:0
					});
				}
			}
			for(var i = 0;i<qxGraphics.length;i++){
				var g = qxGraphics[i];
				if(g.attrs['REMARK'] == '1'){
					g.updateOptions({
						outlineWidth: 1,
						outlineColor: "#CCCC00",
						fill: false
					});
				}
				else{
					g.updateOptions({
						outlineWidth: 1,
						outlineColor: "#CCCC00",
						fill: false,
						outlineOpacity:0
					});
				}
			}
			setTimeout($.hitch(this,function(){
				var base64png = this._map.print(400, 400);
				if(handler){
					base64png = base64png.replace('data:image/png;base64,','');
					handler(base64png);
				}
				AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['station', true]);
				//AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['xz', true]);
				AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['ocean', true]);
				for(var i = 0;i<graphics.length;i++){
					var g = graphics[i];
					g.updateOptions({
						outlineWidth: 2,
						outlineColor: "#BCDBF9",
						fill: false,
						outlineOpacity:1
					});
				}
				var qxGraphics = this.graphicLayer.all();
				for(var i = 0;i<qxGraphics.length;i++){
					var g = qxGraphics[i];
					g.updateOptions({
						outlineWidth: 1,
						outlineColor: "#BCDBF9",
						fill: false,
						outlineOpacity:1
					});
				}
//				outlineWidth: 2,
//				outlineColor: "#BCDBF9",
//				fill: false
			}),1000);
		},
		
		addWeatherDatas: function() {
			if(this.isFirstAddWeaherDatas) {
				$.getJSON(config.geodataServices.quxiancenter, $.hitch(this, function(data) {
					var _this = this;
					for(var item in data) {
						var url = config.services.weatherUrl + data[item].code + "&datatype=hourfc";
						$.ajax({
							type: "get",
							url: url,
							dataType: 'json',
							data:{
								t:((new Date()).getTime())
							},
							async: true,
							success: $.hitch(data[item], function(result) {
								if(result['jh'] && result) {
									var time = parseInt(result['jh'][0].jf.substring(result['jh'][0].jf.length - 4, result['jh'][0].jf.length - 2));
									var ja = result['jh'][0].ja;
									var imgSrcPath = "";
									if(time >= 6 && time <= 18) {
										if((ja == "00" || ja == "01" || ja == "03" || ja == "13"))
											imgSrcPath = "assets/tqyb/mapicon/day/" + ja + ".png";
										else
											imgSrcPath = "assets/tqyb/mapicon/" + ja + ".png";
									} else {
										if((ja == "00" || ja == "01" || ja == "03" || ja == "13"))
											imgSrcPath = "assets/tqyb/mapicon/night/" + ja + ".png";
										else
											imgSrcPath = "assets/tqyb/mapicon/" + ja + ".png";
									}
									var htmlString = '<div style="width:60px;height:60px;"><img class="maphtmlweather" code="' + ja +'" src="' + imgSrcPath + '"></img></div>';
									_this.weatherGraphicLayer.addHtml(htmlString, this.lon, this.lat);
									$(".maphtmlweather").mouseover(function(evt) {
										var src = evt.target.src.split(".")[0];
										var code = $(evt.target).attr('code');
										var index = src.lastIndexOf("/");
										var htmlStr = "<div class='weatherName-popup'>" + config.tqbm[code] + "</div>"
										var mappoint = _this._map.toMap([evt.clientX,evt.clientY]);
										_this._map.showPopup(mappoint, htmlStr, 0, 0);
										$(".g-popup-pointer").css('background', "url(assets/tq-arrow-1.png) no-repeat");
										$(".g-popup-pointer").css('margin', "-2px 0 0 0");
										$(".g-group-pointer").css("width", "13px");
										$(".g-group-pointer").css("height", "17px");
									}).mouseout(function(evt) {
										$(".g-popup-pointer").css('background', "");
										$(".g-popup-pointer").css('margin', "-2px 0 0 0");
										$(".g-group-pointer").css("width", "");
										$(".g-group-pointer").css("height", "");
										_this._map.hidePopup(true);
									});
								}
							})
						});
					}
				}));
				this.isFirstAddWeaherDatas = false;
			}

		},

		shwoQyLayer: function(topic, data) {
			this._qyGraphicLayer.clear();
			this._qyGraphicLayer.show();
			if($.isArray(data)) {
				for(var i = 0; i < data.length; i++) {
					var qy = data[i];
					var pt = G.Proj.WebMercator.project(parseFloat(qy.ENTERPRISEC_X), parseFloat(qy.ENTERPRISEC_Y));
					var g = new G.Graphic.Point(pt, qy, {
						shape: 'image',
						offset: [-12, -12],
						size: [24, 23],
						image: 'assets/qyicon.png',
						clickable: true
					});
					//					var g = new G.Graphic.Point(pt, qy, {
					//						shape: 'image',
					//						offset: [-30, -30],
					//						size: [60, 60],
					//						image: 'assets/qyicon.png',//'assets/tqyb/mapicon/53.png',
					//						clickable: true
					//					});

					g.addTo(this._qyGraphicLayer);
				}
			}

		},

		switchLayerVisible: function(topic, data) {
			var lryName = data[0];
			var visible = data[1];
			var layer = null;
			switch(lryName) {
				case 'station':
					layer = this._stationInfoGraphicLayer;
					break;
				case "qx":
					layer = this.qxGraphicLayer;
					break;
				case "xz":
					layer = this.graphicLayer;
					break;
				case "ocean":
					layer = this.oceanLayer;
					break;
				case "weather":
					layer = this.weatherGraphicLayer;
					break;
				case "qy":
					layer = this._qyGraphicLayer;
					break;
				case "alert":
					layer = this._alertLayer;
					break;
				case "stationvalue":
					layer = this._stationValueLayers;
					break;
				case "radar":
					layer = this._radarLayer;
					if(visible && !this._radarHeighlightLayer.isVisible()){
						this._radarHeighlightLayer.show();
						$('.radar-legend').css('display','block');
					}
					else{
						this._radarHeighlightLayer.hide();
						$('.radar-legend').css('display','none');
					}
					break;
				case "yqzz":
					layer = this._contourlineLayer;
					if(visible){
						this._contourlineLegendLayer.show();
					}
					else{
						this._contourlineLegendLayer.hide();
					}
					break;
			}
			if(layer) {
				if(visible && !layer.isVisible()) {
					layer.show();
				} else if(!visible && layer.isVisible()) {
					layer.hide();
				}
			}
		},

		changeLayerClickable: function(topic, data) {
			var lryName = data[0];
			var clickable = data[1];
			switch(lryName) {
				//				case 'station':
				//					if(this._stationInfoGraphicLayer) {
				//						if(clickable)
				//							this.setGraphicLayerStyle(this._stationInfoGraphicLayer, ["*"], [], {
				//								clickable: clickable
				//							});
				//						else
				//							this.setGraphicLayerStyle(this._stationInfoGraphicLayer, ["*"], [], {
				//								outlineWidth: 2,
				//								outlineColor: "#BCDBF9",
				//								fill: false,
				//								clickable: clickable
				//							});
				//					}
				//					break;
				case "qx":
					if(this.qxGraphicLayer) {
						if(clickable)
							this.setGraphicLayerStyle(this.qxGraphicLayer, ["*"], [], {
								clickable: clickable
							});
						else {
							if(this.graphicLayer.isVisible())
								this.setGraphicLayerStyle(this.qxGraphicLayer, ["*"], [], {
									outlineWidth: 2,
									outlineColor: "#BCDBF9",
									fill: false,
									clickable: clickable
								});
							else
								this.setGraphicLayerStyle(this.qxGraphicLayer, ["*"], [], {
									outlineWidth: 2,
									outlineColor: "#BCDBF9",
									fill: false
								});
						}
					}
					break;
			}
		},

		setGraphicLayerStyle: function(layer, fields, conditions, style) {
			layer.setStyle(fields, conditions, style);
		},

		/**
		 * 企业关联自动站
		 * @param {Object} topic
		 * @param {Object} id
		 */
		relateQySite: function(topic, id) {
			var graphiclist = this._qyGraphicLayer.all();
			for(var i = 0; i < graphiclist.length; i++) {
				var graphic = graphiclist[i];
				if(graphic.attrs['UUID'] == id) {
					this.qyGraphicClickedHandler({
						graphic: graphic
					});
					this._map.view(graphic.geom);
					break;
				}
			}
		},

		qyGraphicClickedHandler: function(evt) {
			console.log('qyGraphicClickedHandler');
			var graphic = evt.graphic;
			var x = graphic.geom[0];
			var y = graphic.geom[1];
			var r = parseFloat(graphic.attrs['ENTERPRISESCOPE']);
			//判断企业位于哪个行政区划
			if(graphic.attrs['_location_'] == null) {
				var districts = this.qxGraphicLayer.all();
				var intersectDistrict = null;
				for(var i = 0; i < districts.length; i++) {
					var d = districts[i];
					if(util.inside([x, y], d.geom.m[0][0])) {
						intersectDistrict = d;
						break;
					}
				}
				if(intersectDistrict != null) {
					graphic.attrs['_location_'] = intersectDistrict.attrs['COUNTRY'];
				} else {
					graphic.attrs['_location_'] = '渤海';
				}
			}

			if(r == null || isNaN(r)) {
				alert('该企业的关注范围为空');
				return;
			}
			var circleGeom = [
				[]
			];
			for(var i = 0; i < 360; i++) {
				var d = Math.PI * i / 180;
				var tx = Math.cos(d) * r * 1000 + x;
				var ty = Math.sin(d) * r * 1000 + y;
				circleGeom[0].push([tx, ty]);
			}
			if(this._qyBuffer == null) {
				this._qyBuffer = new G.Graphic.Polygon(circleGeom, {}, {
					outlineColor: '#006666',
					fillColor: '#006666',
					fillOpacity: 0.7
				});

				this._qyBuffer.addTo(this._qyGraphicLayer);
			} else {
				this._qyBuffer.updateGeom(circleGeom);
			}
			var extent = [x-1200*r,y-1000*r,x+2000*r,y+1000*r];
			this._map.zoomExtent(extent);
			
			graphic.bringToTop();
			var unPt = G.Proj.WebMercator.unproject(x, y);
			//做缓冲区检索自动站信息
			var stationIds = [];
			$.ajax({
				data: {
					lon: unPt[0],
					lat: unPt[1],
					r: r,
					t: ((new Date()).getTime())
				},
				async: false,
				dataType:'json',
				complete: $.hitch(this, function(xhr, status) {
					var result = xhr.responseJSON;
					if(result) {
						if(result.code == 200) {
							stationIds = result.content;
							this.shwoAppointStation(null, result.content);
						} else {
							alert('查询自动站信息失败：' + result.errormsg);
						}
					}
				}),
				error: function(xhr, status, error) {
					console.log(xhr);
					console.log(status);
					console.log(error);
					console.log('查询自动站信息失败：');
				},
				type: 'get',
				url: config.services.bufferQuery
			});
			AppEvent.dispatchAppEvent(AppEvent.QY_GRAPHIC_CLICK, [stationIds, graphic.attrs['UUID'], stationIds, graphic]);
			var attrs = graphic.attrs;
			this._map.showPopup(graphic.geom, qypopuptemplate);
			$("#Qy_Name-div").html(attrs.ENTERPRISENAME);
			$("#qy-bh").html(attrs.UUID);
			if(attrs.PRE == undefined) {
				attrs.PRE = '/';
			}
			$("#qydz-div").html(attrs.ENTERPRISEADDR);
			$("#qylxr-div").html(attrs.ENTERPRISECONTACTS);

			$("#qylxrdh-div").html(attrs.ENTERPRISETELEPHONE);
			$("#qyms-div").html(attrs.ENTERPRISEDESCRIPTION);
			$("#qyywfx-div").html(attrs.ENTERPRISEBUSSDRIECTION);
			$("#qygzlx-div").html(attrs.ENTERPRISEWEATHER);

			var map = this._map;
			$("#closebtn").click(function() {
				map.hidePopup(true);
				$("#closebtn").off('click');
			});
		},

		qxGraphicClickedHandler: function(evt) {
			var graphic = evt.graphic;
			if(this.weatherGraphicLayer.isVisible()) {
				AppEvent.dispatchAppEvent(AppEvent.SHOW_COUNTRY_WEATHER, graphic.attrs.COUNTRY);
				this.setGraphicLayerStyle(this.qxGraphicLayer, ["*"], [], {
					outlineWidth: 2,
					outlineColor: "#BCDBF9",
					fill: false
				});
				if(graphic.attrs.COUNTRY == "塘沽" || graphic.attrs.COUNTRY == "汉沽" || graphic.attrs.COUNTRY == "大港") {
					var gra;
					var graphics = this.qxGraphicLayer.all();
					for(var i = 0; i < graphics.length; i++) {
						if(graphics[i].attrs.COUNTRY == "塘沽" || graphics[i].attrs.COUNTRY == "汉沽" || graphics[i].attrs.COUNTRY == "大港") {
							graphics[i].updateOptions({
								fillColor: "#3573ef",
								fill: true,
								fillOpacity: 0.8,
								outlineWidth: 4
							});
						}
					}
				} else
					graphic.updateOptions({
						fillColor: "#3573ef",
						fill: true,
						fillOpacity: 0.8,
						outlineWidth: 4
					});
			}

			if(!this.graphicLayer.isVisible() && !this.weatherGraphicLayer.isVisible()) {
				var htmlStr = "<div class='xzName-popup'>" + graphic.attrs.COUNTRY + "</div>"
				this._map.showPopup(this._map.toMap(this.screenPoint), htmlStr, 0, 0);
				$(".g-popup-pointer").css('background', "url(assets/xz-arrow.png) no-repeat");
				$(".g-popup-pointer").css('margin', "-5px 0 0 0");
				$(".g-group-pointer").css("width", "26px");
				$(".g-group-pointer").css("height", "21px");
			}
		},

		graphicClickedHandler: function(evt) {
			this.showPopup(evt.graphic);
		},

		showPopup: function(graphic) {
			var spt = this._map.toScreen(graphic.geom);
			var attrs = graphic.attrs;
			if(attrs['station_Id_C'] == 'LINGANG' || attrs['station_Id_C'] == 'ZHAXIA'){
				this._map.showPopup(graphic.geom, cwpopuptemplate);
				$('.popup-div-common-row').css('display','none');
				$('.popup-div-cw-row').css('display','table-row');
				$('#station-cw').html(attrs.tide_data + "m");
				$('#viewCWButton').click(function(){
					AppEvent.dispatchAppEvent(AppEvent.VIEW_CW_HISTORY,attrs['station_Id_C']);
				});
			}
			else{
				this._map.showPopup(graphic.geom, popuptemplate);
				$('.popup-div-common-row').css('display','table-row');
				$('.popup-div-cw-row').css('display','none');
				if(attrs.PRE == undefined) {
				attrs.PRE = '/';
				}
				$("#pre-div").html(attrs.PRE + "&nbsp;mm");
				if(attrs.TEM == undefined) {
					attrs.TEM = '/';
				}
				$("#tem-div").html(attrs.TEM + "&nbsp;℃");
				if(attrs.WIN_S_Avg_2mi == undefined) {
					attrs.WIN_S_Avg_2mi = '/';
				}
				if(attrs.WIN_D_Avg_2mi == undefined) {
					attrs.WIN_D_Avg_2mi = '/';
				}
				if(attrs.WIN_S_Inst_Max == undefined) {
					attrs.WIN_S_Inst_Max = '/';
				}
				if(attrs.WIN_D_INST_Max == undefined) {
					attrs.WIN_D_INST_Max = '/';
				}
	
				$("#WIN_S_Avg_2mi-div").html(attrs.WIN_S_Avg_2mi + '&nbsp;m/s<br>' + attrs.WIN_D_Avg_2mi + '&nbsp;°');
				$("#WIN_S_Inst_Max-div").html(attrs.WIN_S_Inst_Max + '&nbsp;m/s<br>' + attrs.WIN_D_INST_Max + '&nbsp;°');
			}
			$("#Station_Name-div").html(attrs.station_Name);

			var map = this._map;
			$("#closebtn").click(function() {
				map.hidePopup(true);
				$("#closebtn").off('click');
			});

			AppEvent.dispatchAppEvent(AppEvent.STATION_GRAPHIC_CLICK, [graphic.geom, graphic.attrs]);
		},

		//加载站点基本信息
		getBasicStationsHandler: function(result) {
			if(result.code == 200) {
				var stations = result.content;
				for(var i = 0; i < stations.length; i++) {
					var station = stations[i];
					var pt = G.Proj.WebMercator.project(parseFloat(station.lon), parseFloat(station.lat));
					var g = new G.Graphic.Point(pt, {
						admin_Code_CHN: station.admin_Code_CHN,
						station_Id_C: station.station_Id_C,
						station_Name: station.station_Name
					}, {
						shape: 'image',
						offset: [-10, -10],
						size: [19, 19],
						image: 'assets/stationinfo/normal.png',
						clickable: true
					});
					g.addTo(this._stationInfoGraphicLayer);
					station.geom = pt;
					this._gTable[station.station_Id_C] = g;
				}
				Global.setStationInfos(stations);
				AppEvent.dispatchAppEvent(AppEvent.LOAD_STATIONS_COMPELETE, stations);
				//加载潮位自动站
				//临港
				var pt = G.Proj.WebMercator.project(117.5451168989, 38.7684606231);
				var g = new G.Graphic.Point(pt, {
						station_Id_C: 'LINGANG',
						station_Name: '临港'
					}, {
						shape: 'image',
						image:'assets/stationinfo/cwstationicon.png',
						size: [36, 36],
						offset:[-25,-18],
						clickable: true
					});
				g.addTo(this._stationInfoGraphicLayer);
				this._gTable['LINGANG'] = g;
				//闸下
				var pt = G.Proj.WebMercator.project(117.7111099887, 38.9920405094);
				var g = new G.Graphic.Point(pt, {
						station_Id_C: 'ZHAXIA',
						station_Name: '闸下'
					}, {
						shape: 'image',
						image:'assets/stationinfo/cwstationicon.png',
						size: [36, 36],
						offset:[-25,-18],
						clickable: true
					});
				g.addTo(this._stationInfoGraphicLayer);
				this._gTable['ZHAXIA'] = g;
				this.getStationDetailInfo();
			} else {
				alert('加载站点基本信息失败，信息：' + result.errormsg);
			}

		},
		//加载站点数据信息
		getStationDetailInfo: function() {
			$.ajax({
				data:{t:((new Date()).getTime())},
				dataType:'json',
				async:false,
				complete: $.hitch(this, function(xhr, status) {
					var result = xhr.responseJSON;
					if(result && result.stationData && $.isArray(result.stationData)) {
						var stations = result.stationData;
						var gStations = [];
						for(var i = 0; i < stations.length; i++) {
							var item = stations[i];
							for(var key in item) {
								if(key == 'station_Id_C' || key == 'create_Time') {
									continue;
								}
								var value = item[key];
								if(parseFloat(value) >= 999999) {
									item[key] = '/';
								}
							}
							item['viewdiv'] = "<div class='viewdiv' id='" + item['station_Id_C'] + "'></div>"
							var g = this._gTable[item.station_Id_C];
							g.attrs = $.extend(g.attrs, item);
							if(g == null) {
								continue;
							}
							this._gTable[item.station_Id_C] = g;
							g.attrs.geom = g.geom;
							gStations.push(g.attrs);
						}
						Global.setStationInfos(gStations);
						AppEvent.dispatchAppEvent(AppEvent.LOAD_STATIONS_DATADETAIL_COMPELETE, stations);
						
					}
				}),
				error: $.hitch(this, function(xhr, status, error) {
					console.log(xhr);
					console.log(status);
					console.log(error);
					console.log('加载站点信息失败');
				}),
				type: 'get',
				url: config.services.stationDetailInfo
			});
			
			//获取潮位信息
			$.ajax({
				data:{t:((new Date()).getTime())},
				dataType:'json',
				complete: $.hitch(this, function(xhr, status) {
					var result = xhr.responseJSON;
					if(result.tide && $.isArray(result.tide)) {
						var stations = result.tide;
						for(var i = 0; i < stations.length; i++) {
							var item = stations[i];
							item['viewdiv'] = "<div class='viewdiv' id='" + item['station_Id_C'] + "'></div>"
							var g = this._gTable[item.tide_code];
							g.attrs = $.extend(g.attrs, item);
							this._gTable[item.tide_code] = g;
						}
//						AppEvent.dispatchAppEvent(AppEvent.LOAD_STATIONS_DATADETAIL_COMPELETE, stations);
						this.getThresholds();
					}
				}),
				error: $.hitch(this, function(xhr, status, error) {
					console.log(xhr);
					console.log(status);
					console.log(error);
					console.log('加载潮位站点信息失败');
					this.getThresholds();
				}),
				type: 'get',
				url: config.services.cwStationDetailInfo
			});
		},

		cancleAlertStations: function() {
			this._alertLayer.clear();
			this._autoShowAlertSymbol = true;
			this.getThresholds();
		},

		/**
		 * 高亮指定报警的站点
		 */
		alertStations: function(topic, ids) {
			this._autoShowAlertSymbol = false;
			clearTimeout(this.timeoutIdle);
			this._alertLayer.clear();
			for(var key in this._gTable) {
				var g = this._gTable[key];
				if(ids.indexOf(g.attrs['station_Id_C']) != -1) {
					this._alertLayer.addHtml('<div id="animate-circle"> <div class="dot"></div> <div class="pulse"></div> </div>', g.geom[0], g.geom[1]);
				}
			}
		},

		getThresholds: function() {
			if(this._autoShowAlertSymbol) {
				this._alertLayer.clear();
			}
			$.ajax({
				data:{t:((new Date()).getTime())},
				dataType:'json',
				complete: $.hitch(this, function(xhr, status) {
					var result = xhr.responseJSON;
					if(result.gisThreshold && $.isArray(result.gisThreshold)) {
						var stations = result.gisThreshold;
						for(var i = 0; i < stations.length; i++) {
							var lvalue = stations[i];
							var g = this._gTable[lvalue['THRESHOLDRELATIONID']];
							if(g == null) {
								continue;
							}
							this.alertStation(g, lvalue);
						}
						//Global.setStationInfos(stations);
						//AppEvent.dispatchAppEvent
						AppEvent.dispatchAppEvent(AppEvent.REFRESH_STATION_INFOS);
						//3分钟后自动去取阈值，更新报警
						this.timeoutIdle = setTimeout($.hitch(this, this.getStationDetailInfo), 1000 * 3 * 60);
					}
				}),
				error: function(xhr, status, error) {
					console.log(xhr);
					console.log(status);
					console.log(error);
					console.log('加载站点阈值信息失败');
					this.timeoutIdle = setTimeout($.hitch(this, this.getStationDetailInfo), 1000 * 3 * 60);
				},
				type: 'get',
				url: config.services.stationThresholds
			});
			
			//潮位报警
			$.ajax({
				data:{t:((new Date()).getTime())},
				dataType:'json',
				complete: $.hitch(this, function(xhr, status) {
					var result = xhr.responseJSON;
					if(result.tide && $.isArray(result.tide)) {
						var stations = result.tide;
						
						for(var i = 0; i < stations.length; i++) {
							var lvalue = stations[i];
							var g = this._gTable[lvalue['tide_code']];
							if(g == null) {
								continue;
							}
							if(parseFloat(g.attrs.tide_data) > parseFloat(lvalue['tide_data'])){
								this._alertLayer.addHtml('<div id="animate-circle"> <div class="dot"></div> <div class="pulse"></div> </div>', g.geom[0], g.geom[1]);
							}
							//this.alertStation(g, lvalue);
						}
					}
				}),
				error: function(xhr, status, error) {
					console.log(xhr);
					console.log(status);
					console.log(error);
					console.log('加载潮位站点阈值信息失败');
				},
				type: 'get',
				url: config.services.cwStationThresholds
			});
		},

		popupStation: function(topic, param) {
			var sid = param[0];
			var iscenter = param[1];
			var g = this._gTable[sid];
			this.showPopup(g);
			if(iscenter == true){
				var extent = this._map.getExtent();
				var pt = [g.geom[0] + (extent[2] - extent[0]) / 10, g.geom[1] + (extent[3] - extent[1]) / 10];
				this._map.view(pt);
			}
			
		},

		alertStation: function(g, lvalue) {
			g.attrs['alert'] = false;
			if(g.attrs['PRE'] >= parseFloat(lvalue['PRE'])) {
				g.attrs['alert'] = true;
				g.attrs['alert_PRE'] = true;
			}
			if(g.attrs['TEM'] >= parseFloat(lvalue['TEM_Max']) || g.attrs['TEM'] <= parseFloat(lvalue['TEM_Min'])) {
				g.attrs['alert'] = true;
				g.attrs['alert_TEM'] = true;
			}
			if(g.attrs['WIN_S_Avg_2mi'] >= parseFloat(lvalue['WIN_S_Avg_2mi'])) {
				g.attrs['alert'] = true;
				g.attrs['alert_WIN'] = true;
			}

			if(this._autoShowAlertSymbol && g.attrs['alert'] == true) {
				this._alertLayer.addHtml('<div id="animate-circle"> <div class="dot"></div> <div class="pulse"></div> </div>', g.geom[0], g.geom[1]);
			}
			//else if(this._autoShowAlertSymbol){

		},

		shwoAppointStation: function(topic, ids) {
			//this._stationInfoGraphicLayer.clear();
			this._showInfoLabelStationGraphics = [];
			for(var key in this._gTable) {
				var g = this._gTable[key];
				if(ids.indexOf(g.attrs['station_Id_C']) != -1) {
					//this._stationInfoGraphicLayer.add(g);
					//g.addTo(this._stationInfoGraphicLayer);
					g.updateOptions({
						size: [19, 19]
					});
					this._showInfoLabelStationGraphics.push(g);
					this.switchLayerVisible(null, ['station', true]);
					this.switchLayerVisible(null, ['alert', true]);
					this.switchLayerVisible(null, ['stationvalue', false]);
				} else {
					g.updateOptions({
						size: [0, 0]
					});
				}
			}
		},
		
		/**
		 * 显示自动站某个指标值
		 */
		showStationSingleValueLabel: function(topic, fieldName) {
			this.switchLayerVisible(null, ['stationvalue', true]);
			this._stationValueLayers.clear();
			//this._alertLayer.clear();
			for(var i=0;i<this._showInfoLabelStationGraphics.length;i++){
				var g = this._showInfoLabelStationGraphics[i];
				if(g.attrs[fieldName] == null || g.attrs[fieldName] == '' || g.attrs[fieldName] == '/'){
					continue;
				}
				this._stationValueLayers.addHtml('<span class="station-value-label">'+g.attrs[fieldName]+'</span>', g.geom[0], g.geom[1]);
			}
		},

		shwoAllStation: function(topic) {
			this.switchLayerVisible(null, ['station', true]);
			this.switchLayerVisible(null, ['alert', true]);
			this.switchLayerVisible(null, ['stationvalue', false]);
			for(var key in this._gTable) {
				var g = this._gTable[key];
				g.updateOptions({
					size: [19, 19]
				});
			}
			console.log('shwoAllStation');
		},
		
		addRadarImage:function(){
			if(this._radarWarnIconFlashHandler != null){
				clearInterval(this._radarWarnIconFlashHandler);
				this._radarWarnIconFlashHandler = null;
			}
			$.ajax({
				data:{t:((new Date()).getTime())},
				dataType:'json',
				complete: $.hitch(this, function(xhr, status) {
					var result = xhr.responseJSON;
					if(result.code == 200) {
						this._radarLayer.clear();
						var cpt = G.Proj.WebMercator.project(117.7331,39.0497);
						var imagepath = result.content.image;
						$('#radardate').text('日期：'+imagepath.substring(0, 4) + "-" + imagepath.substring(4, 6) + "-" + imagepath.substring(6, 8));
						$('#radartime').text('时间：'+imagepath.substring(9, 11) + ":" + imagepath.substring(11, 13));
						this._radarLayer.addImage('radaroutput/CR/37/'+result.content.image,cpt[0]-230*1000,cpt[1]-230*1000,cpt[0]+230*1000,cpt[1]+230*1000);
						setTimeout($.hitch(this, this.addRadarImage), 1000 * 6 * 60);
						var warnpoints = result.content.warnpoints;
						this._radarHeighlightLayer.clear();
						if(warnpoints != null){
							warnpoints.length>0?$('.radar-warn').css('display','block'):$('.radar-warn').css('display','none');
							this._radarWarnIconFlashHandler = setInterval($.hitch(this,function(){
								this._radarWarnIconFlashFlag % 2 == 0?$('.radar-warn').css('background-image','url(assets/radarwarn1.png)'):$('.radar-warn').css('background-image','url(assets/radarwarn0.png)')
								this._radarWarnIconFlashFlag++;
							}),1000);
							for(var i=0;i<warnpoints.length;i++){
								var pt = warnpoints[i];
								var mercatorPt = G.Proj.WebMercator.project(pt.x,pt.y);
								var g = new G.Graphic.Polygon([[[mercatorPt[0],mercatorPt[1]],[mercatorPt[0],mercatorPt[1]-1000],[mercatorPt[0]+1000,mercatorPt[1]-1000],[mercatorPt[0]+1000,mercatorPt[1]]]],pt,{
									outline:false,
									fillColor:this.getRadarColor(pt.v),
									fillOpacity:0.8
								});
								g.addTo(this._radarHeighlightLayer);
							}
						}
						else{
							$('.radar-warn').css('display','none');
						}
					}
				}),
				error: function(xhr, status, error) {
					console.log(xhr);
					console.log(status);
					console.log(error);
					console.log('加载雷达图失败');
					setTimeout($.hitch(this, this.addRadarImage), 1000 * 6 * 60);
				},
				type: 'get',
				url: 'radar/querylatest.do'
			});
		},

		init: function() {
			G.ready($.hitch(this, this.geoHeyReadyHandler));
		},
		
		getRadarColor:function(colorValue){
		var color='';
		switch(colorValue){
			case -5:
				color = '#00ACA4';
				break;
			case 0:
				color =  '#C0C0FE';
				break;
			case 5:
				color =  '#7A72EE';
				break;
			case 10:
				color =  '#1E26D0';
				break;
			case 15:
				color =  '#A6FCA8';
				break;
			case 20:
				color =  '#00EA00';
				break;
			case 25:
				color =  '#10921A';
				break;
			case 30:
				color =  '#FCF464';
				break;
			case 35:
				color =  '#C8C802';
				break;
			case 40:
				color =  '#8C8C00';
				break;
			case 45:
				color =  '#FEACAC';
				break;
			case 50:
				color =  '#FE645C';
				break;
			case 55:
				color =  '#EE0230';
				break;
			case 60:
				color =  '#D48EFE';
				break;
			case 65:
				color =  '#AA24FA';
				break;
		}
		return color;
   },
		viewContourLine:function (topic,content){
			AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['yqzz', true]);
			$("#yqzz-checkbox > div").css("background", "url(assets/checked.png)");
			
			
			//this._contourlineLayer.show();
			this._contourlineLayer.clear();
			this._contourlineLayer.addImage('contourline/'+content.fileName,content.xmin,content.ymin,content.xmax,content.ymax);
			//this._contourlineLegendLayer.addHtml(legendtemplate,13112309,4695269);
			if(this._isAddContourLineLegend == false){
				var g = new G.Graphic.Point([13112309,4695269],null,
				{
			        shape: 'image',
			        size: [49,186],
			        image: 'assets/legend.png',
			        clickable: false
			    });
			    //setTimeout($.hitch(this,function(){
			    	g.addTo(this._contourlineLegendLayer);
			    	this._isAddContourLineLegend = true;
			    //}),2000);
			
			}
			
		},
		clearContourLine:function (topic,content){
			this._contourlineLayer.clear();
			//this._contourlineLegendLayer.clear();
		}
	};
});