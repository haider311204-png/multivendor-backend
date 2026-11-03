const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Images 'uploads' folder mein save hongi
    },
    filename: (req, file, cb) => {
        // File ka unique naam banayein
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({ storage: storage });

const { 
    addMasterProduct, 
    updateMasterProduct, 
    deleteMasterProduct, 
    addSellerProduct, 
    getProducts, 
    getAllMasterProductsForSeller,
    addBulkProducts,
    uploadCsvProducts,
    deleteBulkProducts
} = require('../controllers/productController');

const { protect, adminOnly, sellerOnly } = require('../middleware/authMiddleware');

// Public Routes
router.get('/', getProducts);

// Admin Routes
// Yahan upload.single('image') add kiya hai taake single image upload ho sake
router.post('/master', protect, adminOnly, upload.single('image'), addMasterProduct);
router.post('/master/bulk', protect, adminOnly, addBulkProducts);
router.post('/master/bulk-delete', protect, adminOnly, deleteBulkProducts);
router.post('/master/upload-csv', protect, adminOnly, upload.single('csvFile'), uploadCsvProducts); 
router.put('/master/:id', protect, adminOnly, updateMasterProduct);
router.delete('/master/:id', protect, adminOnly, deleteMasterProduct);

// Seller Routes
router.post('/seller-add', protect, sellerOnly, addSellerProduct);
router.get('/master/all', protect, sellerOnly, getAllMasterProductsForSeller);

module.exports = router;