import React, { useState } from 'react';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import '../../style/viewsStyle/dashbored.css';
import AverageInvoiceValueChart from './facture/AverageInvoiceValueChart ';
import Header from './HeaderDash';
import InvoiceAmountDistributionChart from './facture/InvoiceAmountDistributionChart ';
import InvoiceFrequencyChart from './facture/InvoiceFrequencyChart ';
import InvoiceTrendsChart from './facture/InvoiceTrendsChart ';
import OutstandingInvoicesChart from './facture/OutstandingInvoicesChart ';
import DashProduct from './product/DashProduct';
import SalesChart from './product/SalesChart ';


function Dashbord() {
    const [frequencyPeriod, setFrequencyPeriod] = useState('daily'); // State for selected period
    const [selectedChart, setSelectedChart] = useState('averageInvoiceValue'); // State for selected chart
    const charts = {
        averageInvoiceValue: { component: <AverageInvoiceValueChart />, title: 'Average Invoice Value' },
        invoiceAmountDistribution: { component: <InvoiceAmountDistributionChart />, title: 'Invoice Amount Distribution' },
        invoiceFrequency: {
            component: (
                <>
                    <select
                        value={frequencyPeriod}
                        onChange={(e) => setFrequencyPeriod(e.target.value)}
                        style={{ marginBottom: '20px' }} 
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
                    
                   
                    <div class="row">

                           {/* New Sections */}
                    <div className="recent-activities" class="col-4">
                        <h2>Recent Activities</h2>
                       <SalesChart/>
                    </div>

                    <div className="chart-container" class="col-8">
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
                        <h2>{charts[selectedChart].title}</h2>
                        {charts[selectedChart].component}
                    </div>      
                   
                   
                 
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
