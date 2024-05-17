// Fetch JSON data
fetch('./team-9-medan.json')
    .then(response => response.json()) // Mengubah response menjadi JSON
    .then(initializeDashboard) // Memanggil fungsi initializeDashboard dengan data JSON
    .catch(error => console.error('Error fetching data:', error)); // Menangkap dan menampilkan error jika gagal mengambil data

// Function to initialize the dashboard
function initializeDashboard(data) {
    // Inisialisasi DataTable untuk 10 unit residensial teratas
    const tableResidential = initializeDataTable('#top-sales-residential', data, 'RESIDENTIAL_UNITS');

    // Inisialisasi DataTable untuk 10 unit komersial teratas
    const tableCommercial = initializeDataTable('#top-sales-commercial', data, 'COMMERCIAL_UNITS');

    // Inisialisasi elemen popup dan overlay
    const popup = document.getElementById("popup");
    const overlay = document.getElementById("overlay");

    // Menambahkan event listener klik ke tombol "Insights"
    document.querySelectorAll(".show-insight-btn")
        .forEach(button => button.addEventListener("click", togglePopup));

    // Menambahkan event listener klik ke overlay untuk menutup popup
    overlay.addEventListener("click", () => togglePopup());

    // Menghitung transaksi berdasarkan lingkungan
    const neighborhoodTransactions = calculateNeighborhoodTransactions(data);

    // Membuat bar chart untuk menampilkan total transaksi per lingkungan
    const chart = createNeighborhoodSalesChart(neighborhoodTransactions);

    // Menambahkan event listener klik ke tombol sort
    document.querySelector('.sort-btn').addEventListener('click', toggleSortOptions);

    // Menambahkan event listener klik ke opsi sort
    document.querySelectorAll('.sort-option')
        .forEach(option => option.addEventListener('click', event => sortChartData(event.target.dataset.sortType)));

    // Function untuk menginisialisasi DataTable
    function initializeDataTable(selector, data, unitsKey) {
        return new DataTable(selector, {
            data: data,
            columns: [
                { data: 'NEIGHBORHOOD' }, // Kolom untuk lingkungan
                { data: 'BUILDING_CLASS_CATEGORY' }, // Kolom untuk kategori kelas bangunan
                { data: unitsKey } // Kolom untuk jumlah unit (residensial/komersial)
            ]
        });
    }

    // Function untuk menampilkan atau menyembunyikan popup
    function togglePopup() {
        popup.style.display = popup.style.display === "block" ? "none" : "block";
        overlay.style.display = overlay.style.display === "block" ? "none" : "block";
    }

    // Function untuk menghitung transaksi berdasarkan lingkungan
    function calculateNeighborhoodTransactions(data) {
        const neighborhoodTransactions = {};
        data.forEach(property => {
            neighborhoodTransactions[property.NEIGHBORHOOD] = (neighborhoodTransactions[property.NEIGHBORHOOD] || 0) + 1;
        });
        return Object.entries(neighborhoodTransactions)
            .sort((a, b) => a[1] - b[1])
            .reduce((obj, [neighborhood, count]) => ({ ...obj, [neighborhood]: count }), {});
    }

    // Function untuk membuat bar chart transaksi per lingkungan
    function createNeighborhoodSalesChart(neighborhoodTransactions) {
        const ctx = document.getElementById("neighborhood-sales-chart").getContext("2d");
        return new Chart(ctx, {
            type: "bar",
            data: {
                labels: Object.keys(neighborhoodTransactions), // Label untuk lingkungan
                datasets: [{
                    label: "Total Transactions by Neighborhood",
                    data: Object.values(neighborhoodTransactions), // Data jumlah transaksi per lingkungan
                    borderWidth: 1,
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true } // Sumbu y dimulai dari nol
                }
            }
        });
    }

    // Function untuk menampilkan atau menyembunyikan opsi sort
    function toggleSortOptions() {
        const sortOptions = document.querySelector('.sort-options');
        sortOptions.style.display = sortOptions.style.display === "block" ? "none" : "block";
    }

    // Function untuk mengurutkan data chart
    function sortChartData(sortType) {
        const sortedData = Object.entries(neighborhoodTransactions)
            .sort((a, b) => sortType === 'asc' ? a[1] - b[1] : b[1] - a[1]); // Mengurutkan data berdasarkan jenis sort
        chart.data.labels = sortedData.map(([neighborhood]) => neighborhood); // Mengatur label chart dengan data terurut
        chart.data.datasets[0].data = sortedData.map(([, count]) => count); // Mengatur data chart dengan data terurut
        chart.update(); // Mengupdate chart dengan data terbaru
    }
}
s
