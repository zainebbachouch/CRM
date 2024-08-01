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
import SalesChart from './product/SalesChart ';
import TotalSalesByCategoryChart from './categorie/TotalSalesByCategoryChart ';
import AverageSalesPriceByCategoryChart from './categorie/AverageSalesPriceByCategoryChart ';
import SalesDistributionByCategoryChart from './categorie/SalesDistributionByCategoryChart ';
import NumberOfProductsByCategoryChart from './categorie/NumberOfProductsByCategoryChart ';
import RevenueContributionByCategoryChart from './categorie/RevenueContributionByCategoryChart ';


function Dashbord() {
    const [frequencyPeriod, setFrequencyPeriod] = useState('daily'); // State for selected period
    const [selectedChart, setSelectedChart] = useState('averageInvoiceValue'); // State for selected chart
    const [selectedCategoryChart, setSelectedCategoryChart] = useState('totalSalesByCategory'); // State for selected category chart   
    const [frequencyPeriodd, setFrequencyPeriodd] = useState('daily'); // State for selected period




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

    const chartsCategories = {
        totalSalesByCategory: { component: <TotalSalesByCategoryChart period={frequencyPeriodd} />, title: 'Total Sales by Category' },
        averageSalesPriceByCategory: { component: <AverageSalesPriceByCategoryChart period={frequencyPeriodd} />, title: 'Average Sales Price by Category' },
        salesDistributionByCategory: { component: <SalesDistributionByCategoryChart period={frequencyPeriodd} />, title: 'Sales Distribution by Category' },
        revenueContributionByCategory: { component: <RevenueContributionByCategoryChart period={frequencyPeriodd} />, title: 'Revenue Contribution by Category' },
    };

    return (
        <div className="d-flex">
            <SideBar />
            <div className="d-flex container-fluid m-0 p-0 flex-column">
                <TopBar />
                <div className="container-fluid p-0 m-0 dashboard-content">
                    <Header />
                    <div className="row">
                        <div className="col-4">
                            <SalesChart />
                        </div>
                        <div className="col-8">
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
                        <div className="row">
                            <div className="col-8">
                                <select
                                    value={frequencyPeriod}
                                    onChange={(e) => setFrequencyPeriodd(e.target.value)}
                                    style={{ marginBottom: '20px' }}
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                                {Object.keys(chartsCategories).map((chartKey) => (
                                    <label key={chartKey}>
                                        <input
                                            type="radio"
                                            value={chartKey}
                                            checked={selectedCategoryChart === chartKey}
                                            onChange={() => setSelectedCategoryChart(chartKey)}
                                        />
                                        {chartsCategories[chartKey].title}
                                    </label>
                                ))}
                                <h2>{chartsCategories[selectedCategoryChart]?.title}</h2>
                                {chartsCategories[selectedCategoryChart]?.component}
                            </div>
                            <div className="col-4">
                                <NumberOfProductsByCategoryChart />
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default Dashbord;