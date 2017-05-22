package com.geohey.radar;

import com.alibaba.fastjson.JSONObject;
import com.geohey.utils.PropertiesUtils;
import org.apache.commons.lang3.time.StopWatch;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URL;
import java.net.URLConnection;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashSet;
import java.util.Timer;
import java.util.TimerTask;

public class ScheduleServlet extends HttpServlet {

	private static final Logger LOGGER = LoggerFactory.getLogger(ScheduleServlet.class);

	/**
	 * Constructor of the object.
	 */
	public ScheduleServlet() {
		super();
	}

	/**
	 * Destruction of the servlet. <br>
	 */
	public void destroy() {
		super.destroy(); // Just puts "destroy" string in log
		// Put your code here
	}

	/**
	 * The doGet method of the servlet. <br>
	 *
	 * This method is called when a form has its tag value method equals to get.
	 * 
	 * @param request the request send by the client to the server
	 * @param response the response send by the server to the client
	 * @throws ServletException if an error occurred
	 * @throws IOException if an error occurred
	 */
	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		//updateRadarData("CR\\37");
		final String radardir = PropertiesUtils.getProperties("radardir");
		final String radaroutdir = PropertiesUtils.getProperties("radaroutdir");
		updateRadarData(radardir,radaroutdir,"CR\\37");
		response.getWriter().print("ok");
		response.getWriter().flush();
	}

	/**
	 * The doPost method of the servlet. <br>
	 *
	 * This method is called when a form has its tag value method equals to post.
	 * 
	 * @param request the request send by the client to the server
	 * @param response the response send by the server to the client
	 * @throws ServletException if an error occurred
	 * @throws IOException if an error occurred
	 */
	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		response.setContentType("text/html");
		PrintWriter out = response.getWriter();
		out
				.println("<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\">");
		out.println("<HTML>");
		out.println("  <HEAD><TITLE>A Servlet</TITLE></HEAD>");
		out.println("  <BODY>");
		out.print("    This is ");
		out.print(this.getClass());
		out.println(", using the POST method");
		out.println("  </BODY>");
		out.println("</HTML>");
		out.flush();
		out.close();
	}

	/**
	 * Initialization of the servlet. <br>
	 *
	 * @throws ServletException if an error occurs
	 */
	public void init(ServletConfig servletConfig) throws ServletException {
		// Put your code here
		
		final String radaroutdir = PropertiesUtils.getProperties("radaroutdir");

//		System.out.println("ScheduleServlet init");
//		updateRadarData(radardir,radaroutdir,"CR\\37");
		
		TimerTask task = new TimerTask() {  
            @Override  
            public void run() {  
                // task to run goes here
				StopWatch stopWatch = new StopWatch();
				stopWatch.start();
				LOGGER.info("update radar data.....");
				String radardir = PropertiesUtils.getProperties("radardir");
				Date now = new Date();
				SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
				String dateString = sdf.format(now);
				radardir = radardir + File.separator + "Z9220-" + dateString + File.separator;
				System.out.println("update radar data at "+radardir+".....");
				try {
					updateRadarData(radardir, radaroutdir, "CR\\37");
				} catch (Exception e) {
					LOGGER.error("update radar data task error.", e);
					e.printStackTrace();
				}
				stopWatch.stop();
				System.out.println(String.format("update radar data compeleted, time = %d", stopWatch.getTime()));
				LOGGER.info("update radar data compeleted, time = {}", stopWatch.getTime());
            }
        };  
        Timer timer = new Timer();  
        long delay = 0;  
        long intevalPeriod = 60 * 1000 * 1;  
        // schedules the task to be run in an interval  
        timer.scheduleAtFixedRate(task, delay, intevalPeriod);  
	}
	
	public static void main(String args[]){
		String radardir = "E:\\03_work\\qx\\Z9220-20160918\\";
		String radaroutdir = "E:\\03_work\\qx\\Z9220-20160918\\output\\";
		updateRadarData(radardir,radaroutdir,"CR\\37");
	}
	
	/**
	 * 更新雷达数据
	 */
	public static void updateRadarData(String radardir,String radaroutdir,String productname){
		String orignOutDir = radaroutdir;
		radardir = radardir + productname;
		radaroutdir = radaroutdir + productname;
		File radardirFile = new File(radardir);
		File outdirFile = new File(radaroutdir);
		
		
		//先读取已经转换过的所有数据
		FileFilter filefilter = new FileFilter() {
            public boolean accept(File file) {
                //if the file extension is .txt return true, else false
                if (file.getName().endsWith(".png")) {
                    return true;
                }
                return false;
            }
        };
        HashSet<String> exsitImagesFileNames = new HashSet<String>();
        if(outdirFile.isDirectory()){
    		File[] files = outdirFile.listFiles(filefilter);
    		for(File f : files){
    			exsitImagesFileNames.add(f.getName());
    		}
    	}
    	filefilter = new FileFilter() {
            public boolean accept(File file) {
                //if the file extension is .txt return true, else false
                if (file.getName().endsWith(".220")) {
                    return true;
                }
                return false;
            }
        };
        long time = 0;
        File latestFile = null;
        int radarThreshold = -1;
        BufferedReader in = null;
        String result = "";
        //获取雷达阈值数据
        try{
        	String ip = PropertiesUtils.getProperties("proxy.url.host");
            String port = PropertiesUtils.getProperties("proxy.url.port");
            String url = "http://" + ip + ":"+port+"/alertPro-admin-web/services/station/getRadarThreshold";
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
                    connection.getInputStream()));
            String line;
            while ((line = in.readLine()) != null) {
                result += line;
            }
            JSONObject jsonResult = (JSONObject) JSONObject.parse(result);
            radarThreshold = Integer.valueOf(jsonResult.getString("LEIDA"));
        }catch(Exception ex){
        	ex.printStackTrace();
        	radarThreshold = 55;
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
        
        
    	if(radardirFile.isDirectory()){
    		File[] files = radardirFile.listFiles(filefilter);
    		for(File f : files){
    			String name = f.getName()+".png";
    			if(!exsitImagesFileNames.contains(name)){
    				Reader.parseRadar(f.getAbsolutePath(), "CR\\37", orignOutDir, radarThreshold);
    			}
    		}
    	}
	}
}
