require(["jquery",
	'core/AppEvent',
	'core/GlobalParams',
	'jslibs/hitch',
	"js/ConfigData",
	'echarts',
	'bootstrap',
	'bootstrap-table',
	'bootstrap-table-zh-CN'
], function(
	$,
	AppEvent,
	Global,
	hitch,
	config,
	echarts) {

	var id, time;
	var rainfallChart, ywsfChart, otherChart,selectStation;

	//降雨量图表选项
	var rainfallOption = {
		color: ['#00F9FF', '#FCD900'],
		tooltip: {
			trigger: 'item'
		},
		legend: {
			orient: 'vertical',
			x: 'left',
			y: 'bottom',
			data: ['已到达数据量', '未到达数据量'],
			textStyle: {
				color: "#fff",
				fontSize: "15",
				fontFamily: "微软雅黑"
			}
		},
		toolbox: {
			show: false
		},
		calculable: true,
		series: [{
			name: '数据到达率',
			type: 'pie',
			center: ["50%", "50%"],
			radius: ['30%', '70%'],
			itemStyle: {
				normal: {
					label: {
						show: false
					},
					labelLine: {
						show: false
					}
				}
			},
			data: [{
				value: 0,
				name: '已到达数据量'
			}, {
				value: 0,
				name: '未到达数据量'
			}]
		}]
	};

	//压温湿风图表选项
	var ywsfOption = {
		color: ['#8fc31f', '#f19149'],
		tooltip: {
			trigger: 'item'
		},
		legend: {
			orient: 'vertical',
			x: 'left',
			y: 'bottom',
			data: ['已到达数据量', '未到达数据量'],
			textStyle: {
				color: "#fff",
				fontSize: "15",
				fontFamily: "微软雅黑"
			}
		},
		toolbox: {
			show: false
		},
		calculable: true,
		series: [{
			name: '数据到达率',
			type: 'pie',
			center: ["50%", "50%"],
			radius: ['30%', '70%'],
			itemStyle: {
				normal: {
					label: {
						show: false
					},
					labelLine: {
						show: false
					}
				}
			},
			data: [{
				value: 0,
				name: '已到达数据量'
			}, {
				value: 0,
				name: '未到达数据量'
			}]
		}]
	};

	//其他地面数据图表选项
	var otherOption = {
		color: ['#eb6877', '#Facd89'],
		tooltip: {
			trigger: 'item'
		},
		legend: {
			orient: 'vertical',
			x: 'left',
			y: 'bottom',
			data: ['已到达数据量', '未到达数据量'],
			textStyle: {
				color: "#fff",
				fontSize: "15",
				fontFamily: "微软雅黑"
			}
		},
		toolbox: {
			show: false
		},
		calculable: true,
		series: [{
			name: '数据到达率',
			type: 'pie',
			center: ["50%", "50%"],
			radius: ['30%', '70%'],
			itemStyle: {
				normal: {
					label: {
						show: false
					},
					labelLine: {
						show: false
					}
				}
			},
			data: [{
				value: 0,
				name: '已到达数据量'
			}, {
				value: 0,
				name: '未到达数据量'
			}]
		}]
	};

	function formatTime(value) {
		value = value.toString();
		var index = value.indexOf(".");
		if(index > -1) {
			return value.substring(0, index);
		}
		return value;
	}

	function timeTypeFormatter(value, row, index) {
		return formatTime(value);
	}

	function loadDatas(data) {
		$(".chart-date").empty();
		$(".chart-date").html(time);
		var stationIds = [];
		if(data.length > 0) {
			for(var i = 0; i < data.length; i++) {
				if(data[i]["data_states"] != "0")
					stationIds.push(data[i]["station_id"]);
			}
		}
		AppEvent.dispatchAppEvent(AppEvent.ALERT_STATIONS, stationIds);

		$("#dataTable").bootstrapTable("load", data);
		$("#dataTable").bootstrapTable('hideLoading');
	}

	function reloadDatas(isTimeChange) { //isTimeChange标识时间是否改变，如果未改变则饼图数据不改变
		switch(id) {
			case "other-row":
				getArrivalRateData('1', isTimeChange);
				break;
			case "ywsf-row":
				getArrivalRateData('2', isTimeChange);
				break;
			default:
				getArrivalRateData('0', isTimeChange);
		}
	}

	function getArrivalRateData(dataType, isTimeChange) {
		$("#dataTable").bootstrapTable('showLoading');
		if(isTimeChange) {
			rainfallChart.showLoading({
				text: '加载中...'
			});
			otherChart.showLoading({
				text: '加载中...'
			});
			ywsfChart.showLoading({
				text: '加载中...'
			});
		}

		var url = "../" + config.services.arrivalRate;
		$.ajax({
			type: 'GET',
			dataType: "json",
			url: url,
			data: {
				'sync_date': time,
				t:((new Date()).getTime())
			},
			success: function(result) {
				if(result && result.qxMinDataLog) {
					var unarrivalDatas = result.qxMinDataLog.filter(function(element, index, array) {
						return(element['sync_states'] == '1' && element['data_type'] == dataType);
					});

					var arrivalDatas = result.qxMinDataLog.filter(function(element, index, array) {
						return(element['sync_states'] == '0' && element['data_type'] == dataType);
					});
					loadDatas(unarrivalDatas);

					if(isTimeChange)
						changeChartOption(result.qxMinDataLog);
				} else
					alert("未查询到" + time + "的数据");
			},
			error: function() {
				loadDatas([]);

				if(isTimeChange)
					changeChartOption();
				alert("未查询到" + time + "的数据");
			}
		});

	}

	function changeChartOption(data) {
		if(data) {
			var arrivalDatas = getDatas(data, '0', '0');
			var unarrivalDatas = getDatas(data, '1', '0');
			rainfallChart.setOption({
				series: [{
					data: [{
						value: arrivalDatas.length,
						name: '已到达数据量'
					}, {
						value: unarrivalDatas.length,
						name: '未到达数据量'
					}]
				}]
			});

			arrivalDatas = getDatas(data, '0', '2');
			unarrivalDatas = getDatas(data, '1', '2');
			ywsfChart.setOption({
				series: [{
					data: [{
						value: arrivalDatas.length,
						name: '已到达数据量'
					}, {
						value: unarrivalDatas.length,
						name: '未到达数据量'
					}]
				}]
			});

			arrivalDatas = getDatas(data, '0', '1');
			unarrivalDatas = getDatas(data, '1', '1');
			otherChart.setOption({
				series: [{
					data: [{
						value: arrivalDatas.length,
						name: '已到达数据量'
					}, {
						value: unarrivalDatas.length,
						name: '未到达数据量'
					}]
				}]
			});
		} else {
			rainfallChart.setOption({
				series: [{
					data: [{
						value: 0,
						name: '已到达数据量'
					}, {
						value: 0,
						name: '未到达数据量'
					}]
				}]
			});

			ywsfChart.setOption({
				series: [{
					data: [{
						value: 0,
						name: '已到达数据量'
					}, {
						value: 0,
						name: '未到达数据量'
					}]
				}]
			});

			otherChart.setOption({
				series: [{
					data: [{
						value: 0,
						name: '已到达数据量'
					}, {
						value: 0,
						name: '未到达数据量'
					}]
				}]
			});
		}

		rainfallChart.hideLoading();
		ywsfChart.hideLoading();
		otherChart.hideLoading();
	}

	function getDatas(datas, syncState, dataType) {
		return datas.filter(function(element, index, array) {
			return(element['sync_states'] == syncState && element['data_type'] == dataType);
		});
	}

	function init() {
		time = Global.getArrivalTime();
		$(".chart-date").empty();
		$(".chart-date").html(time);

		rainfallChart = echarts.init(document.getElementById("rainfallChart"));
		rainfallChart.setOption(rainfallOption);

		ywsfChart = echarts.init(document.getElementById("ywsfChart"));
		ywsfChart.setOption(ywsfOption);

		otherChart = echarts.init(document.getElementById("otherChart"));
		otherChart.setOption(otherOption);

		getArrivalRateData('0', true);

		var optionDataTable = {
			data: [],
			striped: true,
			pagination: true,
			pageSize: 6,
			pageList: [6, 8, 10, 15],
			search: true,
			uniqueId:'station_id',
			minimunCountColumns: 2,
			onClickCell: function(field, value, row, $element) {
				AppEvent.dispatchAppEvent(AppEvent.POPUP_AND_CENTER_STATION, [row['station_id'],true]);
			},
			columns: [{
				title: "站点编号",
				field: "station_id",
				visible: false
			}, {
				title: '站点名称',
				field: 'station_name',
				align: 'center',
				width: 210
			}, {
				title: '数据名称',
				field: 'data_name',
				align: 'center',
				width: 210
			}, {
				title: '同步时间',
				field: 'sync_date',
				align: 'center',
				width: 210,
				formatter: timeTypeFormatter
			}, {
				title: '数据详情',
				field: 'reson',
				align: 'center',
				width: 250
			}],
			onPostBody:function(){
				stationGraphicClickHandler();
			}
		};
		$("#dataTable").bootstrapTable(optionDataTable);

		$(".chart-row").click(function(evt) {
			id = evt.currentTarget.id;
			reloadDatas(false);
		});

		$(".godiv").click(function(evt) {
			if(evt.stopPropagation)
				evt.stopPropagation();
			if($(evt.currentTarget).hasClass("other-play"))
				id = 'other-row';
			else if($(evt.currentTarget).hasClass('ywsf-play'))
				id = 'ywsf-row';
			else
				id = 'rainfall-row';
			var unformatTime = time.replace(/-/g, "/");
			var date = new Date(unformatTime);
			var minute = date.getMinutes();
			minute += 10;
			date.setMinutes(minute);
			time = date.Format("yyyy-MM-dd hh:mm:ss");
			Global.setArrivalTime(time);
			reloadDatas(true);
		});

		$(".backdiv").click(function(evt) {
			if(evt.stopPropagation)
				evt.stopPropagation();
			if($(evt.currentTarget).hasClass("other-play"))
				id = 'other-row';
			else if($(evt.currentTarget).hasClass('ywsf-play'))
				id = 'ywsf-row';
			else
				id = 'rainfall-row';
			var unformatTime = time.replace(/-/g, "/");
			var date = new Date(unformatTime);
			var minute = date.getMinutes();
			minute -= 10;
			date.setMinutes(minute);
			time = date.Format("yyyy-MM-dd hh:mm:ss");
			Global.setArrivalTime(time);
			reloadDatas(true);
		});
		AppEvent.addAppEventListener(AppEvent.STATION_GRAPHIC_CLICK, stationGraphicClickHandler);
	}
	
	function stationGraphicClickHandler(topic,params){
		if(params != null){
			selectStation = params[1];
		}
		//设置选中行的颜色
		if(selectStation != null){
			var rowSelector = "#dataTable>tbody>tr";
			$(rowSelector).css('background-color','');
			rowSelector = "#dataTable>tbody>tr[data-uniqueid='"+selectStation['station_Id_C']+"']";
			$(rowSelector).css('background-color',config.selectRowColor);
		}
	}
	init();
});