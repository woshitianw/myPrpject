package com.geohey.db.dao;

import com.geohey.db.entry.IssueWordFile;
import com.geohey.db.entry.Station;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository(value = "stationDao")
public interface StationDao {
    List<Station> getAll();
    void deleteAll();
    void insert(Station station);
    List queryByBuffer(QueryParam param);
    int getQYZZIssue();
    void addQYZZIssue();
    void updateQYZZIssue(int param);
    void insertIssueWordFile(IssueWordFile file);
    List getAllWordFiles();
    IssueWordFile getWordFileByIssue(int issue);
}


