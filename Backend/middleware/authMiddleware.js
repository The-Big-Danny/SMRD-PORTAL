const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.header("x-auth-token");

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fix: Extract the ID specifically
        // This ensures req.user is the string ID "679..." and not the object {id: "679..."}
        req.user = decoded.id; 
        next();
    } catch (err) {
        res.status(401).json({ message: "Token is not valid" });
    }
};
