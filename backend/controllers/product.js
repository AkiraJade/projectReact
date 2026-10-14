const mongoose = require('mongoose');
const Product = require('../models/product')
const Order = require('../models/order')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary')
const APIFeatures = require('../utils/apiFeatures');
const BadWordsPkg = require('bad-words');
const FilterClass = BadWordsPkg.Filter || BadWordsPkg;
const badWordsFilter = new FilterClass();

exports.newProduct = async (req, res, next) => {
    try {
        let images = []

        if (req.body.images) {
            if (typeof req.body.images === 'string') {
                images.push(req.body.images)
            } else if (Array.isArray(req.body.images)) {
                images = req.body.images
            }
        } else if (req.files && req.files.length > 0) {
            images = req.files.map(f => f.path);
        }

        let imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
            try {
                const result = await cloudinary.v2.uploader.upload(images[i], {
                    folder: 'products',
                    width: 800,
                    crop: "scale",
                });

                imagesLinks.push({
                    public_id: result.public_id,
                    url: result.secure_url
                })

            } catch (error) {
                console.log('Cloudinary upload error:', error.message)
            }
        }

        if (imagesLinks.length === 0) {
            imagesLinks.push({
                public_id: 'sample_product_image',
                url: '/images/Dosnoventa_company_x.webp'
            })
        }

        req.body.images = imagesLinks
        req.body.user = req.user ? req.user.id : null;

        const product = await Product.create(req.body);

        return res.status(201).json({
            success: true,
            product
        })
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        })
    }
}

exports.getProducts = async (req, res) => {
    const resPerPage = Number(req.query.limit) || 24;
    const queryCopy = { ...req.query };

    // Support case-insensitive category query e.g. category=bikes -> Bikes
    if (queryCopy.category) {
        queryCopy.category = new RegExp(`^${queryCopy.category}$`, 'i');
    }

    const baseQuery = Product.find({ isPublished: { $ne: false }, isDeleted: { $ne: true } });
    const apiFeatures = new APIFeatures(baseQuery, queryCopy).search().filter();
    const productsCount = await Product.countDocuments({ isPublished: { $ne: false }, isDeleted: { $ne: true } });

    apiFeatures.pagination(resPerPage);
    const products = await apiFeatures.query;
    let filteredProductsCount = products.length;

    if (!products)
        return res.status(400).json({ message: 'error loading products' })
    return res.status(200).json({
        success: true,
        products,
        filteredProductsCount,
        resPerPage,
        productsCount,
    })
}

exports.getSingleProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // If product is soft-deleted, only admins can view it
        if (product.isDeleted === true) {
            let isAdmin = false;
            let token = req.cookies?.token;
            if (!token && req.headers?.authorization && req.headers.authorization.startsWith('Bearer')) {
                token = req.headers.authorization.split(' ')[1];
            }
            if (token && token !== 'null') {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    const user = await User.findById(decoded.id);
                    if (user && user.role === 'admin') {
                        isAdmin = true;
                    }
                } catch (e) {}
            }
            if (!isAdmin) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found or has been removed'
                });
            }
        }

        // If product is draft/unpublished, only admins can view it
        if (product.isPublished === false) {
            let isAdmin = false;
            let token = req.cookies?.token;
            if (!token && req.headers?.authorization && req.headers.authorization.startsWith('Bearer')) {
                token = req.headers.authorization.split(' ')[1];
            }
            if (token && token !== 'null') {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    const user = await User.findById(decoded.id);
                    if (user && user.role === 'admin') {
                        isAdmin = true;
                    }
                } catch (e) {}
            }
            if (!isAdmin) {
                return res.status(404).json({
                    success: false,
                    message: 'Product is currently unlisted or draft'
                });
            }
        }

        return res.status(200).json({
            success: true,
            product
        });
    } catch (err) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }
}

exports.getAdminProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            products
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}
exports.updateProduct = async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }
    if (req.body.images) {
        let images = []
        if (typeof req.body.images === 'string') {
            images.push(req.body.images)
        } else {
            images = req.body.images
        }

        let imagesLinks = [];
        for (let i = 0; i < images.length; i++) {
            try {
                const result = await cloudinary.v2.uploader.upload(images[i], {
                    folder: 'products',
                    width: 150,
                    crop: "scale",
                });
                imagesLinks.push({
                    public_id: result.public_id,
                    url: result.secure_url
                })
            } catch (err) {
                console.log(err);
            }
        }
        req.body.images = imagesLinks
    } else {
        delete req.body.images;
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindandModify: false
    })
    return res.status(200).json({
        success: true,
        product
    })
}

// Soft-delete product => DELETE /api/v1/admin/product/:id
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.isDeleted === true) {
            return res.status(400).json({
                success: false,
                message: 'Product is already in Trash'
            });
        }

        product.isDeleted = true;
        product.deletedAt = new Date();
        product.deletedBy = req.user ? req.user.id : null;
        await product.save({ validateBeforeSave: false });

        return res.status(200).json({
            success: true,
            message: 'Product moved to Trash successfully'
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

// Restore soft-deleted product => PUT /api/v1/admin/product/:id/restore
exports.restoreProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (!product.isDeleted) {
            return res.status(400).json({
                success: false,
                message: 'Product is not in Trash'
            });
        }

        product.isDeleted = false;
        product.deletedAt = null;
        product.deletedBy = null;
        await product.save({ validateBeforeSave: false });

        return res.status(200).json({
            success: true,
            message: 'Product restored successfully'
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

// Permanent delete product => DELETE /api/v1/admin/product/:id/permanent
exports.permanentDeleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if product is referenced in customer orders
        const hasOrders = await Order.findOne({ 'orderItems.product': req.params.id });
        if (hasOrders) {
            return res.status(400).json({
                success: false,
                message: 'Cannot permanently delete this product because it is referenced in customer order history. It will remain safely preserved in Trash.'
            });
        }

        // Clean up Cloudinary images safely
        if (product.images && product.images.length > 0) {
            for (let i = 0; i < product.images.length; i++) {
                if (product.images[i].public_id && !product.images[i].public_id.startsWith('http') && !product.images[i].public_id.includes('sample')) {
                    try {
                        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
                    } catch (err) {
                        console.log('Error destroying image from Cloudinary:', err.message);
                    }
                }
            }
        }

        await Product.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: 'Product permanently deleted'
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

// Get all trashed products => GET /api/v1/admin/trash/products
exports.getTrashProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ isDeleted: true })
            .populate('deletedBy', 'name email')
            .sort({ deletedAt: -1 });
        return res.status(200).json({
            success: true,
            products
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

exports.createProductReview = async (req, res, next) => {
    try {
        const { rating, comment, productId } = req.body;
        const numRating = Number(rating);
        if (!numRating || numRating < 1 || numRating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5' });
        }
        if (!comment || !comment.trim()) {
            return res.status(400).json({ success: false, message: 'Please provide a review comment' });
        }

        // Mask profanity in review comments
        let sanitizedComment = comment;
        try {
            if (badWordsFilter.isProfane(comment)) {
                sanitizedComment = badWordsFilter.clean(comment);
            }
        } catch (filterErr) {
            // If filter fails for any reason, proceed with original comment
        }

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(404).json({ success: false, message: 'Product not found or invalid product ID' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Verified purchase check: non-admins must have ordered this product
        if (req.user.role !== 'admin') {
            const hasPurchased = await Order.findOne({
                user: req.user._id,
                'orderItems.product': productId
            });
            if (!hasPurchased) {
                return res.status(400).json({
                    success: false,
                    message: 'Only verified riders who have purchased this item can submit a review'
                });
            }
        }

        const review = {
            user: req.user._id,
            name: req.user.name,
            rating: numRating,
            comment: sanitizedComment.trim()
        };

        const isReviewed = product.reviews.find(
            r => r.user.toString() === req.user._id.toString()
        );

        if (isReviewed) {
            product.reviews.forEach(r => {
                if (r.user.toString() === req.user._id.toString()) {
                    r.comment = sanitizedComment.trim();
                    r.rating = numRating;
                }
            });
        } else {
            product.reviews.push(review);
            product.numOfReviews = product.reviews.length;
        }

        const sumRatings = product.reviews.reduce((acc, item) => item.rating + acc, 0);
        product.ratings = product.reviews.length > 0 ? Number((sumRatings / product.reviews.length).toFixed(1)) : 0;
        await product.save({ validateBeforeSave: false });

        return res.status(200).json({
            success: true,
            message: 'Review posted successfully'
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

exports.getProductReviews = async (req, res, next) => {
    try {
        if (!req.query.id || !mongoose.Types.ObjectId.isValid(req.query.id)) {
            return res.status(200).json({ success: true, reviews: [] });
        }

        const product = await Product.findById(req.query.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        const activeReviews = (product.reviews || []).filter(r => !r.isDeleted);
        res.status(200).json({
            success: true,
            reviews: activeReviews
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Soft-delete review => DELETE /api/v1/reviews?id=...&productId=...
exports.deleteReview = async (req, res, next) => {
    try {
        const product = await Product.findById(req.query.productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const review = (product.reviews || []).find(r => r._id.toString() === req.query.id.toString());
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Only admin or review author can soft-delete
        if (req.user.role !== 'admin' && review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You are not authorized to delete this review' });
        }

        review.isDeleted = true;
        review.deletedAt = new Date();
        review.deletedBy = req.user._id;

        const activeReviews = product.reviews.filter(r => !r.isDeleted);
        product.numOfReviews = activeReviews.length;
        product.ratings = activeReviews.length > 0
            ? Number((activeReviews.reduce((acc, item) => item.rating + acc, 0) / activeReviews.length).toFixed(1))
            : 0;

        await product.save({ validateBeforeSave: false });

        return res.status(200).json({
            success: true,
            message: 'Review moved to Trash'
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

// Restore soft-deleted review => PUT /api/v1/admin/review/restore?id=...&productId=...
exports.restoreReview = async (req, res, next) => {
    try {
        const product = await Product.findById(req.query.productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const review = (product.reviews || []).find(r => r._id.toString() === req.query.id.toString());
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        review.isDeleted = false;
        review.deletedAt = null;
        review.deletedBy = null;

        const activeReviews = product.reviews.filter(r => !r.isDeleted);
        product.numOfReviews = activeReviews.length;
        product.ratings = activeReviews.length > 0
            ? Number((activeReviews.reduce((acc, item) => item.rating + acc, 0) / activeReviews.length).toFixed(1))
            : 0;

        await product.save({ validateBeforeSave: false });

        return res.status(200).json({
            success: true,
            message: 'Review restored successfully'
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

// Permanent delete review => DELETE /api/v1/admin/review/permanent?id=...&productId=...
exports.permanentDeleteReview = async (req, res, next) => {
    try {
        const product = await Product.findById(req.query.productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        product.reviews = (product.reviews || []).filter(r => r._id.toString() !== req.query.id.toString());
        const activeReviews = product.reviews.filter(r => !r.isDeleted);
        product.numOfReviews = activeReviews.length;
        product.ratings = activeReviews.length > 0
            ? Number((activeReviews.reduce((acc, item) => item.rating + acc, 0) / activeReviews.length).toFixed(1))
            : 0;

        await product.save({ validateBeforeSave: false });

        return res.status(200).json({
            success: true,
            message: 'Review permanently deleted'
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

// Get all trashed reviews => GET /api/v1/admin/trash/reviews
exports.getTrashReviews = async (req, res, next) => {
    try {
        const products = await Product.find({ 'reviews.isDeleted': true })
            .select('name reviews')
            .populate('reviews.deletedBy', 'name email');

        let deletedReviews = [];
        for (const p of products) {
            for (const r of (p.reviews || [])) {
                if (r.isDeleted) {
                    deletedReviews.push({
                        _id: r._id,
                        productId: p._id,
                        productName: p.name,
                        userName: r.name,
                        rating: r.rating,
                        comment: r.comment,
                        deletedAt: r.deletedAt,
                        deletedBy: r.deletedBy
                    });
                }
            }
        }

        return res.status(200).json({
            success: true,
            reviews: deletedReviews
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

exports.productSales = async (req, res, next) => {
    try {
        const sales = await Order.aggregate([
            {
                $match: {
                    orderStatus: { $ne: 'Cancelled' }
                }
            },
            { $project: { _id: 0, orderItems: 1 } },
            { $unwind: "$orderItems" },
            {
                $group: {
                    _id: { product: "$orderItems.name" },
                    total: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
                },
            },
            { $sort: { total: -1 } }
        ]);

        const totalRevenue = sales.reduce((acc, item) => acc + (item.total || 0), 0);

        const totalPercentage = sales.map(item => ({
            name: item._id.product,
            percent: totalRevenue > 0 ? Number(((item.total / totalRevenue) * 100).toFixed(2)) : 0
        }));

        res.status(200).json({
            success: true,
            totalPercentage,
            sales,
            totalSales: [{ total: totalRevenue }]
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Admin: Bulk soft-delete products => DELETE /api/v1/admin/products/bulk
exports.bulkDeleteProducts = async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'No product IDs provided' });
        }

        const result = await Product.updateMany(
            { _id: { $in: ids } },
            {
                $set: {
                    isDeleted: true,
                    deletedAt: new Date(),
                    deletedBy: req.user ? req.user.id : null
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: `${result.modifiedCount} product(s) moved to Trash`,
            deletedCount: result.modifiedCount
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// Admin: Bulk restore products => PUT /api/v1/admin/products/bulk/restore
exports.bulkRestoreProducts = async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'No product IDs provided' });
        }

        const result = await Product.updateMany(
            { _id: { $in: ids } },
            {
                $set: {
                    isDeleted: false,
                    deletedAt: null,
                    deletedBy: null
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: `${result.modifiedCount} product(s) restored successfully`,
            restoredCount: result.modifiedCount
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// Admin: Get overall counts of trashed items => GET /api/v1/admin/trash/counts
exports.getTrashCounts = async (req, res, next) => {
    try {
        const productsCount = await Product.countDocuments({ isDeleted: true });
        const usersCount = await User.countDocuments({ isDeleted: true });

        const productsWithDeletedReviews = await Product.find({ 'reviews.isDeleted': true }).select('reviews');
        let reviewsCount = 0;
        for (const p of productsWithDeletedReviews) {
            reviewsCount += (p.reviews || []).filter(r => r.isDeleted).length;
        }

        return res.status(200).json({
            success: true,
            counts: {
                products: productsCount,
                users: usersCount,
                reviews: reviewsCount,
                total: productsCount + usersCount + reviewsCount
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};