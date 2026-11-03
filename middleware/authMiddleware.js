const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Token verify karne ke liye middleware
const protect = async (req, res, next) => {
    let token;

    // Check karein ke header mein Bearer token mojood hai
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // "Bearer <token>" mein se sirf token nikaalein
            token = req.headers.authorization.split(' ')[1];

            // Token verify karein
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // User ko database se dhoondein (password ke baghair)
            req.user = await User.findById(decoded.id).select('-password');

            return next(); // Agar sab theek hai toh agle step par jayein
        } catch (error) {
            // Agar token galat ya expire ho gaya hai
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    // Agar koi token hi nahi bheja gaya
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Sirf Admin ke liye access
const adminOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'super_admin' || req.user.role === 'admin')) {
        return next();
    } else {
        return res.status(403).json({ message: 'Admin access only' });
    }
};

// Sirf Seller ke liye access
const sellerOnly = (req, res, next) => {
    if (req.user && req.user.role === 'seller') {
        return next();
    } else {
        return res.status(403).json({ message: 'Seller access only' });
    }
};

module.exports = { protect, adminOnly, sellerOnly };