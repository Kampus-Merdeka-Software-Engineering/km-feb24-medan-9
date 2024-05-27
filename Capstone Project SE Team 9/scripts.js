// Fetch JSON data
fetch("./team-9-medan.json")
  .then((response) => response.json())
  .then(initializeDashboard)
  .catch((error) => console.error("Error fetching data:", error));

function initializeDashboard(data) {
  // Inisialisasi DataTables
  const tableResidential = initializeDataTable(
    "#top-sales-residential",
    data,
    "RESIDENTIAL_UNITS"
  );
  const tableCommercial = initializeDataTable(
    "#top-sales-commercial",
    data,
    "COMMERCIAL_UNITS"
  );
  const tableMonthlySalesPrice = initializeDataTablePrice(
    "#top-sales-monthly-price",
    data
  );
  const tableTopBuildingTransaction = initializeDataTableBuildingTransaction(
    "#top-building-transaction",
    data
  );

  // Inisialisasi elemen popup dan overlay
  const popup = document.getElementById("popup");
  const overlay = document.getElementById("overlay");

  // Event listeners
  document.querySelectorAll(".show-insight-btn").forEach((button) =>
    button.addEventListener("click", toggleDescription)
  );
  overlay.addEventListener("click", togglePopup);
  document.querySelectorAll(".sort-btn").forEach((button) =>
    button.addEventListener("click", toggleSortOptions)
  );
  document.querySelectorAll(".sort-option").forEach((option) =>
    option.addEventListener("click", (event) => {
      const chartType = event.target.dataset.chartType;
      const sortType = event.target.dataset.sortType;
      if (chartType === "neighborhood") {
        sortNeighborhoodChartData(sortType);
      } else if (chartType === "building") {
        sortBuildingChartData(sortType);
      }
    })
  );
  document
    .querySelector(".apply-filter-btn")
    .addEventListener("click", applyFilter);
  document
    .querySelector(".clear-filter-btn")
    .addEventListener("click", clearFilter);

  // Event listener untuk tombol "Apply Filter"
  document
    .getElementById("apply-transaction-filter")
    .addEventListener("click", applyTransactionFilter);

  // Fungsi untuk filter max min sesuai range total transaction by neighborhood   
  function applyTransactionFilter() {
    const min = parseInt(document.getElementById("min-transaction").value);
    const max = parseInt(document.getElementById("max-transaction").value);
    const filteredData = data.filter((property) => {
      const transaction = neighborhoodTransactions[property.NEIGHBORHOOD];
      return transaction >= min && transaction <= max;
    });
    updateChartsWithFilteredData(filteredData);
  }
  // Hitung statistik data
  let { neighborhoodTransactions, monthlySales, monthlyTransactions } =
    calculateDataStatistics(data);

  // Buat chart
  let chartNeighborhoodSales = createNeighborhoodSalesChart(
    neighborhoodTransactions
  );
  let chartTotalMonthlySales = createTotalMonthlySalesChart(
    monthlySales,
    monthlyTransactions
  );

  console.log(data);

  let dataForTopBuildingTransaction = [];
  let arrLabelTopBuildingTransaction = [];
  data.forEach((property) => {
    if (
      !arrLabelTopBuildingTransaction.includes(property.BUILDING_CLASS_CATEGORY)
    ) {
      arrLabelTopBuildingTransaction.push(property.BUILDING_CLASS_CATEGORY);
      dataForTopBuildingTransaction.push({
        BUILDING_CLASS_CATEGORY: property.BUILDING_CLASS_CATEGORY,
        SALE_PRICE: parseFloat(property.SALE_PRICE),
      });
    } else {
      let index = arrLabelTopBuildingTransaction.indexOf(
        property.BUILDING_CLASS_CATEGORY
      );
      dataForTopBuildingTransaction[index].SALE_PRICE += parseFloat(
        property.SALE_PRICE
      );
    }
  });

  dataForTopBuildingTransaction.sort((a, b) => b.SALE_PRICE - a.SALE_PRICE);

  let chartTopBuildingTransaction = createTopBuildingTransactionChart(
    dataForTopBuildingTransaction.slice(0, 10)
  ); // Gunakan top 10 data untuk chart

  // Fungsi untuk inisialisasi DataTable
  function initializeDataTable(selector, data, unitsKey) {
    return new DataTable(selector, {
      data: data,
      columns: [
        { data: "NEIGHBORHOOD" },
        { data: "BUILDING_CLASS_CATEGORY" },
        { data: unitsKey },
      ],
      order: [[2, "desc"]], // Default sort by total units descending
    });
  }

  // Fungsi untuk inisialisasi DataTable untuk total monthly sales price
  function initializeDataTablePrice(selector, data) {
    return new DataTable(selector, {
      data: data,
      columns: [{ data: "SALE_DATE" }, { data: "SALE_PRICE" }],
    });
  }

  // Fungsi untuk inisialisasi DataTable untuk top building transaction chart data
  function initializeDataTableBuildingTransaction(selector, data) {
    return new DataTable(selector, {
      data: data.slice(0, 10),
      columns: [{ data: "BUILDING_CLASS_CATEGORY" }, { data: "SALE_PRICE" }],
    });
  }

  // Fungsi untuk toggle display popup
  function togglePopup() {
    popup.style.display = popup.style.display === "block" ? "none" : "block";
    overlay.style.display =
      overlay.style.display === "block" ? "none" : "block";
  }

  // Fungsi untuk toggle display deskripsi
  function toggleDescription(event) {
    const description = event.target.nextElementSibling;
    description.style.display =
      description.style.display === "none" ? "block" : "none";
  }

  // Fungsi untuk hitung statistik data
  function calculateDataStatistics(data) {
    const neighborhoodTransactions = {};
    const monthlySales = {};
    const monthlyTransactions = {};

    data.forEach((property) => {
      const saleDate = new Date(property.SALE_DATE);
      const month = `${saleDate.getFullYear()}-${String(
        saleDate.getMonth() + 1
      ).padStart(2, "0")}`;

      neighborhoodTransactions[property.NEIGHBORHOOD] =
        (neighborhoodTransactions[property.NEIGHBORHOOD] || 0) + 1;
      monthlySales[month] =
        (monthlySales[month] || 0) + parseFloat(property.SALE_PRICE) || 0;
      monthlyTransactions[month] =
        (monthlyTransactions[month] || 0) + 1;
    });

    return { neighborhoodTransactions, monthlySales, monthlyTransactions };
  }

  // Fungsi untuk buat chart bar untuk neighborhood sales transactions
  function createNeighborhoodSalesChart(neighborhoodTransactions) {
    const ctx = document
      .getElementById("neighborhood-sales-chart")
      .getContext("2d");
    return new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(neighborhoodTransactions),
        datasets: [
          {
            label: "Total Transactions by Neighborhood",
            data: Object.values(neighborhoodTransactions),
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }

  // Fungsi untuk toggle display sort options
  function toggleSortOptions(event) {
    const sortOptions = event.target.nextElementSibling;
    sortOptions.style.display =
      sortOptions.style.display === "block" ? "none" : "block";
  }

  // Fungsi untuk sort chart data untuk NEIGHBORHOOD SALES CHART
  function sortNeighborhoodChartData(sortType) {
    const sortedData = Object.entries(neighborhoodTransactions).sort(
      ([, a], [, b]) => (sortType === "asc" ? a - b : b - a)
    );
    chartNeighborhoodSales.data.labels = sortedData.map(
      ([neighborhood]) => neighborhood
    );
    chartNeighborhoodSales.data.datasets[0].data = sortedData.map(
      ([, count]) => count
    );
    chartNeighborhoodSales.update();
  }

  function sortBuildingChartData(sortType) {
    const chart = Chart.getChart("top-building-transaction-chart");
    if (chart) {
      const data = chart.data.datasets[0].data;
      const labels = chart.data.labels;

      const sortedData = labels.map((label, index) => ({
        label: label,
        value: data[index],
      }));

      if (sortType === "asc") {
        sortedData.sort((a, b) => a.value - b.value);
      } else {
        sortedData.sort((a, b) => b.value - a.value);
      }

      chart.data.labels = sortedData.map((item) => item.label);
      chart.data.datasets[0].data = sortedData.map((item) => item.value);
      chart.update();
    }
  }

  // Fungsi untuk apply filter by date dan update charts dengan filtered data
  function applyFilter() {
    const startDate = new Date(document.getElementById("start-date").value);
    const endDate = new Date(document.getElementById("end-date").value);
    const filteredData = data.filter((property) => {
      const saleDate = new Date(property.SALE_DATE);
      return saleDate >= startDate && saleDate <= endDate;
    });
    updateChartsWithFilteredData(filteredData);
  }

  // Fungsi untuk clear filter dan reset charts
  function clearFilter() {
    document.getElementById("start-date").value = "";
    document.getElementById("end-date").value = "";
    updateChartsWithFilteredData(data);
  }
  // Fungsi untuk update semua charts dan DataTables dengan filtered data
  function updateChartsWithFilteredData(filteredData) {
    const { neighborhoodTransactions, monthlySales, monthlyTransactions } =
      calculateDataStatistics(filteredData);

    updateNeighborhoodSalesChart(neighborhoodTransactions);
    updateTotalMonthlySalesChart(monthlySales, monthlyTransactions);
    updateTopBuildingTransactionChart(filteredData.slice(0, 10));
    updateDataTables(filteredData);
  }

  // Fungsi untuk update neighborhood sales chart
  function updateNeighborhoodSalesChart(neighborhoodTransactions) {
    chartNeighborhoodSales.data.labels = Object.keys(neighborhoodTransactions);
    chartNeighborhoodSales.data.datasets[0].data = Object.values(
      neighborhoodTransactions
    );
    chartNeighborhoodSales.update();
  }

  // Fungsi untuk update total monthly sales chart
  function updateTotalMonthlySalesChart(monthlySales, monthlyTransactions) {
    chartTotalMonthlySales.data.labels = Object.keys(monthlySales);
    chartTotalMonthlySales.data.datasets[0].data = Object.values(monthlySales);
    chartTotalMonthlySales.data.datasets[1].data =
      Object.values(monthlyTransactions);
    chartTotalMonthlySales.update();
  }

  // Fungsi untuk update top building transaction chart
  function updateTopBuildingTransactionChart(data) {
    chartTopBuildingTransaction.data.labels = data.map(
      (property) => property.BUILDING_CLASS_CATEGORY
    );
    chartTopBuildingTransaction.data.datasets[0].data = data.map((property) =>
      parseFloat(property.SALE_PRICE)
    );
    chartTopBuildingTransaction.update();
  }

  // Fungsi untuk update DataTables dengan filtered data
  function updateDataTables(filteredData) {
    tableResidential.clear().rows.add(filteredData).draw();
    tableCommercial.clear().rows.add(filteredData).draw();
    tableMonthlySalesPrice.clear().rows.add(filteredData).draw();
    tableTopBuildingTransaction
      .clear()
      .rows.add(filteredData.slice(0, 10))
      .draw();
  }

  // Fungsi untuk buat total monthly sales chart
  function createTotalMonthlySalesChart(monthlySales, monthlyTransactions) {
    const ctx = document
      .getElementById("total-monthly-sales-chart")
      .getContext("2d");
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
            yAxisID: "y",
          },
          {
            label: "Total Monthly Transactions",
            data: Object.values(monthlyTransactions),
            borderWidth: 1,
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            fill: true,
            yAxisID: "y1",
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            position: "left",
            title: {
              display: true,
              text: "Total Sales Price",
            },
          },
          y1: {
            beginAtZero: true,
            position: "right",
            title: {
              display: true,
              text: "Total Transactions",
            },
          },
        },
      },
    });
  }

  // Fungsi untuk buat top building transaction chart
  function createTopBuildingTransactionChart(data) {
    const ctx = document
      .getElementById("top-building-transaction-chart")
      .getContext("2d");
    const labels = data.map((item) => item.BUILDING_CLASS_CATEGORY);
    const salesData = data.map((item) => item.SALE_PRICE);

    return new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Sales",
            data: salesData,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: { beginAtZero: true },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || "";
                if (label) {
                  label += ": ";
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(context.parsed.y);
                }
                return label;
              },
            },
          },
        },
      },
    });
  }
}
