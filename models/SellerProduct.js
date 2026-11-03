const mongoose = require('mongoose');

const sellerProductSchema = new mongoose.Schema({
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    masterProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'MasterProduct', required: true },
    price: { type: Number, required: true },
    images: { type: [String] },
    stock: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('SellerProduct', sellerProductSchema);