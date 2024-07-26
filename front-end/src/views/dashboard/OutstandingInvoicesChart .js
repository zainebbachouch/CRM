import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement, // Ajout de l'élément ArcElement
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, ArcElement, Tooltip, Legend); // Enregistrement de ArcElement

const OutstandingInvoicesChart = () => {
  const [chartData, setChartData] = useState({
    labels: [], // Initialisation des labels
    datasets: [
      {
        data: [], // Initialisation des données
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    const fetchOutstandingInvoices = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/outstanding-invoices');
        const { unpaidInvoiceCount, unpaidInvoiceTotal } = response.data.outstandingInvoices;

        setChartData({
          labels: ['Nombre de Factures Impayées', 'Montant Total des Factures Impayées'],
          datasets: [
            {
              data: [unpaidInvoiceCount, unpaidInvoiceTotal],
              backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
              borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching outstanding invoices:', error);
      }
    };

    fetchOutstandingInvoices();
  }, []);

  return (
    <div className="chart-container">
      <h2>Factures Impayées</h2>
      <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
    </div>
  );
};

export default OutstandingInvoicesChart;
