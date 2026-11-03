const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getAllUsers, approveSeller, getSettings, updateSettings } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Naya Public Route (Bina token ke, taake Customer Service page data fetch kar sake)
router.get('/public/settings', getSettings); 

// Admin Routes (Protected)
router.get('/admin/users', protect, adminOnly, getAllUsers);
router.put('/admin/approve-seller/:id', protect, adminOnly, approveSeller);
router.get('/admin/settings', protect, adminOnly, getSettings);
router.post('/admin/settings', protect, adminOnly, updateSettings);

module.exports = router;