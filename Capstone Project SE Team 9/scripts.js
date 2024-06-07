document.addEventListener("DOMContentLoaded", () => {
  fetch("./team-9-medan.json")
    .then((response) => response.json())
    .then(initializeDashboard)
    .catch((error) => console.error("Error fetching data:", error));
});

function initializeDashboard(data) {
  setMinMaxDates("2016-09", "2017-08");
  initializeDataTables(data);
  initializePopupsAndOverlays();
  initializeEmailJS();
  initializeEventListeners();
  initializeChartsAndInsights(data);
}

function setMinMaxDates(minDate, maxDate) {
  ["start-date", "end-date"].forEach((id) => {
    const element = document.getElementById(id);
    element.setAttribute("min", minDate);
    element.setAttribute("max", maxDate);
  });
}

function initializeDataTables(data) {
  initializeDataTable("#top-sales-residential", data, "RESIDENTIAL_UNITS");
  initializeDataTable("#top-sales-commercial", data, "COMMERCIAL_UNITS");
  initializeDataTablePrice("#top-sales-monthly-price", data);
  initializeDataTableBuildingTransaction("#top-building-transaction", data);
}

function initializePopupsAndOverlays() {
  const popup = document.getElementById("popup");
  const overlay = document.getElementById("overlay");
  overlay.addEventListener("click", togglePopup);
}

function initializeEmailJS() {
  emailjs.init("AktJbbI84hHDSO86e");
  const btn = document.getElementById("button");
  document.getElementById("form").addEventListener("submit", (event) => {
    event.preventDefault();
    btn.value = "Sending...";
    emailjs.sendForm("capstone_project", "template_o390uu1", event.target)
      .then(() => {
        btn.value = "Send Email";
        alert("Email sent successfully!");
      })
      .catch((err) => {
        btn.value = "Send Email";
        alert("Failed to send email. Please try again later.");
        console.error("Error sending email:", err);
      });
  });
}

function initializeEventListeners() {
  document.querySelectorAll(".sort-btn").forEach((button) => 
    button.addEventListener("click", toggleSortOptions)
  );
  document.querySelectorAll(".sort-option").forEach((option) => 
    option.addEventListener("click", handleSortOptionClick)
  );
  document.querySelectorAll(".show-insight-btn2").forEach((button) => 
    button.addEventListener("click", toggleDescription.bind(null, "description2"))
  );
  document.querySelectorAll(".show-insight-btn3").forEach((button) => 
    button.addEventListener("click", toggleDescription.bind(null, "description3"))
  );
  document.querySelector(".apply-filter-btn").addEventListener("click", applyFilter);
  document.querySelector(".clear-filter-btn").addEventListener("click", clearFilter);
  document.getElementById("apply-transaction-filter").addEventListener("click", applyTransactionFilter);
  document.getElementById("clear-transaction-filter").addEventListener("click", clearTransactionFilter);
}

function initializeChartsAndInsights(data) {
  let { neighborhoodTransactions, monthlySales, monthlyTransactions } = calculateDataStatistics(data);
  let chartNeighborhoodSales = createNeighborhoodSalesChart(neighborhoodTransactions);
  let chartTotalMonthlySales = createTotalMonthlySalesChart(monthlySales, monthlyTransactions);
  let chartTopBuildingTransaction = createTopBuildingTransactionChart(data);

  ["total-monthly-sales-chart", "neighborhood-sales-chart", "top-building-transaction-chart"].forEach((chartId) => {
    document.getElementById(chartId).onclick = (event) => handleChartClick(event, Chart.getChart(chartId));
  });

  data.sort((a, b) => new Date(a.SALE_DATE) - new Date(b.SALE_DATE));
  let defaultStartDate = new Date(data[0].SALE_DATE);
  let defaultEndDate = new Date(data[data.length - 1].SALE_DATE);
  updateInsights(data, defaultStartDate, defaultEndDate);
  updateInsights2(data);
}

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
  const popup = document.getElementById("popup");
  const overlay = document.getElementById("overlay");
  popup.style.display = popup.style.display === "block" ? "none" : "block";
  overlay.style.display = overlay.style.display === "block" ? "none" : "block";
}

function toggleDescription(className, event) {
  const description = document.querySelector(`#growth-chart-2 .${className}`);
  description.style.display = description.style.display === "none" ? "block" : "none";
}

function handleSortOptionClick(event) {
  const chartType = event.target.dataset.chartType;
  const sortType = event.target.dataset.sortType;
  if (chartType === "neighborhood") {
    sortChartData(chartNeighborhoodSales, sortType, "description2");
  } else if (chartType === "building") {
    sortChartData(chartTopBuildingTransaction, sortType, "description3");
  }
}

function sortChartData(chart, sortType, descriptionClass) {
  const labels = chart.data.labels;
  const data = chart.data.datasets[0].data;
  const sortedData = labels.map((label, index) => ({ label, value: data[index] }));
  
  sortedData.sort((a, b) => sortType === "asc" ? a.value - b.value : b.value - a.value);
  
  chart.data.labels = sortedData.map(item => item.label);
  chart.data.datasets[0].data = sortedData.map(item => item.value);
  chart.update();

  const maxData = Math.max(...chart.data.datasets[0].data);
  const minData = Math.min(...chart.data.datasets[0].data);
  const insightText = `Data telah diurutkan berdasarkan ${sortType === "asc" ? "terendah" : "tertinggi"}. 
    Data Tertinggi: ${maxData} Berada di ${sortedData.find(item => item.value === maxData).label}
    Data Terendah: ${minData} Berada di ${sortedData.find(item => item.value === minData).label}`;
  
  document.querySelectorAll(`.${descriptionClass}`).forEach((description) => {
    description.innerHTML = insightText;
  });
}

function applyFilter() {
  const startDate = new Date(document.getElementById("start-date").value);
  const endDate = new Date(document.getElementById("end-date").value);
  const minDate = new Date(document.getElementById("start-date").getAttribute("min"));
  const maxDate = new Date(document.getElementById("end-date").getAttribute("max"));

  if (isInvalidDateRange(startDate, endDate, minDate, maxDate)) {
    alert(`Please select dates within the range ${minDate.toLocaleDateString()} to ${maxDate.toLocaleDateString()}.`);
    return;
  }

  const filteredData = data.filter(property => {
    const saleDate = new Date(property.SALE_DATE);
    return saleDate >= startDate && saleDate <= endDate;
  });

  updateChartsWithFilteredData(filteredData);
  updateInsights(filteredData, startDate, endDate);
}

function clearFilter() {
  document.getElementById("start-date").value = "";
  document.getElementById("end-date").value = "";
  updateChartsWithFilteredData(data);
  updateInsights(data);
}

function applyTransactionFilter() {
  const minTransaction = parseInt(document.getElementById("min-transaction").value);
  const maxTransaction = parseInt(document.getElementById("max-transaction").value);
  const minTransactionValue = parseInt(document.getElementById("min-transaction").getAttribute("min"));
  const maxTransactionValue = parseInt(document.getElementById("max-transaction").getAttribute("max"));

  if (isNaN(minTransaction) || isNaN(maxTransaction) || isInvalidTransactionRange(minTransaction, maxTransaction, minTransactionValue, maxTransactionValue)) {
    alert(`Please select transactions within the range ${minTransactionValue} to ${maxTransactionValue}.`);
    return;
  }

  const filteredData = data.filter(property => {
    const transaction = neighborhoodTransactions[property.NEIGHBORHOOD] || 0;
    return transaction >= minTransaction && transaction <= maxTransaction;
  });

  updateNeighborhoodSalesChart(filteredData);
  updateInsights2(filteredData);
}

function clearTransactionFilter() {
  document.getElementById("min-transaction").value = "";
  document.getElementById("max-transaction").value = "";
  updateNeighborhoodSalesChart(data);
  updateInsights2(data);
}

function updateNeighborhoodSalesChart(filteredData) {
  const neighborhoodTransactions = calculateNeighborhoodTransactions(filteredData);
  updateChartData(chartNeighborhoodSales, neighborhoodTransactions);
}

function updateChartsWithFilteredData(filteredData) {
  const monthlySales = calculateMonthlySales(filteredData);
  const monthlyTransactions = calculateMonthlyTransactions(filteredData);
  updateChartData(chartTotalMonthlySales, monthlySales);
  updateChartData(chartTotalMonthlyTransactions, monthlyTransactions);
}

function updateChartData(chart, data) {
  chart.data.labels = Object.keys(data);
  chart.data.datasets[0].data = Object.values(data);
  chart.update();
}

function handleChartClick(event, chart) {
  const activePoints = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
  if (activePoints.length) {
    const datasetIndex = activePoints[0].datasetIndex;
    const index = activePoints[0].index;
    const label = chart.data.labels[index];
    const value = chart.data.datasets[datasetIndex].data[index];
    alert(`Label: ${label}\nValue: ${value}`);
  }
}

function isInvalidDateRange(startDate, endDate, minDate, maxDate) {
  return startDate < minDate || endDate > maxDate || startDate > endDate;
}

function isInvalidTransactionRange(minTransaction, maxTransaction, minTransactionValue, maxTransactionValue) {
  return minTransaction < minTransactionValue || maxTransaction > maxTransactionValue || minTransaction > maxTransaction;
}

function calculateNeighborhoodTransactions(data) {
  return data.reduce((acc, property) => {
    const neighborhood = property.NEIGHBORHOOD;
    acc[neighborhood] = (acc[neighborhood] || 0) + 1;
    return acc;
  }, {});
}

function calculateMonthlySales(data) {
  return data.reduce((acc, property) => {
    const saleDate = new Date(property.SALE_DATE);
    const monthYear = `${saleDate.getFullYear()}-${saleDate.getMonth() + 1}`;
    acc[monthYear] = (acc[monthYear] || 0) + property.SALE_PRICE;
    return acc;
  }, {});
}

function calculateMonthlyTransactions(data) {
  return data.reduce((acc, property) => {
    const saleDate = new Date(property.SALE_DATE);
    const monthYear = `${saleDate.getFullYear()}-${saleDate.getMonth() + 1}`;
    acc[monthYear] = (acc[monthYear] || 0) + 1;
    return acc;
  }, {});
}

function updateInsights(data, startDate, endDate) {
  const totalSales = data.reduce((acc, property) => acc + property.SALE_PRICE, 0);
  const totalTransactions = data.length;
  const highestSale = Math.max(...data.map(property => property.SALE_PRICE));
  const lowestSale = Math.min(...data.map(property => property.SALE_PRICE));
  document.getElementById("insight-total-sales").innerText = `Total Sales: ${totalSales}`;
  document.getElementById("insight-total-transactions").innerText = `Total Transactions: ${totalTransactions}`;
  document.getElementById("insight-highest-sale").innerText = `Highest Sale: ${highestSale}`;
  document.getElementById("insight-lowest-sale").innerText = `Lowest Sale: ${lowestSale}`;
}

function updateInsights2(data) {
  const neighborhoodTransactions = calculateNeighborhoodTransactions(data);
  const maxTransactionNeighborhood = Object.keys(neighborhoodTransactions).reduce((a, b) => neighborhoodTransactions[a] > neighborhoodTransactions[b] ? a : b);
  const minTransactionNeighborhood = Object.keys(neighborhoodTransactions).reduce((a, b) => neighborhoodTransactions[a] < neighborhoodTransactions[b] ? a : b);
  document.getElementById("insight-max-transaction").innerText = `Neighborhood with Max Transactions: ${maxTransactionNeighborhood} (${neighborhoodTransactions[maxTransactionNeighborhood]})`;
  document.getElementById("insight-min-transaction").innerText = `Neighborhood with Min Transactions: ${minTransactionNeighborhood} (${neighborhoodTransactions[minTransactionNeighborhood]})`;
}

function createNeighborhoodSalesChart(neighborhoodTransactions) {
  return new Chart(document.getElementById("neighborhood-sales-chart"), {
    type: "bar",
    data: {
      labels: Object.keys(neighborhoodTransactions),
      datasets: [{
        label: "Transactions",
        data: Object.values(neighborhoodTransactions),
      }],
    },
  });
}

function createTotalMonthlySalesChart(monthlySales, monthlyTransactions) {
  return new Chart(document.getElementById("total-monthly-sales-chart"), {
    type: "line",
    data: {
      labels: Object.keys(monthlySales),
      datasets: [
        {
          label: "Sales",
          data: Object.values(monthlySales),
          borderColor: "rgba(75, 192, 192, 1)",
          fill: false,
        },
        {
          label: "Transactions",
          data: Object.values(monthlyTransactions),
          borderColor: "rgba(153, 102, 255, 1)",
          fill: false,
        },
      ],
    },
  });
}

function createTopBuildingTransactionChart(data) {
  const buildingTransactionData = calculateBuildingTransactionData(data);
  return new Chart(document.getElementById("top-building-transaction-chart"), {
    type: "horizontalBar",
    data: {
      labels: Object.keys(buildingTransactionData),
      datasets: [{
        label: "Sales",
        data: Object.values(buildingTransactionData),
      }],
    },
  });
}

function calculateBuildingTransactionData(data) {
  return data.reduce((acc, property) => {
    const buildingType = property.BUILDING_CLASS_CATEGORY;
    acc[buildingType] = (acc[buildingType] || 0) + property.SALE_PRICE;
    return acc;
  }, {});
}
