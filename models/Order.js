const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'MasterProduct' },
            sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Seller ka ID
            name: String,
            price: Number,
            quantity: Number,
            image: String
        }
    ],
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: String, required: true },
    status: { type: String, default: 'Pending' } // Pending, Shipped, Delivered
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);