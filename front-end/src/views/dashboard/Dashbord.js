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


function Dashbord() {
    const [frequencyPeriod, setFrequencyPeriod] = useState('daily'); // State for selected period
    const [selectedChart, setSelectedChart] = useState('averageInvoiceValue'); // State for selected chart
    const charts = {
        averageInvoiceValue: { component: <AverageInvoiceValueChart />, title: 'Average Invoice Value' },
        invoiceCount: { component: <InvoiceCountChart />, title: 'Invoice Count' },
        invoiceAmountDistribution: { component: <InvoiceAmountDistributionChart />, title: 'Invoice Amount Distribution' },
        invoiceFrequency: {
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
        outstandingInvoices: { component: <OutstandingInvoicesChart />, title: 'Outstanding Invoices' },
        invoiceTrends: { component: <InvoiceTrendsChart />, title: 'Invoice Trends' },


    }

    return (
        <div className="d-flex">
            <SideBar />
            <div className="d-flex container-fluid m-0 p-0 flex-column">
                <TopBar />
                <div className="container-fluid p-0 m-0 dashboard-content">
                    <Header />
                    <div className="chart-selection">
                        {Object.keys(charts).map((chartKey) => (
                            <label key={chartKey}>
                                <input
                                    type="radio"
                                    value={chartKey}
                                    checked={selectedChart === chartKey}
                                    onChange={() => setSelectedChart(chartKey)}
                                />
                                {charts[chartKey].title}
                            </label>
                        ))}
                    </div>
                    <div className="chart-container">
                        <h2>{charts[selectedChart].title}</h2>
                        {charts[selectedChart].component}
                    </div>
                    {/* New Sections */}
                    <div className="recent-activities">
                        <h2>Recent Activities</h2>
                        <p>Here you can add recent activities...</p>
                    </div>
                    <div className="performance-overview">
                        <h2>Performance Overview</h2>
                        <p>Here you can add performance overview...</p>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default Dashbord;
