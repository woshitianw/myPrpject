package com.geohey.db.entry;

/**
 * Created by wenyb on 2016/10/16.
 */
public class Station {
    private String admin_code_chn;
    private String name;
    private String id;
    private String wkt;

    public String getSt_wkt() {
        return st_wkt;
    }

    public void setSt_wkt(String st_wkt) {
        this.st_wkt = st_wkt;
    }

    private String st_wkt;
    private double x;
    private double y;

    public String getAdmin_code_chn() {
        return admin_code_chn;
    }

    public void setAdmin_code_chn(String admin_code_chn) {
        this.admin_code_chn = admin_code_chn;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getWkt() {
        return wkt;
    }

    public void setWkt(String wkt) {
        this.wkt = wkt;
    }

    public double getX() {
        return x;
    }

    public void setX(double x) {
        this.x = x;
    }

    public double getY() {
        return y;
    }

    public void setY(double y) {
        this.y = y;
    }
}
