import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

const SalesDistributionByCategoryChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/sales-distribution-by-category');
        const categories = response.data.map(item => item.category);
        const quantities = response.data.map(item => item.quantity);

        setChartData({
          labels: categories,
          datasets: [
            {
              label: 'Quantity Sold',
              data: quantities,
              backgroundColor: 'rgba(255, 159, 64, 0.6)',
              borderColor: 'rgba(255, 159, 64, 1)',
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Bar
        data={chartData}
        options={{
          title: {
            display: true,
            text: 'Sales Distribution by Category',
            fontSize: 25,
          },
          legend: {
            display: true, 
            position: 'top',
          },
          scales: {
            x: {
              stacked: true,
            },
            y: {
              stacked: true,
            },
          },
        }}
      />
    </div>
  );
};

export default SalesDistributionByCategoryChart;