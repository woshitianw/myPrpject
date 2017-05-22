//顶层的Jquery对象，提供给Global对象使用
var topJQuery = null;
require(["jquery",
	"widgets/map/MapWidget",
	'core/GlobalParams',
	'core/AppEvent',
	'util/TimeObjectUtil',
	'js/ConfigData',
	'js/util/Util'
], function(
	$,
	mapWidget,
	Global,
	AppEvent,
	TimeObjectUtil,
	config,
	Util) {
	//处理窗体大小发生变化
	topJQuery = $;
	var resizeHandler = null;
	var map = null;
	var headerHeight = 100;
	var leftMenuWidth = 100;
	var contentTabHeight = 25;
	var currentIFrameId = '';
	var menuTable = {},
		mapswitch = false;
	var currentMenuButtomDom = null;

	function initMapMenu() {
		$.getJSON("data/mapmenu.json", function(result) {
			for(var key in result.mapmenu) {
				var menus = result.mapmenu[key];
				menuTable[key] = [];
				for(var i = 0; i < menus.length; i++) {
					var li = $("<li></li>", {
						id: menus[i].id,
						class: "content-li",
						html: menus[i].label
					});
					menuTable[key].push(li);
					li
				}
			}
		});
	}

	function changeIframe(id) {
		if(currentIFrameId == id) {
			if(id == 'statinfo'){
				AppEvent.dispatchAppEvent(AppEvent.SWITCH_IFRAME, id);
			}
			return;
		}
		AppEvent.dispatchAppEvent(AppEvent.SWITCH_IFRAME, id);
		if(currentIFrameId == 'warninginfo' || currentIFrameId == 'warninginfo_qy') {
			//取消在报警信息模块指定报警站的功能
			AppEvent.dispatchAppEvent(AppEvent.CANCLE_ALERT_STATIONS);
		}
		if(currentIFrameId == 'qyinfomation' || currentIFrameId == 'warninginfo_qy' || currentIFrameId == 'callposition'){
			//在企业信息和企业报警页面，只显示部分站点
			AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['qy', false]);
			AppEvent.dispatchAppEvent(AppEvent.SHOW_ALL_STATION);
		}
		if(currentIFrameId == 'yqzz'){
			AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['yqzz', false]);
			AppEvent.dispatchAppEvent(AppEvent.CLEAR_YQZZ);
		}
		currentIFrameId = id;
		switch(id) {
			case "statinfo":
				setIframe(id, "zdxx/zdxx.html");
				AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['station', true]);
				AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['alert', true]);
				break;
			case "datareachrate":
				setIframe(id, "sjddl/sjddl.html");
				AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['station', true]);
				AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['alert', true]);
				break;
			case "warninginfo":
				setIframe(id, "bjxx/bjxx.html");
				AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['station', true]);
				AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['alert', true]);
				break;
			case "lodmap":
				setIframe(id, "");
				break;
			case "cloudmap":
				setIframe(id, "");
				break;
			case "contourmap":
				setIframe(id, "");
				break;
			case "weatherforecast":
				setIframe(id, "tqyb/tqyb.html");
				AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['station', false]);
				AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['alert', false]);
				break;
			case "qyinfomation":
				setIframe(id, "qyxx/qyxx.html");
				AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['station', false]);
				AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['alert', false]);
				break;
			case "warninginfo_qy":
				setIframe(id, "qybj/qybjxx.html");
				AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['station', false]);
				AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['alert', true]);
				break;
			case "callposition":
				setIframe(id, "whdw/whdw.html");
				AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['station', false]);
				AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['alert', true]);
				break;
			case "yqzz":
				setIframe(id, "yqzz/yqzz.html");
				AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['yqzz', true]);
				break;
		}

		if(id == "weatherforecast") {
			AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['weather', true]);
			AppEvent.dispatchAppEvent(AppEvent.CHANGE_LAYER_CLICKABLE, ["qx", true]);
		} else {
			AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['weather', false]);
			AppEvent.dispatchAppEvent(AppEvent.CHANGE_LAYER_CLICKABLE, ["qx", false]);
		}
	}

	function setIframe(id, url) {
		$("#content-div").empty();
		$("#content-div").append($("<iframe></iframe>", {
			id: id + "-iframe",
			class: "content-iframe",
			src: url
		}));
	}

	function initMap() {
		mapWidget.init();
		setTimeout(function() {
			AppEvent.dispatchAppEvent('MAP_INIT_COMPLETE', [0]);
		}, 1000)
	}

	//        function onbodyResize() {
	//            if (resizeHandler) {
	//                clearTimeout(resizeHandler);
	//            }
	//            resizeHandler = setTimeout(function () {
	//                resize()
	//            }, 200);
	//        }
	//
	//        function resize() {
	//            $("#app-content").css("top", this.headerHeight + "px");
	//            $("#app-content").css("height", ($(window).height() - headerHeight) + "px");
	//            $("#maincontainer").css("width", ($(window).width() - leftMenuWidth) + "px");
	//            $("#maincontainer").css("height", ($(window).height() - headerHeight - contentTabHeight) + "px");
	//            $("#maincontainer").css("left", leftMenuWidth + "px");
	//        }

	function init() {
		var username = Util.getQueryString('username');
		Global.setUserName(username);
		if(config.authority == 2){
			if(username == null || username ==  ''){
				if(config.loginurl != null && config.loginurl != ''){
					//window.location.href = config.loginurl
					window.location.href = config.loginurl;
				}
				else{
					alert('您还未登录！')
				}
				return;
			}
		}
		changeIframe('statinfo');
		initMapMenu(); //初始化菜单
		initMap();
		//		var time = TimeObjectUtil.formatterDate2(new Date());
		//		Global.setArrivalTime(time);
		//		$("#layer-switch").css("left", ($(window).width() * 0.4 - 150) + "px");//图层控制按钮放置位置
		$("#mapset-div").css("top", '0');
		$("#mapset-div").click(function() {
			if(mapswitch) {
				$("#layer-switch-title").css("display", "none");
				$("#layer-switch-content").css("display", "none");
				var layerSwitchTop = $('#layer-switch').css('top');
				layerSwitchTop = parseFloat(layerSwitchTop.replace('px',''));
				$('#layer-switch').css('top',(layerSwitchTop+140)+'px');
				$("#mapset-div").css("top", '0');
				
				mapswitch = false;
			} else {
				$("#layer-switch-title").css("display", "block");
				$("#layer-switch-content").css("display", "block");
				var layerSwitchTop = $('#layer-switch').css('top');
				layerSwitchTop = parseFloat(layerSwitchTop.replace('px',''));
				$('#layer-switch').css('top',(layerSwitchTop-140)+'px');
				$("#mapset-div").css("top", "");
				mapswitch = true;
			}
		});

		//鼠标放置时显示
		$(".menu-title").hover(function(evt) {
			var key = $(evt.currentTarget).attr('menu');
			currentMenuButtomDom = evt.currentTarget;
			var menulist = menuTable[key];
			$("#downmenuul").empty();
			for(var i = 0; i < menulist.length; i++) {
				$("#downmenuul").append(menulist[i]);
			}

			$("#downmenuul").css("display", "block");
			$("#downmenuul-arrow").css("display", "block");
			//设置下拉菜单的位置
			var rect = evt.currentTarget.getBoundingClientRect();
			$("#downmenuul").css("top", (rect.bottom + 10) + 'px');
			$("#downmenuul").css("left", (rect.left + rect.width / 2 - 60) + 'px');
			$("#downmenuul-arrow").css("top", (rect.bottom + 10) + "px");
			$("#downmenuul-arrow").css("left", (rect.left + rect.width / 2) + "px");
			$('#menu-title-label').css('display', 'none');

			$("#downmenuul>.content-li").click(menuClickHandler);
		});

		$('#mapbtn').click(function() {
			//console.log($('#mainmenulist span').css('display'));
			$('#mainmenulist span').toggleClass('dn');
		});

		//鼠标离开时菜单隐藏
		$("#downmenuul").mouseleave(function() {
			$("#downmenuul").css("display", "none");
			$("#downmenuul-arrow").css("display", "none");
			$('#menu-title-label').css('display', 'block');
			//	        $("#mapmenu").css("height", "47px");
		});
		//	    AppEvent.addAppEventListener(AppEvent.SWITCH_IFRAME,function(topic,data){
		//	    	setIframe(data[0],data[1]);
		//	    })
		AppEvent.addAppEventListener(AppEvent.SET_MENU_TITLE_LABEL, function(topic, data) {
			$('#menu-title-label').text(data);
		});

		AppEvent.addAppEventListener(AppEvent.SET_IFRAME, function(topic, data) {
			currentIFrameId = data.id;
			setIframe(data.id, data.url);
		})

		AppEvent.dispatchAppEvent(AppEvent.SET_MENU_TITLE_LABEL, '站点信息');
		
		AppEvent.addAppEventListener(AppEvent.CLOSE_POPUPWINDOW,function(){
			$('#mask_div').css('display','none');
			$('#poupwindow').attr('src','');
		});
		
		AppEvent.addAppEventListener(AppEvent.OPEN_POPUPWINDOW,function(topic,option){
			if(option == null){
				return;
			}
			$('#mask_div').css('display','block');
			var top = $(window).height()/2 - option.height/2;
			$('#poupwindow').css('top',top+'px');
			
			var left = $(window).width()/2 - option.width/2;
			$('#poupwindow').css('top',top+'px');
			$('#poupwindow').css('left',left+'px');
			$('#poupwindow').css('width',option.width+'px');
			$('#poupwindow').css('height',option.height+'px');
			
			$('#poupwindow').attr('src',option.src);
		});
		
		online();
	}

	function menuClickHandler(evt) {
		var liid = $(evt.currentTarget)[0].id;
		var title = $(evt.currentTarget).text();
		AppEvent.dispatchAppEvent(AppEvent.SET_MENU_TITLE_LABEL, title);
		changeIframe(liid);
		$('#mainmenulist>span:first-child').children('.menu-split').css('display', 'inline-block');
		$('.menu-title').addClass('dn');
		$(currentMenuButtomDom).insertBefore('#mainmenulist>span:first-child');
		$(currentMenuButtomDom).children('.menu-split').css('display', 'none');
		$("#downmenuul").css("display", "none");
		$('#menu-title-label').css('display', 'block');

	}
	
	function online(){
		if (window.WebSocket) {
        websocket = new WebSocket(encodeURI(config.socketService));

        websocket.onopen = function() {
            var user = Math.ceil(Math.random()*10);
            console.log('socket opened : [join]'+user);
            //连接成功
            websocket.send('[join]'+user);
        };
        websocket.onerror = function() {
			console.log('socket onclose');
            //连接失败
        };
        websocket.onclose = function() {
			console.log('socket onclose');
            //连接断开
        };
        //消息接收
        websocket.onmessage = function(message) {


            var message = JSON.parse(message.data);

            if (message.type == 'count') {
                //userCount = message.msg;
            }else if(message.type == 'goOut'){
//              $("body").html("");
//              goOut("此用户在其它终端已经早于您登录,您暂时无法登录");
            }else if(message.type == 'thegoout'){
//              $("body").html("");
//              goOut("您被系统管理员强制下线");
            }else if(message.type == 'userlist'){
                //userlist = message.list;
            } else if(message.type == 'iphone'){
                //var div = document.getElementById("div");
                //div.innerHTML="<div>"+message.num+"</div>";
				var phoneNumber = message.num;
				console.log('外呼定位号码：'+phoneNumber);
				if(phoneNumber == null || phoneNumber == ''){
					return;
				}
				var data={'ENTERPRISETELEPHONE':phoneNumber,t:((new Date()).getTime())};
				$.ajax({
					data:data,
					dataType:'json',
					complete: function(xhr, status) {
						var result = xhr.responseJSON;
						if(result != null){
							AppEvent.dispatchAppEvent(AppEvent.SET_MENU_TITLE_LABEL, '外呼定位');
						$('#mainmenulist>span:first-child').children('.menu-split').css('display', 'inline-block');
						$('.menu-title').addClass('dn');
						currentMenuButtomDom = $('#menu-qy-title');
						$(currentMenuButtomDom).insertBefore('#mainmenulist>span:first-child');
						$(currentMenuButtomDom).children('.menu-split').css('display', 'none');
						$("#downmenuul").css("display", "none");
						$('#menu-title-label').css('display', 'block');
						setIframe('callposition', "whdw/whdw.html?phone="+phoneNumber);
						AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['station', false]);
						AppEvent.dispatchAppEvent(AppEvent.SWITCH_LAYER_VISIBLE, ['alert', true]);
						currentIFrameId = 'callposition';
						if ( $(".mask-container").length == 0 ) { 
							$('<div class="mask-container">'+
				      		'<span id="alert-symbol">'+
				        	'<div class="alert-symbol-animate"></div>'+
				        	'<div class="alert-symbol-animate1"></div>'+
				        	'<div class="alert-symbol-animate2"></div>'+
				        	'<audio loop="loop" autoplay="autoplay"> <source src="assets/song.mp3" type="audio/mpeg"></audio>'+
				      		'</span>'+
				    			'</div>').appendTo('body');
							_intervalHandler = setInterval(play,500);
								$('#alert-symbol').click(function(){
									clearInterval(_intervalHandler);
									$('.mask-container').remove();
								});
							}
						} 
						else{
							console.log(phoneNumber+'该号码无企业');
						}
						
					},
					error: function(xhr, status, error) {
						console.log(xhr);
						console.log(status);
						console.log(error);
						console.log('查询企业信息失败：');
					},
					type: 'get',
					url:  config.services.qyInfo
				});
            }
        };
    }
	}
	var animateIndex = 1;
		var animateLength = 3
		var _intervalHandler = null;
function play(){
		if(animateIndex>animateLength){
			for(var i=1;i<=animateLength;i++){
				$('.alert-symbol-animate'+i).css('display','none');
			}
			animateIndex=1;
		}
		else{
			$('.alert-symbol-animate'+animateIndex).css('display','block');
			animateIndex++;
		}
	}
	init();
});