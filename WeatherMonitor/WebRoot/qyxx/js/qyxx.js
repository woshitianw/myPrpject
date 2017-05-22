function formatterColumnPREFun(value, row, index) {
	if(row['alert_PRE'] && row['alert_PRE'] == true) {
		return "<span style='color:#ff0000;font-weight:bold''>" + value + '</span>'
	}
	return value;
}

function formatterColumnTEMFun(value, row, index) {
	if(row['alert_TEM'] && row['alert_TEM'] == true) {
		return "<span style='color:#ff0000;font-weight:bold'>" + value + '</span>'
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
	'js/ConfigData',
	'core/GlobalParams',
//	'js/totalcitydata',
	'bootstrap',
	'bootstrap-table',
	'bootstrap-table-zh-CN'
], function(
	$,
	AppEvent,
	config,
	Global) {
//	var qyList = [
//	{"id":1,"UUID":"c4d8ede6702f4478abd9ac6fc3183a63","ENTERPRISENAME":"滨海大道企业","ENTERPRISEADDR":"滨海大道企业",'THRESHOLDSCOPE':'5',
//		"ENTERPRISECONTACTS":"陈斌","ENTERPRISETELEPHONE":"13699998888","ENTERPRISEDESCRIPTION":"鱼虾生产","ENTERPRISEC_X":"117.735982","ENTERPRISEC_Y":"39.026529","ENTERPRISEWEATHERDATA":"高温 28℃/降雨量 9mm/大风 2.1m/s"
//	},
//	{"id":2,"UUID":"c4d8ede6702f4478abd9ac6fc3183a61","ENTERPRISENAME":"滨海大道企业","ENTERPRISEADDR":"滨海大道企业",'THRESHOLDSCOPE':'10',
//		"ENTERPRISECONTACTS":"陈斌","ENTERPRISETELEPHONE":"13699998888","ENTERPRISEDESCRIPTION":"鱼虾生产","ENTERPRISEC_X":"117.8281111989","ENTERPRISEC_Y":"38.9930774240","ENTERPRISEWEATHERDATA":"高温 28℃/降雨量 9mm/大风 2.1m/s"
//	},
//	{"id":3,"UUID":"c4d8ede6702f4478abd9ac6fc3183a60","ENTERPRISENAME":"滨海大道企业","ENTERPRISEADDR":"滨海大道企业",'THRESHOLDSCOPE':'30',
//		"ENTERPRISECONTACTS":"陈斌","ENTERPRISETELEPHONE":"13699998888","ENTERPRISEDESCRIPTION":"鱼虾生产","ENTERPRISEC_X":"117.7293116679","ENTERPRISEC_Y":"38.9272158749","ENTERPRISEWEATHERDATA":"高温 28℃/降雨量 9mm/大风 2.1m/s"
//	}
//	];

	var qyList = [];
	var selectQyId = '';
	var selectStation = null;
	
	function loadQyDatas(){
		if(Global.getQyList() == null){
			$.ajax({
				data:{t:((new Date()).getTime())},
				dataType:'json',
				complete: function(xhr, status) {
					var result = xhr.responseJSON;
					if(result && result.enterprise) {
						if($.isArray(result.enterprise) == false){
							qyList = [result.enterprise];
						}else{
							qyList = result.enterprise;
						}
						Global.setQyList(qyList);
						//qyList[1].ENTERPRISEC_X = '117.7281111989';
						$("#qyTable").bootstrapTable('load', qyList);
						AppEvent.dispatchAppEvent(AppEvent.SHOW_QY_LAYER,qyList);
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
		}else{
			qyList = Global.getQyList();
			$("#qyTable").bootstrapTable('load', qyList);
			AppEvent.dispatchAppEvent(AppEvent.SHOW_QY_LAYER,qyList);
		}
	}
	
	function init(){
//		console.log(totalcitydata);
		var result={};
//		for(var key in totalcitydata){
//			result[key] = {};
//			result[key].x = totalcitydata[key].center.x;
//			result[key].y = totalcitydata[key].center.y;
//			result[key].Name_CHN = totalcitydata[key].attributes.Name_CHN;
//			result[key].shortname = totalcitydata[key].attributes.shortname;
//		}
//		console.log(JSON.stringify(result));
		var optionQYTable = {
	        data: [],
	        striped: true,
	        pagination: true,
	        pageSize: 6,
	        pageList: [6, 8, 10, 15],
	        search: true,
	        minimunCountColumns: 2,
	        uniqueId:'UUID',
	        onPostBody:function(){
	        	if(selectQyId != ''){
	        		var rowSelector = "#qyTable>tbody>tr";
					$(rowSelector).css('background-color','');
					rowSelector = "#qyTable>tbody>tr[data-uniqueid='"+selectQyId+"']";
					$(rowSelector).css('background-color',config.selectRowColor);
	        	}
			},
	        onClickCell: function (field, value, row, element) {
	        	AppEvent.dispatchAppEvent(AppEvent.RELATE_QY_STATIONS,row['UUID']);
	        },
	        columns:[
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
	    loadQyDatas();
	    AppEvent.addAppEventListener(AppEvent.QY_GRAPHIC_CLICK, qyGraphicClickHandler);
	    
	    //$("#stationTable").bootstrapTable("load", []);
		var optionTable = {
			data: [],
			striped: true,
			pagination: false,
			search: false,
			minimunCountColumns: 2,
			uniqueId:'station_Id_C',
			onClickCell: function(field, value, row, $element) {
				AppEvent.dispatchAppEvent(AppEvent.POPUP_AND_CENTER_STATION,[row['station_Id_C'],false]);
			},
			onPostBody:function(){
				stationGraphicClickHandler();
			}
		};
		$("#stationTable").bootstrapTable(optionTable);
		$('#stationTable>thead>tr:last-child>th').click(function(evt){
			var fieldName = $(evt.currentTarget).attr('data-field');
			AppEvent.dispatchAppEvent(AppEvent.SHOW_STATION_SINGLE_VALUE, fieldName);
			//设置选中列的颜色
			var rowSelector = "#stationTable>thead>tr:last-child>th";
			$(rowSelector).css('background-color','');
			$(evt.currentTarget).css('background-color',config.selectRowColor);
		});
		
		AppEvent.addAppEventListener(AppEvent.STATION_GRAPHIC_CLICK, stationGraphicClickHandler);
	}
	
	function qyGraphicClickHandler(topic,params){
		$("#stationTableContainer").css("display",'block');
		var relateStations = [];
		var relateStationIds = params[0];
		var qyid = params[1];
		selectQyId = qyid;
		var stations = Global.getStationInfos();
		for(var i = 0;i<stations.length;i++){
			var station = stations[i];
			if(relateStationIds.indexOf(station['station_Id_C']) != -1){
				relateStations.push(station);
			}
		}
		selectStation = null;
		$("#stationTable").bootstrapTable("load", relateStations);
		
		var rowSelector = "#qyTable>tbody>tr";
		$(rowSelector).css('background-color','');
		rowSelector = "#qyTable>tbody>tr[data-uniqueid='"+qyid+"']";
		$(rowSelector).css('background-color',config.selectRowColor);
		
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
})