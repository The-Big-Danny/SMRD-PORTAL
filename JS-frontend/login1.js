document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const errorMsg = document.getElementById("error-message");
    const togglePassword = document.querySelector('#togglePassword');
    const passwordInput = document.querySelector('#password');

    // --- 1. Password Visibility Toggle ---
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle FontAwesome icons
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // --- 2. Login Logic ---
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const matricNumber = document.getElementById("regNo").value;
            const password = passwordInput.value;

            if (errorMsg) {
                errorMsg.textContent = "Authenticating...";
                errorMsg.style.color = "blue";
            }

            // Replace with your Render URL when you deploy
            const API_URL = "https://smrd-portal.onrender.com/api/auth/login"; 

            try {
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ matricNumber, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.clear();
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("studentName", data.student.name);
                    localStorage.setItem("matricNo", data.student.matricNumber);

                    window.location.href = "/PAGES/STUDENT HTML/student-dash.html";
                } else {
                    if (errorMsg) {
                        errorMsg.textContent = data.message || "Invalid Login Credentials";
                        errorMsg.style.color = "red";
                    }
                }
            } catch (error) {
                console.error("Connection error:", error);
                if (errorMsg) {
                    errorMsg.textContent = "Server is offline! Check your connection.";
                    errorMsg.style.color = "red";
                }
            }
        });
    }

});
