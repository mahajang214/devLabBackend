const logger = require("../config/logger");
const jwt = require("jsonwebtoken");
const protected = async (req, res, next) => {
    try {

        // Debug logs
        // console.log("Cookies:", req.cookies);
        // console.log("Authorization Header:", req.headers.authorization);

        const token =
            req.cookies?.token ||
            (req.headers.authorization?.startsWith("Bearer ")
                ? req.headers.authorization.split(" ")[1]
                : null);

        console.log("Extracted Token:", token);
        if (!token) {
            logger.warn('Authentication attempt failed: No token provided');
            return res.status(401).json({ message: "Authentication required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        logger.info(`User authenticated: ${decoded.id}`);
        req.user = decoded;
        next();

    } catch (error) {
        logger.error('Token verification failed:', error);
        return res.status(401).json({ message: "Invalid token" });
    }
}

module.exports = protected;