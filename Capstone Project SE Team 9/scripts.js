document.addEventListener("DOMContentLoaded", () => {
  fetch("./team-9-medan.json")
    .then((response) => response.json())
    .then(initializeDashboard)
    .catch((error) => console.error("Error fetching data:", error));
});

function initializeDashboard(data) {
   // Set min and max dates for the date inputs
   const minDate = "2016-09";
   const maxDate = "2017-08";
   document.getElementById("start-date").setAttribute("min", minDate);
   document.getElementById("start-date").setAttribute("max", maxDate);
   document.getElementById("end-date").setAttribute("min", minDate);
   document.getElementById("end-date").setAttribute("max", maxDate);
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

  overlay.addEventListener("click", togglePopup);
  document
    .querySelectorAll(".sort-btn")
    .forEach((button) => button.addEventListener("click", toggleSortOptions));
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
 
  //Kritik dan Saran to email 
 (function(){
   emailjs.init('AktJbbI84hHDSO86e');
  const btn = document.getElementById('button');

  document.getElementById('form').addEventListener('submit', function(event) {
      event.preventDefault();

      btn.value = 'Sending...';

      const serviceID = 'capstone_project';
      const templateID = 'template_o390uu1';

      emailjs.sendForm(serviceID, templateID, this)
          .then(() => {
              btn.value = 'Send Email';
              alert('Email sent successfully!');
          }, (err) => {
              btn.value = 'Send Email';
              alert('Failed to send email. Please try again later.');
              console.error('Error sending email:', err);
          });
  });
})();


  // Event listeners untuk show-insight-btn2 dan show-insight-btn3
  document
    .querySelectorAll(".show-insight-btn2")
    .forEach((button) => button.addEventListener("click", toggleDescription2));

  document
    .querySelectorAll(".show-insight-btn3")
    .forEach((button) => button.addEventListener("click", toggleDescription3));
  document
    .querySelector(".apply-filter-btn")
    .addEventListener("click", applyFilter);
  document
    .querySelector(".clear-filter-btn")
    .addEventListener("click", clearFilter);
  document
    .getElementById("apply-transaction-filter")
    .addEventListener("click", applyTransactionFilter);
  document
    .getElementById("clear-transaction-filter")
    .addEventListener("click", clearTransactionFilter);

  let { neighborhoodTransactions, monthlySales, monthlyTransactions } =
    calculateDataStatistics(data);

  let chartNeighborhoodSales = createNeighborhoodSalesChart(
    neighborhoodTransactions
  );
  let chartTotalMonthlySales = createTotalMonthlySalesChart(
    monthlySales,
    monthlyTransactions
  );
  let chartTopBuildingTransaction = createTopBuildingTransactionChart(data);

  // Tambahkan event listener untuk klik chart
  document.getElementById("total-monthly-sales-chart").onclick = (event) =>
    handleChartClick(event, chartTotalMonthlySales);
  document.getElementById("neighborhood-sales-chart").onclick = (event) =>
    handleChartClick(event, chartNeighborhoodSales);
  document.getElementById("top-building-transaction-chart").onclick = (event) =>
    handleChartClick(event, chartTopBuildingTransaction);

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
    overlay.style.display =
      overlay.style.display === "block" ? "none" : "block";
  }

  function toggleDescription2(event) {
    const description = document.querySelector("#growth-chart-2 .description2");
    description.style.display =
      description.style.display === "none" ? "block" : "none";
  }

  function toggleDescription3(event) {
    const description = document.querySelector("#growth-chart-3 .description3");
    description.style.display =
      description.style.display === "none" ? "block" : "none";
  }

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
      monthlyTransactions[month] = (monthlyTransactions[month] || 0) + 1;
    });

    return { neighborhoodTransactions, monthlySales, monthlyTransactions };
  }

  function createNeighborhoodSalesChart(neighborhoodTransactions) {
    console.log(neighborhoodTransactions);
    const amounts = Object.values(neighborhoodTransactions);
    //MAX =1329 MIN = 22
    const highestAmount = 1329;
    const minAmount = 22;
    console.log(highestAmount);
    console.log(minAmount);

    document.getElementById("min-transaction").max = highestAmount;
    document.getElementById("min-transaction").min = minAmount;


    

    const ctx = document
      .getElementById("neighborhood-sales-chart")
      .getContext("2d");
    return new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(neighborhoodTransactions),
        datasets: [
          {
            label: "Total Transaction by Neighborhood",
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
    sortOptions.style.display =
      sortOptions.style.display === "block" ? "none" : "block";
  }

  function sortNeighborhoodChartData(sortType) {
    let arrLabels = chartNeighborhoodSales.data.labels;
    let arrData = chartNeighborhoodSales.data.datasets[0].data;
    let arrTempSortData = [];
    for (let i = 0; i < arrLabels.length; i++) {
      arrTempSortData.push({
        chartLabel: arrLabels[i],
        chartData: arrData[i],
      });
    }
    // Sort the data based on the sortType
    arrTempSortData.sort((a, b) => sortType === 'asc' ? (a.chartData - b.chartData) : (b.chartData - a.chartData));
    // Update chart data with sorted labels and data
    chartNeighborhoodSales.data.labels = arrTempSortData.map((element) => element.chartLabel);
    chartNeighborhoodSales.data.datasets[0].data = arrTempSortData.map((element) => element.chartData);
    chartNeighborhoodSales.update();

    
    // Update the description based on the sortType  dibwah button insight
    document.querySelectorAll(".description2").forEach((description) => {
      description.innerHTML =
        sortType === "asc" ? ascDescription : descDescription;
    });
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
    // insight top building transaction
    let insightText3 = `Data telah diurutkan berdasarkan ${sortType === "asc" ? "terendah" : "tertinggi"}.
    Data Tertinggi : ${Math.max(...chart.data.datasets[0].data)} Berada di ${chart.data.labels.find((label) => chart.data.datasets[0].data[chart.data.labels.indexOf(label)] === Math.max(...chart.data.datasets[0].data)) }
    Data Terendah : ${Math.min(...chart.data.datasets[0].data)} Berada di ${chart.data.labels.find((label) => chart.data.datasets[0].data[chart.data.labels.indexOf(label)] === Math.min(...chart.data.datasets[0].data)) }
    `;
    // Update the description based on the insight 
    document.querySelectorAll(".description3").forEach((description) => {
      description.innerHTML = insightText3;
    });

    

  }


  function applyFilter() {
    const startDate = new Date(document.getElementById("start-date").value);
    const endDate = new Date(document.getElementById("end-date").value);

    const minDate = new Date(document.getElementById("start-date").getAttribute("min"));
    const maxDate = new Date(document.getElementById("end-date").getAttribute("max"));

    if (startDate < minDate || endDate > maxDate || startDate > endDate) {
      alert(`Please select dates within the range ${minDate.toLocaleDateString()} to ${maxDate.toLocaleDateString()}.`);
      return;
    }

    const filteredData = data.filter((property) => {
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
  function clearTransactionFilter() {
    document.getElementById("min-transaction").value = "";
    document.getElementById("max-transaction").value = "";
    updateNeighborhoodSalesChart(data);
    updateInsights2(data);
  }

  function applyTransactionFilter() {
    const min = parseInt(document.getElementById("min-transaction").value);
    const max = parseInt(document.getElementById("max-transaction").value);

    // Filter data berdasarkan rentang transaksi
    const filteredData = data.filter((property) => {
      const transaction = neighborhoodTransactions[property.NEIGHBORHOOD] || 0;
      return transaction >= min && transaction <= max;
    });

    // Perbarui Grafik Penjualan Neighborhood dengan data yang telah difilter
    updateNeighborhoodSalesChart(filteredData);

    // Perbarui insight dengan data yang telah difilter
    updateInsights2(filteredData, min, max);
  }

  function updateNeighborhoodSalesChart(filteredData) {
    // Hitung ulang transaksi Neighborhood untuk data yang telah difilter
    const { neighborhoodTransactions } = calculateDataStatistics(filteredData);

    // Perbarui grafik
    const labels = Object.keys(neighborhoodTransactions);
    const data = Object.values(neighborhoodTransactions);

    chartNeighborhoodSales.data.labels = labels;
    chartNeighborhoodSales.data.datasets[0].data = data;
    chartNeighborhoodSales.update();
  }

  function updateChartsWithFilteredData(filteredData) {
    const { monthlySales, monthlyTransactions } =
      calculateDataStatistics(filteredData);

    const labels = Object.keys(monthlySales).sort();
    chartTotalMonthlySales.data.labels = labels;
    chartTotalMonthlySales.data.datasets[0].data = labels.map(
      (label) => monthlySales[label]
    );
    chartTotalMonthlySales.data.datasets[1].data = labels.map(
      (label) => monthlyTransactions[label]
    );
    chartTotalMonthlySales.update();
  }

  function updateInsights(filteredData, startDate, endDate) {
    // Hitung statistik berdasarkan data yang difilter
    const { monthlySales, monthlyTransactions, neighborhoodTransactions } =
      calculateDataStatistics(filteredData);

    // Generate insight
    let insightText = `Berikut adalah data penjualan properti di Manhattan berdasarkan grafik diatas dengan rentang tanggal ${startDate.toLocaleDateString()} hingga ${endDate.toLocaleDateString()}.
Total Transactions: ${filteredData.length}.Total Monthly Sales Price: ${filteredData.reduce((acc, property) => acc + parseFloat(property.SALE_PRICE), 0)}.
Data ini mencakup transaksi properti yang difilter dari tanggal mulai hingga tanggal akhir yang ditentukan. Ini mencakup total jumlah transaksi selama periode tersebut serta total harga jual bulanan dari transaksi-transaksi tersebut.`;


      document.getElementById("total-monthly-sales-chart-description").innerHTML = insightText;
  }

   

  function updateInsights2(filteredData, min, max) {
    // Hitung statistik berdasarkan data yang difilter
    const { neighborhoodTransactions } = calculateDataStatistics(filteredData);

    // Generate insight
    let insightText2 = `Data yang Difilter dari ${min} hingga ${max}:
     Data Tertinggi : ${Math.max(...Object.values(neighborhoodTransactions))} Berada di ${Object.keys(neighborhoodTransactions).find((key) => neighborhoodTransactions[key] === Math.max(...Object.values(neighborhoodTransactions)) )}
     Data Terendah : ${Math.min(...Object.values(neighborhoodTransactions))} Berada di ${Object.keys(neighborhoodTransactions).find((key) => neighborhoodTransactions[key] === Math.min(...Object.values(neighborhoodTransactions)) )}
     `;
      

      document.querySelectorAll(".description2").forEach((description) => {
        description.innerHTML = insightText2;
    });
  }

  function createTotalMonthlySalesChart(monthlySales, monthlyTransactions) {
    const ctx = document
      .getElementById("total-monthly-sales-chart")
      .getContext("2d");
    const labels = Object.keys(monthlySales).sort();

    return new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Total Sales Price",
            data: labels.map((label) => monthlySales[label]),
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderWidth: 1,
            fill: false,
            yAxisID: "sales", // Penjualan menggunakan sumbu Y utama
          },
          {
            label: "Total Transaction",
            data: labels.map((label) => monthlyTransactions[label]),
            borderColor: "rgba(153, 102, 255, 1)",
            backgroundColor: "rgba(153, 102, 255, 0.2)",
            borderWidth: 1,
            fill: false,
            yAxisID: "transactions", // Transaksi menggunakan sumbu Y utama
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onResize : function(chart, size) {
          var showTicks = (size.width < 768) ? false : true;
          chart.options.scales.y.display = showTicks;
          chart.options.scales.sales.display = showTicks;
          chart.options.scales.transactions.display = showTicks;
          chart.options.scales.x.ticks.minRotation = 90;
          chart.options.scales.x.ticks.maxRotation = 90;
          chart.update();
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Total",
              font: {
                weight: "bold",
              },
            },
          },
        },
      },
      
    });
  }

  function createTopBuildingTransactionChart(data) {
    const dataForTopBuildingTransaction = calculateBuildingTransactions(data);

    const ctx = document
      .getElementById("top-building-transaction-chart")
      .getContext("2d");
    return new Chart(ctx, {
      type: "bar",
      data: {
        labels: dataForTopBuildingTransaction.map(
          (item) => item.BUILDING_CLASS_CATEGORY
        ),
        datasets: [
          {
            label: "Top Building Transactions",
            data: dataForTopBuildingTransaction.map((item) => item.SALE_PRICE),
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

  function calculateBuildingTransactions(data) {
    const buildingTransactions = {};

    // Hitung total penjualan untuk setiap kategori kelas bangunan
    data.forEach((property) => {
      if (!buildingTransactions[property.BUILDING_CLASS_CATEGORY]) {
        buildingTransactions[property.BUILDING_CLASS_CATEGORY] = 0;
      }
      buildingTransactions[property.BUILDING_CLASS_CATEGORY] +=
        parseFloat(property.SALE_PRICE) || 0;
    });

    // Ubah objek menjadi array dan urutkan berdasarkan total penjualan
    const sortedTransactions = Object.entries(buildingTransactions)
      .map(([category, sales]) => ({
        BUILDING_CLASS_CATEGORY: category,
        SALE_PRICE: sales,
      }))
      .sort((a, b) => b.SALE_PRICE - a.SALE_PRICE);

    // Ambil 10 kategori kelas bangunan dengan total penjualan tertinggi
    const top10 = sortedTransactions.slice(0, 10);

    return top10;
  }

  function handleChartClick(event, chart) {
    const activeElement = chart.getElementAtEvent(event)[0];
    if (activeElement) {
      const label = chart.data.labels[activeElement.index];
      const value = chart.data.datasets[0].data[activeElement.index];
      alert(`${label}: $${value}`);
    }
  }

  
  data.sort((a, b) => new Date(a.SALE_DATE) - new Date(b.SALE_DATE));
  let defaultStartDate = new Date(data[0].SALE_DATE);
  let defaultEndDate = new Date(data[data.length - 1].SALE_DATE);
  updateInsights(data, defaultStartDate, defaultEndDate);
  updateInsights2(data, 0, 1000);
}
