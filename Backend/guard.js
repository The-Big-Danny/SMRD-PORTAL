(function () {
    const checkAuth = () => {
        const token = localStorage.getItem("token");
        // If no token exists, immediately kick them to login
        if (!token) {
            window.location.replace("login.html");
        }
    };

    // Run when the page first loads
    checkAuth();

    // Run specifically when the "Back" button is used
    window.addEventListener('pageshow', function (event) {
        // event.persisted is true if the page was loaded from the browser cache
        if (event.persisted || !localStorage.getItem("token")) {
            window.location.replace("login.html");
        }
    });
})();