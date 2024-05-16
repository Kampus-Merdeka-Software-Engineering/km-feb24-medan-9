
// Write JavaScript to load and parse a local JSON file.
var request = new XMLHttpRequest();
request.open("GET", "./team-9-medan.json", false);
request.send(null);

var objPropertyParsed = JSON.parse(request.responseText);

// top 10 sales by residential unit

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

objPropertyParsed.sort((a, b) => b.COMMERCIAL_UNITS - a.COMMERCIAL_UNITS);

for (var i = 0; i < 10; i++) {
    var objTable = document.getElementById("top-sales-commercial");
    var row = document.createElement("tr");
    var cell1 = document.createElement("td");
    var cell2 = document.createElement("td");
    var cell3 = document.createElement("td");

    cell1.innerHTML = objPropertyParsed[i].NEIGHBORHOOD;
    cell2.innerHTML = objPropertyParsed[i].BUILDING_CLASS_CATEGORY;
    cell3.innerHTML = objPropertyParsed[i].COMMERCIAL_UNITS;

    row.appendChild(cell1);
    row.appendChild(cell2);
    row.appendChild(cell3);
    objTable.appendChild(row);
}

// Get the popup and overlay elements by their IDs
var popup = document.getElementById("popup");
var overlay = document.getElementById("overlay");

// Get the "Insights" buttons by their class name
var showInsightButtons = document.getElementsByClassName("show-insight-btn");

// Loop through each "Insights" button and add a click event listener
for (var i = 0; i < showInsightButtons.length; i++) {
    showInsightButtons[i].addEventListener("click", function() {
        // Toggle the display of the popup and overlay
        popup.style.display = (popup.style.display === "block") ? "none" : "block";
        overlay.style.display = (overlay.style.display === "block") ? "none" : "block";
    });
}

// Add a click event listener to the overlay to close the popup when clicked
overlay.addEventListener("click", function() {
    popup.style.display = "none";
    overlay.style.display = "none";
});

