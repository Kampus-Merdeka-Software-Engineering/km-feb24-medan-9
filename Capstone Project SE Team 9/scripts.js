// Fetch JSON data
fetch('./team-9-medan.json')
    .then(response => response.json())
    .then(initializeDashboard)
    .catch(error => console.error('Error fetching data:', error));

// Function to initialize the dashboard
function initializeDashboard(data) {
    // Initialize DataTable for top 10 residential units
    const tableResidential = initializeDataTable('#top-sales-residential', data, 'RESIDENTIAL_UNITS');

    // Initialize DataTable for top 10 commercial units
    const tableCommercial = initializeDataTable('#top-sales-commercial', data, 'COMMERCIAL_UNITS');

    // Initialize popup and overlay elements
    const popup = document.getElementById("popup");
    const overlay = document.getElementById("overlay");

    // Add click event listeners to "Insights" buttons
    document.querySelectorAll(".show-insight-btn")
        .forEach(button => button.addEventListener("click", togglePopup));

    // Add click event listener to overlay to close popup
    overlay.addEventListener("click", () => togglePopup());

    // Calculate transactions by neighborhood
    const neighborhoodTransactions = calculateNeighborhoodTransactions(data);

    // Create bar chart to display total transactions by neighborhood
    const chart = createNeighborhoodSalesChart(neighborhoodTransactions);

    // Add click event listener to sort button
    document.querySelector('.sort-btn').addEventListener('click', toggleSortOptions);

    // Add click event listeners to sort options
    document.querySelectorAll('.sort-option')
        .forEach(option => option.addEventListener('click', event => sortChartData(event.target.dataset.sortType)));

    // Functions
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

    function togglePopup() {
        popup.style.display = popup.style.display === "block" ? "none" : "block";
        overlay.style.display = overlay.style.display === "block" ? "none" : "block";
    }

    function calculateNeighborhoodTransactions(data) {
        const neighborhoodTransactions = {};
        data.forEach(property => {
            neighborhoodTransactions[property.NEIGHBORHOOD] = (neighborhoodTransactions[property.NEIGHBORHOOD] || 0) + 1;
        });
        return Object.entries(neighborhoodTransactions)
            .sort((a, b) => a[1] - b[1])
            .reduce((obj, [neighborhood, count]) => ({ ...obj, [neighborhood]: count }), {});
    }

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

    function toggleSortOptions() {
        const sortOptions = document.querySelector('.sort-options');
        sortOptions.style.display = sortOptions.style.display === "block" ? "none" : "block";
    }

    function sortChartData(sortType) {
        const sortedData = Object.entries(neighborhoodTransactions)
            .sort((a, b) => sortType === 'asc' ? a[1] - b[1] : b[1] - a[1]);
        chart.data.labels = sortedData.map(([neighborhood]) => neighborhood);
        chart.data.datasets[0].data = sortedData.map(([, count]) => count);
        chart.update();
    }
}










   
