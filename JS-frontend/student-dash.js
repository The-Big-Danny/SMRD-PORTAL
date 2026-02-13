const BASE_URL = "https://smrd-portal.onrender.com"; 

function showServerError(message = "Server is currently offline. Please try again later.") {
    if (document.querySelector('.toast-container')) return;
    const toast = document.createElement('div');
    toast.className = 'toast-container';
    toast.innerHTML = `<i class="fa fa-exclamation-triangle"></i><span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 5000);
}

// --- 3. GPA Calculation Helper (Fixed to handle potential String vs Number issues) ---
function calculateSemesterGPAs(results) {
    const semesters = {
        "1-First": [], "1-Second": [], "2-First": [], "2-Second": [],
        "3-First": [], "3-Second": [], "4-First": [], "4-Second": []
    };
    results.forEach(res => {
        const key = `${res.year}-${res.semester}`;
        if (semesters[key]) semesters[key].push(res);
    });
    return Object.keys(semesters).map(key => {
        const semResults = semesters[key];
        if (semResults.length === 0) return 0;
        
        // Safety: Ensure unit and point are treated as numbers
        const totalUnits = semResults.reduce((sum, r) => sum + (Number(r.unit) || 0), 0);
        const totalPoints = semResults.reduce((sum, r) => sum + ((Number(r.point) || 0) * (Number(r.unit) || 0)), 0);
        
        return totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : 0;
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.replace("login2.html");
        return;
    }

    const nameDisplay = document.getElementById("user-fullname");
    const resultsBody = document.getElementById("results-body");

    try {
        const [profileRes, resultsRes] = await Promise.all([
            fetch(`${BASE_URL}/api/auth/profile`, { headers: { "x-auth-token": token } }),
            fetch(`${BASE_URL}/api/results/my-results`, { headers: { "x-auth-token": token } })
        ]);

        if (profileRes.status === 401 || resultsRes.status === 401) {
            localStorage.clear();
            window.location.replace("login2.html");
            return;
        }

        if (profileRes.ok) {
            const student = await profileRes.json();
            if (nameDisplay) nameDisplay.innerText = student.name;
        }

        const resultsData = await resultsRes.json();
        if (resultsRes.ok && resultsData.success) {
            const results = resultsData.data;
            if (!resultsBody) return;
            
            resultsBody.innerHTML = "";

            if (results.length === 0) {
                resultsBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No results found yet.</td></tr>`;
            } else {
                let totalPoints = 0, totalUnits = 0, passedCount = 0, failedCount = 0;

                results.forEach(res => {
                    // SAFETY MAPPING: Check both common field names
                    const unit = Number(res.unit) || 0;
                    const point = Number(res.point) || 0;
                    const title = res.courseTitle || res.courseName || "Untitled Course";
                    const remark = res.remark || (res.grade === "F" ? "Fail" : "Passed");

                    totalUnits += unit;
                    totalPoints += (point * unit);
                    if (res.grade === "F") failedCount++; else passedCount++;

                    resultsBody.innerHTML += `
                        <tr>
                            <td>${res.courseCode}</td>
                            <td>${title}</td>
                            <td>${res.score}</td>
                            <td>${res.grade}</td>
                            <td>${remark}</td>
                        </tr>`;
                });

                const gpa = totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : "0.00";
                document.getElementById("stat-gpa").innerText = gpa;
                document.getElementById("stat-courses").innerText = results.length;
                document.getElementById("stat-passed").innerText = passedCount;
                document.getElementById("stat-failed").innerText = failedCount;

                const semesterData = calculateSemesterGPAs(results);
                updateChart(semesterData);
            }
        }
    } catch (error) {
        console.error("Dashboard error:", error);
        showServerError("Connection Failed.");
    }
    setupUILogic();
});

function updateChart(semesterData) {
    const chartElement = document.getElementById('performanceChart');
    if (!chartElement) return;
    const ctx = chartElement.getContext('2d');
    if (window.myGPAChart) window.myGPAChart.destroy();
    
    window.myGPAChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Yr 1(1st)', 'Yr 1(2nd)', 'Yr 2(1st)', 'Yr 2(2nd)', 'Yr 3(1st)', 'Yr 3(2nd)', 'Yr 4(1st)', 'Yr 4(2nd)'],
            datasets: [{
                label: 'GPA Progress',
                data: semesterData,
                backgroundColor: 'rgba(23, 57, 92, 0.2)',
                borderColor: '#17395c',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#17395c'
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            scales: { y: { beginAtZero: true, max: 5.0 } } 
        }
    });
}

function setupUILogic() {
    const logoutLink = document.getElementById("sidebar-logout");
    if (logoutLink) {
        logoutLink.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.replace("login2.html");
        });
    }
}
