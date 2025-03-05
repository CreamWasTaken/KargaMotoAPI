const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");

        if (!authHeader) {
            return res.status(401).json({ error: "Access Denied. No token provided." });
        }

        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Invalid Authorization format. Use 'Bearer <token>'" });
        }

        const token = authHeader.split(" ")[1];

        const verified = jwt.verify(token, process.env.JWT_SECRET);

        if (!verified.user_id) {
            return res.status(401).json({ error: "Invalid token: User ID missing." });
        }

        req.user = { _id: verified.user_id }; // ✅ Match token payload

        next();
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
