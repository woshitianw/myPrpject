/**
 * @author wenyb
 * @date 2016/7/28
 * @function 全局变量管理
 */
define(["jquery"],function ($) {
    var GlobalParams = {
    	/**
    	 * 获取全局的事件实例
    	 * @param {Object} ignoreTop  是否忽略最顶层的window
    	 */
        getEventInstance:function(){
        	var windowObj=null;
        	windowObj = this.getTopWindow();
			if(windowObj == null)
				return null;
        	if(windowObj['_custom_global_event'] == null){
        		windowObj['_custom_global_event']={name:'global event instance'};
        	}
        	return windowObj['_custom_global_event'];
        },
        getTopJQuery:function(){
        	var windowObj=null;
        	windowObj = this.getTopWindow();
			if(windowObj == null)
				return null;
        	if(windowObj['_custom_top_jquery'] == null){
        		windowObj['_custom_top_jquery']=windowObj.topJQuery;
        		//windowObj['_custom_global_event']={name:'event instance'};
        	}
        	return windowObj['_custom_top_jquery'];
        },
        getTopWindow:function(){
        	if(window == null){
        		return null;
        	}
        	 var obj=window.self;
        	 var loopNum = 0;//循环次数，如果大于该次数不再查找，避免死循环。
			  while(true && loopNum<5)
			  {
			   if(obj.document.getElementById("_self_top_tag"))
			   {
			   	return obj;
			   }
			   obj=obj.window.parent;
			   loopNum++;
  			}
			  return obj;
        },
        //设置监测站信息
        setStationInfos:function(datas){
        	var windowObj=null;
        	windowObj = this.getTopWindow();
			// if(windowObj == null)
			// 	return null;
        	windowObj['_custom_global_stationinfos'] = datas;
        },
        //设置监测站信息
        getStationInfos:function(){
        	var windowObj=null;
        	windowObj = this.getTopWindow();
			// if(windowObj == null)
			// 	return null;
        	return windowObj == null?[]:windowObj['_custom_global_stationinfos'];
        },
        //设置数据到达率时间
        setArrivalTime:function(time){
        	var windowObj = null;
        	windowObj = this.getTopWindow();
        	windowObj['_custom_global_arrivaltime'] = time;
        },
        //获取数据到达率时间
        getArrivalTime:function(){
        	var windowObj = null;
        	windowObj = this.getTopWindow();
        	return windowObj['_custom_global_arrivaltime'];
        },
        //获取企业列表
        getQyList:function(){
        	var windowObj = null;
        	windowObj = this.getTopWindow();
        	return windowObj['_custom_global_qylist'];
        },
        //设置企业列表
        setQyList:function(list){
        	var windowObj = null;
        	windowObj = this.getTopWindow();
        	windowObj['_custom_global_qylist'] = list;
        },
        setUserName:function(user){
            var windowObj = null;
            windowObj = this.getTopWindow();
            windowObj['_custom_global_user'] = user;
        },
        getUserName:function(){
            var windowObj = null;
            windowObj = this.getTopWindow();
            return windowObj['_custom_global_user']
        }
    };
    return GlobalParams;
});
