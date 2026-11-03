const mongoose = require('mongoose');

const masterProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    basePrice: { type: Number, required: true },
    images: { type: [String], required: true }, // Cloudinary URLs
    category: { type: String },
}, { timestamps: true });

// AUTO-UPDATE LOGIC: Jab Admin price/image update kare
masterProductSchema.post('findOneAndUpdate', async function (doc) {
    if (doc) {
        const SellerProduct = mongoose.model('SellerProduct');
        // Seller ke store mein is product ki price aur image sync karein
        await SellerProduct.updateMany(
            { masterProductId: doc._id },
            { $set: { price: doc.basePrice, images: doc.images } }
        );
        console.log(`Auto-synced product: ${doc.name} to all sellers.`);
    }
});

module.exports = mongoose.model('MasterProduct', masterProductSchema);