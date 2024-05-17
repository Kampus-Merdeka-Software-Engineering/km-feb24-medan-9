// Write JavaScript to load and parse a local JSON file.
var request = new XMLHttpRequest();
request.open("GET", "./team-9-medan.json", false);
	@@ -11,41 +10,50 @@ var objPropertyParsed = JSON.parse(request.responseText);
objPropertyParsed.sort((a, b) => b.RESIDENTIAL_UNITS - a.RESIDENTIAL_UNITS);

for (var i = 0; i < 10; i++) {
  var objTable = document.getElementById("top-sales-residential");
  var row = document.createElement("tr");
  var cell1 = document.createElement("td");
  var cell2 = document.createElement("td");
  var cell3 = document.createElement("td");

  cell1.innerHTML = objPropertyParsed[i].NEIGHBORHOOD;
  cell2.innerHTML = objPropertyParsed[i].BUILDING_CLASS_CATEGORY;
  cell3.innerHTML = objPropertyParsed[i].RESIDENTIAL_UNITS;

  row.appendChild(cell1);
  row.appendChild(cell2);
  row.appendChild(cell3);
  objTable.appendChild(row);
}
// top 10 sales by commercial unit

// objPropertyParsed.sort((a, b) => b.COMMERCIAL_UNITS - a.COMMERCIAL_UNITS);

// for (var i = 0; i < 10; i++) {
//   var objTable = document.getElementById("top-sales-commercial");
//   var row = document.createElement("tr");
//   var cell1 = document.createElement("td");
//   var cell2 = document.createElement("td");
//   var cell3 = document.createElement("td");

//   cell1.innerHTML = objPropertyParsed[i].NEIGHBORHOOD;
//   cell2.innerHTML = objPropertyParsed[i].BUILDING_CLASS_CATEGORY;
//   cell3.innerHTML = objPropertyParsed[i].COMMERCIAL_UNITS;

//   row.appendChild(cell1);
//   row.appendChild(cell2);
//   row.appendChild(cell3);
//   objTable.appendChild(row);
// }

let table = new DataTable('#top-sales-commercial', {
    data: objPropertyParsed,
    columns: [
        { data: 'NEIGHBORHOOD' },
        { data: 'BUILDING_CLASS_CATEGORY' },
        { data: 'COMMERCIAL_UNITS' }
    ]
});

// Get the popup and overlay elements by their IDs
var popup = document.getElementById("popup");
	@@ -56,16 +64,75 @@ var showInsightButtons = document.getElementsByClassName("show-insight-btn");

// Loop through each "Insights" button and add a click event listener
for (var i = 0; i < showInsightButtons.length; i++) {
  showInsightButtons[i].addEventListener("click", function () {
    // Toggle the display of the popup and overlay
    popup.style.display = popup.style.display === "block" ? "none" : "block";
    overlay.style.display =
      overlay.style.display === "block" ? "none" : "block";
  });
}

// Add a click event listener to the overlay to close the popup when clicked
overlay.addEventListener("click", function () {
  popup.style.display = "none";
  overlay.style.display = "none";
});

var arrNeighborhoods = [];
var arrCountTransactionsByNeighborhoods = [];

objPropertyParsed.forEach((property) => {
    if(!arrNeighborhoods.includes(property.NEIGHBORHOOD)){
        arrNeighborhoods.push(property.NEIGHBORHOOD);
    }
    else{
        let index = arrNeighborhoods.indexOf(property.NEIGHBORHOOD);
        if(arrCountTransactionsByNeighborhoods[index]){
            arrCountTransactionsByNeighborhoods[index] += 1;
        }
        else{
            arrCountTransactionsByNeighborhoods[index] = 1;
        }
    }
});

var objArrTransactionByNeighborhoods = [];
for(var i = 0; i < arrNeighborhoods.length; i++){
    objArrTransactionByNeighborhoods[i] = {
        neighborhood: arrNeighborhoods[i],
        count: arrCountTransactionsByNeighborhoods[i]
    };
}

// kondisi sekarang objArrTransactionByNeighborhoods belum ke sort
objArrTransactionByNeighborhoods.sort((a, b) => a.count - b.count);

// kondisi sekarang objArrTransactionByNeighborhoods udah ke sort, 
// tapi arrNeighborhoods dan arrCountTransactionsByNeighborhoods belum
for (var i = 0; i < objArrTransactionByNeighborhoods.length; i++) {
    arrNeighborhoods[i] = objArrTransactionByNeighborhoods[i].neighborhood;
    arrCountTransactionsByNeighborhoods[i] = objArrTransactionByNeighborhoods[i].count;
}

const ctx = document.getElementById("neighborhood-sales-chart");

new Chart(ctx, {
  type: "bar",
  data: {
    labels: arrNeighborhoods,
    datasets: [
      {
        label: "Total Transactions by Neighborhoods",
        data: arrCountTransactionsByNeighborhoods,
        borderWidth: 1,
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});
