const Order = require('../models/Order');

// @desc    Naya Order Place Karein
// @route   POST /api/orders
const placeOrder = async (req, res) => {
    try {
        const { items, totalAmount, shippingAddress } = req.body;

        if (items && items.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        const buyerId = req.user.id; 

        const order = new Order({
            buyerId,
            items,
            totalAmount,
            shippingAddress
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Buyer ke apne orders
// @route   GET /api/orders/myorders
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ buyerId: req.user.id });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Seller ke orders
// @route   GET /api/orders/seller-orders
const getSellerOrders = async (req, res) => {
    try {
        const orders = await Order.find({});
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Order ka status update karein
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = status;
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Admin ke liye saare orders
// @route   GET /api/orders/admin/all
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('buyerId', 'name email');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { placeOrder, getMyOrders, getSellerOrders, updateOrderStatus, getAllOrders };