// --- 1. SETTINGS ---
// Change this to your Render URL after deployment
const BASE_URL = "http://localhost:5000"; 

document.addEventListener("DOMContentLoaded", async () => {
    // SELECT ELEMENTS
    const semesterSelect = document.getElementById('semester-select');
    const resultsTableBody = document.getElementById('result-table-body');
    const totalCreditEl = document.querySelector('.summary-box.cre p');
    const gradePointEl = document.querySelector('.summary-box.grd p');
    const gpaEl = document.querySelector('.summary-box.gpa p');
    const token = localStorage.getItem("token");

    let allResults = [];

    if (!token) {
        window.location.replace("login2.html");
        return;
    }

    // --- 2. FETCH DATA FROM BACKEND ---
    try {
        const response = await fetch(`${BASE_URL}/api/results/my-results`, {
            headers: { "x-auth-token": token }
        });
        const data = await response.json();

        if (response.ok && data.success) {
            allResults = data.data;
            renderResults("1-First"); // Default view
        }
    } catch (err) {
        console.error("Fetch Error:", err);
    }

    // --- 3. DYNAMIC RENDER FUNCTION ---
    function renderResults(semesterKey) {
        const [year, semester] = semesterKey.split("-");
        const filtered = allResults.filter(r => r.year == year && r.semester == semester);

        resultsTableBody.innerHTML = "";
        let totalCredits = 0;
        let totalPoints = 0;
        const gradeWeight = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };

        if (filtered.length === 0) {
            resultsTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No records found for this semester.</td></tr>`;
        } else {
            filtered.forEach((course) => {
                totalCredits += course.unit;
                totalPoints += (course.unit * (gradeWeight[course.grade] || 0));

                resultsTableBody.innerHTML += `
                    <tr>
                        <td>${course.courseCode}</td>
                        <td>${course.courseName}</td>
                        <td>${course.unit}</td>
                        <td>${course.score}</td>
                        <td>${course.grade}</td>
                        <td>${course.remark}</td>
                    </tr>`;
            });
        }

        totalCreditEl.textContent = totalCredits;
        gradePointEl.textContent = totalPoints;
        gpaEl.textContent = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
    }

    // --- 4. DROPDOWN LISTENER ---
    semesterSelect.addEventListener('change', (e) => {
        renderResults(e.target.value);
    });

    // --- 5. PDF DOWNLOAD FEATURE ---
    const downloadBtn = document.querySelector('#download-pdf');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            doc.setFont('helvetica', 'bold');
            doc.text('UNIVERSITY OF NIGERIA, NSUKKA', 105, 20, { align: 'center' });
            doc.setFontSize(14);
            doc.text('STUDENT RESULT SLIP', 105, 30, { align: 'center' });

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text(`Name: ${localStorage.getItem('studentName') || 'N/A'}`, 20, 45);
            doc.text(`Matric No: ${localStorage.getItem('matricNo') || 'N/A'}`, 20, 52);
            doc.text(`Semester: ${semesterSelect.options[semesterSelect.selectedIndex].text}`, 20, 59);

            let y = 80;
            doc.setFont('helvetica', 'bold');
            doc.text('Code', 20, y);
            doc.text('Title', 45, y);
            doc.text('Unit', 120, y);
            doc.text('Score', 140, y);
            doc.text('Grade', 160, y);

            y += 8;
            doc.setFont('helvetica', 'normal');

            const rows = resultsTableBody.querySelectorAll('tr');
            rows.forEach((row) => {
                const cells = row.querySelectorAll('td');
                if (cells.length > 1) {
                    doc.text(cells[0].textContent, 20, y);
                    doc.text(cells[1].textContent.substring(0, 25), 45, y);
                    doc.text(cells[2].textContent, 125, y);
                    doc.text(cells[3].textContent, 145, y);
                    doc.text(cells[4].textContent, 165, y);
                    y += 8;
                }
            });

            doc.save(`${localStorage.getItem('matricNo')}_Result.pdf`);
        });
    }

    // --- 6. PRINT FEATURE ---
    const printBtn = document.getElementById("print-result");
    if (printBtn) {
        printBtn.addEventListener("click", () => {
            const printWindow = window.open('', '_blank');
            const tableHTML = document.querySelector(".results").innerHTML;
            const summaryHTML = document.querySelector(".summary").innerHTML;

            printWindow.document.write(`
                <html>
                <head><title>Result Slip</title><style>body{font-family:sans-serif;padding:20px;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #000;padding:8px;}</style></head>
                <body>
                    <h2>UNIVERSITY OF NIGERIA, NSUKKA</h2>
                    <p>Name: ${localStorage.getItem('studentName')}</p>
                    <p>Matric: ${localStorage.getItem('matricNo')}</p>
                    <hr>${tableHTML}<br>${summaryHTML}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        });
    }
});