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
	'js/util/Util',
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
	TimeObjectUtil,
	util) {
		
		var qyList = [];
		var phoneNumber = '';//022-66251959
//		var phoneNumber = '022-66251959';//
		var selectStation = null;
	function calculateLayout(){
//		$('#firstrow').css('width',$(window).width());
//		$('#secondrow').css('width',$(window).width());
//		$('#thirdrow').css('width',$(window).width());
		
		var tmpHeight = $(window).height()/3;
		$('#firstrow').css('height',tmpHeight);
		$('#secondrow').css('height',tmpHeight);
		$('#thirdrow').css('height',tmpHeight);
		$('#firstrow').css('top',0);
		$('#firstrow').css('left',0);
		$('#secondrow').css('top',tmpHeight);
		$('#firstrow').css('left',0);
		$('#thirdrow').css('top',tmpHeight*2);
		$('#firstrow').css('left',0);
	}
	
	function loadWether3H(qy){
		var location = null;
		if(qy.attrs['_location_'] == null || qy.attrs['_location_'] == '未知')
		{
			location = null;
		}else if(qy.attrs['_location_'] == '汉沽'){
			location='hangu';
		}else if(qy.attrs['_location_'] == '塘沽'){
			location='tanggu';
		}else if(qy.attrs['_location_'] == '大港'){
			location='dagang';
		}
		else if(qy.attrs['_location_'] == '渤海'){
			location='bohai';
		}
		var data = {
			location:location,
			t:((new Date()).getTime())
		};
		$.ajax({
			data:data,
			dataType:'json',
			complete: function(xhr, status) {
				var result = xhr.responseJSON;
				if(result && result.weatherH && $.isArray(result.weatherH)) {
					$("#wether3HTable").bootstrapTable('load', result.weatherH);
				}
				else{
					alert('企业区域3小时预报无数据');
				}
				//loadQyDatas();
			},
			error: function(xhr, status, error) {
				console.log(xhr);
				console.log(status);
				console.log(error);
				console.log('查询企业区域3小时预报信息失败：');
				//loadQyDatas();
			},
			type: 'get',
			url: '../' + config.services.weather3h
		});
	}
	
	function loadQyDatas(){
		var data = {t:((new Date()).getTime())};
		if(phoneNumber != null && phoneNumber != ''){
			data={'ENTERPRISETELEPHONE':phoneNumber,t:((new Date()).getTime())};
		}
		$.ajax({
			data:data,
			dataType:'json',
			complete: function(xhr, status) {
				var result = xhr.responseJSON;
				if(result && result.enterprise) {
					if($.isArray(result.enterprise) == false){
						qyList = [result.enterprise];
					}else{
						qyList = result.enterprise;
					}
					//Global.setQyList(qyList);
					$("#qyTable").bootstrapTable('load', qyList);
					AppEvent.dispatchAppEvent(AppEvent.SHOW_QY_LAYER,qyList);
					if(phoneNumber != null && phoneNumber != '' && qyList.length > 0){
						AppEvent.dispatchAppEvent(AppEvent.RELATE_QY_STATIONS,qyList[0]['UUID']);
					}
				}
			},
			error: function(xhr, status, error) {
				console.log(xhr);
				console.log(status);
				console.log(error);
				console.log('查询自动站信息失败：');
			},
			type: 'get',
			url: '../' + config.services.qyInfo
		});
	}
	function init() {
		calculateLayout();
		phoneNumber = util.getQueryString('phone');
		var optionQYTable = {
	        data: [],
	        striped: true,
	        pagination: false,
	        search: false,
	        minimunCountColumns: 2,
	        uniqueId:'UUID',
	        onClickCell: function (field, value, row, element) {
	        	AppEvent.dispatchAppEvent(AppEvent.RELATE_QY_STATIONS,row['UUID']);
	       },
	        columns:[
	        	{title:'id', field:'id',align:'center',width:230,visible:false},
	        	{title:'uuid', field:'UUID',align:'center',width:230,visible:false},
	        	{title:'企业名称', field:'ENTERPRISENAME',align:'center',width:'20%'},
	        	{title:'电话', field:'ENTERPRISETELEPHONE',align:'center',width:'15%',formatter:function(value, row, index){
	        		if(value != null && value != '') {
	        			if(value.indexOf(',') != -1){
	        				var vals = value.split(',');
	        				return vals.join('<br>');
	        			}
	        			else if(value.indexOf('，') != -1){
	        				var vals = value.split('，');
	        				return vals.join('<br>');
	        			}
						return value;
					}
	        	}},
	        	{title:'联系人', field:'ENTERPRISECONTACTS',align:'center',width:'10%'},
	        	{title:'业务方向', field:'ENTERPRISEDESCRIPTION',align:'center',width:'15%'},
	        	{title:'关注类型', field:'ENTERPRISEWEATHERDATA',align:'center',width:'30%'}
	        ]
	    };
	    $("#qyTable").bootstrapTable(optionQYTable);
	    
	    var optionStationTable = {
			data: [],
			striped: true,
			pagination: false,
			search: false,
			minimunCountColumns: 2,
			uniqueId:'station_Id_C',
			onClickCell: function(field, value, row, $element) {
				AppEvent.dispatchAppEvent(AppEvent.POPUP_AND_CENTER_STATION,[row['station_Id_C'],false]);
			}
		};
		$("#stationTable").bootstrapTable(optionStationTable);
		$('#stationTable>thead>tr:last-child>th').click(function(evt){
			var fieldName = $(evt.currentTarget).attr('data-field');
			AppEvent.dispatchAppEvent(AppEvent.SHOW_STATION_SINGLE_VALUE, fieldName);
			//设置选中列的颜色
			var rowSelector = "#stationTable>thead>tr:last-child>th";
			$(rowSelector).css('background-color','');
			$(evt.currentTarget).css('background-color',config.selectRowColor);
		});
		
		var wether3hTable = {
	        data: [],
	        striped: true,
	        pagination: false,
	        search: false,
	        minimunCountColumns: 2,
	        uniqueId:'id',
	        columns:[
	        	{title:'id', field:'id',align:'center',width:230,visible:false},
	        	{title:'空间位置', field:'name',align:'center',width:'12%'},
	        	{title:'预警发布时段', field:'starttime',align:'center',width:'16%'},
	        	{title:'天气现象', field:'tqxx',align:'center',width:'12%'},
	        	{title:'风力', field:'fl',align:'center',width:'12%'},
	        	{title:'风向', field:'fx',align:'center',width:'12%'},
	        	{title:'最高温度', field:'temmax',align:'center',width:'12%'},
	        	{title:'最低温度', field:'temmin',align:'center',width:'12%'},
	        	{title:'能见度', field:'visiblity',align:'center',width:'12%'}
	        ]
	    };
	    $("#wether3HTable").bootstrapTable(wether3hTable);
	    AppEvent.addAppEventListener(AppEvent.QY_GRAPHIC_CLICK, qyGraphicClickHandler);
	    AppEvent.addAppEventListener(AppEvent.STATION_GRAPHIC_CLICK, stationGraphicClickHandler);
	    loadQyDatas();
	}
	
	function qyGraphicClickHandler(topic,params){
		var relateStations = [];
		var relateStationIds = params[0];
		var stations = Global.getStationInfos();
		for(var i = 0;i<stations.length;i++){
			var station = stations[i];
			if(relateStationIds.indexOf(station['station_Id_C']) != -1){
				relateStations.push(station);
			}
		}
		$("#stationTable").bootstrapTable("load", relateStations);
		var qyid = params[1];
		var rowSelector = "#qyTable>tbody>tr";
		$(rowSelector).css('background-color','');
		rowSelector = "#qyTable>tbody>tr[data-uniqueid='"+qyid+"']";
		$(rowSelector).css('background-color',config.selectRowColor);
		loadWether3H(params[3]);
		var rowSelector = "#stationTable>thead>tr:last-child>th";
		$(rowSelector).css('background-color','');
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
	init();
});