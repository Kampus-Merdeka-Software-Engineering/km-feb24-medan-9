document.addEventListener("DOMContentLoaded", () => {
  fetch("./team-9-medan.json")
      .then((response) => response.json())
      .then(initializeDashboard)
      .catch((error) => console.error("Error fetching data:", error));
});

function initializeDashboard(data) {
  // Initialize DataTables
  const tableResidential = initializeDataTable("#top-sales-residential", data, "RESIDENTIAL_UNITS");
  const tableCommercial = initializeDataTable("#top-sales-commercial", data, "COMMERCIAL_UNITS");
  const tableMonthlySalesPrice = initializeDataTablePrice("#top-sales-monthly-price", data);
  const tableTopBuildingTransaction = initializeDataTableBuildingTransaction("#top-building-transaction", data);

  // Initialize popup and overlay elements
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
  document.querySelector(".apply-filter-btn").addEventListener("click", applyFilter);
  document.querySelector(".clear-filter-btn").addEventListener("click", clearFilter);
  document.getElementById("apply-transaction-filter").addEventListener("click", applyTransactionFilter);

  let { neighborhoodTransactions, monthlySales, monthlyTransactions } = calculateDataStatistics(data);

  let chartNeighborhoodSales = createNeighborhoodSalesChart(neighborhoodTransactions);
  let chartTotalMonthlySales = createTotalMonthlySalesChart(monthlySales, monthlyTransactions);

  console.log(data);

  let dataForTopBuildingTransaction = [];
  let arrLabelTopBuildingTransaction = [];
  let arrValueTopBuildingTransaction = [];
  data.forEach((property) => {
      if (arrLabelTopBuildingTransaction.indexOf(property.BUILDING_CLASS_CATEGORY) === -1) {
          arrLabelTopBuildingTransaction.push(property.BUILDING_CLASS_CATEGORY);
          arrValueTopBuildingTransaction.push(parseFloat(property.SALE_PRICE));
      } else {
          arrValueTopBuildingTransaction[arrLabelTopBuildingTransaction.indexOf(property.BUILDING_CLASS_CATEGORY)] += parseFloat(property.SALE_PRICE);
      }
  });

  for (let i = 0; i < arrLabelTopBuildingTransaction.length; i++) {
      dataForTopBuildingTransaction.push({
          BUILDING_CLASS_CATEGORY: arrLabelTopBuildingTransaction[i],
          SALE_PRICE: arrValueTopBuildingTransaction[i]
      });
  }

  dataForTopBuildingTransaction.sort((a, b) => b.SALE_PRICE - a.SALE_PRICE);

  let chartTopBuildingTransaction = createTopBuildingTransactionChart(dataForTopBuildingTransaction.slice(0, 10));

  function initializeDataTable(selector, data, unitsKey) {
      return new DataTable(selector, {
          data: data,
          columns: [
              { data: "NEIGHBORHOOD" },
              { data: "BUILDING_CLASS_CATEGORY" },
              { data: unitsKey },
          ],
          order: [[2, "desc"]],
      });
  }

  function initializeDataTablePrice(selector, data) {
      return new DataTable(selector, {
          data: data,
          columns: [{ data: "SALE_DATE" }, { data: "SALE_PRICE" }],
      });
  }

  function initializeDataTableBuildingTransaction(selector, data) {
      return new DataTable(selector, {
          data: data.slice(0, 10),
          columns: [{ data: "BUILDING_CLASS_CATEGORY" }, { data: "SALE_PRICE" }],
      });
  }

  function togglePopup() {
      popup.style.display = popup.style.display === "block" ? "none" : "block";
      overlay.style.display = overlay.style.display === "block" ? "none" : "block";
  }

  function toggleDescription(event) {
      const description = event.target.nextElementSibling;
      description.style.display = description.style.display === "none" ? "block" : "none";
  }

  function calculateDataStatistics(data) {
      const neighborhoodTransactions = {};
      const monthlySales = {};
      const monthlyTransactions = {};

      data.forEach((property) => {
          const saleDate = new Date(property.SALE_DATE);
          const month = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, "0")}`;

          neighborhoodTransactions[property.NEIGHBORHOOD] = (neighborhoodTransactions[property.NEIGHBORHOOD] || 0) + 1;
          monthlySales[month] = (monthlySales[month] || 0) + parseFloat(property.SALE_PRICE) || 0;
          monthlyTransactions[month] = (monthlyTransactions[month] || 0) + 1;
      });

      return { neighborhoodTransactions, monthlySales, monthlyTransactions };
  }

  function createNeighborhoodSalesChart(neighborhoodTransactions) {
      const ctx = document.getElementById("neighborhood-sales-chart").getContext("2d");
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

  function toggleSortOptions(event) {
      const sortOptions = event.target.nextElementSibling;
      sortOptions.style.display = sortOptions.style.display === "block" ? "none" : "block";
  }

  function sortNeighborhoodChartData(sortType) {
      const sortedData = Object.entries(neighborhoodTransactions).sort(
          ([, a], [, b]) => (sortType === "asc" ? a - b : b - a)
      );
      chartNeighborhoodSales.data.labels = sortedData.map(([neighborhood]) => neighborhood);
      chartNeighborhoodSales.data.datasets[0].data = sortedData.map(([, count]) => count);
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

  function applyFilter() {
      const startDate = new Date(document.getElementById("start-date").value);
      const endDate = new Date(document.getElementById("end-date").value);
      const filteredData = data.filter((property) => {
          const saleDate = new Date(property.SALE_DATE);
          return saleDate >= startDate && saleDate <= endDate;
      });
      updateChartsWithFilteredData(filteredData);
  }

  function clearFilter() {
      document.getElementById("start-date").value = "";
      document.getElementById("end-date").value = "";
      updateChartsWithFilteredData(data);
  }

  function applyTransactionFilter() {
      const min = parseInt(document.getElementById("min-transaction").value);
      const max = parseInt(document.getElementById("max-transaction").value);
      const filteredData = data.filter((property) => {
          const transaction = neighborhoodTransactions[property.NEIGHBORHOOD];
          return transaction >= min && transaction <= max;
      });
      updateChartsWithFilteredData(filteredData);
  }

  function updateChartsWithFilteredData(filteredData) {
      const { neighborhoodTransactions, monthlySales, monthlyTransactions } = calculateDataStatistics(filteredData);
      chartNeighborhoodSales.data.labels = Object.keys(neighborhoodTransactions);
      chartNeighborhoodSales.data.datasets[0].data = Object.values(neighborhoodTransactions);
      chartNeighborhoodSales.update();

      chartTotalMonthlySales.data.labels = Object.keys(monthlySales);
      chartTotalMonthlySales.data.datasets[0].data = Object.values(monthlySales);
      chartTotalMonthlySales.data.datasets[1].data = Object.values(monthlyTransactions);
      chartTotalMonthlySales.update();
  }

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
                      borderColor: "blue",
                      borderWidth: 1,
                      fill: false,
                  },
                  {
                      label: "Total Monthly Transactions",
                      data: Object.values(monthlyTransactions),
                      borderColor: "green",
                      borderWidth: 1,
                      fill: false,
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

  function createTopBuildingTransactionChart(data) {
      const ctx = document.getElementById("top-building-transaction-chart").getContext("2d");
      return new Chart(ctx, {
          type: "bar",
          data: {
              labels: data.map((item) => item.BUILDING_CLASS_CATEGORY),
              datasets: [
                  {
                      label: "Top Building Transactions by Sale Price",
                      data: data.map((item) => item.SALE_PRICE),
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
}
