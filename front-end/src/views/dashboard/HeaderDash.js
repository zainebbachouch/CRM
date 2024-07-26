import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SmallChart from './minichart/SmallChart ';

const Header = () => {
  const [data, setData] = useState({
    totalRevenue: [],
    totalProductsSold: [],
  });
  const [revenuePeriod, setRevenuePeriod] = useState('monthly');
  const [productsPeriod, setProductsPeriod] = useState('monthly'); // or the default you want
  const [labels, setLabels] = useState([]); // Labels for the x-axis

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch total revenue based on the selected period
        const totalRevenueResponse = await axios.get(`http://127.0.0.1:5000/api/totalrevenue?period=${revenuePeriod}`);
        const totalProductsSoldResponse = await axios.get(`http://127.0.0.1:5000/api/total-products-sold?period=${productsPeriod}`);
        console.log("Total Products Sold Response:", totalProductsSoldResponse.data);

        // Ensure responses are arrays before mapping
        const revenueData = Array.isArray(totalRevenueResponse.data) 
            ? totalRevenueResponse.data.map(item => item.totalRevenue) 
            : [];
  
            const productsData = Array.isArray(totalProductsSoldResponse.data)
            ? totalProductsSoldResponse.data.map(item => item.totalProductsSold) 
            : [];
        
  
        // Update data state
        setData({
          totalRevenue: revenueData,
          totalProductsSold: productsData,
        });
  
        // Set labels for the x-axis based on the period
        setLabels(revenueData.length > 0 ? revenueData.map((_, index) => `Period ${index + 1}`) : []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, [revenuePeriod, productsPeriod]); // Include both periods in the dependency array
  

  return (
    <div className="header">
      <div className="card">
        <div className="card-content">
          <div className="icon">
            <i className="fas fa-money-bill-alt"></i>
          </div>
          <div className="value">
            ${data.totalRevenue.reduce((a, b) => a + b, 0).toLocaleString()}
          </div>
          <div className="label">Total Revenue</div>
          {/* Period selection for Total Revenue */}
          <label htmlFor="period">Select Period: </label>
          <select id="revenue-period" value={revenuePeriod} onChange={(e) => setRevenuePeriod(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <div style={{ height: '40%' }}>
            {/**
             *             <SmallChart data={data.totalRevenue} labels={labels} chartType="bar" />

             */}
            <SmallChart data={data.totalRevenue} labels={labels} chartType="line" />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-content">
          <div className="icon">
            <i className="fas fa-box"></i>
          </div>
          <div className="value">
            {data.totalProductsSold.length > 0 
    ? data.totalProductsSold.reduce((a, b) => a + b, 0).toLocaleString(): 0} {/* Sum of total products sold */}
          </div>
          <div className="label">Total Products Sold</div>
          {/* Period selection for Total Products Sold */}
          <label htmlFor="period">Select Period: </label>
          <select id="products-period" value={productsPeriod} onChange={(e) => setProductsPeriod(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div style={{ height: '40%' }}>
          {/**
             *            <SmallChart data={data.totalProductsSold} labels={labels} chartType="line" />


             */}
          <SmallChart data={data.totalProductsSold} labels={labels} chartType="line" />
        </div>
      </div>

      <div className="card">

      </div>
    </div>
  );
};

export default Header;
