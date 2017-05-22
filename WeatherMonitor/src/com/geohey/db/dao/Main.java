package com.geohey.db.dao;

import com.geohey.db.entry.Dma;
import com.geohey.db.entry.Station;
import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.FileSystemXmlApplicationContext;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

/**
 * Created by wenyb on 2016/10/16.
 */
public class Main {
    public static void main(String[] args) throws IOException {

        InputStream inputStream = new FileInputStream("E:\\03_work\\qx\\weather-monitor\\weather-monitor\\src\\main\\resources\\mybatis\\dev.xml");
        SqlSessionFactory _factory = new SqlSessionFactoryBuilder().build(inputStream);
        SqlSession sqlSession = _factory.openSession();
        //List<Dma> results = sqlSession.selectList("com.geohey.db.dao.Dma.getAll");
        Station station = new Station();
        station.setAdmin_code_chn("120221");
        station.setX(117.6769);
        station.setY(39.4261);
        station.setWkt("POINT(117.6769 39.4261)");
        station.setSt_wkt("ST_GeometryFromText('POINT(117.6769 39.4261)',4326)");
        station.setName("宁河大于庄");
        station.setId("A2362");
        sqlSession.insert("com.geohey.db.dao.Station.insertStation",station);
        System.out.println("haha");
    }
}
