package com.geohey.db.entry;

/**
 * Created by wenyb on 2016/10/16.
 */
public class Dma {
    public int getIcf() {
        return icf;
    }

    public void setIcf(int icf) {
        this.icf = icf;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPid() {
        return pid;
    }

    public void setPid(String pid) {
        this.pid = pid;
    }

    private String id;
    private String name;
    private String pid;
    private int icf;
}
