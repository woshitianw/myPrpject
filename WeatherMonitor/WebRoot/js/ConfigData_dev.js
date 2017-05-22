/**
 * @author haoml
 * @date 2016/9/12
 * @function 配置数据
 */
define(function() {
	var _configdata = {
		geometryServiceUrl: "",
		mapcenter: [13109384.149490075, 4781781.395613562],
		mapres: 260.748113140625,
		tangguextent:[13021823.873453453, 4656665.065510396,13216828.645208318, 4768145.669540168],//塘沽范围
		tqbm: { //天气编码与天气现象对照
			"00": "晴",
			"01": "多云",
			"02": "阴",
			"03": "阵雨",
			"04": "雷阵雨",
			"05": "雷阵雨伴有冰雹",
			"06": "雨夹雪",
			"07": "小雨",
			"08": "中雨",
			"09": "大雨",
			"10": "暴雨",
			"11": "大暴雨",
			"12": "特大暴雨",
			"13": "阵雪",
			"14": "小雪",
			"15": "中雪",
			"16": "大雪",
			"17": "暴雪",
			"18": "雾",
			"19": "冻雨",
			"20": "沙尘暴",
			"21": "小到中雨",
			"22": "中到大雨",
			"23": "大到暴雨",
			"24": "暴雨到大暴雨",
			"25": "大暴雨到特大暴雨",
			"26": "小到中雪",
			"27": "中到大雪",
			"28": "大到暴雪",
			"29": "浮尘",
			"30": "扬沙",
			"31": "强沙尘暴",
			"32": "浓雾",
			"33": "雪",
			"49": "强浓雾",
			"53": "霾",
			"54": "中度霾",
			"55": "重度霾",
			"56": "严重霾",
			"57": "大雾",
			"58": "特强浓雾",
			"99": "无"
		},
		services: {
			stationBasicInfo: 'data/stations.json', //获取站点基本信息服务,
			stationDetailInfo: 'data/getMonitorInfo.json', //获取站点详细信息服务
			stationThresholds: 'data/getThresholds.json', //获取站点阈值信息服务
			stationHistory: 'data/stationHistory.json',
			cwStationDetailInfo:'data/cwDetail.json',//潮位自动站信息服务
			cwStationThresholds:'data/cwThresholds.json',//潮位自动站潮位报警阈值信息
			cwHistory: 'data/cwHistory.json',//潮位自动站历史值
			warning: 'data/getwarn.json',
			warningDetail: 'data/getWarningInfo.json',
			warningResult: 'proxy/alertPro-admin-web/services/warn/getResult',
			warningResultInfo: 'proxy/alertPro-admin-web/services/warn/getResultInfo',
			arrivalRate: "data/getArrivaRate.json", //获取数据到达率
			weatherUrl: "proxy/weatherservice/DataService/json_swaquery?areaid=", //天气预报url
			bufferQuery: "http://60.205.159.8:6080/WeatherMonitor/station/query.do",
			qyInfo: "data/qyInfo.json",
			weather3h:'data/weather3h.json'
		},
		geodataServices: {
			xiangzhen: "data/xiangzhen_mercator.geojson", //乡镇级别行政区划数据
			quxian: 'data/quxian_mercator.geojson', //区县级别行政区划数据
			quxiancenter: 'data/qxcenter.geojson', //区县级别行政区划中心点数据
			ocean: "data/ocean.geojson"
		},
		socketService:'ws://112.74.27.180:8886',
		selectRowColor:'rgba(51,102,51,0.8)',
	};
	return _configdata;
});