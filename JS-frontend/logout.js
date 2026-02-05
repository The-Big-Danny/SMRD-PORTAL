// JS-frontend/logout.js

document.addEventListener("DOMContentLoaded", () => {
    console.log("Logout script loaded and watching for clicks...");

    const logoutBtn = document.getElementById("confirm-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            console.log("Logout button clicked!"); 

            const passwordField = document.getElementById("logout-password");
            const password = passwordField ? passwordField.value : "";
            const matricNumber = localStorage.getItem("matricNo");

            if (!password) {
                alert("Please enter your password to confirm logout.");
                return;
            }

            try {
                // Verify password before wiping session
                const response = await fetch("https://smrd-portal.onrender.com/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        matricNumber: matricNumber,
                        password: password
                    })
                });

                if (response.ok) {
                    // 1. Wipe all local data
                    localStorage.clear();
                    sessionStorage.clear(); // Clear session storage as well

                    alert("Logout successful!");

                    // 2. The magic "History Killer":
                    // This replaces the current history entry so the 'back' button 
                    // doesn't know the dashboard or logout page existed.
                    window.location.replace("login2.html");
                } else {
                    const data = await response.json();
                    alert(data.message || "Incorrect password. Logout cancelled.");
                }
            } catch (error) {
                console.error("Logout error:", error);
                alert("Server error. Please try again.");
            }
        });
    } else {
        console.error("CRITICAL: Logout button with ID 'confirm-btn' was not found!");
    }

});
