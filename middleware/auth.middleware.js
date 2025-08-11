const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verifing Token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedUser;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid token" });
    }
}

module.exports = auth;