const express = require('express');
const router = express.Router();
const { placeOrder, getMyOrders, getSellerOrders, updateOrderStatus, getAllOrders } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, placeOrder); 
router.get('/myorders', protect, getMyOrders);
router.get('/seller-orders', getSellerOrders);
router.put('/:id/status', updateOrderStatus); 
router.get('/admin/all', protect, adminOnly, getAllOrders); // Naya Route

module.exports = router;