import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement, // Ajoutez LineElement pour les graphiques linéaires
  Tooltip,
  Legend,
} from 'chart.js';

// Enregistrez les éléments nécessaires
ChartJS.register(CategoryScale, LinearScale, LineElement, Tooltip, Legend);

const AverageInvoiceValueChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Valeur Moyenne des Factures',
        data: [],
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
      },
    ],
  });

  useEffect(() => {
    const fetchAverageInvoiceValue = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/averageinvoicevalue');
        const averageInvoiceValue = response.data.averageInvoiceValue;

        setChartData({
          labels: ['Valeur Moyenne'], // Ajustez selon votre besoin
          datasets: [
            {
              label: 'Valeur Moyenne des Factures',
              data: [averageInvoiceValue || 0],
              fill: false,
              borderColor: 'rgba(75, 192, 192, 1)',
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching average invoice value:', error);
      }
    };

    fetchAverageInvoiceValue();
  }, []);

  return (
    <div className="chart-container">
      <h2>Valeur Moyenne des Factures</h2>
      <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
    </div>
  );
};

export default AverageInvoiceValueChart;
