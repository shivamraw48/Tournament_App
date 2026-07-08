const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // 1. Get the token from the request header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format is "Bearer TOKEN"

    // 2. If no token is provided, deny access
    if (token == null) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // 3. Verify the token using our secret key
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token is not valid' });
        }
        
        // 4. If valid, attach the user's info to the request and proceed
        req.user = decoded; // The decoded payload { id: '...', username: '...' }
        next(); // This calls the next function (our route handler)
    });
};
const adminMiddleware = (req, res, next) => {
    // This middleware should run AFTER the normal authMiddleware,
    // so we can trust that req.user is already attached.
    
    if (req.user && req.user.isAdmin) {
        next(); // User is an admin, proceed
    } else {
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

// Update exports
module.exports = {
    authMiddleware,
    adminMiddleware
};

