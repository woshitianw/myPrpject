define([], function(){
	var TimeObjectUtil;
	/**
	 * @title 时间工具类
	 * @note 本类一律违规验证返回false
	 * @author {boonyachengdu@gmail.com}
	 * @date 2013-07-01
	 * @formatter "2013-07-01 00:00:00" , "2013-07-01"
	 */
	TimeObjectUtil = {
	    /**
	     * 获取当前时间毫秒数
	     */
	    getCurrentMsTime : function() {
	        var myDate = new Date();
	        return myDate.getTime();
	    },
	    
	    /**
	     * 把'yyyy-MM-dd mm:hh:ss'格式的数据转成Date对象
	     * @param {Object} dateString
	     */
	    parse:function(dateString){
	    	var strArray=dateString.split(" ");   
			var strDate=strArray[0].split("-");   
			var strTime=strArray[1].split(":");   
			var a=new Date(strDate[0],(strDate[1]-parseInt(1)),strDate[2],strTime[0],strTime[1],strTime[2]);
			return a;
	    },
	    /**
	     * 毫秒转时间格式
	     */
	    longMsTimeConvertToDateTime : function(time) {
	        var myDate = new Date(time);
	        return this.formatterDateTime(myDate);
	    },
	    /**
	     * 毫秒转时间格式
	     */
	    longMsTimeConvertToDateTime2 : function(time) {
	        var myDate = new Date(time);
	        return this.formatterDate(myDate);
	    },
	    /**
	     * 时间格式转毫秒
	     */
	    dateToLongMsTime : function(date) {
	        var myDate = new Date(date);
	        return myDate.getTime();
	    },
	    /**
	     * 格式化日期（不含时间）
	     */
	    formatterDate : function(date) {
	        var datetime = date.getFullYear()
	                + "-"// "年"
	                + ((date.getMonth() + 1) > 10 ? (date.getMonth() + 1) : "0"
	                        + (date.getMonth() + 1))
	                + "-"// "月"
	                + (date.getDate() < 10 ? "0" + date.getDate() : date
	                        .getDate());
	        return datetime;
	    },
	    /**
	     * 格式化日期（含时间"00:00:00"）
	     */
	    formatterDate2 : function(date) {
	        var datetime = date.getFullYear()
	                + "-"// "年"
	                + ((date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : "0"
	                        + (date.getMonth() + 1))
	                + "-"// "月"
	                + (date.getDate() < 10 ? "0" + date.getDate() : date
	                        .getDate()) + " " + 
	                        (date.getHours()<10?"0"+date.getHours():date.getHours()) +":"+
	                        (date.getMinutes()<10?"0"+date.getMinutes():date.getMinutes())+":"+
	                        (date.getSeconds()<10?"0"+date.getSeconds():date.getSeconds());
	        return datetime;
	    },
	    /**
	     * 格式化日期（不含时间）
	     */
	    formatterDate3 : function(date) {
	        var datetime = date.getMonth() + 1
	                + "月"// "月"
	                + date.getDate() + '日';
	        return datetime;
	    },
	    /**
	     * 格式化日期（不含时间），2016.11.09
	     */
	    formatterDate4 : function(date) {
	        var datetime = date.getFullYear()
	                + "."// "年"
	                + ((date.getMonth() + 1) > 10 ? (date.getMonth() + 1) : ""
	                        + (date.getMonth() + 1))
	                + "."// "月"
	                + (date.getDate() < 10 ? "" + date.getDate() : date
	                        .getDate());
	        return datetime;
	    },
	    /**
	     * 格式化去日期（含时间）
	     */
	    formatterDateTime : function(date) {
	        var datetime = date.getFullYear()
	                + "-"// "年"
	                + ((date.getMonth() + 1) > 10 ? (date.getMonth() + 1) : "0"
	                        + (date.getMonth() + 1))
	                + "-"// "月"
	                + (date.getDate() < 10 ? "0" + date.getDate() : date
	                        .getDate())
	                + " "
	                + (date.getHours() < 10 ? "0" + date.getHours() : date
	                        .getHours())
	                + ":"
	                + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date
	                        .getMinutes())
	                + ":"
	                + (date.getSeconds() < 10 ? "0" + date.getSeconds() : date
	                        .getSeconds());
	        return datetime;
	    },
	    /**
	     * 时间比较{结束时间大于开始时间}
	     */
	    compareDateEndTimeGTStartTime : function(startTime, endTime) {
	        return ((new Date(endTime.replace(/-/g, "/"))) >= (new Date(
	                startTime.replace(/-/g, "/"))));
	    },
	    /**
	     * 验证开始时间合理性{开始时间不能小于当前时间{X}个月}
	     */
	    compareRightStartTime : function(month, startTime) {
	        var now = formatterDayAndTime(new Date());
	        var sms = new Date(startTime.replace(/-/g, "/"));
	        var ems = new Date(now.replace(/-/g, "/"));
	        var tDayms = month * 30 * 24 * 60 * 60 * 1000;
	        var dvalue = ems - sms;
	        if (dvalue > tDayms) {
	            return false;
	        }
	        return true;
	    },
	    /**
	     * 验证开始时间合理性{结束时间不能小于当前时间{X}个月}
	     */
	    compareRightEndTime : function(month, endTime) {
	        var now = formatterDayAndTime(new Date());
	        var sms = new Date(now.replace(/-/g, "/"));
	        var ems = new Date(endTime.replace(/-/g, "/"));
	        var tDayms = month * 30 * 24 * 60 * 60 * 1000;
	        var dvalue = sms - ems;
	        if (dvalue > tDayms) {
	            return false;
	        }
	        return true;
	    },
	    /**
	     * 验证开始时间合理性{结束时间与开始时间的间隔不能大于{X}个月}
	     */
	    compareEndTimeGTStartTime : function(month, startTime, endTime) {
	        var sms = new Date(startTime.replace(/-/g, "/"));
	        var ems = new Date(endTime.replace(/-/g, "/"));
	        var tDayms = month * 30 * 24 * 60 * 60 * 1000;
	        var dvalue = ems - sms;
	        if (dvalue > tDayms) {
	            return false;
	        }
	        return true;
	    },
	    /**
	     * 获取最近几天[开始时间和结束时间值,时间往前推算]
	     */
	    getRecentDaysDateTime : function(day) {
	        var daymsTime = day * 24 * 60 * 60 * 1000;
	        var yesterDatsmsTime = this.getCurrentMsTime() - daymsTime;
	        var startTime = this.longMsTimeConvertToDateTime(yesterDatsmsTime);
	        var pastDate = this.formatterDate2(new Date(startTime));
	        var nowDate = this.formatterDate2(new Date());
	        var obj = {
	            startTime : pastDate,
	            endTime : nowDate
	        };
	        return obj;
	    },
	    /**
	     * 获取今天[开始时间和结束时间值]
	     */
	    getTodayDateTime : function() {
	        var daymsTime = 24 * 60 * 60 * 1000;
	        var tomorrowDatsmsTime = this.getCurrentMsTime() + daymsTime;
	        var currentTime = this.longMsTimeConvertToDateTime(this.getCurrentMsTime());
	        var termorrowTime = this.longMsTimeConvertToDateTime(tomorrowDatsmsTime);
	        var nowDate = this.formatterDate2(new Date(currentTime));
	        var tomorrowDate = this.formatterDate2(new Date(termorrowTime));
	        var obj = {
	            startTime : nowDate,
	            endTime : tomorrowDate
	        };
	        return obj;
	    },
	    /**
	     * 获取明天[开始时间和结束时间值]
	     */
	    getTomorrowDateTime : function() {
	        var daymsTime = 24 * 60 * 60 * 1000;
	        var tomorrowDatsmsTime = this.getCurrentMsTime() + daymsTime;
	        var termorrowTime = this.longMsTimeConvertToDateTime(tomorrowDatsmsTime);
	        var theDayAfterTomorrowDatsmsTime = this.getCurrentMsTime()+ (2 * daymsTime);
	        var theDayAfterTomorrowTime = this.longMsTimeConvertToDateTime(theDayAfterTomorrowDatsmsTime);
	        var pastDate = this.formatterDate2(new Date(termorrowTime));
	        var nowDate = this.formatterDate2(new Date(theDayAfterTomorrowTime));
	        var obj = {
	            startTime : pastDate,
	            endTime : nowDate
	        };
	        return obj;
	    },
	    /**
	     * 在目标时间上加上指定的分钟
	     */
	    plusMinutes:function(time,minutes){
	    	var time_ts=time.getTime();
	    	var nt=new Date();
	    	nt.setTime(time_ts+60*1000*minutes);
	    	return nt;
	    },
	    formatDateString:function(date)
		{   
		    var arr = date.split(/[- :T]/), // from your example var date = "2012-11-14T06:57:36+0000";
		    date = new Date(arr[0], arr[1]-1, arr[2], arr[3], arr[4], 00);
		    return date;
		    //newDate = date.toString("MMMM");
		    //.. do further stuff here  
		}
	};
	return TimeObjectUtil;
});