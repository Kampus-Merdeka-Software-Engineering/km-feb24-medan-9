// Fetch JSON data
fetch('./team-9-medan.json')
    .then(response => response.json())
    .then(initializeDashboard)
    .catch(error => console.error('Error fetching data:', error));

function initializeDashboard(data) {
    // Initialize DataTables
    const tableResidential = initializeDataTable('#top-sales-residential', data, 'RESIDENTIAL_UNITS');
    const tableCommercial = initializeDataTable('#top-sales-commercial', data, 'COMMERCIAL_UNITS');
    const tableMonthlySalesPrice = initializeDataTablePrice('#top-sales-monthly-price', data);
    const tableTopBuildingTransaction = initializeDataTableBuildingTransaction('#top-building-transaction', data);

    // Initialize popup and overlay elements
    const popup = document.getElementById("popup");
    const overlay = document.getElementById("overlay");

    // Event listeners
    document.querySelectorAll(".show-insight-btn").forEach(button => button.addEventListener("click", toggleDescription));
    overlay.addEventListener("click", togglePopup);
    document.querySelectorAll('.sort-btn').forEach(button => button.addEventListener('click', toggleSortOptions));
    document.querySelectorAll('.sort-option').forEach(option => option.addEventListener('click', event => {
        const chartType = event.target.dataset.chartType;
        const sortType = event.target.dataset.sortType;
        if (chartType === 'neighborhood') {
            sortNeighborhoodChartData(sortType);
        } else if (chartType === 'building') {
            sortBuildingChartData(sortType);
        }
    }));
    document.querySelector('.apply-filter-btn').addEventListener('click', applyFilter);
    document.querySelector('.clear-filter-btn').addEventListener('click', clearFilter);

    // Calculate statistics
    let { neighborhoodTransactions, monthlySales, monthlyTransactions } = calculateDataStatistics(data);

    // Create charts
    let chartNeighborhoodSales = createNeighborhoodSalesChart(neighborhoodTransactions);
    let chartTotalMonthlySales = createTotalMonthlySalesChart(monthlySales, monthlyTransactions);
    let chartTopBuildingTransaction = createTopBuildingTransactionChart(data.slice(0, 10)); // Use top 10 data for the chart

    // Function to initialize DataTable
    function initializeDataTable(selector, data, unitsKey) {
        return new DataTable(selector, {
            data: data,
            columns: [
                { data: 'NEIGHBORHOOD' },
                { data: 'BUILDING_CLASS_CATEGORY' },
                { data: unitsKey }
            ]
        });
    }

    // Function to initialize DataTable for total monthly sales price
    function initializeDataTablePrice(selector, data) {
        return new DataTable(selector, {
            data: data,
            columns: [
                { data: 'SALE_DATE' },
                { data: 'SALE_PRICE' }
            ]
        });
    }

    // Function to initialize DataTable for top building transaction chart data
    function initializeDataTableBuildingTransaction(selector, data) {
        return new DataTable(selector, {
            data: data.slice(0, 10),
            columns: [
                { data: 'BUILDING_CLASS_CATEGORY' },
                { data: 'SALE_PRICE' }
            ]
        });
    }

    // Function to toggle the display of the popup
    function togglePopup() {
        popup.style.display = popup.style.display === "block" ? "none" : "block";
        overlay.style.display = overlay.style.display === "block" ? "none" : "block";
    }

    // Function to toggle the display of the description
    function toggleDescription(event) {
        const description = event.target.nextElementSibling;
        description.style.display = description.style.display === "none" ? "block" : "none";
    }

    // Function to calculate data statistics
    function calculateDataStatistics(data) {
        const neighborhoodTransactions = {};
        const monthlySales = {};
        const monthlyTransactions = {};

        data.forEach(property => {
            const saleDate = new Date(property.SALE_DATE);
            const month = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;

            neighborhoodTransactions[property.NEIGHBORHOOD] = (neighborhoodTransactions[property.NEIGHBORHOOD] || 0) + 1;
            monthlySales[month] = (monthlySales[month] || 0) + parseFloat(property.SALE_PRICE) || 0;
            monthlyTransactions[month] = (monthlyTransactions[month] || 0) + 1;
        });

        return { neighborhoodTransactions, monthlySales, monthlyTransactions };
    }

    // Function to create a bar chart for neighborhood sales transactions
    function createNeighborhoodSalesChart(neighborhoodTransactions) {
        const ctx = document.getElementById("neighborhood-sales-chart").getContext("2d");
        return new Chart(ctx, {
            type: "bar",
            data: {
                labels: Object.keys(neighborhoodTransactions),
                datasets: [{
                    label: "Total Transactions by Neighborhood",
                    data: Object.values(neighborhoodTransactions),
                    borderWidth: 1,
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // Function to toggle the display of the sort options
    function toggleSortOptions(event) {
        const sortOptions = event.target.nextElementSibling;
        sortOptions.style.display = sortOptions.style.display === "block" ? "none" : "block";
    }

    // Function to sort chart data for NEIGHBORHOOD SALES CHART
    function sortNeighborhoodChartData(sortType) {
        const sortedData = Object.entries(neighborhoodTransactions)
            .sort(([, a], [, b]) => sortType === 'asc' ? a - b : b - a);
        chartNeighborhoodSales.data.labels = sortedData.map(([neighborhood]) => neighborhood);
        chartNeighborhoodSales.data.datasets[0].data = sortedData.map(([, count]) => count);
        chartNeighborhoodSales.update();
    }

    // Function to sort chart data for the Top Building Transaction chart
    function sortBuildingChartData(sortType) {
        const sortedData = data.slice(0, 10).sort((a, b) => {
            if (sortType === 'asc') {
                return parseFloat(a.SALE_PRICE) - parseFloat(b.SALE_PRICE);
            } else {
                return parseFloat(b.SALE_PRICE) - parseFloat(a.SALE_PRICE);
            }
        });
        chartTopBuildingTransaction.data.labels = sortedData.map(property => property.BUILDING_CLASS_CATEGORY); // Use property.BUILDING_CLASS_CATEGORY as label
        chartTopBuildingTransaction.data.datasets[0].data = sortedData.map(property => parseFloat(property.SALE_PRICE));
        chartTopBuildingTransaction.update();
    }

    // Function to apply filter by date and update the charts with filtered data
    function applyFilter() {
        const startDate = new Date(document.getElementById('start-date').value);
        const endDate = new Date(document.getElementById('end-date').value);
        const filteredData = data.filter(property => {
            const saleDate = new Date(property.SALE_DATE);
            return saleDate >= startDate && saleDate <= endDate;
        });
        updateChartsWithFilteredData(filteredData);
    }

    // Function to clear filter and reset the charts
    function clearFilter() {
        document.getElementById('start-date').value = '';
        document.getElementById('end-date').value = '';
        updateChartsWithFilteredData(data);
    }

    // Function to update all charts and DataTables with filtered data
    function updateChartsWithFilteredData(filteredData) {
        const { neighborhoodTransactions, monthlySales, monthlyTransactions } = calculateDataStatistics(filteredData);

        updateNeighborhoodSalesChart(neighborhoodTransactions);
        updateTotalMonthlySalesChart(monthlySales, monthlyTransactions);
        updateTopBuildingTransactionChart(filteredData.slice(0, 10));
        updateDataTables(filteredData);
    }

    // Function to update neighborhood sales chart
    function updateNeighborhoodSalesChart(neighborhoodTransactions) {
        chartNeighborhoodSales.data.labels = Object.keys(neighborhoodTransactions);
        chartNeighborhoodSales.data.datasets[0].data = Object.values(neighborhoodTransactions);
        chartNeighborhoodSales.update();
    }

    // Function to update total monthly sales chart
    function updateTotalMonthlySalesChart(monthlySales, monthlyTransactions) {
        chartTotalMonthlySales.data.labels = Object.keys(monthlySales);
        chartTotalMonthlySales.data.datasets[0].data = Object.values(monthlySales);
        chartTotalMonthlySales.data.datasets[1].data = Object.values(monthlyTransactions);
        chartTotalMonthlySales.update();
    }

    // Function to update top building transaction chart
    function updateTopBuildingTransactionChart(data) {
        chartTopBuildingTransaction.data.labels = data.map(property => property.BUILDING_CLASS_CATEGORY);
        chartTopBuildingTransaction.data.datasets[0].data = data.map(property => parseFloat(property.SALE_PRICE));
        chartTopBuildingTransaction.update();
    }

    // Function to update DataTables with filtered data
    function updateDataTables(filteredData) {
        tableResidential.clear().rows.add(filteredData).draw();
        tableCommercial.clear().rows.add(filteredData).draw();
        tableMonthlySalesPrice.clear().rows.add(filteredData).draw();
        tableTopBuildingTransaction.clear().rows.add(filteredData.slice(0, 10)).draw();
    }

    // Function to create total monthly sales chart
    function createTotalMonthlySalesChart(monthlySales, monthlyTransactions) {
        const ctx = document.getElementById("total-monthly-sales-chart").getContext("2d");
        return new Chart(ctx, {
            type: "line",
            data: {
                labels: Object.keys(monthlySales),
                datasets: [
                    {
                        label: "Total Monthly Sales Price",
                        data: Object.values(monthlySales),
                        borderWidth: 1,
                        borderColor: "rgba(75, 192, 192, 1)",
                        backgroundColor: "rgba(75, 192, 192, 0.2)",
                        fill: true,
                        yAxisID: 'y',
                    },
                    {
                        label: "Total Monthly Transactions",
                        data: Object.values(monthlyTransactions),
                        borderWidth: 1,
                        borderColor: "rgba(255, 99, 132, 1)",
                        backgroundColor: "rgba(255, 99, 132, 0.2)",
                        fill: true,
                        yAxisID: 'y1',
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Total Sales Price'
                        }
                    },
                    y1: {
                        beginAtZero: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Total Transactions'
                        }
                    }
                }
            }
        });
    }

    // Function to create the top building transaction chart
    function createTopBuildingTransactionChart(data) {
        const ctx = document.getElementById("top-building-transaction-chart").getContext("2d");
        return new Chart(ctx, {
            type: "bar",
            data: {
                labels: data.map(property => property.BUILDING_CLASS_CATEGORY), // Use property.BUILDING_CLASS_CATEGORY as label
                datasets: [{
                    label: "Top Building Transaction",
                    data: data.map(property => parseFloat(property.SALE_PRICE)), // Use parseFloat(property.SALE_PRICE) as data
                    borderWidth: 1,
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
}
