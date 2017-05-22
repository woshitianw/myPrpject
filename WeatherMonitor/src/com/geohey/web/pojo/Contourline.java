package com.geohey.web.pojo;

public class Contourline {
	private String fileName;
	private double xmin;
	private double ymin;
	private double xmax;
	private double ymax;
	private int width;
	private int height;
	public void setFileName(String fileName) {
		this.fileName = fileName;
	}
	public String getFileName() {
		return fileName;
	}
	public void setHeight(int height) {
		this.height = height;
	}
	public int getHeight() {
		return height;
	}
	public void setWidth(int width) {
		this.width = width;
	}
	public int getWidth() {
		return width;
	}
	public void setXmin(double xmin) {
		this.xmin = xmin;
	}
	public double getXmin() {
		return xmin;
	}
	public void setXmax(double xmax) {
		this.xmax = xmax;
	}
	public double getXmax() {
		return xmax;
	}
	public void setYmin(double ymin) {
		this.ymin = ymin;
	}
	public double getYmin() {
		return ymin;
	}
	public void setYmax(double ymax) {
		this.ymax = ymax;
	}
	public double getYmax() {
		return ymax;
	}
}
