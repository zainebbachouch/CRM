import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SmallChart from './minichart/SmallChart ';

const Header = () => {
  const [data, setData] = useState({
    totalRevenue: [],
    totalProductsSold: [],
    tasksCounts: { toDo: 0, inProgress: 0, done: 0 },
  });

  const [revenuePeriod, setRevenuePeriod] = useState('monthly');
  const [productsPeriod, setProductsPeriod] = useState('monthly'); // or the default you want
  const [labels, setLabels] = useState([]); // Labels for the x-axis
  const [selectedStatus, setSelectedStatus] = useState('To-Do'); // State for selected task status



  useEffect(() => {
    const fetchData = async () => {
        try {
            // Fetch total revenue and products sold
            const totalRevenueResponse = await axios.get(`http://127.0.0.1:5000/api/totalrevenue?period=${revenuePeriod}`);
            const totalProductsSoldResponse = await axios.get(`http://127.0.0.1:5000/api/total-products-sold?period=${productsPeriod}`);
            
            // Fetch tasks counts by status
            const tasksCountsResponse = await axios.get(`http://127.0.0.1:5000/api/tasks-counts?status=${selectedStatus}`);
            console.log("Tasks Counts Response:", tasksCountsResponse.data);

            const revenueData = Array.isArray(totalRevenueResponse.data)
                ? totalRevenueResponse.data.map(item => item.totalRevenue)
                : [];
                
            const productsData = Array.isArray(totalProductsSoldResponse.data)
                ? totalProductsSoldResponse.data.map(item => item.totalProductsSold)
                : [];
                   // Normalize the keys for task counts
                   const normalizedTasksCounts = {
                    toDo: tasksCountsResponse.data['toDo'] || tasksCountsResponse.data['To-Do'] || 0,
                    inProgress: tasksCountsResponse.data['inProgress'] || tasksCountsResponse.data['In-Progress'] || 0,
                    done: tasksCountsResponse.data['done'] || tasksCountsResponse.data['Done'] || 0,
                };

            setData(prevData => ({
                ...prevData,
                totalRevenue: revenueData,
                totalProductsSold: productsData,
                tasksCounts: normalizedTasksCounts,
            }));

            setLabels(revenueData.length > 0 ? revenueData.map((_, index) => `Period ${index + 1}`) : []);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    fetchData();
}, [revenuePeriod, productsPeriod, selectedStatus]);

const totalTasks = data.tasksCounts.toDo + data.tasksCounts.inProgress + data.tasksCounts.done;
    const completedTasks = data.tasksCounts.done || 0;
    const percentageCompleted = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const taskStatusLabels = ['To-Do', 'In-Progress', 'Done'];
    const taskStatusData = [data.tasksCounts.toDo, data.tasksCounts.inProgress, data.tasksCounts.done];


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
              ? data.totalProductsSold.reduce((a, b) => a + b, 0).toLocaleString() : 0} {/* Sum of total products sold */}
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
  {/* Tasks Card */}
  <div className="card">
                <div className="card-content">
                    <div className="icon">
                        <i className="fas fa-tasks"></i>
                    </div>
                    <div className="value">{totalTasks} tasks</div>
                    <div className="value">
                        {data.tasksCounts.done} Completed Task ({percentageCompleted.toFixed(2)}%)
                    </div>
                    
                </div>
                <div style={{ height: '40%' }}>
                    <SmallChart data={taskStatusData} labels={taskStatusLabels} chartType="pie" />
                </div>
            </div>
        </div>
    );
};
export default Header;
