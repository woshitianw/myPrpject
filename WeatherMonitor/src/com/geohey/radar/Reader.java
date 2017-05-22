package com.geohey.radar;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.AffineTransform;
import java.awt.image.AffineTransformOp;
import java.awt.image.BufferedImage;
import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileFilter;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;
import java.nio.ByteBuffer;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;

import javax.imageio.ImageIO;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.geohey.utils.MecatorUtil;
import com.geohey.utils.PropertiesUtils;

public class Reader {
	private static final Logger LOGGER = LoggerFactory.getLogger(Reader.class);
	private static double x = 117.7331;
	private static double y = 39.0497;
	public static void main(String[] args){
//		String filePath = PropertiesUtils.getProperties("radardir");
//		filePath = filePath + "CR\\37\\20160918.001800.00.37.220";
//		String outPath = PropertiesUtils.getProperties("radaroutdir");
		long stattime = System.currentTimeMillis();
//		JSONArray warnResults = parseRadar(filePath,"CR",outPath,50,false);
		File file = getLatestFile("E:\\03_work\\qx\\Z9220-20160918\\CR\\37","200");
		LOGGER.info(file.getAbsolutePath());
		long endtime = System.currentTimeMillis();
		LOGGER.info("耗时："+(endtime-stattime) + "ms");
//		LOGGER.info(JSONObject.toJSONString(warnResults));
		
		
	}
	
	/**
	 * 解析雷达数据
	 * @param filePath 雷达文件
	 * @param productName 产品名称
	 * @param outDir 图片输出目录
	 * @param thresholdValue 报警阈值
	 * @param outImage 是否输出图片
	 * @return
	 */
	public static void parseRadar(String filePath,String productName,String outDir,int thresholdValue){
		double[] mecatorCoords = MecatorUtil.lonLat2Mercator(x, y);
		double x_mercator = mecatorCoords[0];
		double y_mercator = mecatorCoords[1];
		try {
			File f = new File(filePath);
			JSONArray warnJsonArray = new JSONArray();
			if(f.exists() == false){
				throw new Exception(filePath + "文件不存在。");
			}
			FileInputStream fis = new FileInputStream(filePath);
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
			short blocksNumber;
			byte[] buffer = new byte[fis.available()];
			fis.read(buffer);
			fis.close();
			ByteArrayReader reader = new ByteArrayReader(buffer);
			//byte[] buffer = new byte[]{0x00,0x25};
			Calendar cal = Calendar.getInstance();
			cal.set(1970, 0, 1);
			LOGGER.info("------------------------信息标题块----------------------------------");
			LOGGER.info(String.format("信息代码:%s",reader.getInt16()));
			int days = reader.getInt16();
			cal.add(Calendar.DATE, days);
			
			LOGGER.info(String.format("信息日期:%s",sdf.format(cal.getTime())));
			LOGGER.info(String.format("格林威治标准时间零点之后的秒数:%s",reader.getInt32()));
			LOGGER.info(String.format("包括标题的信息字节数:%s",reader.getInt32()));
			LOGGER.info(String.format("源ID:%s",reader.getInt16()));
			LOGGER.info(String.format("目的:%s",reader.getInt16()));
			blocksNumber = reader.getInt16();
			LOGGER.info(String.format("块数:%s",blocksNumber));
			
			LOGGER.info("------------------------产品说明块----------------------------------");
			LOGGER.info(String.format("块区分:%s",reader.getInt16()));//应该为-1
			LOGGER.info(String.format("雷达纬度:%s",reader.getInt32()));
			LOGGER.info(String.format("雷达经度:%s",reader.getInt32()));
			LOGGER.info(String.format("雷达高度:%s",reader.getInt16()));
			LOGGER.info(String.format("产品号:%s",reader.getInt16()));
			LOGGER.info(String.format("操作模式:%s",reader.getInt16()));//0=维护；1=晴空；2=降水/灾害天气
			LOGGER.info(String.format("体扫方式:%s",reader.getInt16()));
			LOGGER.info(String.format("序列号:%s",reader.getInt16()));
			LOGGER.info(String.format("体扫号:%s",reader.getInt16()));
			
			cal.set(1970, 0, 1);
			days = reader.getInt16();
			cal.add(Calendar.DATE, days);
			LOGGER.info(String.format("体扫日期:%s",sdf.format(cal.getTime())));
			LOGGER.info(String.format("体扫开始时间:%s",reader.getInt32()));
			LOGGER.info(String.format("产品生成日期:%s",reader.getInt16()));
			LOGGER.info(String.format("产品生成时间:%s",reader.getInt32()));
			
			//产品参数P1-2
			reader.skip(4);
			LOGGER.info(String.format("仰角号:%s",reader.getInt16()));
			//产品参数P3
			reader.skip(2);
			//1-16级数据门限
			reader.skip(32);
			
			//产品参数
			reader.skip(14);
			LOGGER.info(String.format("产品版本号:%s",reader.getUnsignedShort()));
			LOGGER.info(String.format("SPOT BLANK:%s",reader.getUnsignedShort()));
			LOGGER.info(String.format("顶至符号块:%s",reader.getInt32()));
			LOGGER.info(String.format("顶至图表块:%s",reader.getInt32()));
			LOGGER.info(String.format("顶至表格块:%s",reader.getInt32()));
			//LOGGER.info(String.format("地图数:%s",reader.getInt16()));
			
			LOGGER.info(String.format("已读取字节数:%s",reader.getOffset()));
			LOGGER.info("------------------------产品符号块----------------------------------");
			LOGGER.info(String.format("块区分:%s",reader.getInt16()));//应该为-1
			LOGGER.info(String.format("块ID:%s",reader.getInt16()));
			int blockLength = reader.getInt32();
			LOGGER.info(String.format("块长:%s",blockLength));
			short lryCount = reader.getInt16();
			LOGGER.info(String.format("层数:%s",lryCount));
			
			for(short i=0;i<lryCount;i++){
				LOGGER.info(String.format("########第%s层#########",i+1));
				LOGGER.info(String.format("层区分:%s",reader.getInt16()));//应该为-1
				int lryLength = reader.getInt32();
				LOGGER.info(String.format("层长:%s",lryLength));
				//栅格数据包
				LOGGER.info(String.format("包代码:%x",reader.getInt16()));
				LOGGER.info(String.format("包代码:%x",reader.getInt16()));
				LOGGER.info(String.format("包代码:%x",reader.getInt16()));
				LOGGER.info(String.format("起点I坐标:%s",reader.getInt16()));
				LOGGER.info(String.format("起点J坐标:%s",reader.getInt16()));
				LOGGER.info(String.format("X标准整数:%s",reader.getInt16()));
				LOGGER.info(String.format("X标准小数:%s",reader.getInt16()));
				LOGGER.info(String.format("Y标准整数:%s",reader.getInt16()));
				LOGGER.info(String.format("Y标准小数:%s",reader.getInt16()));
				//reader.isBigEndian=false;
				short lineNum = reader.getInt16();
				LOGGER.info(String.format("行数:%s",lineNum));
				//reader.isBigEndian=true;
				LOGGER.info(String.format("包说明:%s",reader.getInt16()));
				BufferedImage bi = null;
				Graphics2D graphic = null;
				bi = new BufferedImage(lineNum, lineNum, BufferedImage.TYPE_INT_ARGB);
		        graphic = bi.createGraphics();
		        graphic.setColor(new Color(0.2f,0.3f,0.4f,0.4f));
		        graphic.fillRect(0, 0, lineNum, lineNum);
		        
		        Map<String,Integer> thresholdColors = new HashMap<String,Integer>();
				for(short j=0;j<lineNum;j++){
					short columnIndex = 0;
					short byteNumber = reader.getInt16();
					
					for(short k = 0;k<byteNumber;k++){
						int pixValues = reader.getUnsignedShort();
						int[] pixInfo = getPixInfosByByte(pixValues);
						for(short _i = 0; _i<pixInfo[0];_i++){
							int colorValue = (pixInfo[1]-2)*5;
							if(colorValue >= thresholdValue && thresholdColors.containsKey(Integer.toHexString(pixInfo[2]))==false){
								thresholdColors.put(Integer.toHexString(pixInfo[2]),colorValue);
							}
							try{
								bi.setRGB(j, columnIndex, pixInfo[2]);
							}
							catch(Exception ex){
								ex.printStackTrace();
							}
							columnIndex++;
						}
					}
					for(;columnIndex<lineNum;columnIndex++){
						bi.setRGB(j, columnIndex, 0x000000ff);
					}
				}
				Iterator<ImageWriter> it = ImageIO.getImageWritersByFormatName("png");
		        ImageWriter writer = it.next();
		        String imagePath = filePath.substring(filePath.lastIndexOf("\\")) + ".png";
		        imagePath = outDir + productName + "\\" + imagePath;
		        f = new File(imagePath);
		        if (!f.getParentFile().exists()) {  
	                f.getParentFile().mkdirs();  
	            }  
		        ImageOutputStream ios = ImageIO.createImageOutputStream(f);
		        writer.setOutput(ios);
		        AffineTransform transform = new AffineTransform(-1, 0, 0, 1,bi.getWidth(), 0);// 水平翻转  
		        AffineTransformOp op = new AffineTransformOp(transform,AffineTransformOp.TYPE_BILINEAR);
		        bi = op.filter(bi, null);
		        bi = rotateImage(bi,270);
		        for(int _i = 0;_i<460;_i++){
		        	for(int j = 0;j<460;j++){
		        		int color = bi.getRGB(_i, j);
		        		if(color != 0 && thresholdColors.containsKey(Integer.toHexString(color))){
		        			JSONObject warnItem = new JSONObject();
							double _x = (_i-230)*1000 + x_mercator;
							double _y = (230-j)*1000 + y_mercator;
							double[] lonlat = MecatorUtil.Mercator2lonLat(_x, _y);
							//在天津范围内的才报警
							if(MecatorUtil.insideTianjin(lonlat)){
								warnItem.put("x", lonlat[0]);
								warnItem.put("y", lonlat[1]);
								warnItem.put("v", thresholdColors.get(Integer.toHexString(color)));
								warnJsonArray.add(warnItem);
							}
		        		}
		        	}
		        }
		        writer.write(bi);
		        //保存报警信息
		        try{
		        	File file = new File(outDir + productName + "\\" + filePath.substring(filePath.lastIndexOf("\\")) + ".json");
	        		if (!file.exists()) {
	        			file.createNewFile();
	        	    }
        			FileWriter fw = new FileWriter(file.getAbsoluteFile());
		        	BufferedWriter bw = new BufferedWriter(fw);
		        	bw.write(JSON.toJSONString(warnJsonArray));
		        	bw.close();
		        	if(warnJsonArray.size()>0){
		        		//调用报警接口
		        		invokeWarnInterface();
		        	}
		        }catch(Exception ex){
		        	ex.printStackTrace();
		        }
			}
			LOGGER.info("ok");
		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	public static void invokeWarnInterface(){
		BufferedReader in = null;
        String result = "";
		try{
			String ip = PropertiesUtils.getProperties("proxy.url.host");
            String port = PropertiesUtils.getProperties("proxy.url.port");
            String url = "http://" + ip + ":"+port+"/alertPro-admin-web/services/warn/leidaWarn";
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
	}
	
	/** 
     * 把byte转为字符串的bit 
     */  
    public static String byteToBit(byte b) {  
        return ""  
                + (byte) ((b >> 7) & 0x1) + (byte) ((b >> 6) & 0x1)  
                + (byte) ((b >> 5) & 0x1) + (byte) ((b >> 4) & 0x1) + ' ' +   
                + (byte) ((b >> 3) & 0x1) + (byte) ((b >> 2) & 0x1)  
                + (byte) ((b >> 1) & 0x1) + (byte) ((b >> 0) & 0x1);  
    }
    
    /** 
     * 将byte转换为一个长度为8的byte数组，数组每个值代表bit 
     */  
    public static byte[] getBooleanArray(byte b) {  
        byte[] array = new byte[8];  
        for (int i = 7; i >= 0; i--) {  
            array[i] = (byte)(b & 1);  
            b = (byte) (b >> 1);  
        }  
        return array;  
    }
    
    public static int[] getPixInfosByByte(int pixValues){
		short pixNumbers = (short) (pixValues >> 4);
		short colorValue = (short) (pixValues&0x0f);
		int color=0;
		switch(colorValue){
			case 0:
				color =  0x000000ff;
			break;
			case 1:
				color = 0xff00ACA4;
				break;
			case 2:
				color =  0xffC0C0FE;
				break;
			case 3:
				color =  0xff7A72EE;
				break;
			case 4:
				color =  0xff1E26D0;
				break;
			case 5:
				color =  0xffA6FCA8;
				break;
			case 6:
				color =  0xff00EA00;
				break;
			case 7:
				color =  0xff10921A;
				break;
			case 8:
				color =  0xffFCF464;
				break;
			case 9:
				color =  0xffC8C802;
				break;
			case 10:
				color =  0xff8C8C00;
				break;
			case 11:
				color =  0xffFEACAC;
				break;
			case 12:
				color =  0xffFE645C;
				break;
			case 13:
				color =  0xffEE0230;
				break;
			case 14:
				color =  0xffD48EFE;
				break;
			case 15:
				color =  0xffAA24FA;
				break;
		}
		return new int[]{pixNumbers,colorValue,color};
    }
    
    public static BufferedImage rotateImage(final BufferedImage bufferedimage,
            final int degree) {
        int w = bufferedimage.getWidth();
        int h = bufferedimage.getHeight();
        int type = bufferedimage.getColorModel().getTransparency();
        BufferedImage img;
        Graphics2D graphics2d;
        (graphics2d = (img = new BufferedImage(w, h, type))
                .createGraphics()).setRenderingHint(
                RenderingHints.KEY_INTERPOLATION,
                RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        graphics2d.rotate(Math.toRadians(degree), w / 2, h / 2);
        graphics2d.drawImage(bufferedimage, 0, 0, null);
        graphics2d.dispose();
        return img;
    }
    public static File getLatestFile(String dirPath,final String extName){
    	System.out.println(dirPath);
    	File dir = new File(dirPath);
    	FileFilter filefilter = new FileFilter() {
            public boolean accept(File file) {
                //if the file extension is .txt return true, else false
                if (file.getName().endsWith(extName)) {
                    return true;
                }
                return false;
            }
        };
        long time = 0;
        File latestFile = null;
    	if(dir.isDirectory()){
    		File[] files = dir.listFiles(filefilter);
    		for(File file : files){
    			if(file.lastModified()>time){
        			latestFile = file;
        			time = file.lastModified();
        		}
    		}
    		return latestFile;
    	}
    	return null;
    }
}
