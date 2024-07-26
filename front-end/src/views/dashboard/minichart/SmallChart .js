import React from 'react';
import { Bar, Line } from 'react-chartjs-2';

const SmallChart = ({ data, labels, chartType = 'bar' }) => {
    const chartData = {
        labels: labels,
        datasets: [
          {
            label: chartType === 'bar' ? 'Total Revenue' : 'Total Products Sold',
            data: data.length > 0 ? data : [0], // Prevent issues with empty data
            backgroundColor: chartType === 'bar' ? 'rgba(75, 192, 192, 0.6)' : undefined,
            borderColor: chartType === 'line' ? 'rgba(75, 192, 192, 1)' : undefined,
            borderWidth: 1,
          },
        ],
      };
      

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1000, // Adjust the value based on your needs
        },
      },
      x: {
        title: {
          display: true,
          text: 'Period', // Change as needed (e.g., 'Days', 'Months')
        },
      },
    },
  };

  return (
    <div style={{ height: '100px', width: '100%' }}>
      {chartType === 'bar' ? (
        <Bar data={chartData} options={options} />
      ) : (
        <Line data={chartData} options={options} />
      )}
    </div>
  );
};

export default SmallChart;
