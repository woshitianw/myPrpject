package com.geohey.web.controller;


import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.geohey.db.dao.QueryParam;
import com.geohey.db.dao.StationDao;
import com.geohey.db.entry.IssueWordFile;
import com.geohey.db.entry.Station;
import com.geohey.listener.SpringWrapper;
import com.geohey.radar.Reader;
import com.geohey.utils.GdalUtil;
import com.geohey.utils.PropertiesUtils;
import com.geohey.web.pojo.Contourline;
import com.geohey.web.pojo.RestResult;

import freemarker.template.Configuration;
import freemarker.template.Template;

import org.apache.ibatis.session.SqlSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by gyang on 16-4-1.
 */
@Controller
public class StationController {
	private static final Logger LOGGER = LoggerFactory.getLogger(StationController.class);
    @Resource
    private StationDao stationDao;
    private Configuration configuration = null;

    /**
     * 根据经纬度和半径查询自动站
     **/
    @RequestMapping(value = "/station/query.do")
    public void queryStations(HttpServletRequest request, HttpServletResponse response) throws IOException {
        RestResult clientResult = RestResult.build();
        response.setHeader("Content-type", "application/json;charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type,x-requested-with,Authorization,Access-Control-Allow-Origin");
        response.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Max-Age","360");
        String lon = request.getParameter("lon");//经度
        String lat = request.getParameter("lat");//纬度
        if(lon == null || lon.trim().equals("")){
            clientResult.setErrormsg("经度为空");
        }else if(lat == null || lat.trim().equals("")){
            clientResult.setErrormsg("纬度为空");
        }
        else {
            try{
                double r = Double.valueOf(request.getParameter("r"));//半径
                r = r*1000;
                QueryParam param = new QueryParam();
                param.setR(r);
                param.setX(Double.parseDouble(lon));
                param.setY(Double.parseDouble(lat));
                List<String> ids = stationDao.queryByBuffer(param);
                RestResult.ok(clientResult,ids);
            }
            catch (Exception ex){
                clientResult.setErrormsg(ex.getMessage());
                ex.printStackTrace();
            }
        }
        response.getWriter().write(JSON.toJSONString(clientResult));
        response.getWriter().flush();
    }
    
    /**
     * 获取所有自动站信息
     **/
    @RequestMapping(value = "/station/getall.do")
    public void getAllStations(HttpServletRequest request, HttpServletResponse response) throws IOException {
        RestResult clientResult = RestResult.build();
        response.setHeader("Content-type", "application/json;charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type,x-requested-with,Authorization,Access-Control-Allow-Origin");
        response.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Max-Age","360");
        try{
            List<Station> lst = stationDao.getAll();
            //JSONObject result = new JSONObject();
            JSONArray resultLst = new JSONArray();
            for(Station station : lst){
            	JSONObject stationJSON = new JSONObject();
            	stationJSON.put("station_Id_C", station.getId());
            	stationJSON.put("admin_Code_CHN", station.getAdmin_code_chn());
            	stationJSON.put("station_Name", station.getName());
            	String wkt = station.getWkt();
            	wkt = wkt.substring(6, wkt.length()-1);
            	String[] coords = wkt.split(" ");
            	stationJSON.put("lon", coords[0]);
            	stationJSON.put("lat", coords[1]);
            	resultLst.add(stationJSON);
            }
            //result.put("station", resultLst);
            RestResult.ok(clientResult,resultLst);
        }
        catch (Exception ex){
            clientResult.setErrormsg(ex.getMessage());
            ex.printStackTrace();
        }
        response.getWriter().write(JSON.toJSONString(clientResult));
        response.getWriter().flush();
    }


    /**
     * 从泰达瑞华接口获取自动站，并作更新
     **/
    @RequestMapping(value = "/station/update.do")
    public void getStation(HttpServletRequest request, HttpServletResponse response) throws IOException {
        BufferedReader in = null;
        String result = "";
        RestResult clientResult = RestResult.build();
        response.setHeader("Content-type", "application/json;charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type,x-requested-with,Authorization,Access-Control-Allow-Origin");
        response.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Max-Age","360");
        try{
            String serviceUrl = PropertiesUtils.getProperties("station.service");
            URL realUrl = new URL(serviceUrl);
            URLConnection connection = realUrl.openConnection();
            connection.setRequestProperty("accept", "*/*");
            connection.setRequestProperty("connection", "Keep-Alive");
            connection.setRequestProperty("user-agent",
                    "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)");
            connection.setRequestProperty("Charset", "utf-8");
            // 建立实际的连接
            connection.connect();
            in = new BufferedReader(new InputStreamReader(
                    connection.getInputStream(),"utf-8"));
            String line;
            while ((line = in.readLine()) != null) {
                result += line;
            }
            JSONObject objResult = (JSONObject) JSON.parse(result);
            if(objResult.get("station") instanceof JSONArray){
                stationDao.deleteAll();
                JSONArray stations = (JSONArray) objResult.get("station");
                for(int  i = 0;i<stations.size();i++){
                    JSONObject stationJSON = stations.getJSONObject(i);
                    Station station = new Station();
                    station.setAdmin_code_chn(stationJSON.getString("admin_Code_CHN"));

                    station.setWkt("POINT("+ stationJSON.getString("lon") +" "+ stationJSON.getString("lat")+")");
                    station.setName(stationJSON.getString("station_Name"));
                    station.setId(stationJSON.getString("station_Id_C"));
                    stationDao.insert(station);
                }
            }
            //System.out.println("更新站点成功");

            RestResult.ok(clientResult,"更新站点成功");
            //clientResult.ok
            response.getWriter().write(JSON.toJSONString(clientResult));
            response.getWriter().flush();
        }
        catch (Exception ex){
            clientResult.setErrormsg(ex.getMessage());
            ex.printStackTrace();
            response.getWriter().write(JSON.toJSONString(clientResult));
            response.getWriter().flush();
        }
    }
    
    /**
     * 获取最新的雷达数据信息
     **/
    @RequestMapping(value = "/radar/querylatest.do")
    public void getRadar(HttpServletRequest request, HttpServletResponse response) throws IOException {
        RestResult clientResult = RestResult.build();
        response.setHeader("Content-type", "application/json;charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type,x-requested-with,Authorization,Access-Control-Allow-Origin");
        response.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Max-Age","360");
        try{
        	String radarDir = PropertiesUtils.getProperties("radaroutdir");
        	
            radarDir = radarDir + "CR" + File.separator + "37";
            File pngFile = Reader.getLatestFile(radarDir, ".png");
            JSONObject result = new JSONObject();
            
            if(pngFile.exists()){
            	String imageName = pngFile.getName();
            	String[] strings = imageName.split(".");
            	//String dataTime = strings[0].substring(0, 3) + "-" + strings[0].substring(4, 5) + "-" + strings[0].substring(6, 7) + " " + ""
            	result.put("image",pngFile.getName());
            	String imagePath = pngFile.getAbsolutePath();
            	String jsonFilePath = imagePath.substring(0, imagePath.indexOf(".png"));
            	jsonFilePath = jsonFilePath + ".json";
            	File jsonFile = new File(jsonFilePath);
            	if(jsonFile.exists()){
            		InputStreamReader read = new InputStreamReader(
                        new FileInputStream(jsonFile),"utf-8");//考虑到编码格式
                        BufferedReader bufferedReader = new BufferedReader(read);
                        String lineTxt = "";
                        String warnContent = "";
                        while((lineTxt = bufferedReader.readLine()) != null){
                        	warnContent = warnContent + lineTxt;
                        }
                        result.put("warnpoints", JSONObject.parse(warnContent));
                        read.close();
            	}
            	
            }
            clientResult.setCode(RestResult.RESULT_OK);
            clientResult.setContent(result);
        }catch(Exception ex){
        	clientResult.setErrormsg(ex.getMessage());
        	LOGGER.error("/radar/querylatest.do error",ex);
        }
        
        response.getWriter().write(JSON.toJSONString(clientResult));
        response.getWriter().flush();
    }
    
    /**
     * 生成雨情制作的等值线图
     **/
    @RequestMapping(value = "/contourline/create.do")
    public void createContourline(HttpServletRequest request, HttpServletResponse response) throws IOException {
        RestResult clientResult = RestResult.build();
        response.setHeader("Content-type", "application/json;charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type,x-requested-with,Authorization,Access-Control-Allow-Origin");
        response.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Max-Age","360");
        try{
        	String pointsString = request.getParameter("points");
        	String[] pointTags = pointsString.split(",");
        	int size = pointTags.length;
        	double[][] points = new double[size/3][3];
        	int index = 0;
        	for(int i = 0;i<size;i = i+3){
        		points[index][0] = Double.valueOf(pointTags[i]);
        		points[index][1] = Double.valueOf(pointTags[i+1]);
        		points[index][2] = Double.valueOf(pointTags[i+2]);
        		index++;
        	}
        	try{
        		Contourline result = GdalUtil.create(points);
        		clientResult.setCode(RestResult.RESULT_OK);
                clientResult.setContent(result);
        	}catch(Exception ex){
        		clientResult.setCode(RestResult.RESULT_SERVER_ERROR);
                clientResult.setContent(ex.getMessage());
        	}
        }catch(Exception ex){
        	ex.printStackTrace();
        	clientResult.setErrormsg(ex.getMessage());
        	LOGGER.error("/contourline/create error",ex);
        }
        
        response.getWriter().write(JSON.toJSONString(clientResult));
        response.getWriter().flush();
    }
    
    /**
     * 获取雨情制作的期刊号
     **/
    @RequestMapping(value = "/contourline/getissue.do")
    public void getQYZZIssue(HttpServletRequest request, HttpServletResponse response) throws IOException {
        RestResult clientResult = RestResult.build();
        response.setHeader("Content-type", "application/json;charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type,x-requested-with,Authorization,Access-Control-Allow-Origin");
        response.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Max-Age","360");
        try{
        	int issue = stationDao.getQYZZIssue();
        	RestResult.ok(clientResult, issue);
        }catch(Exception ex){
        	clientResult.setErrormsg(ex.getMessage());
        	LOGGER.error("/contourline/getissue error",ex);
        }
        
        response.getWriter().write(JSON.toJSONString(clientResult));
        response.getWriter().flush();
    }
    
    /**
     * 增加雨情制作的期刊号
     **/
    @RequestMapping(value = "/contourline/addissue.do")
    public void addQYZZIssue(HttpServletRequest request, HttpServletResponse response) throws IOException {
        RestResult clientResult = RestResult.build();
        response.setHeader("Content-type", "application/json;charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type,x-requested-with,Authorization,Access-Control-Allow-Origin");
        response.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Max-Age","360");
        try{
        	stationDao.addQYZZIssue();
        	int issue = stationDao.getQYZZIssue();
        	RestResult.ok(clientResult, issue);
        }catch(Exception ex){
        	clientResult.setErrormsg(ex.getMessage());
        	LOGGER.error("/contourline/addissue error",ex);
        }
        
        response.getWriter().write(JSON.toJSONString(clientResult));
        response.getWriter().flush();
    }
    
    /**
     * 更新雨情制作的期刊号
     **/
    @RequestMapping(value = "/contourline/updateissue.do")
    public void updateQYZZIssue(HttpServletRequest request, HttpServletResponse response) throws IOException {
        RestResult clientResult = RestResult.build();
        response.setHeader("Content-type", "application/json;charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type,x-requested-with,Authorization,Access-Control-Allow-Origin");
        response.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Max-Age","360");
        try{
        	int issue = Integer.valueOf(request.getParameter("issue"));
        	stationDao.updateQYZZIssue(issue);
        	RestResult.ok(clientResult, "ok");
        }catch(Exception ex){
        	clientResult.setErrormsg(ex.getMessage());
        	LOGGER.error("/contourline/addissue error",ex);
        }
        
        response.getWriter().write(JSON.toJSONString(clientResult));
        response.getWriter().flush();
    }
    
    /**
     * 输出雨情制作word、txt文档
     **/
    @RequestMapping(value = "/contourline/outputword.do")
    public void outputYQZZWordFile(HttpServletRequest request, HttpServletResponse response) throws IOException {
        RestResult clientResult = RestResult.build();
        response.setHeader("Content-type", "application/json;charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type,x-requested-with,Authorization,Access-Control-Allow-Origin");
        response.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Max-Age","360");
        Writer out = null;
        try{
        	if(configuration == null){
        		configuration = new Configuration();
                configuration.setDefaultEncoding("UTF-8");
        	}
        	
        	String issue = request.getParameter("issue");
        	String reason = request.getParameter("reason");
        	String year = request.getParameter("year");
        	String alldate = request.getParameter("alldate");
        	String timeduring = request.getParameter("timeduring");
        	String pinlv = request.getParameter("pinlv");
        	String all_yl = request.getParameter("all_yl");
        	String region_yl = request.getParameter("region_yl");
        	String max_place = request.getParameter("max_place");
        	String yl_value = request.getParameter("yl_value");
        	String start_time = request.getParameter("start_time");
        	String end_time = request.getParameter("end_time");
        	String title = request.getParameter("title");
        	String image = request.getParameter("image");
        	String stations = request.getParameter("stations");
        	String type = request.getParameter("type");
        	String startdate = request.getParameter("startdate");
        	String enddate = request.getParameter("enddate");
        	
        	String templatedir = PropertiesUtils.getProperties("contourline.workspace") + File.separator + "template";
	        configuration.setDirectoryForTemplateLoading(new File(templatedir));
	        Template template = null;
	        String txtTemplate = "";
	        File txtFile = null;
        	
        	txtFile = new File(templatedir + File.separator + type+".txt");
        	InputStreamReader read = new InputStreamReader(
                new FileInputStream(txtFile),"gb2312");//考虑到编码格式
            BufferedReader bufferedReader = new BufferedReader(read);
            String lineTxt = null;
            while((lineTxt = bufferedReader.readLine()) != null){
            	txtTemplate = txtTemplate+lineTxt;
            }
            read.close();
        	
        	Map<String, Object> root = new HashMap<String, Object>();
        	root.put("param_reason",reason);
	        root.put("year", year);
	        root.put("issue", issue);
	        root.put("alldate", alldate);
	        root.put("timeduring", timeduring);
	        txtTemplate = txtTemplate.replace("${timeduring}", timeduring);
	        root.put("pinlv", pinlv);
	        txtTemplate = txtTemplate.replace("${pinlv}", pinlv);
	        root.put("all_yl",all_yl);
	        txtTemplate = txtTemplate.replace("${all_yl}", all_yl);
	        root.put("region_yl", region_yl);
	        root.put("max_place", max_place);
	        txtTemplate = txtTemplate.replace("${max_place}", max_place);
	        root.put("yl_value", yl_value);
	        txtTemplate = txtTemplate.replace("${yl_value}", yl_value);
	        root.put("start_time", start_time);
	        txtTemplate = txtTemplate.replace("${start_time}", start_time);
	        root.put("end_time", end_time);
	        txtTemplate = txtTemplate.replace("${end_time}", end_time);
	        root.put("title", title);
	        root.put("image",image);
	        //JSONArray stationArray = (JSONArray) JSON.parse(stations);
	        String[] stationInfos = stations.split(",");
	        
	        //获取各区县的雨量数据
	        Map<String,String> qxRain = null;
	        if(type.equals("fxqb")){
	        	qxRain = getQxNoRain(startdate,enddate);
	        } else {
	        	qxRain = getQxRain(startdate,enddate);
	        }
	        
	        for(String key : qxRain.keySet()){
	        	root.put(key,qxRain.get(key));
	        }
	        
	        if(type.equals("yb")){
	        	template = configuration.getTemplate("yb.xml");
	        	for(int i=0;i<stationInfos.length;i=i+2){
	        		root.put(stationInfos[i],stationInfos[i+1]);
	        	}
	        }
	        else if(type.equals("xqb")){
	        	template = configuration.getTemplate("xqb.xml");
	        	Map<String,String> ljyl = getXQLJ();
	        	for(int i=0;i<stationInfos.length;i=i+2){
	        		if(ljyl.containsKey(stationInfos[i])){
	        			root.put(stationInfos[i],stationInfos[i+1]+"（"+ljyl.get(stationInfos[i])+"）");
	        		}
	        		else{
	        			root.put(stationInfos[i],stationInfos[i+1]+"（0.0）");
	        		}
	        	}
	        }
	        else if(type.equals("fxqb")){
	        	template = configuration.getTemplate("fxqb.xml");
	        	for(int i=0;i<stationInfos.length;i=i+2){
	        		root.put(stationInfos[i],stationInfos[i+1]);
	        	}
	        }
	        else if(type.equals("zkb")){
	        	template = configuration.getTemplate("zkb.xml");
	        	for(int i=0;i<stationInfos.length;i=i+2){
	        		root.put(stationInfos[i],stationInfos[i+1]);
	        	}
	        }
	        for(int i=0;i<stationInfos.length;i=i+2){
	        	txtTemplate = txtTemplate.replace("${"+stationInfos[i]+"}", stationInfos[i+1]);
        		//root.put(stationInfos[i],stationInfos[i+1]);
        	}
	        System.out.println(txtTemplate);
	        String outdir = PropertiesUtils.getProperties("contourline.outdir") + File.separator + "wordfiles";
	        String fileName = String.valueOf(System.currentTimeMillis());
	        IssueWordFile wordFile = new IssueWordFile();
	        wordFile.setCreatetime(new Date());
	        wordFile.setFilename(fileName+".doc");
	        wordFile.setIssue(Integer.valueOf(issue));
	        wordFile.setIssuetype(type);
	        stationDao.insertIssueWordFile(wordFile);
	        File outFile = new File(outdir + File.separator + fileName+".doc");
	        if(outFile.getParentFile().exists() == false){
	        	outFile.getParentFile().mkdir();
	        }
	        out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(outFile),"UTF-8"));
	        template.process(root, out);
	        //输出txt
	        FileOutputStream o=null; 
	        o = new FileOutputStream(outdir + File.separator + fileName+".txt");  
	        o.write(txtTemplate.getBytes("utf-8"));  
	        o.close();  
        	RestResult.ok(clientResult, wordFile);
        }catch(Exception ex){
        	ex.printStackTrace();
        	clientResult.setErrormsg(ex.getMessage());
        	LOGGER.error("/contourline/outputword.do error",ex);
        }
        finally{
        	if(out != null){
	        	out.close();
	        }
        }
        response.getWriter().write(JSON.toJSONString(clientResult));
        response.getWriter().flush();
    }
    
    /**
     * 获取区县雨量数据-汛期
     **/
    private Map<String, String> getQxRain(String start,String end){
    	BufferedReader in = null;
    	String content = "";
    	Map<String, String> result = new HashMap<String, String>();
    	try{
        	String ip = PropertiesUtils.getProperties("proxy.url.host");
            String port = PropertiesUtils.getProperties("proxy.url.port");
            String url = "http://" + ip + ":"+port+"/alertPro-admin-web/services/station/getgetDistrictPreSum?star_time="+URLEncoder.encode(start)+"&end_time="+URLEncoder.encode(end);
            URL realUrl = new URL(url);
            URLConnection connection = realUrl.openConnection();
            // 设置通用的请求属性
            connection.setRequestProperty("accept", "*/*");
            connection.setRequestProperty("connection", "Keep-Alive");
            connection.setRequestProperty("user-agent",
                    "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)");
            // 建立实际的连接
            connection.connect();
            in = new BufferedReader(new InputStreamReader(
                    connection.getInputStream(),"UTF-8"));
            String line;
            while ((line = in.readLine()) != null) {
            	content += line;
            }
            JSONObject jsonResult = (JSONObject) JSONObject.parse(content);
            JSONArray jsonArray = jsonResult.getJSONArray("districtPre");
            for(int i = 0;i<jsonArray.size();i++){
            	JSONObject item = (JSONObject) jsonArray.get(i);
            	result.put("A"+item.getString("code"), item.getString("sum_pre"));
            }
        }catch(Exception ex){
        	ex.printStackTrace();
        }
        finally{
        	if(in != null){
        		try {
					in.close();
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
        	}
        }
        return result;
    }
    
    /**
     * 获取区县雨量数据-非汛期
     **/
    private Map<String, String> getQxNoRain(String start,String end){
    	BufferedReader in = null;
    	String content = "";
    	Map<String, String> result = new HashMap<String, String>();
    	try{
        	String ip = PropertiesUtils.getProperties("proxy.url.host");
            String port = PropertiesUtils.getProperties("proxy.url.port");
            String url = "http://" + ip + ":"+port+"/alertPro-admin-web/services/station/getNonfloodagePre?star_time="+URLEncoder.encode(start)+"&end_time="+URLEncoder.encode(end);
            URL realUrl = new URL(url);
            URLConnection connection = realUrl.openConnection();
            // 设置通用的请求属性
            connection.setRequestProperty("accept", "*/*");
            connection.setRequestProperty("connection", "Keep-Alive");
            connection.setRequestProperty("user-agent",
                    "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)");
            // 建立实际的连接
            connection.connect();
            in = new BufferedReader(new InputStreamReader(
                    connection.getInputStream(),"UTF-8"));
            String line;
            while ((line = in.readLine()) != null) {
            	content += line;
            }
            JSONObject jsonResult = (JSONObject) JSONObject.parse(content);
            JSONArray jsonArray = jsonResult.getJSONArray("districtPre");
            for(int i = 0;i<jsonArray.size();i++){
            	JSONObject item = (JSONObject) jsonArray.get(i);
            	result.put("A"+item.getString("code"), item.getString("sum_pre"));
            }
        }catch(Exception ex){
        	ex.printStackTrace();
        }
        finally{
        	if(in != null){
        		try {
					in.close();
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
        	}
        }
        return result;
    }
    
    /**
     * 获取汛期累计数据
     **/
    private Map<String, String> getXQLJ(){
    	BufferedReader in = null;
    	String content = "";
    	Map<String, String> result = new HashMap<String, String>();
    	try{
        	String ip = PropertiesUtils.getProperties("proxy.url.host");
            String port = PropertiesUtils.getProperties("proxy.url.port");
            String url = "http://" + ip + ":"+port+"/alertPro-admin-web/services/station/getFloodSeasonPreSum";
            URL realUrl = new URL(url);
            URLConnection connection = realUrl.openConnection();
            // 设置通用的请求属性
            connection.setRequestProperty("accept", "*/*");
            connection.setRequestProperty("connection", "Keep-Alive");
            connection.setRequestProperty("user-agent",
                    "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)");
            // 建立实际的连接
            connection.connect();
            in = new BufferedReader(new InputStreamReader(
                    connection.getInputStream(),"UTF-8"));
            String line;
            while ((line = in.readLine()) != null) {
            	content += line;
            }
            JSONObject jsonResult = (JSONObject) JSONObject.parse(content);
            JSONArray jsonArray = jsonResult.getJSONArray("sumPre");
            for(int i = 0;i<jsonArray.size();i++){
            	JSONObject item = (JSONObject) jsonArray.get(i);
            	String code = item.getString("station_Id_C");
            	if(code.indexOf("A") == -1){
            		code = "A"+code;
            	}
            	result.put(code, item.getString("sum_pre"));
            }
        }catch(Exception ex){
        	ex.printStackTrace();
        }
        finally{
        	if(in != null){
        		try {
					in.close();
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
        	}
        }
        return result;
    }
    
    /**
     * 获取所有输出的word文档列表
     * @param request
     * @param response
     * @throws IOException
     */
    @RequestMapping(value = "/contourline/getallwordfiles.do")
    public void getAllwordfiles(HttpServletRequest request, HttpServletResponse response) throws IOException {
        RestResult clientResult = RestResult.build();
        response.setHeader("Content-type", "application/json;charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type,x-requested-with,Authorization,Access-Control-Allow-Origin");
        response.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Max-Age","360");
        try{
        	List<IssueWordFile> files = stationDao.getAllWordFiles();
        	RestResult.ok(clientResult, files);
        }catch(Exception ex){
        	clientResult.setErrormsg(ex.getMessage());
        	LOGGER.error("/contourline/addissue error",ex);
        }
        
        response.getWriter().write(JSON.toJSONString(clientResult));
        response.getWriter().flush();
    }
}
