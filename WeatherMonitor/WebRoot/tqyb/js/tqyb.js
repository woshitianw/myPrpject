require(["jquery",
	'core/AppEvent',
	'js/ConfigData',
	"widgets/map/MapWidget",
	'core/GlobalParams',
	'echarts',
	'bootstrap'
], function(
	$,
	AppEvent,
	config,
	mapWidget,
	Global,
	echarts) {
	var weatherChart, windChart;
	var weatherOption = {
		grid:{
			top:25,
			left:50,
			right:50,
			bottom:10
		},
		textStyle: {
			fontSize: '16',
			fontFamily: '微软雅黑',
			fontWeight: 'bold',
			color: "#FFFFFF"
		},
		toolbox: {
			show: false
		},
		calculable: true,
		xAxis: [{
			show: false,
			type: 'category',
			boundaryGap: false,
			data: ['08时', '09时', '10时', '11时', '12时', '13时', '14时', '15时', '16时', '17时', '18时', '19时']
		}],
		yAxis: [{
			show: false
		}],

		series: [{
			symbol: 'circle',
			symbolSize: 15,
			name: '气温',
			type: 'line',
			itemStyle: {
				normal: {
					color: '#F68226',
					outlineColor: "#F68226",
					label: {
						show: true,
						formatter: '{c} °C'
					},
					labelLine: {
						show: true
					},
					lineStyle: {
						color: "#F68226",
						width: 2,
						type: "solid"
					}
				}
			},
			data: [21, 26, 28, 28, 22, 19, 18, 17, 19, 20, 11, 12]
		}]
	};

	function showCountryWeather(topic, countryName) {
		$.getJSON("../data/qxcenter.geojson", function(result) {
			if(result) {
				var code, url = "../" + config.services.weatherUrl;
				for(var item in result) {
					if(result[item].name == countryName) {
						code = result[item].code;
						if(code == "101031100") {
							$("#title-div").empty();
							$("#title-div").html("滨海新区");
						} else {
							$("#title-div").empty();
							$("#title-div").html(countryName);
						}
						break;
					}
				}
				url += code + "&datatype=hourfc"
				getLifeInfos(code); //获取生活指数
				$.ajax({
					type: "get",
					url: url,
					async: true,
					dataType: "json",
					data:{t:((new Date()).getTime())},
					success: function(result) {
						if(result['jh']) {
							var times = [],
								jbs = [],
								jcs = [],
								clouds = [],
								weatherId = [];
							for(var i = 0; i < 12; i++) {
								var time = result['jh'][i].jf.substring(result['jh'][i].jf.length - 4, result['jh'][i].jf.length - 2) + "时";
								times.push(time); //天气预报时间
								jbs.push(result['jh'][i].jb); //最高温度
								jcs.push(getJc(result['jh'][i].jc)); //风向角度值
								clouds.push(result['jh'][i].jd); //风力
								weatherId.push(result['jh'][i].ja); //天气现象图标代码
							}
							addWeatherTime(times, weatherId); //添加天气预报时间
							addCloudInfo(clouds, jcs); //添加风速风向信息
							weatherChart.setOption({
								xAxis: [{
									data: times
								}],
								series: [{
									data: jbs
								}]

							});
						}
					}
				});

			}
		})
	}

	function getJc(jc) {
		var jcAngle = 0;
		switch(jc) {
			case "0":
				jcAngle = 180;
				break;
			case "1":
				jcAngle = -135;
				break;
			case "2":
				jcAngle = -90;
				break;
			case "3":
				jcAngle = -45;
				break;
			case "4":
				jcAngle = 0;
				break;
			case "5":
				jcAngle = 45;
				break;
			case "6":
				jcAngle = 90;
				break;
			case "7":
				jcAngle = 135;
				break;
			default:
				jcAngle = 180;
				break;
		}

		return jcAngle;
	}

	function getLifeInfos(code) {
		var url = "../" + config.services.weatherUrl;
		url = url + code + "&datatype=index";
		$.ajax({
			type: "get",
			url: url,
			dataType: "json",
			async: true,
			data:{t:((new Date()).getTime())},
			success: function(result) {
				if(result.i) {
					for(var item in result.i) {
						var itemObj = result.i[item];
						if(itemObj.i1 == "uv") {
							$("#zwxzs-simpleinfo").empty();
							$("#zwxzs-detailinfo").empty();
							$("#zwxzs-simpleinfo").html(itemObj.i4);
							$("#zwxzs-detailinfo").html(itemObj.i5);
						} else if(itemObj.i1 == "gm") {
							$("#gmzs-simpleinfo").empty();
							$("#gmzs-detailinfo").empty();
							$("#gmzs-simpleinfo").html(itemObj.i4);
							$("#gmzs-detailinfo").html(itemObj.i5);
						} else if(itemObj.i1 == "ct") {
							$("#cyzs-simpleinfo").empty();
							$("#cyzs-detailinfo").empty();
							$("#cyzs-simpleinfo").html(itemObj.i4);
							$("#cyzs-detailinfo").html(itemObj.i5);
						} else if(itemObj.i1 == "xc") {
							$("#xczs-simpleinfo").empty();
							$("#xczs-detailinfo").empty();
							$("#xczs-simpleinfo").html(itemObj.i4);
							$("#xczs-detailinfo").html(itemObj.i5);
						} else if(itemObj.i1 == "yd") {
							$("#ydzs-simpleinfo").empty();
							$("#ydzs-detailinfo").empty();
							$("#ydzs-simpleinfo").html(itemObj.i4);
							$("#ydzs-detailinfo").html(itemObj.i5);
						} else if(itemObj.i1 == "pl") {
							$("#kqwrzs-simpleinfo").empty();
							$("#kqwrzs-detailinfo").empty();
							$("#kqwrzs-simpleinfo").html(itemObj.i4);
							$("#kqwrzs-detailinfo").html(itemObj.i5);
						}
					}
				}
			}
		});
	}

	function addWeatherTime(times, weatherIds) {
		var items = $(".weathertime-item");
		if(items && weatherIds && items.length == weatherIds.length) {
			items.empty();
			items.each(function(index, item) {
				var time = parseInt(times[index]);
				if(index == 0) {
					$(item).html("现在");
				} else
					$(item).html(times[index]);

				var imgSrcPath = "",
					className = "weathericon-div ";
				if(time >= 6 && time <= 18) {
					className += "weatherDayIcon-div";
					if((weatherIds[index] == "00" || weatherIds[index] == "01" || weatherIds[index] == "03" || weatherIds[index] == "13"))
						imgSrcPath = "../assets/tqyb/mapicon/day/" + weatherIds[index] + ".png";
					else
						imgSrcPath = "../assets/tqyb/mapicon/" + weatherIds[index] + ".png";
				} else {
					className += "weatherNightIcon-div";
					if((weatherIds[index] == "00" || weatherIds[index] == "01" || weatherIds[index] == "03" || weatherIds[index] == "13"))
						imgSrcPath = "../assets/tqyb/mapicon/night/" + weatherIds[index] + ".png";
					else
						imgSrcPath = "../assets/tqyb/mapicon/" + weatherIds[index] + ".png";
				}
				var weathericon = $("<img></img>", {
					id: "weathericon-" + time,
					class: className,
					src: imgSrcPath
				});

				$(item).append(weathericon);
			})
		}
	}

	function addCloudInfo(clouds, jcs) {
		$(".cloud-div").empty();
		if(clouds && clouds.length == jcs.length) {
			for(var i = 0; i < clouds.length; i++) {
				item = $("<div></div>", {
					class: "col-xs-1"
				});
				var cloudName = '';
				switch(clouds[i]) {
					case "0":
						cloudName = "无风";
						break;
					case "1":
						cloudName = "软风";
						break;
					case '2':
						cloudName = "轻风";
						break;
					case "3":
						cloudName = "微风";
						break;
					case "4":
						cloudName = "和风";
						break;
					case "5":
						cloudName = "清风";
						break;
					case '6':
						cloudName = "强风";
						break;
					case "7":
						cloudName = "劲风";
						break;
					case "8":
						cloudName = "大风";
						break;
					case "9":
						cloudName = "烈风";
						break;
					case "10":
						cloudName = "狂风";
						break;
					case "11":
						cloudName = "暴风";
						break;
					case "12":
						cloudName = "台风";
						break;
					default:
						cloudName = "";
						break;
				}

				var clouddir = $("<div></div>", {
					class: 'clouddir-div'
				});
				clouddir.css("transform", "rotate(" + jcs[i] + "deg)");
				clouddir.css("-ms-transform", "rotate(" + jcs[i] + "deg)");
				clouddir.css("-moz-transform", "rotate(" + jcs[i] + "deg)");
				clouddir.css("-webkit-transform", "rotate(" + jcs[i] + "deg)");
				clouddir.css("-o-transform", "rotate(" + jcs[i] + "deg)");
				clouddir.css("height", "26px");
				clouddir.css("background", "url(../assets/tqyb/clouddir.png) center center no-repeat");

				item.html(cloudName + "<br/>" + clouds[i] + "级");
				item.prepend(clouddir);

				$(".cloud-div").append(item);
			}
		}
	}

	function init() {
		AppEvent.addAppEventListener(AppEvent.SHOW_COUNTRY_WEATHER, showCountryWeather);

		//$("#weatherChart").css("width", (130 + parseInt($(".main-div").css("width").replace("px", ''))) + "px");
		for(var i = 0; i < 12; i++) {
			var item = $("<div></div>", {
				class: "col-xs-1 weathertime-item"
			});
			$("#weathertime-div").append(item);
		}
		showCountryWeather('', "塘沽");

		weatherChart = echarts.init(document.getElementById('weatherChart'));
		weatherChart.setOption(weatherOption);

		AppEvent.dispatchAppEvent(AppEvent.ADD_WEATHER_DATAS);
	}

	init();
})