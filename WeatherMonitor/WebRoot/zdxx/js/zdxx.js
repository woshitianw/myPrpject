//function formatterColumnFun(value,row,index){
//	if(index == 2){
//		if(row['alert_PRE'] && row['alert_PRE'] == true){
//			alert('baojing per');
//		}
//	}
//	else if(index == 3){
//		if(row['alert_TEM'] && row['alert_TEM'] == true){
//			alert('baojing TEM');
//		}
//	}
//	else if(index == 4){
//		console.log('alert 4');
//		if(row['alert_WIN'] && row['alert_WIN'] == true){
//			alert('baojing WIN');
//		}
//	}
//}

function formatterColumnPREFun(value, row, index) {
	if(row['alert_PRE'] && row['alert_PRE'] == true) {
		return "<span style='color:#ff0000;font-weight:bold''>" + value + '</span>'
	}
	return value;
}

function formatterColumnTEMFun(value, row, index) {
	if(row['alert_TEM'] && row['alert_TEM'] == true) {
		return "<span style='color:#ff0000;font-weight:bold''>" + value + '</span>'
	}
	return value;
}

function formatterColumnWINFun(value, row, index) {
	if(row['alert_WIN'] && row['alert_WIN'] == true) {
		return "<span style='color:#ff0000;font-weight:bold''>" + value + '</span>'
	}
	return value;
}

require(["jquery",
	'core/AppEvent',
	'core/GlobalParams',
	'js/ConfigData',
	'echarts',
	'util/TimeObjectUtil',
	'bootstrap',
	'bootstrap-table',
	'bootstrap-table-zh-CN',
	'unslider'
], function(
	$,
	AppEvent,
	Global,
	config,
	echarts,
	TimeObjectUtil) {
	//处理窗体大小发生变化
	var resizeHandler = null;
	var map = null;
	var headerHeight = 100;
	var leftMenuWidth = 100;
	var contentTabHeight = 25;
	var datas = [];
	var myChart = null;
	var stations = null;
	var currentOption = '降水量';
	var time = null;
	var chartdatareachrate;
	var lastSelectStationRow = null;
	var selectStation = null;
	//创建测试数据
	//	for (var i = 0; i < 24; i++) {
	//	    var item = {
	//	        'Station_Id_C': '1182345',
	//	        'Station_Name': '塘沽国家基本气象站',
	//	        'PRE': random(1, 100),
	//	        'TEM': random(1, 35),
	//	        'PRS': random(1, 20),
	//	        'RHU': random(1, 100),
	//	        'VIS_HOR_10MI': random(50, 1000),
	//	        'WIN_D_Avg_2mi': random(0, 360),
	//	        "WIN_S_Avg_2mi": random(1, 10),
	//	        'WIN_D_Avg_2mi_S': '西北风',
	//	        'WIN_S_Max': random(5, 15),
	//	        'WIN_D_S_Max': random(0, 360),
	//	        'WIN_D_S_Max_S': '西北风',
	//	        'WIN_S_Inst_Max': random(5, 15),
	//	        'WIN_D_INST_Max': random(0, 360),
	//	        'WIN_D_INST_Max_S': '南北风',
	//	        'RHU_Min': random(1, 35),
	//	        'time': i
	//	    }
	//	    datas.push(item);
	//	}

	function createSimulateDatas() {
		var now = new Date();
		//now.setMinutes(7);
		var nowDay = now.getDate();
		var nowMonth = now.getMonth() + 1;
		var nowYear = now.getFullYear();
		var nowHours = now.getHours();
		var nowMinutes = now.getMinutes();
		var nowSeconds = now.getSeconds();
		var datas = [];

		var cMinutes = Math.floor(nowMinutes / 10) * 10;
		var cHour = nowHours;
		var day = nowDay;
		for(var i = 0; i < 4; i++) {
			var mTotal = Math.floor(cMinutes / 10)
			for(var j = 0; j <= mTotal; j++) {
				var minites = cMinutes - j * 10;
				var proper = random(1, 100);
				if(proper < 20) {
					continue;
				}
				var item = {
					'station_Id_C': '1182345',
					'station_Name': '塘沽国家基本气象站',
					'PRE': random(1, 100),
					'TEM': random(1, 35),
					'PRS': random(1, 20),
					'RHU': random(1, 100),
					'VIS_HOR_10MI': random(50, 1000),
					'WIN_D_Avg_2mi': random(0, 360),
					"WIN_S_Avg_2mi": random(1, 10),
					'WIN_D_Avg_2mi_S': '西北风',
					'WIN_S_Max': random(5, 15),
					'WIN_D_S_Max': random(0, 360),
					'WIN_D_S_Max_S': '西北风',
					'WIN_S_Inst_Max': random(5, 15),
					'WIN_D_INST_Max': random(0, 360),
					'WIN_D_INST_Max_S': '南北风',
					'RHU_Min': random(1, 35),

					'create_Time': '2016-10-' + day + " " + (cHour < 10 ? '0' + cHour.toString() : cHour) + ":" + (minites == 0 ? '00' : minites) + ":00"
				}
				datas.push(item);
			}
			cMinutes = 50;
			nowHours--;
			if(nowHours < 0) {
				cHour = 24 + nowHours;
				day = nowDay - 1;
			} else {
				cHour = nowHours;
			}
		}
		datas.reverse();
		return datas;
	}
	
	function processCWHistoryDatas(historyDatas){
		if(historyDatas == null || historyDatas.length == 0) {
			return [];
		}
		var datas = [];
		for(var i = 0; i < historyDatas.length; i++) {
			var item = historyDatas[i];
			var time = TimeObjectUtil.parse(item.tide_time);
			datas.push({time:time.getHours() + ":" + (time.getMinutes()<10?"0"+time.getMinutes():time.getMinutes()),
				tide_data:parseFloat(item.tide_data),
				tide_time:TimeObjectUtil.formatterDate2(time)});
		}
		return datas.reverse();
	}

	function processHistoryDatas(historyDatas) {
		if(historyDatas == null || historyDatas.length == 0) {
			return [];
		}
		var startDate
		if(historyDatas[0].create_Time){
			startDate = TimeObjectUtil.parse(historyDatas[0].create_Time);
		}
		else{
			startDate = TimeObjectUtil.parse(historyDatas[0].tide_time);
		}
		
		var cHour = startDate.getHours();
		
		var hourDatas = []; //一个小时的数据
		var returnDatas = [];
		var hourSumPre = [];//累计降雨量

		var toDecimal = function toDecimal(x) { 
	      var f = parseFloat(x); 
	      if (isNaN(f)) { 
	        return; 
	      } 
	      f = Math.round(x*100)/100; 
	      return f; 
	    } 
		
		var processHoursData = function(_hDatas) {
			var item = null;
			if(returnDatas == 0){
				
			}
			if(_hDatas.length > 0) {
				var _data = _hDatas[_hDatas.length-1];
				var item = _data;
				item.time = cHour + '时';
				var PRE = 0;
				for(var j = 0; j < _hDatas.length; j++) {
					PRE = PRE + parseFloat(_hDatas[j].PRE);
				}
				hourSumPre.push(toDecimal(PRE));
				returnDatas.push(item);
			}
		}

		for(var i = 0; i < historyDatas.length; i++) {
			var item = historyDatas[i];
			for(var key in item){
				if(key == 'station_Id_C' || key == 'create_Time' || key == 'WIN_D_Avg_2mi_S' || key == 'WIN_D_INST_Max_S' || key == 'WIN_D_S_Max_S' || key == 'station_Name') {
					continue;
				}
				var value = item[key];
				if(parseFloat(value) >= 999999) {
					item[key] = '';
				}
			}
			var date = null;
			
			if(historyDatas[i].create_Time){
				date = TimeObjectUtil.parse(historyDatas[i].create_Time);
			}
			else{
				date = TimeObjectUtil.parse(historyDatas[i].tide_time);
			}
			if(date.getHours() == cHour) {
				hourDatas.push(historyDatas[i]);
			} else {
				//对上一个小时的数据进行汇总
				processHoursData(hourDatas);
				hourDatas = [];
				hourDatas.push(historyDatas[i]);
				cHour = date.getHours();
			}
		}
		processHoursData(hourDatas);
		for(var i = 0;i<returnDatas.length;i++){
			returnDatas[i].PRE = hourSumPre[i+1];
		}
		var lastData = {};
		$.extend( lastData,historyDatas[0]);
		lastData.time = '现在';
		lastData.PRE=hourSumPre[0];
		returnDatas = returnDatas.reverse();
		returnDatas.push(lastData);
		return returnDatas;
	}


	function random(min, max) {
		return parseInt(Math.random() * (max - min + 1) + min, 10);
	}

	var dataArriveOption = {
		color: ['#00F9FF', '#FCD900'],
		tooltip: {
			trigger: 'item'
		},
		legend: {
			orient: 'vertical',
			right:'5%',
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

	function setChartDatas() {
		$("#chart-date").empty();
		$("#chart-date").html(time);

		chartdatareachrate.showLoading({
			text: "加载中..."
		});

		//第一次请求数据到达率，不加时间
		var url = "../" + config.services.arrivalRate;
		var data = {t:((new Date()).getTime())};
		if(time != null){
			data = {
				"sync_date": time,
				t:((new Date()).getTime())
			};
		}
		$.ajax({
			type: "get",
			url: url,
			data: data,
			async: true,
			dataType:'json',
			success: function(result) {
				if(result && result.qxMinDataLog) {
					if(time == null && result.qxMinDataLog[0]){
						time = result.qxMinDataLog[0].sync_date;
						$("#chart-date").html(time);
						Global.setArrivalTime(time);
					}
					var unarrivalDatas = result.qxMinDataLog.filter(function(element, index, array) {
						return(element['sync_states'] == '1');
					});

					var arrivalDatas = result.qxMinDataLog.filter(function(element, index, array) {
						return(element['sync_states'] == '0');
					});

					chartdatareachrate.setOption({
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
				} else
					alert("未查询到" + time + "的数据");
				chartdatareachrate.hideLoading();
			},
			error: function() {
				chartdatareachrate.hideLoading();
				alert("未查询到" + time + "的数据");
			}
		});
	}

	function init() {
		time = Global.getArrivalTime();
		$("#banner-container").unslider({
			speed: 500, //  The speed to animate each slide (in milliseconds)
			delay: 2000, //  The delay between slide animations (in milliseconds)
			keys: true,
			dots: true, //  Display dot navigation
			fluid: true //  Support responsive design. May break non-responsive designs
		});

		chartdatareachrate = echarts.init(document.getElementById('chartdatareachrate'));
		chartdatareachrate.setOption(dataArriveOption);
		console.log('station info init');

		setChartDatas();

		AppEvent.addAppEventListener(AppEvent.LOAD_STATIONS_COMPELETE, function(evt, data) {
			stations = Global.getStationInfos();
			$("#stationTable").bootstrapTable('load', stations);
		});
		AppEvent.addAppEventListener(AppEvent.LOAD_STATIONS_DATADETAIL_COMPELETE, function(evt, data) {
			stations = Global.getStationInfos();
			//更新当前天气信息
			$("#stationTable").bootstrapTable('load', stations);
			updateCurrentWeatherInfo();
		});

		AppEvent.addAppEventListener(AppEvent.REFRESH_STATION_INFOS, function(evt, data) {
			stations = Global.getStationInfos();
			$("#stationTable").bootstrapTable('load', stations);
		});

		var optionTable = {
			data: [],
			striped: true,
			pagination: true,
			pageSize: 6,
			pageList: [6, 8, 10, 15],
			search: true,
			minimunCountColumns: 2,
			uniqueId:'station_Id_C',
			onClickCell: function(field, value, row, $element) {
				if(field == "viewdiv") {
					//AppEvent.dispatchAppEvent(AppEvent.SWITCH_IFRAME,['lsdb',"lsdb/lsdb.html?sid="+row['station_Id_C']]);
					//console.log();
					viewHistory(row);
				}
				else{
					AppEvent.dispatchAppEvent(AppEvent.POPUP_AND_CENTER_STATION,[row['station_Id_C'],true]);
				}
			},
			onPostBody:function(){
				stationGraphicClickHandler();
			}
		};
		$("#stationTable").bootstrapTable(optionTable);
		$("#stationTable").bootstrapTable("load", []);
		if(Global.getStationInfos() != null) {
			var stations = Global.getStationInfos();
			$("#stationTable").bootstrapTable('load', stations);
			updateCurrentWeatherInfo();
		}

		AppEvent.addAppEventListener(AppEvent.SWITCH_IFRAME, function(topic, data) {
			//setIframe(data[0],data[1]);
			if(data == 'statinfo') {
				$('.lsdb-bg').css('display', 'none');
				$('#arriveInfoContainer').css('display', 'block');
			}
		});

		$('.lsdb-chart-optionbar span').click(function(evt) {
			var option = $(evt.currentTarget).text();
			if(option == currentOption) {
				return;
			}
			currentOption = option;
			$('.lsdb-chart-optionbar span').removeClass('lsdb-option-select');
			$(evt.currentTarget).addClass('lsdb-option-select');
			setChartData(option);
		});

		$("#chartdatareachrate").click(function(evt) {
			AppEvent.dispatchAppEvent(AppEvent.SET_MENU_TITLE_LABEL, '数据达到率');
			AppEvent.dispatchAppEvent(AppEvent.SET_IFRAME, {
				id: "datareachrate",
				url: "sjddl/sjddl.html"
			});
		});

		$("#godiv").click(function(evt) {
			if(evt.stopPropagation)
				evt.stopPropagation();
			var unformatTime = time.replace(/-/g, "/");
			var date = new Date(unformatTime);
			var minute = date.getMinutes();
			minute += 10;
			date.setMinutes(minute);
			time = date.Format("yyyy-MM-dd hh:mm:ss");
			Global.setArrivalTime(time);
			setChartDatas();
		});

		$("#backdiv").click(function(evt) {
			if(evt.stopPropagation)
				evt.stopPropagation();
			var unformatTime = time.replace(/-/g, "/");
			var date = new Date(unformatTime);
			var minute = date.getMinutes();
			minute -= 10;
			date.setMinutes(minute);
			time = date.Format("yyyy-MM-dd hh:mm:ss");
			Global.setArrivalTime(time);
			setChartDatas();
		});
		AppEvent.addAppEventListener(AppEvent.STATION_GRAPHIC_CLICK, stationGraphicClickHandler);
		
		//查看潮位站点历史信息
		AppEvent.addAppEventListener(AppEvent.VIEW_CW_HISTORY, viewCWHistory);
	}
	
	function stationGraphicClickHandler(topic,params){
		if(params != null){
			selectStation = params[1];
		}
		//设置选中行的颜色
		if(selectStation != null){
			var rowSelector = "#stationTable>tbody>tr";
			$(rowSelector).css('background-color','');
			rowSelector = "#stationTable>tbody>tr[data-uniqueid='"+selectStation['station_Id_C']+"']";
			$(rowSelector).css('background-color',config.selectRowColor);
		}
	}


	/**
	 * 查看潮位自动站历史对比值
	 * @param {Object} topic
	 * @param {Object} cwStationId
	 */
	function viewCWHistory(topic,cwStationId){
		AppEvent.dispatchAppEvent(AppEvent.SET_MENU_TITLE_LABEL, '历史比对');
		$('.lsdb-option-cw').css('display','inline-block');
		$('.lsdb-option-common').css('display','none');
		$.ajax({
			type: "get",
			dataType:'json',
			url: '../'+config.services.cwHistory,
			data: {
				tide_code:cwStationId,
				t:((new Date()).getTime())
			},
			async: false,
			success: function(result) {
				if(result && result.tide) {
					datas = processCWHistoryDatas(result.tide);
					$('.lsdb-bg').css('display', 'block');
					$('#arriveInfoContainer').css('display', 'none');
					myChart = echarts.init(document.getElementById('lsdb-chart-div'));
					$('#latest-msg-tr').empty();
					$('.lsdb-chart-optionbar span').removeClass('lsdb-option-select');
					$('.lsdb-chart-optionbar>span:first-child').addClass('lsdb-option-select');
					$('.lsdb-option-cw').css('display','inline-block');
					$('.lsdb-option-common').css('display','none');
					$('<td>' + result.tide[result.tide.length-1]['tide_code'] + '</td>').appendTo($('#latest-msg-tr'));
					$('<td>' + result.tide[result.tide.length-1]['tide_name'] + '</td>').appendTo($('#latest-msg-tr'));
					$('<td>/</td>').appendTo($('#latest-msg-tr'));
					$('<td>/</td>').appendTo($('#latest-msg-tr'));
					$('<td>/</td>').appendTo($('#latest-msg-tr'));
					$('<td>/</td>').appendTo($('#latest-msg-tr'));
					$('<td>/</td>').appendTo($('#latest-msg-tr'));
					$('<td>/</td>').appendTo($('#latest-msg-tr'));
					$('<td>/</td>').appendTo($('#latest-msg-tr'));
					//      $('<td>'+datas[0]['WIN_D_S_Max_S']+'</td>').appendTo($('#latest-msg-tr'));
					$('<td>/</td>').appendTo($('#latest-msg-tr'));
					$('<td>/</td>').appendTo($('#latest-msg-tr'));
					$('<td>/</td>').appendTo($('#latest-msg-tr'));
					currentOption = '潮位';
					setChartData('潮位');
				} else{
					alert("没有查到该站点的历史数据");
				}
					
				//chartdatareachrate.hideLoading();
			},
			error: function() {
				chartdatareachrate.hideLoading();
				alert("未查询到" + time + "的数据");
			}
		});
	}

	function viewHistory(item) {
		AppEvent.dispatchAppEvent(AppEvent.SET_MENU_TITLE_LABEL, '历史比对');
		$('.lsdb-option-cw').css('display','none');
		$('.lsdb-option-common').css('display','inline-block');
		$.ajax({
			type: "get",
			dataType:'json',
			url: '../'+config.services.stationHistory,
			data: {
				Station_Id_C:item.station_Id_C,
				t:((new Date()).getTime())
			},
			async: true,
			success: function(result) {
				if(result && result.stationData) {
					datas = processHistoryDatas(result.stationData);
					$('.lsdb-bg').css('display', 'block');
					$('#lsdb-table').css('display','block');
					$('#arriveInfoContainer').css('display', 'none');
					$('.lsdb-chart-optionbar').css('display','block');
					myChart = echarts.init(document.getElementById('lsdb-chart-div'));
					$('#latest-msg-tr').empty();
					$('<td>' + datas[processHistoryDatas.length-1]['station_Id_C'] + '</td>').appendTo($('#latest-msg-tr'));
					$('<td>' + item['station_Name'] + '</td>').appendTo($('#latest-msg-tr'));
					$('<td>' + datas[processHistoryDatas.length-1]['PRE'] + '</td>').appendTo($('#latest-msg-tr'));
					$('<td>' + datas[processHistoryDatas.length-1]['TEM'] + '</td>').appendTo($('#latest-msg-tr'));
					$('<td>' + datas[processHistoryDatas.length-1]['WIN_S_Avg_2mi'] + '</td>').appendTo($('#latest-msg-tr'));
					$('<td>' + datas[processHistoryDatas.length-1]['WIN_D_Avg_2mi'] + '</td>').appendTo($('#latest-msg-tr'));
					$('<td>' + datas[processHistoryDatas.length-1]['WIN_D_Avg_2mi_S'] + '</td>').appendTo($('#latest-msg-tr'));
					$('<td>' + datas[processHistoryDatas.length-1]['WIN_S_Max'] + '</td>').appendTo($('#latest-msg-tr'));
					$('<td>' + datas[processHistoryDatas.length-1]['WIN_D_S_Max'] + '</td>').appendTo($('#latest-msg-tr'));
					//      $('<td>'+datas[0]['WIN_D_S_Max_S']+'</td>').appendTo($('#latest-msg-tr'));
					$('<td>' + datas[processHistoryDatas.length-1]['WIN_S_Inst_Max'] + '</td>').appendTo($('#latest-msg-tr'));
					$('<td>' + datas[processHistoryDatas.length-1]['WIN_D_INST_Max'] + '</td>').appendTo($('#latest-msg-tr'));
					$('<td>' + datas[processHistoryDatas.length-1]['WIN_D_INST_Max_S'] + '</td>').appendTo($('#latest-msg-tr'));
					if(datas[processHistoryDatas.length-1]['VIS_HOR_1MI'] != null && datas[processHistoryDatas.length-1]['VIS_HOR_1MI'] != ''){
						$('#lsdb-option-select-njd').css('display','inline');
					}
					else{
						$('#lsdb-option-select-njd').css('display','none');
					}
					$('.lsdb-chart-optionbar span').removeClass('lsdb-option-select');
					$('.lsdb-chart-optionbar>span:first-child').addClass('lsdb-option-select');
					currentOption = '降水量';
					setChartData('降水量');
				} else{
					alert("没有查到该站点的历史数据");
				}
					
				//chartdatareachrate.hideLoading();
			},
			error: function() {
				chartdatareachrate.hideLoading();
				alert("未查询到" + time + "的数据");
			}
		});
	}

	function setChartData(title) {
		var field = '';
		var charttype = 'line';
		switch(title) {
			case '降水量':
				field = 'PRE';
				charttype = 'bar';
				break;
			case '温度':
				field = 'TEM';
				break;
			case '风向风速':
				field = 'WIN_S_Avg_2mi';
				break;
			case '气压':
				field = 'PRS';
				break;
			case '湿度':
				field = 'RHU';
				break;
			case '能见度':
				field = 'VIS_HOR_1MI';
				break;
			case '潮位':
				field='tide_data';
				break;
		}
		var times = [];
		var values = [];
		for(var i = 0; i < datas.length; i++) {
			var item = datas[i];
			times.push(item.time);
			if(title == "风向风速"){
				values.push({v:item["WIN_S_Avg_2mi"],d:item["WIN_D_Avg_2mi"]});
			}
			else{
				values.push(item[field]);
			}
		}

		var series = [];
		var option = null;
		if(title == "风向风速") {
			var datavalues = [];
			for(var item in values) {
				var value = {
					value: values[item]['v'],
					symbol: 'arrow',
					symbolSize: [8, 20],
//					symbolOffset:[0,10],
					symbolRotate: values[item]['d'],
					itemStyle: {
						normal: {
							color: '#003366',
							outlineColor: "#003366",
							lineStyle: { // 系列级个性化折线样式
								color: '#ffffff',
								width: 2
							}
						},
						emphasis: {
							color: '#B00FEF'
						}
					}
				};

				datavalues.push(value);
			}

			series = [{
				name: title,
				type: charttype,
				data: datavalues,
				smooth: true,
				label: {
					normal: {
						show: true,
						formatter: '{c}'
					}
				},
				lineStyle: {
					normal: {
						color: '#ffffff',
						width: 2
					}
				}
			}];
		}else if(title == "潮位"){
			$('#historyTimeSpan').text(datas[datas.length-1].tide_time);
			var jjValues = [];
			for(var i = 0;i<values.length;i++){
				jjValues.push(4.9);
			}
			series = [{
				name: title,
				type: charttype,
				symbol: "circle",
				data: values,
				smooth: true,
				barWidth:'20%',
				lineStyle: {
					normal: {
						color: '#1E90FF',
						width: 2
					}
				},
				itemStyle: {
					normal: {
						color: '#ffffff',
						borderColor: '#ffffff'
					}
				},
				areaStyle:{
					normal:{
						color:"rgba(30,144,255,0.8)"
					},
				},
				label: {
					normal: {
						show: true,
						formatter: '{c}m',
						textStyle:{
							color:'#00008B'
						}
					}
				}
			},{
				name: title,
				type: charttype,
				showSymbol: false,
				data: jjValues,
				smooth: true,
				lineStyle: {
					normal: {
						color: '#990000',
						width: 2
					}
				},
				itemStyle: {
					normal: {
						color: '#ffffff',
						borderColor: '#ffffff',
						opacity:0
					}
				}
			}];
		}
		else {
			var stations = Global.getStationInfos();
			var station = stations[0];
			$('#historyTimeSpan').text(station.create_Time);
			series = [{
				name: title,
				type: charttype,
				symbol: "circle",
				data: values,
				smooth: true,
				barWidth:'20%',
				lineStyle: {
					normal: {
						color: '#ffffff',
						width: 2
					}
				},
				itemStyle: {
					normal: {
						color: '#ffffff',
						borderColor: '#ffffff'
					}
				},
				label: {
					normal: {
						show: true,
						formatter: '{c}'
					}
				}
			}];
		}
		
		if(charttype == 'bar'){
			option = {
				backgroundColor: '#61B4F0',
				textStyle: {
					color: 'rgb(255, 255, 255)',
					fontFamily: '微软雅黑',
					fontSize: '14'
				},
			    color: ['#77C159'],
			    grid: {
					left: '0',
					right: '40',
					bottom: '0',
					top: '20',
					containLabel: true
			    },
			    xAxis : [
			        {
			            type : 'category',
			            data : times,
			            axisTick: {
			                alignWithLabel: true
			            }
			        }
			    ],
			    yAxis : [
			        {
			            type : 'value'
			        }
			    ],
			    series : [
			        {
			            name:title,
			            type:'bar',
			            barWidth: '20%',
			            data:values
			        }
			    ]
			};
		}
		else{
			option = {
				backgroundColor: '#61B4F0',
				textStyle: {
					color: 'rgb(255, 255, 255)',
					fontFamily: '微软雅黑',
					fontSize: '14'
				},
				xAxis: {
					type: 'category',
					boundaryGap: false,
					axisLine: {
						show: true,
						onZero: true,
						lineStyle: {
							color: '#ffffff',
							width: 1
						}
					},
					data: times
				},
				yAxis: {
					type: 'value',
					axisLine: {
						show: true,
						onZero: true,
						lineStyle: {
							color: '#ffffff',
							width: 1
						}
					},
				},
				grid: {
					left: '0',
					right: '40',
					bottom: '0',
					top: '20',
					containLabel: true
				},
				series: series
			};
		}
		if(title == "潮位"){
			option.yAxis.max = 9;
		}
		else if(title == '气压'){
			//设置最大最小值区间
			try{
				var min = Number.MAX_VALUE;
				var max = Number.MIN_VALUE;
				for(var i = 0;i<values.length;i++){
					var v = parseFloat(values[i]);
					if(v <= min){
						min = v;
					}
					if(v>max){
						max = v;
					}
				}
				//var interval = max-min;
				max = max + 1;
				min = min - 1;
//				option.yAxis.max = max.toFixed(1);
//				option.yAxis.min = min.toFixed(1);
				option.yAxis.max = max;//这里就是设置最大值最小值的
				option.yAxis.min = min;
			}catch(err){
				console.warn(err);
			}
		}

		myChart.clear();
		myChart.setOption(option);
	}

	function updateCurrentWeatherInfo() {
		var stations = Global.getStationInfos();
		for(var i = 0; i < stations.length; i++) {
			var station = stations[i];
			if(i == 0){
				$('#currentTimeSpan').text(station.create_Time);
				$('#historyTimeSpan').text(station.create_Time);
				
			}
			if(station['station_Id_C'] == '54623') {
				if(station['TEM'] != null) {
					$('#currentTempDiv').text(station['TEM'] + '℃');
				}
				else{
					$('#currentTempDiv').text('-℃');
				}
				if(station['PRE'] != null) {
					$('#rainfallinfo').text(station['PRE'] + 'mm');
				}
				else{
					$('#rainfallinfo').text('-mm');
				}
				if(station['RHU'] != null) {
					$('#humidityinfo').text(station['RHU'] + '%');
				}
				else{
					$('#humidityinfo').text('-%');
				}
				if(station['WIN_D_Avg_2mi_S'] != null) {
					$('#winddirinfo').text(station['WIN_S_Avg_2mi']+'m/s ' + station['WIN_D_Avg_2mi_S'] + '风');
				}
				else{
					$('#winddirinfo').text('-m/s');
				}
				if(station['WIN_S_Inst_Max'] != null){
					$('#instwindInfo').text(station['WIN_S_Inst_Max'] + 'm/s' + station['WIN_D_INST_Max_S'] + '风');
				}
				else{
					$('#instwindInfo').text('-m/s');
				}
				if(station['WIN_S_Max'] != null){
					$('#maxwindinfo').text(station['WIN_S_Max'] + 'm/s' + station['WIN_D_S_Max_S'] + '风');
				}
				else{
					$('#maxwindinfo').text('—m/s');
				}
				if(station['VIS_HOR_1MI'] != null){
					$('#njdinfo').text(station['VIS_HOR_1MI'] + ' m');
				}
				else{
					$('#njdinfo').text('—m');
				}
			}
		}
	}

	init();
});