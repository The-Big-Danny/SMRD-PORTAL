document.addEventListener("DOMContentLoaded", function() {
    // 1. Get all accordion buttons
    var accHeaders = document.getElementsByClassName("accordion-header");

    // 2. Loop through them and add a click event
    for (var i = 0; i < accHeaders.length; i++) {
        accHeaders[i].addEventListener("click", function() {
            // Find the panel (the div below the button)
            var panel = this.nextElementSibling;
            
            // Toggle display
            if (panel.style.display === "block") {
                panel.style.display = "none";
            } else {
                panel.style.display = "block";
            }
        });
    }

    // 3. Simple Form Submission
    const helpForm = document.getElementById("helpForm");
    if (helpForm) {
        helpForm.addEventListener("submit", function(e) {
            e.preventDefault();
            alert("Your message has been received. Admin will contact you soon.");
            helpForm.reset();
        });
    }
});