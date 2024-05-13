document.addEventListener("DOMContentLoaded", function() {
    // Function to handle dropdown link clicks
    function handleDropdownClick(dropdownId, cardId) {
        var dropdown = document.getElementById(dropdownId);
        var links = dropdown.querySelectorAll('.dropdown-content a');
        
        // Loop through each link and attach click event listeners
        links.forEach(function(link) {
            link.addEventListener('click', function(event) {
                event.preventDefault(); // Prevent default link behavior
                
                // Hide dropdown after click
                dropdown.classList.remove('show');
                
                // Scroll to the corresponding card
                var card = document.getElementById(cardId);
                card.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }
    
    // Call handleDropdownClick for Top Product dropdown and corresponding card
    handleDropdownClick('topProductDropdown', 'topProductCard');
    
    // Call handleDropdownClick for Growth Chart dropdown and corresponding card
    handleDropdownClick('growthChartDropdown', 'growthChartCard');
});
