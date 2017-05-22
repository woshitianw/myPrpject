require(["jquery",
	'core/AppEvent',
	'core/GlobalParams',
	'echarts',
	'jquery-svg',
	'js/ConfigData',
	'js/util/Util',
	'bootstrap',
	'bootstrap-table',
	'bootstrap-table-zh-CN'
], function(
	$,
	AppEvent,
	Global,
	echarts,
	jquerysvg,
	config,
	Util) {
	var successColor = '#26E476';
	var waitColor = '#F2E500';
	var failColor = '#E70012';
	var unaudit = false;
	/**
	 * 上一条选中的报警信息
	 */
	var lastSelectWarnRowIndex = -1;
	var flowchartSvg, selectStation = null;
	var currentMainOption = null;

	var warnDatas = [{
		"warn_id": "2c2b2b3e21a5453ba7baa34261dcd686",
		"warn_name": "高温报警",
		"enterprise_id": "",
		"warn_code": "1",
		"warn_type": "最高温度",
		"warn_num": "4",
		"warn_time": "2016-09-08 17:30:53",
		"warn_states": "1",
		"end_time": "2016-09-08 17:30:53",
		"audit_type": "1",
		"audit_status": "1",
		"audit_persion": "张峰",
		"audit_time": "2016-09-08 18:30:53",
		"audit_opinion": ""
	}, {
		"warn_id": "106",
		"warn_name": "降雨报警",
		"enterprise_id": "",
		"warn_code": "1",
		"warn_type": "降雨量",
		"warn_num": "2",
		"warn_time": "2016-09-08 18:30:53",
		"warn_states": "2",
		"end_time": "2016-09-08 19:30:53",
		"audit_type": "0",
		"audit_status": "1",
		"audit_persion": "",
		"audit_time": "2016-09-08 18:30:53",
		"audit_opinion": ""
	}];

	var flowchartItemDivs = [];

	//		var warnDetailCollection = [{
	//			'warn_id':'2c2b2b3e21a5453ba7baa34261dcd686',
	//			'items':[{"Station_Id_C":"54623","Station_Name":"塘沽国家基本气象站","warn_type":"最高温度","warn_data":"24.5","warn_value":"11","warn_time":"2016-09-08 17:30:00"},{"Station_Id_C":"54619","Station_Name":"静海国家一般气象站","warn_type":"最高温度","warn_data":"24.5","warn_value":"11","warn_time":"2016-09-08 17:30:00"}]
	//		}]

	function warnNumColumnFormatter(value, row, index) {
		return "<span warnid='" + row.warn_id + "' type='goto' style='text-decoration:underline;cursor:pointer'>" + value + '站报警</span>'
	}

	function auditTypeFormatter(value, row, index) {
		value = value.toString();
		var html = '';
		if(value == '0') {
			html = "<span>自动审核</span>";
		} else if(value == '1') {
			html = "<span warnid='" + row.warn_id + "' type='pop' style='text-decoration:underline;cursor:pointer'>人工审核</span>";
		}
		//		$(html).mouseenter(function(){
		//			console.log('mouseover');
		//		});
		return html;
	}

	function alertTypeFormatter(value, row, index) {
		value = value.toString();
		var span = '';
		if(value == '0') {
			span = "<span class='state-icon' style='background-color:#608d08'>已经发送</span>";
		} else if(value == '1') {
			span = "<span class='state-icon' style='background-color:#0793d1'>发送成功</span>";
		} else if(value == '2') {
			span = "<span class='state-icon' style='background-color:#f19149'>发送失败</span>";
		} else if(value == '3') {
			span = "<span class='state-icon' style='background-color:#6e7c80'>发送取消</span>";
		} else if(value == '4') {
			span = "<span class='state-icon' style='background-color:#eb6100'>未处理的</span>";
		}

		return span;
	}

	function loadWarnDatas(option) {
		var data = {
				warn_code: 1,
				t: ((new Date()).getTime())
			};
		if(option == '已通过')
		{
			data.audit_status = 1
		}else if(option == '待审核'){
			data.audit_status = 0;
		}
		else{
			data.audit_status = 2;
		}
		lastSelectWarnRowIndex = -1;
		$.ajax({
			data: data,
			dataType:'json',
			complete: function(xhr, status) {
				var result = xhr.responseJSON;
				if(result && result.warning) {
					if($.isArray(result.warning)) {
						warnDatas = result.warning;
					} else {
						warnDatas = [result.warning];
					}

					$("span[type='pop']").off('mouseenter');
					$("span[type='pop']").off('mouseleave');
					$("span[type='goto']").off('click');
					for(var i = 0; i < warnDatas.length; i++) {
						warnDatas[i].id = i;
					}
					$("#warnTable").bootstrapTable('load', warnDatas);
					$("span[type='pop']").on('mouseenter', popWarnInfoContent);
					$("span[type='pop']").on('mouseleave', unPopWarnInfoContent);
					$("span[type='goto']").on('click', showWarnDetail);
					if(warnDatas.length > 0) {
						//默认选中第一条记录
						selectWarnItem(warnDatas[0], 0);
					}
				}
				else{
					warnDatas = [];
					$("#warnTable").bootstrapTable('load', warnDatas);
					clearFlowChart();
				}
			},
			error: function(xhr, status, error) {
				console.log(xhr);
				console.log(status);
				console.log(error);
				console.log('加载自动站报警信息失败');
			},
			type: 'get',
			url: '../' + config.services.warning
		});
	}

	/**
	 * 选中一条报警信息
	 */
	function selectWarnItem(warn, index) {
		if(lastSelectWarnRowIndex == warn.id) {
			return;
		}
		clearFlowChart();
		$('#warnTable>tbody>tr').css('background-color', '');
		lastSelectWarnRowIndex = warn.id;
		$('#warnTable>tbody>tr[data-uniqueid="' + index + '"]').css('background-color', config.selectRowColor);
		var stationIds = [];
		if(warn.warnDetails == null) {
			warn.warnDetails = getWarnDetailById(warn.warn_id);
		}
		if(warn.warnDetails != null) {
			for(var j = 0; j < warn.warnDetails.length; j++) {
				stationIds.push(warn.warnDetails[j].station_id);
			}
		}
		AppEvent.dispatchAppEvent(AppEvent.ALERT_STATIONS, stationIds);

		//绘制流程图
		drawFlowChart(warn);

	}

	function getWarnDetailById(warnid) {
		var warnItems = [];
		$.ajax({
			data: {
				warn_id: warnid,
				t: ((new Date()).getTime())
			},
			dataType:'json',
			async: false,
			complete: function(xhr, status) {
				var result = xhr.responseJSON;
				if(result != null && result.warningInfo) {
					warnItems = result.warningInfo;
				}
			},
			error: function(xhr, status, error) {
				console.log(xhr);
				console.log(status);
				console.log(error);
				console.log('获取报警详细信息失败');
			},
			type: 'get',
			url: '../' + config.services.warningDetail
		});
		return warnItems;
	}

	function showWarnDetail(evt) {
		$('#warnTableContainer').css('display', 'none');
		$('#warnTableDetailContainer').css('display', 'block');
		$('#returnButton').css('display', 'block');
		//获取报警详情信息
		var uid = $(evt.currentTarget.parentNode.parentNode).attr('data-uniqueid');
		var row = $("#warnTable").bootstrapTable('getRowByUniqueId', uid);
		if(row.warnDetails == null) {
			row.warnDetails = getWarnDetailById(row.warn_id)
		}
		$("#warnDetailTable").bootstrapTable('load', row.warnDetails);
	}

	function popWarnInfoContent(evt) {
		console.log(evt);
		$('#warnInfoContent').css('display', 'block');
		$('#warnInfoContent').css('top', (evt.currentTarget.getBoundingClientRect().top-170) + 'px');
		$('#warnInfoContent').css('left', (evt.currentTarget.getBoundingClientRect().left - 380) + 'px');
		var warnId = $(evt.currentTarget).attr('warnid');
		var item = getWarnById(warnId);
		var auditType = '';
		var status = item['audit_status'].toString();
		switch(status) {
			case '0':
				auditType = '待审核';
				break;
			case '1':
				auditType = '已通过';
				break;
			case '2':
				auditType = '未通过';
				break;
		}

		if(status == '2' || status == '1') {
			unaudit = false;
			var content = "<span>审核状态：</span>" + auditType + '<br>';
			content = content + "<span>审核人：</span>" + item['audit_persion'] + '<br>';
			content = content + "<span>审核时间：</span>" + item['audit_time'] + '<br>';
			content = content + "<span>审核意见：</span>" + item['audit_opinion'];
			$('#warnInfoContent').html(content);
		} else {
			unaudit = true;
			var content = "<span id='closebtn'>×</span>";
			content = content + "<span>审核状态</span>" + '<input type="radio" name="auditstatus" value="pass" checked="checked" />通过<input type="radio" name="auditstatus" value="unpass" />未通过 ' + '<br>';
			content = content + "<span>审核说明</span><br>";
			content = content + '<textarea id="auditDescription"></textarea><br>';
			content = content + '<div><input type="button" value="提交" id="btnpost"></div>';
			$("#warnInfoContent").attr('warnid',warnId);
			$("#warnInfoContent").html(content);
			//绑定审核按钮事件
			$('#btnpost').click(auditClick);
		}

		$("#closebtn").click(function() {
			$('#warnInfoContent').css('display', 'none');
		});
	}

	function getWarnById(wid) {
		if(warnDatas == null) {
			return null;
		}
		for(var i = 0; i < warnDatas.length; i++) {
			var item = warnDatas[i];
			if(item['warn_id'] == wid) {
				return item;
			}
		}
		return null;
	}

	function unPopWarnInfoContent(evt) {
		if(!unaudit) {
			console.log(evt);
			console.log('mouseenter');
			$('#warnInfoContent').css('display', 'none');
		}
	}

	function init() {
		var optionWarnTable = {
			data: [],
			striped: true,
			pagination: true,
			pageSize: 6,
			pageList: [6, 8, 10, 15],
			search: true,
			minimunCountColumns: 2,
			uniqueId: 'id',
			onClickCell: function(field, value, row, element) {
				if(field == 'warn_num') {
					return;
				}
				selectWarnItem(row, $(element[0].parentNode).attr('data-uniqueid'));
			},
			columns: [{
				title: 'id',
				field: 'id',
				align: 'center',
				width: 230,
				visible: false
			}, {
				title: '时间',
				field: 'warn_time',
				align: 'center',
				width: 230
			}, {
				title: '报警名称',
				field: 'warn_name',
				align: 'center',
				width: 200
			}, {
				title: '类型',
				field: 'warn_type',
				align: 'center',
				width: 110
			}, {
				title: '自动站报警数量',
				field: 'warn_num',
				align: 'center',
				width: 155,
				formatter: warnNumColumnFormatter
			}, {
				title: '审核类型',
				field: 'audit_type',
				align: 'center',
				width: 95,
				formatter: auditTypeFormatter
			}, {
				title: '报警状态',
				field: 'warn_states',
				align: 'center',
				width: 170,
				formatter: alertTypeFormatter
			}],
			onPostBody: function() {
				$('#warnTable>tbody>tr').css('background-color', '');
				if(lastSelectWarnRowIndex != null && lastSelectWarnRowIndex != '') {
					$('#warnTable>tbody>tr[data-uniqueid="' + lastSelectWarnRowIndex + '"]').css('background-color', config.selectRowColor);
				}

			}
		};
		$("#warnTable").bootstrapTable(optionWarnTable);
		
		$('.optionbar span').click(function(evt) {
			var option = $(evt.currentTarget).text();
			if(option == currentMainOption) {
				return;
			}
			currentMainOption = option;
			loadWarnDatas(option);
			//setMainMoudle(option);
			$('.optionbar span').removeClass('option-select');
			$(evt.currentTarget).addClass('option-select');
		});
		loadWarnDatas('已通过');

		var optionWarnDetailTable = {
			data: [],
			striped: true,
			pagination: true,
			pageSize: 6,
			pageList: [6, 8, 10, 15],
			search: true,
			minimunCountColumns: 2,
			uniqueId: 'station_id',
			onClickCell: function(field, value, row, $element) {
				AppEvent.dispatchAppEvent(AppEvent.POPUP_AND_CENTER_STATION, [row['station_id'], true]);
			},
			columns: [{
				title: '数据采集时间',
				field: 'warn_time',
				align: 'center',
				width: 230
			}, {
				title: '站点编号',
				field: 'station_id',
				align: 'center',
				width: 110
			}, {
				title: '站点名称',
				field: 'station_name',
				align: 'center',
				width: 230
			}, {
				title: '类型',
				field: 'warn_type',
				align: 'center',
				width: 110
			}, {
				title: '数值',
				field: 'warn_data',
				align: 'center',
				width: 110
			}, {
				title: '阈值',
				field: 'warn_value',
				align: 'center',
				width: 110
			}]
		};

		$("#warnDetailTable").bootstrapTable(optionWarnDetailTable);

		$('#returnButton').click(function() {
			$('#warnTableContainer').css('display', 'block');
			$('#warnTableDetailContainer').css('display', 'none');
			$('#returnButton').css('display', 'none');
			//clearFlowChart();
		});
		$('#legend-ok').css('border-bottom-color', successColor);
		$('#legend-wait').css('border-bottom-color', waitColor);
		$('#legend-fail').css('border-bottom-color', failColor);
		$('#receipt-close').click(function() {
			$('#receipt-panel').css('display', 'none');
		});

		AppEvent.addAppEventListener(AppEvent.STATION_GRAPHIC_CLICK, stationGraphicClickHandler);
	}
	
	function auditClick(){
		var content = $('#auditDescription').val();
		var radio=document.getElementsByName("auditstatus");
		var auditType = null;   //  selectvalue为radio中选中的值
		for(var i=0;i<radio.length;i++){
			if(radio[i].checked==true) {
				auditType=radio[i].value;
				break;
			}
		}
		
		var username = Global.getUserName();
		if(username == null || username == ''){
			alert('用户未登录');
			return;
		}
		if(content == ''){
			alert('请填写审核意见');
			return;
		}
		if(auditType == ''){
			alert('请选择审核状态');
			return;
		}
		var audit_status = ''
		if(auditType == 'pass'){
			audit_status = '1';
		}
		else{
			audit_status = '2';
		}
		var warnid = $("#warnInfoContent").attr('warnid');
		$.ajax({
			data: {
				warn_id: warnid,
				audit_status:audit_status,
				audit_opinion:content,
				audit_persion:username,
				t: ((new Date()).getTime())
			},
			dataType:'json',
			async: false,
			complete: function(xhr, status) {
				var result = xhr.responseJSON;
				if(result.res == "0"){
					alert('已提交');
				}
				else{
					alert('提交失败')//这里你看怎么描述合适
				}
				$('#warnInfoContent').css('display', 'none');
			},
			error: function(xhr, status, error) {
				console.log(xhr);
				console.log(status);
				console.log(error);
				console.log('报警信息审批失败');
				alert('报警信息审批失败');
			},
			type: 'get',
			url: '../' + config.services.setAudit
		});
	}

	function drawFlowChart(warn) {
		var sortChartFunc = function(a, b) {
			function getSortValue(mn) {
				if(mn.indexOf('SMS') != -1) {
					return 3;
				}
				if(mn.indexOf('FAX') != -1) {
					return 2;
				}
				if(mn.indexOf('OBD') != -1) {
					return 1;
				}
			}
			return getSortValue(b['MEAN_NAME']) - getSortValue(a['MEAN_NAME']);
		}
		if(warn.chartitems == null) {
			$.ajax({
				dataType:'json',
				data: {
					ALERT_ID: warn.warn_id,
					t: ((new Date()).getTime())
				},
				async: false,
				complete: function(xhr, status) {
					var result = xhr.responseJSON;
					if(result && result.result) {
						if($.isArray(result.result)){
							warn.chartitems = result.result.sort(sortChartFunc);
						}
						else{
							warn.chartitems = [result.result];
						}
					}
				},
				error: function(xhr, status, error) {
					console.log(xhr);
					console.log(status);
					console.log(error);
					console.log('获取报警回执信息失败');
				},
				type: 'get',
				url: '../' + config.services.warningResult
			});
		}
		if(warn.chartitems != null && warn.chartitems.length > 0) {
			$('#flowchart-zdjcxt-icon').css('display', 'block');
			$('#flowchart-fbsd-icon').css('display', 'block');
			if(flowchartSvg == null) {
				$('#chart-svg').svg({
					onLoad: function(svg) {
						flowchartSvg = svg;
						drawFlowChartItems(warn.chartitems);
					}
				});
			} else {
				drawFlowChartItems(warn.chartitems);
			}
		}
	}

	/**
	 * 根据回执的流程信息绘制流程图
	 * @param {Object} flowItems
	 */
	function drawFlowChartItems(flowItems) {
		//flowchartItemDivs = null
		var svg = flowchartSvg;
		var g = svg.group({
			stroke: successColor,
			strokeWidth: 6
		})
		var startX = 225;
		var startY = 212;
		//从自动检测系统到发布手段
		svg.line(g, startX, startY, startX + 130, startY);
		startX = startX + 130 + 134;
		//从发布手段到3种方式的分叉点
		var intervalLength = 40;
		svg.line(g, startX, startY, startX + intervalLength, startY);

		var item = flowItems[0];

		//绘制第一种方式
		var chart = $('<div class="pa flow-charticon"></div>');
		chart.attr('chart-index', 0);
		chart.attr('style', 'top:46px;left:689px;display:block');
		$('#flowchart-fbsd-icon').after(chart);
		var imgAlabel = getChartImageAndLabel(item);
		var spanstyle = 'background-image:url(' + imgAlabel[0] + ');display: block;width: 113px;height:116px';
		var span = $('<span></span>').appendTo(chart);
		span.attr('style', spanstyle);
		var span = $('<span></span>').appendTo(chart);
		span.text(imgAlabel[1]);
		flowchartItemDivs.push(chart);
		svg.line(g, startX + intervalLength, startY + 3, startX + 40, startY - startY / 2, {
			stroke: imgAlabel[2]
		});
		svg.line(g, startX + intervalLength - 3, startY - startY / 2, startX + 200, startY - startY / 2, {
			stroke: imgAlabel[2]
		});
		$(chart).on('click', chartItemClickHandler);

		//绘制第二种方式
		item = flowItems[1];
		if(item == null) {
			return;
		}
		var chart = $('<div class="pa flow-charticon"></div>');
		chart.attr('chart-index', 1);
		chart.attr('style', 'top:260px;left:689px;display:block');
		$('#flowchart-fbsd-icon').after(chart);
		var imgAlabel = getChartImageAndLabel(item);
		var spanstyle = 'background-image:url(' + imgAlabel[0] + ');display: block;width: 113px;height:116px';
		var span = $('<span></span>').appendTo(chart);
		span.attr('style', spanstyle);
		var span = $('<span></span>').appendTo(chart);
		span.text(imgAlabel[1]);
		flowchartItemDivs.push(chart);
		svg.line(g, startX + intervalLength, startY - 3, startX + intervalLength, startY + startY / 2, {
			stroke: imgAlabel[2]
		});
		svg.line(g, startX + intervalLength - 3, startY + startY / 2, startX + 200, startY + startY / 2, {
			stroke: imgAlabel[2]
		});
		$(chart).on('click', chartItemClickHandler);

		//绘制第三种方式
		item = flowItems[2];
		if(item == null) {
			return;
		}
		var chart = $('<div class="pa flow-charticon"></div>');
		chart.attr('chart-index', 2);
		chart.attr('style', 'top:154px;left:789px;display:block');
		$('#flowchart-fbsd-icon').after(chart);
		var imgAlabel = getChartImageAndLabel(item);
		var spanstyle = 'background-image:url(' + imgAlabel[0] + ');display: block;width: 113px;height:116px';
		var span = $('<span></span>').appendTo(chart);
		span.attr('style', spanstyle);
		var span = $('<span></span>').appendTo(chart);
		span.text(imgAlabel[1]);
		flowchartItemDivs.push(chart);
		svg.line(g, startX + intervalLength - 3, startY, startX + 300, startY, {
			stroke: imgAlabel[2]
		});
		$(chart).on('click', chartItemClickHandler);
	}

	function getChartImageAndLabel(item) {
		var v = [];
		switch(item['MEAN_NAME']) {
			case 'FAX':
				v = ['images/05.png', '传真'];
				break;
			case 'BSMS':
				v = ['images/03.png', '手机'];
				break;
			case 'OBD':
				v = ['images/04.png', '外呼'];
				break;
			case 'SMS':
				v = ['images/03.png', '手机'];
				break;
		}
		switch(item['SEND_STATES']) {
			case '0':
				v.push(successColor);
				break;
			case '1':
				v.push(failColor);
				break;
			case '2':
				v.push(waitColor);
				break;
		}
		return v;
	}

	function chartItemClickHandler(evt) {
		var chartIndex = $(evt.currentTarget).attr('chart-index');
		var row = $("#warnTable").bootstrapTable('getRowByUniqueId', lastSelectWarnRowIndex);
		var chart = row.chartitems[chartIndex];
		if(chart.means == null) {
			chart.means = getMeans(chart['MEAN_ID']);
		}
		//console.log(chart);
		$('#receipt-panel').css('display', 'block');
		$('#receipt-panel').css('top', evt.currentTarget.getBoundingClientRect().top);
		$('#receipt-panel').css('left', (evt.currentTarget.getBoundingClientRect().left - 600) + 'px');
		$('#receipt-content').text(chart.PUBCONTENT);
		$('#receipt-tbody').empty();

		var okCount = 0;
		var waitCount = 0;
		var errorCount = 0;
		if(chart.means && chart.means.length > 0) {
			for(var i = 0; i < chart.means.length; i++) {
				var mean = chart.means[i];
				var tr = $('<tr></tr>').appendTo($('#receipt-tbody'));
				$('<td>' + mean['EQUIPMENT_NUM'] + '</td>').appendTo(tr);
				var td = $('<td></td>').appendTo(tr);
				mean['SEND_TIME'] == null ? td.text('') : td.text(mean['SEND_TIME']);
				td = $('<td></td>').appendTo(tr);
				mean['END_TIME'] == null ? td.text('') : td.text(mean['END_TIME']);
				td = $('<td></td>').appendTo(tr);
				if(mean['SEND_STATES'] != null) {
					if(mean['SEND_STATES'] == '0') {
						var span = $("<span class='state-icon'></span>").appendTo(td);
						span.text('发送成功');
						span.css('background-color', '#0793d1');
						okCount++;
					} else if(mean['SEND_STATES'] == '1') {
						var span = $("<span class='state-icon'></span>").appendTo(td);
						span.text('发送失败');
						span.css('background-color', '#f5773d');
						errorCount++;
					} else if(mean['SEND_STATES'] == '2') {
						var span = $("<span class='state-icon'></span>").appendTo(td);
						span.text('已发送');
						span.css('background-color', '#facd89');
						waitCount++;
					} else if(mean['SEND_STATES'] == '3') {
						var span = $("<span class='state-icon'></span>").appendTo(td);
						span.text('等待发送');
						span.css('background-color', '#fcb642');
						waitCount++;
					}
				}
			}
			$('#receipt-ok-count').text(okCount + '成功');
			$('#receipt-wait-count').text(waitCount + '等待');
			$('#receipt-error-count').text(errorCount + '失败');
		}
	}

	function getMeans(id) {
		var means = [];
		$.ajax({
			data: {
				MEAN_ID: id,
				t: ((new Date()).getTime())
			},
			dataType:'json',
			async: false,
			complete: function(xhr, status) {
				var result = xhr.responseJSON;
				if(result && result.resultInfo) {
					if($.isArray(result.resultInfo))
					{
						means = result.resultInfo;
					}else{
						means = [result.resultInfo];
					}
				}
			},
			error: function(xhr, status, error) {
				console.log(xhr);
				console.log(status);
				console.log(error);
				console.log('获取报警发送结果失败');
			},
			type: 'get',
			url: '../' + config.services.warningResultInfo
		});
		return means;
	}

	function clearFlowChart() {
		$('#flowchart-zdjcxt-icon').css('display', 'none');
		$('#flowchart-fbsd-icon').css('display', 'none');
		$('#receipt-panel').css('display', 'none');
		if(flowchartSvg) {
			flowchartSvg.clear();
		}
		if(flowchartItemDivs && flowchartItemDivs.length > 0) {
			$.each(flowchartItemDivs, function(index, div) {
				$(div).off('click');
				$(div).remove();
			});
		}
	}

	function stationGraphicClickHandler(topic, params) {
		if(params != null) {
			selectStation = params[1];
		}
		//设置选中行的颜色
		if(selectStation != null) {
			var rowSelector = "#warnDetailTable>tbody>tr";
			$(rowSelector).css('background-color', '');
			rowSelector = "#warnDetailTable>tbody>tr[data-uniqueid='" + selectStation['station_Id_C'] + "']";
			$(rowSelector).css('background-color', config.selectRowColor);
		}
	}

	init();
});