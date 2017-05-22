package com.geohey.utils;


import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.awt.image.Raster;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.RandomAccessFile;
import java.nio.ByteBuffer;
import java.util.Iterator;

import javax.imageio.ImageIO;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.geohey.web.pojo.Contourline;
import com.idrsolutions.image.tiff.TiffDecoder;

public class GdalUtil {
	private static final Logger LOGGER = LoggerFactory.getLogger(GdalUtil.class);
	public static void gridCreate(){
		
	}
	
	public static void main(String[] args) throws Exception{
		BufferedReader br = new BufferedReader(new FileReader("E:\\07_Data\\gdal\\stations.csv"));
		String s = null;
	
		double[][] points = new double[280][3];
		Boolean head = true;
		int index = 0;
		while((s = br.readLine())!=null){//使用readLine方法，一次读一行
			if(head){
				head = false;
			}else{
				String[] values = s.split(",");
				points[index][0] = Double.valueOf(values[0]);
				points[index][1] = Double.valueOf(values[1]);
				points[index][2] = Double.valueOf(values[2]);
				index++;
			}
        }
        br.close();
        create(points);
        //gdal.GridCreate("invdist:power=2.0:smoothing=1.0", points, 12995852.20341544, 13144306.551984964, 4655715.926781297,4908133.718232842, 400, 681, gdalconst.GDT_UInt16, byteBuffer);
	}
	
	private static String vrtTemplate = "<OGRVRTDataSource>"+
    										"<OGRVRTLayer name=\"{$layername}\">"+
    											"<SrcDataSource>{$filename}</SrcDataSource>" +
												"<GeometryType>wkbPoint</GeometryType>" +
												"<GeometryField encoding=\"PointFromColumns\" x=\"x\" y=\"y\" z=\"v\"/>" + 
											"</OGRVRTLayer>" + 
										"</OGRVRTDataSource>";
	
	private static int MIN_X = 13038728;
	private static int MAX_X = 13141901;
	private static int MIN_Y = 4657818;
	private static int MAX_Y = 4769908;
	private static int WIDTH = 600;
	private static int HEIGHT = 652;
	
	private static String gdalGridCmd = "gdal_grid -a invdist:power=2.0:smoothing=1.0 -txe {$xmin} {$xmax} -tye {$ymin} {$ymax} -outsize {$width} {$height} -of GTiff -ot Int16 -l {$layername} {$vrtpath} {$outpath}";
	private static String cutlineCmd = "gdalwarp -cutline {$clipshapefile} {$intiff} {$outtiff}";
	
	private static java.text.NumberFormat nf = java.text.NumberFormat.getInstance(); 
	public static Contourline create(double[][] points) throws Exception{
		nf.setGroupingUsed(false);
		Contourline contourline = new Contourline();
		long start = System.currentTimeMillis();
		String fileName = String.valueOf(start);
//		String workspace = "E:\\07_Data\\gdal\\workspace";
//		String resultFolder = "D:\\tomcat6_32\\webapps\\WeatherMonitor\\radaroutput";
		
		String resultFolder = PropertiesUtils.getProperties("contourline.outdir");
		String workspace = PropertiesUtils.getProperties("contourline.workspace");
		File f = new File(workspace);
		if (!f.exists()) {  
            f.mkdirs();  
        }  
		f = new File(resultFolder);
		if (!f.exists()) {  
            f.mkdirs();  
        }  
		StringBuilder sb = new StringBuilder();
		sb.append("x,y,v\r\n");
		int minValue = Integer.MAX_VALUE;
		int maxValue = Integer.MIN_VALUE;
		//生成csv坐标文件和vrt模版文件
		for(double[] point : points){
			sb.append(nf.format(point[0])).append(",");
			sb.append(nf.format(point[1])).append(",");
			sb.append(nf.format(point[2])).append("\r\n");
			int value = (int) Math.floor(Double.valueOf(nf.format(point[2])));
			if(value == 555){
				continue;
			}
			if(value < minValue){
				minValue = value;
			}else if(value > maxValue){
				maxValue = value;
			}
		}
		
		FileOutputStream fos = null;
		String csvFilePath = "";
		try{
			csvFilePath = workspace + File.separator + fileName + ".csv";
			fos = new FileOutputStream(csvFilePath);
			fos.write(sb.toString().getBytes());
		}catch(Exception ex){
			ex.printStackTrace();
			Exception _ex = new Exception("生成csv坐标文件失败！");
			LOGGER.error("生成csv坐标文件失败！",_ex);
			throw _ex;
		}
		finally{
			if(fos != null){
				fos.close();
			}
			fos = null;
		}
		String thisVrtTemplate = vrtTemplate.replace("{$filename}", csvFilePath);
		thisVrtTemplate = thisVrtTemplate.replace("{$layername}", fileName);
		String vrtFilePath = "";
		try{
			vrtFilePath = workspace + File.separator + fileName + ".vrt";
			fos = new FileOutputStream(vrtFilePath);
			fos.write(thisVrtTemplate.getBytes());
		}catch(Exception ex){
			ex.printStackTrace();
			Exception _ex = new Exception("生成vrt模版文件失败！");
			LOGGER.error("生成vrt模版文件失败！",_ex);
			throw _ex;
		}
		finally{
			if(fos != null){
				fos.close();
			}
			fos = null;
		}
		
		//调用gdal命令生成tiff
		String tiffFilePath = workspace + File.separator + fileName + ".tiff";
		String gridCmd = gdalGridCmd.replace("{$xmin}", String.valueOf(MIN_X)).
			replace("{$xmax}", String.valueOf(MAX_X)).
			replace("{$ymin}", String.valueOf(MIN_Y)).
			replace("{$ymax}", String.valueOf(MAX_Y)).
			replace("{$width}", String.valueOf(WIDTH)).
			replace("{$height}", String.valueOf(HEIGHT)).
			replace("{$layername}", String.valueOf(fileName)).
			replace("{$vrtpath}", String.valueOf(vrtFilePath)).
			replace("{$outpath}", String.valueOf(tiffFilePath));
		try{
			excuteCmd(gridCmd);
		}
		catch(Exception ex){
			Exception _ex = new Exception("插值分析失败！");
			LOGGER.error("插值分析失败！",_ex);
			throw _ex;
		}
		
		//裁剪滨海新区范围
		String cliptiff = workspace + File.separator + fileName + "_clip.tiff";
		String clipCmd = cutlineCmd.replace("{$clipshapefile}", workspace + File.separator + "bhxq.shp").
			replace("{$intiff}", tiffFilePath).replace("{$outtiff}", cliptiff);
		try{
			excuteCmd(clipCmd);
		}
		catch(Exception ex){
			Exception _ex = new Exception("裁剪栅格数据失败！");
			LOGGER.error("裁剪栅格数据失败！",_ex);
			throw _ex;
		}
		
		//解析tiff文件，生成png图片
		BufferedImage bi = null;
		Graphics2D graphic = null;
		RandomAccessFile raf = new RandomAccessFile(cliptiff,"r");
		TiffDecoder decoder = new TiffDecoder(raf);
		BufferedImage image = decoder.read();
		Raster raster = image.getData();
		int width = image.getWidth();
		int height = image.getHeight();
		if(minValue == Integer.MAX_VALUE){
			minValue=0;
		}
		if(maxValue == Integer.MIN_VALUE){
			maxValue=0;
		}
		//int[] colors = gradientColors((maxValue - minValue + 1), new int[]{0,255,0}, new int[]{255,0,0});
		bi = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
		for(int c = 0;c<width;c++){
			//System.out.println();
			for(int r = 0;r<height;r++){
				int[] h = null;
				int[] out = raster.getPixel(c, r, h);
				short pixValue = (short) out[0];
				//存在一个高低序的问题
				byte[] b = new byte[2];
				b[1] = (byte) (pixValue >> 8);  
		        b[0] = (byte) (pixValue >> 0);
		        pixValue = (short) (((b[0] << 8) | b[1] & 0xff));
		        if(pixValue == 0){
		        	bi.setRGB(c, r, 0x000000ff);
		        }else{
		        	//bi.setRGB(c, r, colors[pixValue-minValue]);
		        	bi.setRGB(c, r, getColorByValue(pixValue));
		        	
		        }
//				System.out.print(pixValue);
//				System.out.print(' ');
			}
		}
		Iterator<ImageWriter> it = ImageIO.getImageWritersByFormatName("png");
        ImageWriter writer = it.next();
        String imagePath = resultFolder + File.separator + fileName + ".png";
        f = new File(imagePath);
        ImageOutputStream ios = ImageIO.createImageOutputStream(f);
		System.out.println();
		writer.setOutput(ios);
		writer.write(bi);
		ios.close();
		long end = System.currentTimeMillis();
		System.out.println(String.format("成功！耗时%dms",(end-start)));
		contourline.setFileName(fileName + ".png");
		contourline.setXmin(MIN_X);
		contourline.setYmin(MIN_Y);
		contourline.setXmax(MAX_X);
		contourline.setYmax(MAX_Y);
		contourline.setWidth(WIDTH);
		contourline.setWidth(HEIGHT);
		return contourline;
	}
	
	private static void excuteCmd(String cmd) throws Exception{
		String osName = System.getProperty("os.name").toLowerCase();
		System.out.println(osName);
		System.out.println(cmd);
		int exitVal = -1;
		try{
			
			//windows操作系统
			if(osName.contains("windows")){
				Runtime rt = Runtime.getRuntime();
				Process p = null;
				p = rt.exec("cmd exe /c " + cmd);
				exitVal = p.waitFor();
				System.out.println(exitVal);
			}
			else{
				//linux操作系统
				String[] cmdA = { "/bin/sh", "-c", cmd };  
                Process process = Runtime.getRuntime().exec(cmdA);
                exitVal = process.waitFor();  
			}
		}
		catch(Exception ex){
			LOGGER.error("excuteCmd error", ex);
			ex.printStackTrace();
			throw ex;
		}
		if(exitVal != 0){
			Exception ex = new Exception("分析异常。");
			throw ex;
		}
	}
	
	/**
	 * 生成随机颜色
	 * @param total
	 * @param startColor  起始颜色[r,g,b]
	 * @param endColor 终止颜色[r,g,b]
	 * @return
	 */
	public static int[] gradientColors(int total,int[] startColor,int[] endColor){
	    
//	    double[] startColor = new double[]{255,0,0};
//	    var endColor = [0,255,0];
		int[] returnColors = new int[total];
	    for(int i = 0;i<total-1;i++){
	      int r = (int) Math.floor(startColor[0] + ((endColor[0]-startColor[0])*i)/(total-1));
	      int g = (int) Math.floor(startColor[1] + ((endColor[1]-startColor[1])*i)/(total-1));
	      int b = (int) Math.floor(startColor[2] + ((endColor[2]-startColor[2])*i)/(total-1));
	      returnColors[i] = 0xff<<24 |  r << 16 | g << 8 | b;
	      System.out.println(r + " " + g + " " + b + " hex:" + Integer.toHexString(returnColors[i]));
	    }
	    returnColors[total-1] = 0xff<<24 |  endColor[0] << 16 | endColor[1] << 8 | endColor[2];
	      System.out.println(endColor[0] + " " + endColor[1] + " " + endColor[2] + " hex:" + Integer.toHexString(returnColors[total-1]));
	    return returnColors;
	  }
	
	public static int getColorByValue(int value){
		if(value <0){
			return 0xffffffff;
		}
		if(value > 250){
			return 0xff990032;
		}
		if(value >100){
			return 0xffFF00FF;
		}
		if(value > 50){
			return 0xff0000FF;
		}
		if(value > 25){
			return 0xff66CDFF;
		}
		if(value > 10){
			return 0xff32CD32;
		}
		return 0xff99FF99;
	}

}

