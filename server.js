const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');

// Environment variables load karein
dotenv.config();

// Database se connect karein
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Uploads folder ko public banayein taake images frontend par dikh sakein
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// Routes Import aur Connect Karein
// ==========================================
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
// ==========================================

// Basic Test Route
app.get('/', (req, res) => {
    res.send('Multi-Vendor Marketplace API is running...');
});

// Fly.io aur Render dono ke liye PORT aur Host set karein
const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});