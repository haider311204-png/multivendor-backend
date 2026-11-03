const MasterProduct = require('../models/MasterProduct');
const SellerProduct = require('../models/SellerProduct');
const fs = require('fs');
const csv = require('csv-parser');

// @desc    Super Admin: Naya Master Product Add Karein (Image Upload ke sath)
const addMasterProduct = async (req, res) => {
    try {
        const { name, description, basePrice, category } = req.body;
        
        // Image ka URL nikaalein
        let imageUrl = '';
        if (req.file) {
            imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        } else {
            return res.status(400).json({ message: 'Product image is required!' });
        }

        // Check Naam
        const existingName = await MasterProduct.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existingName) {
            return res.status(400).json({ message: 'Is naam ka product pehle se database mein mojood hai!' });
        }

        const product = await MasterProduct.create({ 
            name, 
            description, 
            basePrice: Number(basePrice), 
            category, 
            images: [imageUrl] 
        });
        
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Admin: Master Product Update Karein
const updateMasterProduct = async (req, res) => {
    try {
        const product = await MasterProduct.findByIdAndUpdate(
            req.params.id, req.body, { new: true, runValidators: true } 
        );
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Admin: Master Product Delete Karein
const deleteMasterProduct = async (req, res) => {
    try {
        const product = await MasterProduct.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Seller: Product add karein
const addSellerProduct = async (req, res) => {
    try {
        const { masterProductId, price, stock } = req.body;
        const sellerId = req.user.id; 

        const sellerProductCount = await SellerProduct.countDocuments({ sellerId });
        if (sellerProductCount >= 200) {
            return res.status(400).json({ message: 'Aap 200 se zyada products add nahi kar sakte.' });
        }

        const masterProduct = await MasterProduct.findById(masterProductId);
        if (!masterProduct) return res.status(404).json({ message: 'Master Product not found' });

        const sellerProduct = await SellerProduct.create({
            sellerId, masterProductId,
            price: price || masterProduct.basePrice,
            images: masterProduct.images,
            stock: stock || 0
        });

        res.status(201).json(sellerProduct);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Products dekhein
const getProducts = async (req, res) => {
    try {
        const products = await MasterProduct.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Seller ke liye products
const getAllMasterProductsForSeller = async (req, res) => {
    try {
        const products = await MasterProduct.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Bulk Add (JSON)
const addBulkProducts = async (req, res) => {
    try {
        const { products } = req.body; 
        if (!products || products.length === 0) return res.status(400).json({ message: 'No products provided' });

        const newProducts = [];
        const duplicateProducts = [];

        for (const product of products) {
            const existingName = await MasterProduct.findOne({ name: { $regex: new RegExp(`^${product.name}$`, 'i') } });
            let existingImage = null;
            if (product.images && product.images.length > 0) {
                existingImage = await MasterProduct.findOne({ images: product.images[0] });
            }

            if (existingName || existingImage) {
                duplicateProducts.push(product.name); 
            } else {
                newProducts.push(product); 
            }
        }

        if (newProducts.length > 0) {
            await MasterProduct.insertMany(newProducts);
        }

        res.status(201).json({ 
            message: `${newProducts.length} Products Added Successfully!`,
            addedCount: newProducts.length,
            skippedCount: duplicateProducts.length,
            skippedNames: duplicateProducts
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    CSV Upload
const uploadCsvProducts = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Please upload a CSV file' });

        const results = [];
        const filePath = req.file.path;

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                fs.unlinkSync(filePath); 
                const newProducts = [];
                const duplicateProducts = [];

                for (const product of results) {
                    const existingName = await MasterProduct.findOne({ name: { $regex: new RegExp(`^${product.name}$`, 'i') } });
                    if (existingName) {
                        duplicateProducts.push(product.name);
                    } else {
                        newProducts.push({
                            name: product.name,
                            description: product.description,
                            basePrice: Number(product.basePrice),
                            category: product.category,
                            images: product.images.split(',')
                        });
                    }
                }

                if (newProducts.length > 0) {
                    await MasterProduct.insertMany(newProducts);
                }

                res.status(201).json({ 
                    message: `${newProducts.length} Products Added Successfully!`,
                    addedCount: newProducts.length,
                    skippedCount: duplicateProducts.length,
                    skippedNames: duplicateProducts
                });
            });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Bulk Delete
const deleteBulkProducts = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || ids.length === 0) return res.status(400).json({ message: 'No product IDs provided' });
        const result = await MasterProduct.deleteMany({ _id: { $in: ids } });
        res.json({ message: `${result.deletedCount} Products deleted successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { 
    addMasterProduct, 
    updateMasterProduct, 
    deleteMasterProduct, 
    addSellerProduct, 
    getProducts, 
    getAllMasterProductsForSeller,
    addBulkProducts,
    uploadCsvProducts,
    deleteBulkProducts
};