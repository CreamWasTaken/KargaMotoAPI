const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        
        // Check if Authorization header is present
        if (!authHeader) {
            return res.status(401).json({ error: "Access Denied. No token provided." });
        }

        // Ensure token starts with "Bearer "
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Invalid Authorization format." });
        }

        // Extract token
        const token = authHeader.replace("Bearer ", "");

        // Verify token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Attach user data to request object

        // console.log("Middleware tick");
        next(); // Continue to next middleware/controller
    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        res.status(403).json({ error: "Invalid or expired token." });
    }
};

module.exports = authMiddleware;


//auth header syntax
  // headers: {
  //     Authorization: `Bearer ${token}`,  // Send token in header
  // },
