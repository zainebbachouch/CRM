import React, { useState } from 'react';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import '../../style/viewsStyle/dashbored.css';
import AverageInvoiceValueChart from './AverageInvoiceValueChart ';
import Header from './HeaderDash';
import InvoiceAmountDistributionChart from './InvoiceAmountDistributionChart ';
import InvoiceCountChart from './InvoiceCountChart ';
import InvoiceFrequencyChart from './InvoiceFrequencyChart ';
import InvoiceTrendsChart from './InvoiceTrendsChart ';
import OutstandingInvoicesChart from './OutstandingInvoicesChart ';
import TotalRevenueChart from './TotalRevenueChart ';


function Dashbord() {
    const [frequencyPeriod, setFrequencyPeriod] = useState('daily'); // State for selected period
    const charts = [
        { component: <TotalRevenueChart />, title: 'Total Rllevenue' },
        { component: <AverageInvoiceValueChart />, title: 'Average Invoice Value' },
        { component: <InvoiceCountChart />, title: 'Invoice Count' },
        { component: <InvoiceAmountDistributionChart />, title: 'Invoice Amount Distribution' },
        {
            component: (
                <>
                    <select
                        value={frequencyPeriod}
                        onChange={(e) => setFrequencyPeriod(e.target.value)}
                        style={{ marginBottom: '20px' }} // Inline style for spacing
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                    <InvoiceFrequencyChart period={frequencyPeriod} />


                </>
            ), title: 'Invoice Frequency (Monthly)'
        },
        { component: <OutstandingInvoicesChart />, title: 'Outstanding Invoices' },
        { component: <InvoiceTrendsChart />, title: 'Invoice Trends' },
    ];

    return (
        <div className="d-flex">
            <SideBar />
            <div className="d-flex container-fluid m-0 p-0 flex-column">
                <TopBar />
                <div className="container-fluid p-0 m-0 dashboard-content">
                    <Header/>
                    {charts.map((chart, index) => (
                        <div key={index} className="chart-container">
                            <h2>{chart.title}</h2>
                            {chart.component}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Dashbord;
