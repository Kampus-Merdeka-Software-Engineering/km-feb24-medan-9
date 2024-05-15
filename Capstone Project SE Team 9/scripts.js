
// Function to toggle the visibility of dropdown content
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const dropdownContent = dropdown.querySelector('.dropdown-content');
    
    // Hide all dropdowns first
    document.querySelectorAll('.dropdown-content').forEach(content => {
        if (content !== dropdownContent) {
            content.style.display = 'none';
        }
    });
    
    // Toggle the current dropdown
    dropdownContent.style.display = (dropdownContent.style.display === 'block') ? 'none' : 'block';
}

// Event listener to close dropdowns when clicking outside
window.addEventListener('click', function(event) {
    if (!event.target.matches('.dropbtn')) {
        document.querySelectorAll('.dropdown-content').forEach(content => {
            content.style.display = 'none';
        });
    }
});

// Function to show the popup
function showPopup(content) {
    const popup = document.getElementById('popup');
    const popupContent = document.getElementById('popup-content');
    popupContent.innerHTML = content;
    popup.style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

// Function to hide the popup
function hidePopup() {
    document.getElementById('popup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

// Event listener for the overlay to close the popup when clicked
document.getElementById('overlay').addEventListener('click', hidePopup);

// Example usage of showPopup function (this can be triggered by any event, e.g., button click)
document.addEventListener('DOMContentLoaded', function() {
    // Example: Show popup when a specific element is clicked
    document.querySelector('.filter-date').addEventListener('click', function() {
        showPopup('<h2>Filter By Date</h2><p>Content for filtering by date goes here.</p>');
    });
});

// Seperti melakukan penarikan data lewat API tapi dalam bentuk file
// Bisa menggunakan fetch() juga
var request = new XMLHttpRequest();
request.open("GET", "./team-9-medan.json", false);
request.send(null);

var objPropertyParsed = JSON.parse(request.responseText);

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

console.log(objPropertyParsed);
