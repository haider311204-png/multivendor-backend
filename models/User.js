const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['super_admin', 'admin', 'seller', 'buyer'], 
        default: 'buyer' 
    },
    permissions: {
        type: [String], // e.g., ['manage_orders', 'manage_products']
        default: []
    },
    storeName: { type: String }, // Sirf Seller ke liye
    isApproved: { type: Boolean, default: false }, // Seller approval ke liye
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);