/**
 * @author haoml
 * @date 2016/7/7
 * @function 系统事件的派发和响应
 */

define([
    "core/GlobalParams",
    "jslibs/pubsub"
], function (Global) {
    var _instance = {
        CONFIG_LOADED: "configLoaded",
        CONFIG_LOADED_ERROR: "configLoadedError",

        /**
         * 底图切换事件。      事件对象：{target:String 需要处理底图切换的MapWidget的Id,
			 *                        grouplayer:String 需要切换到的GroupLayer的Id,
			 * 						  setlayer:String 需要切换到的SetLayer的Id,
			 *                        sender:String 发起底图切换的对象Id}
         */
        SWITCH_BASEMAP: "switchBasemap",
        /**
         * 底图切换完成事件。      事件对象：{target:String 处理底图切换的MapWidget的Id,
			 *                        grouplayer:String 切换到的GroupLayer的Id,
			 * 						    setlayer:String 切换到的SetLayer的Id,
			 *                        sender:String 发起底图切换的对象Id}

         SWITCH_BASEMAP_COMPLETED: "switchBasemapCompleted",*/

        BASE_MAP_LAYER_LOADED: "baseMapLayerLoaded",
        BASE_MAP_LAYER_LOADED_ERROR: "baseMapLayerLoadedError",

		LOAD_STATIONS_COMPELETE:'loadStationsCompelete',
       
        /**
         * 主地图加载完成
         */
        MAP_LOADED:"maploaded",
        
        SWITCH_IFRAME:'switchIframe',
        
        SET_MENU_TITLE_LABEL:'setMenuTitleLabel',
        
        /**
         * 加载各个站点的详细信息成功事件
         */
        LOAD_STATIONS_DATADETAIL_COMPELETE:'loadStationsDatadetailCompelete',
        
        /**
         * 切换图层的可见性.参数： data:[]  [0]:图层名称（station:站点）   [1]可见性
         */
        SWITCH_LAYER_VISIBLE:'switchLayerVisible',
        
        /**
         * 刷新站点信息表
         */
        REFRESH_STATION_INFOS:'refreshStationInfos',
        
        /**
         * 指定当前地图需要报警的站点，参数：ids：需要显示报警站点的ID
         */
        ALERT_STATIONS:'alertStations',
        
        /**
         * 取消指定显示报警站点
         */
        CANCLE_ALERT_STATIONS:'cancleAlertStations',
        
        /*
         * 更改图层是否可点击：data:Array [0]:图层名 [1]是否可点击
         */
        CHANGE_LAYER_CLICKABLE:'changelayerclickable',
        
        /**
         * 居中站点并弹框显示站点信息：data:Array [0]，需要居中弹窗的站点ID  [1]：是否居中，true：居中，false：不居中
         * 
         */
        POPUP_AND_CENTER_STATION:'popupAndCenterStation',
        /*
         * 展示区县的天气信息
         */
        SHOW_COUNTRY_WEATHER:'showCountryWeather',
        /*
         * 设置iframe页面
         */
        SET_IFRAME:"setiframe",
        
        /**
         * 显示企业图层
         */
        SHOW_QY_LAYER:"showQyLayer",
        
        /**
         * 企业图标点击事件。参数：[0]x经度   [1]y纬度   [2]半径（米）
         */
        QY_GRAPHIC_CLICK:'qyGraphicClick',
        
        /**
         * 站点图标点击事件。参数：[0]geom坐标   [1]attrs属性信息
         */
        STATION_GRAPHIC_CLICK:'stationGraphicClick',
        
        /**
         * 显示所有的自动站。
         */
        SHOW_ALL_STATION:'showAllSstation',
        
        /**
         * 关联自动站和企业。参数:  id 企业ID
         */
        RELATE_QY_STATIONS:'relateQyStations',
        /*
         * 添加天气信息到天气图层
         */
        ADD_WEATHER_DATAS:'addweatherdatas',
        /*
         * 隐藏popup
         */
        HIDE_POPUP:"hidepopup",
        
        /**
         * 在地图上显示自动站单一指标值
         */
        SHOW_STATION_SINGLE_VALUE:'showStationSingleValue',
        
        /**
         * 缩放到滨海新区
         */
        ZOOM_TO_TANGGU:'ZOOM_TO_TANGGU',
        
        /**
         * 查看潮位历史值
         */
        VIEW_CW_HISTORY:'viewCwHistory',
        
        /**
         * 查看雨情制作等值线图
         */
        VIEW_CONTOURLINE:'viewContourline',
        
        /**
         * 输出雨情制作专题图
         */
        PRINT_ISONLINE_MAP:'printIsonlineMap',
        
        /**
         * 清除雨情制作专题图
         */
        CLEAR_YQZZ:'clearYqzz',
        
        /**
         * 关闭弹出窗
         */
        CLOSE_POPUPWINDOW:'closePopupwindow',
        
        /**
         * 打开弹出窗
         */
        OPEN_POPUPWINDOW:'openPopupwindow',
        
        /**
         * 修正雨情制作的降雨量信息
         */
        INCORRECT_RAINVALUE:'incorrectRainvalue',
        
        /**
         * 下载雨情制作的类型
         */
        CREATE_YQZZFILE:'createYqzzfile',
        
        /*
		 *派发系统事件
		 */
		dispatchAppEvent: function(eventName, data) {
			var $ = Global.getTopJQuery();
			if(!$){
				return;
			}
			var _instance = Global.getEventInstance();
			$(_instance).trigger(eventName, [data]);
		},
		/*
		 *监听系统事件 
		 */
		addAppEventListener: function(eventName, eventHandler) {
			var $ = Global.getTopJQuery();
			if(!$){
				return;
			}
			var _instance = Global.getEventInstance();
			$(_instance).on(eventName, eventHandler);
		},
		removeEventListener: function(eventName, eventHandler) {
			var $ = Global.getTopJQuery();
			if(!$){
				return;
			}
			var _instance = Global.getEventInstance();
			$(_instance).off(eventName, eventHandler);
		}
    };
    return _instance;
});