// Fetch JSON data
fetch('./team-9-medan.json')
    .then(response => response.json())
    .then(initializeDashboard)
    .catch(error => console.error('Error fetching data:', error));

// Function to initialize the dashboard
function initializeDashboard(data) {
    // Initialize DataTables
    const tableResidential = initializeDataTable('#top-sales-residential', data, 'RESIDENTIAL_UNITS');
    const tableCommercial = initializeDataTable('#top-sales-commercial', data, 'COMMERCIAL_UNITS');
    const tableMonthlySalesPrice = initializeDataTablePrice('#top-sales-monthly-price', data);

    // Initialize popup and overlay elements
    const popup = document.getElementById("popup");
    const overlay = document.getElementById("overlay");

    // Event listeners
    document.querySelectorAll(".show-insight-btn").forEach(button => button.addEventListener("click", togglePopup));
    overlay.addEventListener("click", togglePopup);
    document.querySelector('.sort-btn').addEventListener('click', toggleSortOptions);
    document.querySelectorAll('.sort-option').forEach(option => option.addEventListener('click', event => sortChartData(event.target.dataset.sortType)));
    document.querySelector('.filter-date-btn').addEventListener('click', toggleDateFilter);
    document.querySelector('.apply-filter-btn').addEventListener('click', applyFilter);
    document.querySelector('.clear-filter-btn').addEventListener('click', clearFilter);

    // Calculate statistics
    const { neighborhoodTransactions, monthlySales, monthlyTransactions } = calculateDataStatistics(data);

    // Create charts
    const chartNeighborhoodSales = createNeighborhoodSalesChart(neighborhoodTransactions);
    const chartTotalMonthlySales = createTotalMonthlySalesChart(monthlySales, monthlyTransactions);
    const chartTopBuildingTransaction = createTopBuildingTransactionChart(data.slice(0, 10));

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

    // Function to toggle the display of the popup
    function togglePopup() {
        popup.style.display = popup.style.display === "block" ? "none" : "block";
        overlay.style.display = overlay.style.display === "block" ? "none" : "block";
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
    function toggleSortOptions() {
        const sortOptions = document.querySelector('.sort-options');
        sortOptions.style.display = sortOptions.style.display === "block" ? "none" : "block";
    }

    // Function to sort chart data
    function sortChartData(sortType) {
        const sortedData = Object.entries(neighborhoodTransactions)
            .sort((a, b) => sortType === 'asc' ? a[1] - b[1] : b[1] - a[1]);
        chartNeighborhoodSales.data.labels = sortedData.map(([neighborhood]) => neighborhood);
        chartNeighborhoodSales.data.datasets[0].data = sortedData.map(([, count]) => count);
        chartNeighborhoodSales.update();
    }

    // Function to toggle date filter
    function toggleDateFilter() {
        const dateFilter = document.querySelector('.date-filter');
        dateFilter.style.display = dateFilter.style.display === 'none' ? 'block' : 'none';
    }

    // Function to apply filter by Date
    function applyFilter() {
        const startDate = new Date(document.getElementById('start-date').value);
        const endDate = new Date(document.getElementById('end-date').value);
        const filteredData = data.filter(property => {
            const saleDate = new Date(property.SALE_DATE);
            return saleDate >= startDate && saleDate <= endDate;
        });
        updateMonthlySalesChart(filteredData);
    }

    // Function to clear filter
    function clearFilter() {
        document.getElementById('start-date').value = '';
        document.getElementById('end-date').value = '';
        updateMonthlySalesChart(data); // Reset to original data
    }

    // Function to update total monthly sales chart with filtered data
    function updateMonthlySalesChart(data) {
        const { monthlySales, monthlyTransactions } = calculateDataStatistics(data);
        tableMonthlySalesPrice.updateData(data);
        chartTotalMonthlySales.data.labels = Object.keys(monthlySales);
        chartTotalMonthlySales.data.datasets[0].data = Object.values(monthlySales);
        chartTotalMonthlySales.data.datasets[1].data = Object.values(monthlyTransactions);
        chartTotalMonthlySales.update();
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
                        backgroundColor: "rgba(255, 99, 132,                        0.2)",
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

    // Function to create the top building transaction chart munculkan  bar chart untuk top 10 building transaction
    function createTopBuildingTransactionChart(data) {
        const ctx = document.getElementById("top-building-transaction-chart").getContext("2d");
        return new Chart(ctx, {
            type: "bar",
            data: {
                labels: data.map(property => property.BUILDING_CLASS_CATEGORY),
                datasets: [{
                    label: "Top 10 Building Transactions",
                    data: data.map(property => property.COMMERCIAL_UNITS + property.RESIDENTIAL_UNITS),
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



                            
