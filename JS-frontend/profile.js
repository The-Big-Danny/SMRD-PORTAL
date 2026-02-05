
const BASE_URL = "https://smrd-portal.onrender.com"; 

// Toast Error Function
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

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    // 2. Security Check
    if (!token) {
        window.location.replace("login2.html");
        return;
    }

    // --- PHOTO PERSISTENCE ---
    const profileImage = document.getElementById('profileImage');
    const savedPhoto = localStorage.getItem("user_profile_env");
    if (savedPhoto && profileImage) {
        profileImage.src = savedPhoto;
    }

    try {
        // 3. Fetch Profile Data using BASE_URL
        const response = await fetch(`${BASE_URL}/api/auth/profile`, {
            method: "GET",
            headers: {
                "x-auth-token": token,
                "Content-Type": "application/json"
            }
        });

        // Handle Session Expiration
        if (response.status === 401) {
            localStorage.clear();
            window.location.replace("login2.html");
            return;
        }

        const data = await response.json();

        if (response.ok) {
            // 4. Populate HTML Fields (Added null checks for safety)
            const nameHeader = document.getElementById("user-fullname");
            if(nameHeader) nameHeader.innerText = data.name || "Student";
            
            if(document.getElementById("prof-name")) document.getElementById("prof-name").value = data.name || "";
            if(document.getElementById("prof-matric")) document.getElementById("prof-matric").value = data.matricNumber || "";
            if(document.getElementById("prof-dept")) document.getElementById("prof-dept").value = data.department || "";
            if(document.getElementById("prof-level")) document.getElementById("prof-level").value = data.level || "";
            if(document.getElementById("prof-email")) document.getElementById("prof-email").value = data.email || "";
            if(document.getElementById("prof-phone")) document.getElementById("prof-phone").value = data.phone || "";
        } else {
            showServerError(data.message || "Could not load profile.");
        }

    } catch (error) {
        console.error("Profile Fetch Error:", error);
        showServerError("Connection Failed. Checking backend...");
    }

    // --- PHOTO UPLOAD LOGIC ---
    setupPhotoUpload();
});

// Helper for Photo Uploading (Saves to LocalStorage for defense persistence)
function setupPhotoUpload() {
    const fileInput = document.getElementById('fileUpload');
    const profileImage = document.getElementById('profileImage');

    if (fileInput && profileImage) {
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    alert("Image too large (Max 2MB)");
                    return;
                }
                const reader = new FileReader();
                reader.onload = function(e) {
                    profileImage.src = e.target.result;
                    // Persist locally so it survives page refreshes
                    localStorage.setItem("user_profile_env", e.target.result);
                }
                reader.readAsDataURL(file);
            }
        });
    }

}
