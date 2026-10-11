const Product = require('../models/product')
const Order = require('../models/order')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary')
const APIFeatures = require('../utils/apiFeatures');

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

    const baseQuery = Product.find({ isPublished: { $ne: false } });
    const apiFeatures = new APIFeatures(baseQuery, queryCopy).search().filter();
    const productsCount = await Product.countDocuments({ isPublished: { $ne: false } });

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

    const products = await Product.find();
    if (!products) {
        return res.status(404).json({
            success: false,
            message: 'Products not found'
        })
    }
    return res.status(200).json({
        success: true,
        products
    })

}
exports.updateProduct = async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    // console.log(req.body)
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }
    let images = []

    // if (typeof req.files === 'string') {
    //     images.push(req.files)
    // } else {
    //     images = req.files
    // }
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
    // console.log(product)
    return res.status(200).json({
        success: true,
        product
    })
}

exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
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
            message: 'Product deleted'
        })
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
            comment: comment.trim()
        };

        const isReviewed = product.reviews.find(
            r => r.user.toString() === req.user._id.toString()
        );

        if (isReviewed) {
            product.reviews.forEach(r => {
                if (r.user.toString() === req.user._id.toString()) {
                    r.comment = comment.trim();
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
        const product = await Product.findById(req.query.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({
            success: true,
            reviews: product.reviews
        })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

exports.deleteReview = async (req, res, next) => {
    try {
        const product = await Product.findById(req.query.productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());
        const numOfReviews = reviews.length;

        const ratings = numOfReviews > 0 ? Number((reviews.reduce((acc, item) => item.rating + acc, 0) / numOfReviews).toFixed(1)) : 0;

        await Product.findByIdAndUpdate(req.query.productId, {
            reviews,
            ratings,
            numOfReviews
        }, {
            new: true,
            runValidators: true,
        });

        return res.status(200).json({
            success: true,
            message: 'Review removed'
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