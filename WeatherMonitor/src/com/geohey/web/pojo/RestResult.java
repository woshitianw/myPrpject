package com.geohey.web.pojo;

/**
 * Created by wenyb on 2016/10/17.
 */
public class RestResult {
    /**
     * 请求成功
     */
    public static final int RESULT_OK = 200;
    /**
     * 客户端请求错误
     */
    public static final int RESULT_CLIENT_ERROR = 404;
    /**
     * 服务器端错误
     */
    public static final int RESULT_SERVER_ERROR = 500;
    /**
     * 服务器端错误，没有该接口的方法
     */
    public static final int RESULT_SERVER_ERROR_NOFUNCTION = 50001;
    /**
     * 用户未登录
     */
    public static final int RESULT_USER_NOLOGIN = 40001;
    /**
     * 数据不存在
     */
    public static final int RESULT_DATA_NO_EXSIT = 40002;

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getErrormsg() {
        return errormsg;
    }

    public static RestResult build(){
        RestResult result = new RestResult();
        result.setCode(RESULT_CLIENT_ERROR);
        return result;
    }

    public static void ok(RestResult result,Object content){
        result.setCode(RESULT_OK);
        result.setErrormsg(null);
        result.setContent(content);
    }

    private RestResult(){

    }

    public void setErrormsg(String errormsg) {
        this.errormsg = errormsg;
    }

    private int code;
    private String errormsg;
    private Object content;

    public Object getContent() {
        return content;
    }

    public void setContent(Object content) {
        this.content = content;
    }
}
