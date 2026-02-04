const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    // 1. Get the token from the request header
    // Note: We use 'x-auth-token', which we will set in the frontend later
    const token = req.header("x-auth-token");

    // 2. Check if there is no token
    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    // 3. Verify the token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add the user data (id) to the request object
        req.user = decoded; 
        next();
    } catch (err) {
        res.status(401).json({ message: "Token is not valid" });
    }
};