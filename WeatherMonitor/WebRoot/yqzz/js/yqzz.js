require(["jquery",
	'core/AppEvent',
	'core/GlobalParams',
	'js/ConfigData',
	'util/TimeObjectUtil',
	'js/util/Util',
	'bootstrap',
	'bootstrap-table',
	'bootstrap-table-zh-CN',
	'bootstrap-datepicker',
	'bootstrap-datepicker2',
	'bootstrap-datepicker2-zh-CN',
	'slider',
	'dropdownlist'
], function(
	$,
	AppEvent,
	Global,
	config,
	TimeObjectUtil,
	util) {
		var isDebug = false;//改为false以后，这里就是走接口了，不然是随机数
	var startSlider,endSlider,currentMainOption,currentYqzzOption,startDate,endDate,hasIsonlineMap;
	var _startTimeString,_endTimeString=null;
	var _hasPreview = false;
	var gnqStationIds=['54623','A3171','A3162','A3175','A3161','A3163','A3101','A3164','A3104','A3105','A3106','A3103','A3163','A3161','A3169','A3102','A2802','A2801','A2607','A2803','54530','A2609','54645','A2602','A2604','A2608'];
	var _historyItems = [];
	var option_reason,option_timeduring,option_pinlv,option_all_yl,option_region_yl;
	function calculateLayout(){
		
		var tmpHeight = '365px';
		$('#firstrow').css('height',tmpHeight);
		$('#firstrow').css('top',0);
		$('#firstrow').css('left',0);
		$('#secondrow').css('top',tmpHeight);
		$('#secondrow').css('bottom',0);
		$('#firstrow').css('left',0);
	}
	function init() {
		calculateLayout();
		$('#datetimepicker').dateRangePicker(
          {
            inline:true,
            autoClose: false,
            singleMonth: true,
            container:'#datetimepicker',
            alwaysOpen:true,
            showTopbar:false
          });
          $('#datetimepicker').dateRangePicker().bind('datepicker-change',datepickerChangeHandler);
          $('#datetimepicker').dateRangePicker().bind('datepicker-first-date-selected',firstDateSelectedHandler);
        startSlider = $("#startTimeSlider").bootstrapSlider({
            min:0,
            max:24,
            step:1,
            id:'startTimeSlider',
            tooltip:'always',
            formatter:function(value){
              return value+'时';
            }
          });
          startSlider.bootstrapSlider('setValue',8);
        endSlider = $("#endTimeSlider").bootstrapSlider({
            min:0,
            max:24,
            step:1,
            id:'endTimeSlider',
            tooltip:'always',
            formatter:function(value){
              return value+'时';
            }
          });
          endSlider.bootstrapSlider('setValue',8);
        $('.left-arrow').click(timeSpanClickHandler);
        $('.right-arrow').click(timeSpanClickHandler);
        
        $('.post-container>.optionbar span').click(function(evt) {
			var option = $(evt.currentTarget).text();
			if(option == currentMainOption) {
				return;
			}
			currentMainOption = option;
			setMainMoudle(option);
			$('.post-container>.optionbar span').removeClass('option-select');
			$(evt.currentTarget).addClass('option-select');
		});
		
		$('#yqzz-optionbar>span').click(function(evt) {
			var option = $(evt.currentTarget).text();
			if(option == currentYqzzOption) {
				return;
			}
			currentYqzzOption = option;
			if(currentYqzzOption == '功能区'){
				$('#gnqTable').css('display','block');
				$('#othersTable').css('display','none');
			}
			else{
				$('#gnqTable').css('display','none');
				$('#othersTable').css('display','block');
				var tWidth = $('#othersTable').css('width');
				console.log(tWidth);
				tWidth = parseInt(tWidth.replace('px',''));
				$(".cal-td").css('width',(tWidth/3)+'px');
			}
			$('#yqzz-optionbar>span').removeClass('option-select');
			$(evt.currentTarget).addClass('option-select');
		});
		AppEvent.dispatchAppEvent(AppEvent.ZOOM_TO_TANGGU);
		setMainMoudle('实况检测');
		$('.createIsonlineButton').click(createIsonline);
		getissueNumber();
		$('#changeIssueButton').click(function(evt){
			$('#changeIssueButton').css('display','none');
			$('.update-issue').css('display','inline-block');
			$('#issueInput').val('');
		});
		$('#cancleupdateissue').click(function(evt){
			$('#changeIssueButton').css('display','inline-block');
			$('.update-issue').css('display','none');
		});
		$('#okupdateissue').click(updateissue);
		
		$('#yqzz-preview-button').click(yqzzpreview);
		
		$('#yqzz-create-button').click(createYQZZButtonClick);
		
		$('#yqzz-clear-button').click(clearClickHandler);
		
		$('#yqzz-edit-button').click(yqzzEditButtonClick);
		
		AppEvent.addAppEventListener(AppEvent.INCORRECT_RAINVALUE,function(topic,sid){
			$("td[sid='"+ sid +"']").html('仪器故障');
		});
		
		AppEvent.addAppEventListener(AppEvent.CREATE_YQZZFILE,createAndDownloadYQZZ);
		
		function issuetypeFormatter(value, row, index){
			if(value == 'yb'){
				return '一般';
			}
			if(value == 'xqb'){
				return '汛期版';
			}
			if(value == 'fxqb'){
				return '非汛期版';
			}
			if(value == 'zkb'){
				return '增刊版';
			}
		}
		
		function timeFormatter(value, row, index){
			return TimeObjectUtil.longMsTimeConvertToDateTime2(value);
		}
		
		function downloadFormatter(value,row,index){
//			var html = "<span class='download-button' type='word' file='" +row['filename'] +"'>word</span>" + 
//			"<span class='download-button' type=txt file='" +row['filename'] +"'>txt</span>";
			var filename = row['filename'].replace('doc','txt');
			var html = "<span class='download-button' type='word' file='" +row['filename'] +"'>word</span>" +
			"<a class='download-button' href='" + "../contourline/wordfiles/"+filename +"' download='" + filename+"'>txt</a>";			
			return html;
		}
		
		var historyTable = {
			data: [],
			striped: true,
			pagination: true,
			pageSize: 15,
			pageList: [6, 8, 10, 15],
			search: false,
			minimunCountColumns: 2,
			uniqueId: 'issue',
			columns: [{
				title: '期号',
				field: 'issue',
				align: 'center',
				width: 100				
			}, {
				title: '时间',
				field: 'createtime',
				align: 'center',
				width: 140,
				formatter:timeFormatter
			}, {
				title: '文件名',
				field: 'filename',
				align: 'center',
				width: 200,
				visible: false
			}, {
				title: '类型',
				field: 'issuetype',
				align: 'center',
				width: 110,
				formatter:issuetypeFormatter
			}, {
				title: '下载',
				field: 'download',
				align: 'center',
				width: 155,
				formatter: downloadFormatter
			}]
		};
		$("#historyTable").bootstrapTable(historyTable);
		
		$('#history_starttime').datepicker({
	    format: 'yyyy-mm-dd',
	    autoclose:true,
	    language:"zh-CN"
		});
		$('#history_endtime').datepicker({
	    format: 'yyyy-mm-dd',
	    autoclose:true,
	    language:"zh-CN"
		});
		
		$('#history_query').click(queryHistoryByTime);
		$('#history_all').click(function(){
			$("#historyTable").bootstrapTable('load', _historyItems);
		});
		
		option_reason = $('#option_reason').hdDropDownList({
			items:['高空槽','低涡','冷空气','地面倒槽','地面气旋','切变线','副热带高压外围']
		});
		
		option_timeduring = $('#option_timeduring').hdDropDownList({
			items:['昨天白天到夜间','昨天下午到夜间','昨天傍晚到夜间','昨天白天','昨天上午','昨天下午','昨天傍晚','昨天夜间','今天早晨','今天凌晨']
		});
		
		option_pinlv=$('#option_pinlv').hdDropDownList({
			items:['普降','部分地区','大部分地区','个别地区','南部地区','北部地区','中部地区','局部地区']
		});
		option_all_yl=$('#option_all_yl').hdDropDownList({
			items:['零星小雨','阵雨','雷阵雨','小雨','小到中雨','中雨','中雷阵雨','大雨','大到暴雨','暴雨']
		});
		option_region_yl=$('#option_region_yl').hdDropDownList({
			items:['局部大雨','局部中雨','局部暴雨']
		});
	}
	
	function queryHistoryByTime(){
		var st = $('#history_starttime').val();
		var et = $('#history_endtime').val();
		if(st == '' || et == ''){
			alert('请选择开始时间和结束时间');
		}
		if(TimeObjectUtil.compareDateEndTimeGTStartTime(st,et) == false){
			alert('请选择开始时间应小于结束时间');
			return;
		}
		st = st + " 00:00:00";
		et = et + " 00:00:00";
		var stlong = TimeObjectUtil.dateToLongMsTime(st);
		var etlong = TimeObjectUtil.dateToLongMsTime(et);
		var results = [];
		for(var i=0;i<_historyItems.length;i++){
			var item = _historyItems[i];
			//var it = TimeObjectUtil.dateToLongMsTime(item.createtime);
			if(item.createtime>=stlong && item.createtime<=etlong){
				results.push(item);
			}
		}
		$("#historyTable").bootstrapTable('load', results);
	}
	
	function createAndDownloadYQZZ(topic,type){
		AppEvent.dispatchAppEvent(AppEvent.CLOSE_POPUPWINDOW);
		AppEvent.dispatchAppEvent(AppEvent.PRINT_ISONLINE_MAP,function(base64png){
			var param_reason = option_reason.val();
			var year = startDate.getFullYear();
			var issue = $('#issueNumber').text();
			var alldate = TimeObjectUtil.formatterDate4(new Date());
			var timeduring = option_timeduring.val();
			var pinlv = option_pinlv.val();
			var all_yl = option_all_yl.val();
			var region_yl = option_region_yl.val();
			var max_place = $('.max-yl-place').text();
			var yl_value = $('.max-yl-hm').text();
			var start_time = $('.yqzz-starttime').html();
			var end_time = $('.yqzz-endtime').html();
			var domlist = $('#gnqTable>tbody>tr>td[sid]');
			var hour = startSlider.bootstrapSlider('getValue');
			if(hour<10){
				hour = "0"+hour;
			}
			var startdate = TimeObjectUtil.formatterDate(startDate) + " " + hour + ':00:00';
			hour = endSlider.bootstrapSlider('getValue');
			if(hour<10){
				hour = "0"+hour;
			}
			var enddate = TimeObjectUtil.formatterDate(endDate)+ " " + hour + ':00:00';
			var stationsItems = [];
			for(var i=0;i<domlist.length;i++){
				var dom = domlist[i];
				var vText = $(dom).text();
				if(vText != null && vText != ""){
					vText = vText.replace('mm','');
				}else{
					var span = $(dom).find('span');
					vText = $(span).text().replace('mm','');
				}
				var sid = $(dom).attr('sid');
				if(sid.indexOf('A') == -1){
					sid = 'A'+sid;
				}
				stationsItems.push(sid);
				stationsItems.push(vText);
			}
			var title = '专题图标题';
			var data = {
				t:(new Date()).getTime(),
				image:base64png,
				reason:param_reason,
				year:year,
				issue:issue,
				alldate:alldate,
				timeduring:timeduring,
				pinlv:pinlv,
				all_yl:all_yl,
				region_yl:region_yl,
				max_place:max_place,
				yl_value:yl_value,
				start_time:start_time,
				end_time:end_time,
				title:title,
				type:type,
				stations:stationsItems.join(','),
				startdate:startdate,
				enddate:enddate
			};
			$.ajax({
				type:"post",
				url:"../" + config.geodataServices.outputword,
				data:data,
				dataType:'json',
				success: function(result) {
					if(result.code == 200 && result.content != null){
						console.log(result.content);
						//生成成功以后期号自动增加
						$("#fileDownFrame").attr("src","../contourline/wordfiles/"+result.content.filename);
						addIssueNumber();
					}
					else{
						alert('生成word失败，'+result.errmsg);
					}
				},
				error: function() {
					alert('生成word失败');
				}
			});
		})
	}
	
	function yqzzEditButtonClick(){
		if(_hasPreview==false){
			alert('请先预览！');
			return;
		}
		var domlist = $('td[sid]');
		points = '';
		var items = [];
		var stations = Global.getStationInfos();
		var stationTable = {};
		var maxStation = null;
		var maxValue = -1000;
		for(var i = 0;i<stations.length;i++){
			var item = stations[i];
			stationTable[item.station_Id_C] = item;
		}
		for(var i=0;i<domlist.length;i++){
			var tdDom = domlist[i];
			var station = stationTable[$(tdDom).attr('sid')];
			if(station == null || station.geom == null){
				continue;
			}
			var value = $(tdDom).text().replace('mm','');
			if(value == '--' || value == '仪器故障'){
				continue;
			}
			value = parseFloat(value);
			items.push([station.geom[0],station.geom[1],value].join(','));
			if(value>maxValue){
				maxStation = station;
				maxValue = value;
			}
		}
		if(maxStation != null){
			$('.max-yl-place').text(maxStation.station_Name);
			$('.max-yl-hm').text(maxValue);
		}
		else{
			$('.max-yl-place').text('');
			$('.max-yl-hm').text('');
		}
		points = items.join(',');
		$.ajax({
			type: "post",
			url: "../" + config.geodataServices.contourline,
			data: {points:points,
				t:(new Date()).getTime()},
			async: false,
			dataType:'json',
			success: function(result) {
				if(result.code == 200 && result.content != null){
					AppEvent.dispatchAppEvent(AppEvent.VIEW_CONTOURLINE,result.content);
				}
			},
			error: function() {
				alert("生成等值线失败");
			}
		});
	}
	
	function createYQZZButtonClick(){
		if(_hasPreview == false){
			alert('请先预览！');
			return;
		}
		AppEvent.dispatchAppEvent(AppEvent.OPEN_POPUPWINDOW, {
			src:'yqzz/templatetypepopup.html',
			width:450,
			height:160
		});
	}
	
	function yqzzpreview()
	{
		createIsonline();
	}
	
	function updateissue(){
		var issue = $('#issueInput').val();
		if(issue == null || issue == '' || util.isNum(issue) == false){
			alert('请正确填写期号');
			return;
		}
		$.ajax({
			type: "get",
			url: "../contourline/updateissue.do",
			data: {t:(new Date()).getTime(),
					issue:issue
					},
			dataType:'json',
			success: function(result) {
				if(result.code == 200 && result.content != null){
				}
				else{
					alert('更新期号失败，'+result.errmsg);
				}
				$('#changeIssueButton').css('display','inline-block');
				$('.update-issue').css('display','none');
				getissueNumber();
			},
			error: function() {
				alert("更新期号失败");
			}
		});
	}
	
	function setMainMoudle(option){
		if(option == '实况检测'){
			//$('#yqzz-optionbar').css('display','none');
			$('.createIsonlineButton').css('display','inline-block');
			$('.yqzz-msg-container').css('display','none');
			$('#yqzz-controlbar').css('display','none');
			$('.calendar-container').css('display','block');
			$('#secondrow').css('display','block');
//			$('#historyTable').css('display','none');
//			$('.pagination-detail').css('display','none');
			$('.table-container').css('display','none');
		}
		else if(option == '雨情制作'){
			$('.createIsonlineButton').css('display','none');
			//$('#yqzz-optionbar').css('display','block');
			$('.yqzz-msg-container').css('display','block');
			$('#yqzz-controlbar').css('display','block');
			$('.calendar-container').css('display','block');
			$('#secondrow').css('display','block');
//			$('#historyTable').css('display','none');
//			$('.pagination-detail').css('display','none');
			$('.table-container').css('display','none');
			getissueNumber();
		}
		else if(option == '历史查询'){
			$('.calendar-container').css('display','none');
			$('#secondrow').css('display','none');
			$('.yqzz-msg-container').css('display','none');
			$('.createIsonlineButton').css('display','none');
//			$('#historyTable').css('display','block');
//			$('.pagination-detail').css('display','block');
			$('.table-container').css('display','block');
			
			getHistoryWordFiles();
		}
	}
	
	function downloadHistory(evt){
		var filename = $(evt.currentTarget).attr('file');
		var type = $(evt.currentTarget).attr('type');
		if(type == 'txt'){
			filename = filename.replace('doc','txt');
		}
		$("#fileDownFrame").attr("src","../contourline/wordfiles/"+filename);
	}
	
	function getHistoryWordFiles(){
		$.ajax({
			type: "get",
			url: '../contourline/getallwordfiles.do',
			data: {	t:(new Date()).getTime()},
			dataType:'json',
			success: function(result) {
				if(result!=null && result.code == 200){
					if($.isArray(result.content)){
						_historyItems = result.content;
						$("#historyTable").bootstrapTable('load', result.content);
						$('span.download-button').click(downloadHistory)
					}
				}
				
			},
			error: function(err) {
				alert('查询历史数据失败')
				console.log(err);
			}
		});
	}
	
	function timeSpanClickHandler(evt){
		var sliderId = $(evt.currentTarget).attr('slider');
		var type = $(evt.currentTarget).attr('type');
		var _slider;
		if(sliderId == 'startTimeSlider'){
			_slider = startSlider;
		}
		else{
			_slider = endSlider;
		}
		var cvalue = _slider.bootstrapSlider('getValue');
		if(type == 'down'){
			if(cvalue == 0){
				return;
			}
			cvalue = cvalue-1;
		}
		else if(type == 'up'){
			if(cvalue == 24){
				return;
			}
			cvalue = cvalue+1;
		}
//		sliderTable[sliderId].bootstrapSlider('refresh');
		_slider.bootstrapSlider('setValue',cvalue);
		setTimeSpanText();
	}
	
	init();
	
	function setTimeSpanText(){
		if(startDate != null){
			var _starthour = startSlider.bootstrapSlider('getValue')<10?'0'+startSlider.bootstrapSlider('getValue'):startSlider.bootstrapSlider('getValue');
			var dateString = TimeObjectUtil.formatterDate3(startDate) + _starthour + '时';
			$('.yqzz-starttime').html(dateString);
		}
		else{
			$('.yqzz-starttime').html('[未选择]');
			
		}
		if(endDate != null){
			var _endhour = endSlider.bootstrapSlider('getValue')<10?'0'+endSlider.bootstrapSlider('getValue'):endSlider.bootstrapSlider('getValue');
			var dateString = TimeObjectUtil.formatterDate3(endDate) + _endhour + '时';
			$('.yqzz-endtime').html(dateString);
		}
		else{
			if(startDate != null){
				var _starthour = startSlider.bootstrapSlider('getValue')<10?'0'+startSlider.bootstrapSlider('getValue'):startSlider.bootstrapSlider('getValue');
				dateString = TimeObjectUtil.formatterDate3(startDate) + _starthour + '时'
				$('.yqzz-endtime').html(dateString);
			}else{
				$('.yqzz-endtime').html('[未选择]');
			}
		}
		_hasPreview = false;
	}
	
	function datepickerChangeHandler(evt,obj){
		console.log(obj);
		startDate = obj.date1;
		endDate = obj.date2;
		setTimeSpanText();
	}
	
	function firstDateSelectedHandler(evt,obj){
		console.log(obj);
		startDate = obj.date1;
		endDate = null;
		setTimeSpanText();
	}
	
	function createIsonline(handler){
		if(startDate == null && endDate == null){
			alert('请选择开始和结束日期');
			return;
		}
		
		if(endDate == null){
			endDate = startDate;
		}
		var starthour = startSlider.bootstrapSlider('getValue')<10?'0'+startSlider.bootstrapSlider('getValue'):startSlider.bootstrapSlider('getValue');
		var endhour = endSlider.bootstrapSlider('getValue')<10?'0'+endSlider.bootstrapSlider('getValue'):endSlider.bootstrapSlider('getValue');
		_startTimeString = TimeObjectUtil.formatterDate(startDate) + " " + starthour + ":00:00";
		_endTimeString = TimeObjectUtil.formatterDate(endDate) + " " + endhour + ":00:00";
		if(TimeObjectUtil.parse(_startTimeString).getTime() >= TimeObjectUtil.parse(_endTimeString).getTime()){
			alert('开始时间应该早于结束时间');
			return;
		}
		
		var points = null;
		$.ajax({
			type: "get",
			url: '../'+config.services.contourline,
			data: {type:'1',
					star_time:_startTimeString,
					end_time:_endTimeString,
					t:(new Date()).getTime()},
			async: false,
			dataType:'json',
			success: function(result) {
				if(result && $.isArray(result.sumPre)) {
					points = '';
					var items = [];
					var stations = Global.getStationInfos();
					var stationTable = {};
					var maxItem = null;
					var maxValue = -1000;
					for(var i = 0;i<stations.length;i++){
						var item = stations[i];
						stationTable[item.station_Id_C] = item;
					}
					for(var i = 0;i<result.sumPre.length;i++){
						var item = result.sumPre[i];
						var station = stationTable[item.station_Id_C];
						if(station == null || station.geom == null){
							continue;
						}
						if(parseInt(item.sum_pre) > 999 || parseInt(item.sum_pre) <0)
						{
							$("td[sid='"+ item.station_Id_C +"']").html("0.0mm");
							item.sum_pre = 0;
							if(isDebug){
								var sum_pre = parseFloat(util.randomFloat(0,12).toFixed(1));
								items.push([station.geom[0],station.geom[1],sum_pre].join(','));
							}
							else{
								items.push([station.geom[0],station.geom[1],0].join(','));
							}
							
							continue;
						}
						if(isDebug){
							var sum_pre = parseFloat(util.randomFloat(0,12).toFixed(1));
							item.sum_pre = sum_pre;
							items.push([station.geom[0],station.geom[1],sum_pre].join(','));
						}
						else{
							items.push([station.geom[0],station.geom[1],item.sum_pre].join(','));
						}
						if(parseFloat(item.sum_pre)>maxValue){
							maxItem = item;
							maxValue = parseFloat(item.sum_pre);
						}
						if(item.sum_pre>10){
							var html = '<span style="color:#ff0000;font-weight:bold;cursor:pointer">' + item.sum_pre + 'mm<span>'
							var dom = $(html);
							$(dom).click(popupCorrectWindow);
							$("td[sid='"+ item.station_Id_C +"']").html('');
							$("td[sid='"+ item.station_Id_C +"']").append(dom);
						}
						else{
							$("td[sid='"+ item.station_Id_C +"']").html(item.sum_pre + "mm");
						}
							
					}
					if(maxItem != null){
						$('.max-yl-place').text(maxItem.station_Name);
						$('.max-yl-hm').text(maxItem.sum_pre);
					}
					else{
						$('.max-yl-place').text('');
						$('.max-yl-hm').text('');
					}
					points = items.join(',');
				}
				else{
					alert('获取滨海新区站点值失败');
				}
			},
			error: function() {
				alert("未查询到数据");
			}
		});
		if(points == null){
			return;
		}
		
		$.ajax({
			type: "post",
			url: "../" + config.geodataServices.contourline,
			data: {points:points,
				t:(new Date()).getTime()},
			async: false,
			dataType:'json',
			success: function(result) {
				if(result.code == 200 && result.content != null){
					AppEvent.dispatchAppEvent(AppEvent.VIEW_CONTOURLINE,result.content);
					_hasPreview = true;
					if(handler != null && $.isFunction(handler)){
						handler(result.content);
					}
				}
			},
			error: function() {
				alert("生成等值线失败");
			}
		});
	}
	
	function getissueNumber(){
		$.ajax({
			type: "get",
			url: "../contourline/getissue.do",
			data: {t:(new Date()).getTime()},
			dataType:'json',
			success: function(result) {
				if(result.code == 200 && result.content != null){
					$('#issueNumber').text(result.content);
				}
			},
			error: function() {
				alert("获取期号失败");
			}
		});
		
	}
	
	function addIssueNumber(){
		$.ajax({
			type: "get",
			url: "../contourline/addissue.do",
			data: {t:(new Date()).getTime()},
			dataType:'json',
			success: function(result) {
				if(result.code == 200 && result.content != null){
					$('#issueNumber').text(result.content);
				}
			},
			error: function() {
				alert("获取期号失败");
			}
		});
	}
	
	function clearClickHandler(){
		AppEvent.dispatchAppEvent(AppEvent.CLEAR_YQZZ);
		$('.common-table>tbody>tr>td[sid]').text('--mm');
		_hasPreview = false;
	}
	
	function popupCorrectWindow(evt){
		var tdNode = evt.currentTarget.parentNode;
		var stationId = $(tdNode).attr('sid');
		var url = 'yqzz/incorrectpopup.html?sid='+stationId+'&st='+_startTimeString+'&et='+_endTimeString;
		AppEvent.dispatchAppEvent(AppEvent.OPEN_POPUPWINDOW, {
			src:url,
			width:850,
			height:350
		});
	}
});