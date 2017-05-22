package com.geohey.db.entry;

import java.util.Date;

public class IssueWordFile {
	private int issue;
	private Date createtime;
	private String issuetype;
	private String filename;
	public void setIssue(int issue) {
		this.issue = issue;
	}
	public int getIssue() {
		return issue;
	}
	public void setCreatetime(Date createtime) {
		this.createtime = createtime;
	}
	public Date getCreatetime() {
		return createtime;
	}
	public void setIssuetype(String issuetype) {
		this.issuetype = issuetype;
	}
	public String getIssuetype() {
		return issuetype;
	}
	public void setFilename(String filename) {
		this.filename = filename;
	}
	public String getFilename() {
		return filename;
	}
}
