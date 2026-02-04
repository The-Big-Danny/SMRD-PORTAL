// JS-frontend/register.js

document.addEventListener("DOMContentLoaded", () => {
    // SETTINGS: Change to your Render URL after deployment
    const API_BASE_URL = "http://localhost:5000"; 
    
    const registerForm = document.getElementById("registerForm");

    // --- 1. Password & Confirm Password Visibility Toggle ---
    const setupToggle = (toggleId, inputId) => {
        const toggleIcon = document.querySelector(toggleId);
        const inputField = document.querySelector(inputId);
        
        if (toggleIcon && inputField) {
            toggleIcon.addEventListener('click', function () {
                const type = inputField.getAttribute('type') === 'password' ? 'text' : 'password';
                inputField.setAttribute('type', type);
                this.classList.toggle('fa-eye-slash');
                this.classList.toggle('fa-eye');
            });
        }
    };

    setupToggle('#togglePassword', '#password');
    setupToggle('#toggleConfirmPassword', '#confirmPassword');

    // --- 2. Registration Logic ---
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = document.getElementById("fullName").value;
            const matricNumber = document.getElementById("matricNumber").value;
            const department = document.getElementById("department").value;
            const level = document.getElementById("level").value;
            const year = document.getElementById("year").value;
            const email = document.getElementById("email").value;
            const phone = document.getElementById("phone").value;
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            const studentData = {
                name, matricNumber, department, level, year, email, phone, password
            };

            try {
                // Using the Global Base URL here
                const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(studentData)
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Registration Successful! Redirecting to login...");
                    window.location.href = "login2.html";
                } else {
                    alert(data.message || "Registration failed. Matric Number may already exist.");
                }
            } catch (error) {
                console.error("Register error:", error);
                alert("Cannot connect to server. please try again!");
            }
        });
    }
});