const Order = require('../models/order');
const Product = require('../models/product');

// Create a new order => /api/v1/order/new
exports.newOrder = async (req, res, next) => {
    let reservedProducts = [];
    try {
        const { orderItems, shippingInfo, paymentInfo } = req.body;

        if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
            return res.status(400).json({ success: false, message: 'No order items supplied' });
        }
        if (!shippingInfo || !shippingInfo.address || !shippingInfo.city || !shippingInfo.phoneNo) {
            return res.status(400).json({ success: false, message: 'Please provide complete delivery details' });
        }

        // 1. Recalculate trusted prices directly from database and atomically reserve inventory
        let verifiedItems = [];
        let itemsPrice = 0;

        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                // Rollback any reserved products
                for (const reserved of reservedProducts) {
                    await Product.findByIdAndUpdate(reserved.productId, { $inc: { stock: reserved.quantity } });
                }
                return res.status(404).json({ success: false, message: `Product not found: ${item.name || item.product}` });
            }

            if (product.isPublished === false) {
                for (const reserved of reservedProducts) {
                    await Product.findByIdAndUpdate(reserved.productId, { $inc: { stock: reserved.quantity } });
                }
                return res.status(400).json({ success: false, message: `Product "${product.name}" is currently unavailable` });
            }

            const requestedQty = Number(item.quantity) || 1;
            if (requestedQty <= 0) {
                for (const reserved of reservedProducts) {
                    await Product.findByIdAndUpdate(reserved.productId, { $inc: { stock: reserved.quantity } });
                }
                return res.status(400).json({ success: false, message: 'Invalid item quantity' });
            }

            // Atomic inventory decrement to prevent overselling
            const updatedProduct = await Product.findOneAndUpdate(
                { _id: product._id, stock: { $gte: requestedQty } },
                { $inc: { stock: -requestedQty } },
                { new: true }
            );

            if (!updatedProduct) {
                // Rollback previously reserved products
                for (const reserved of reservedProducts) {
                    await Product.findByIdAndUpdate(reserved.productId, { $inc: { stock: reserved.quantity } });
                }
                return res.status(400).json({
                    success: false,
                    message: `Product "${product.name}" has insufficient stock (available: ${product.stock}, requested: ${requestedQty})`
                });
            }

            reservedProducts.push({ productId: product._id, quantity: requestedQty });

            const trustedPrice = product.price;
            itemsPrice += trustedPrice * requestedQty;

            verifiedItems.push({
                product: product._id,
                name: product.name,
                price: trustedPrice,
                quantity: requestedQty,
                image: (product.images && product.images[0]?.url) ? product.images[0].url : (item.image || '/images/Dosnoventa_company_x.webp')
            });
        }

        itemsPrice = Number(itemsPrice.toFixed(2));
        const shippingPrice = itemsPrice > 200 ? 0 : 25;
        const taxPrice = Number((0.05 * itemsPrice).toFixed(2));
        const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

        // 2. Verified Payment Status
        // Do not mark an order as paid without verified payment confirmation
        let verifiedPayment = {
            id: paymentInfo?.id || 'COD-' + Date.now(),
            status: 'Cash on Delivery (Pending Payment)'
        };
        let paidAt = null;

        if (paymentInfo?.status === 'verified_paid') {
            verifiedPayment.status = 'Paid';
            paidAt = Date.now();
        }

        const order = await Order.create({
            orderItems: verifiedItems,
            shippingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo: verifiedPayment,
            paidAt,
            orderStatus: 'Processing',
            user: req.user._id
        });

        res.status(201).json({
            success: true,
            order
        });
    } catch (error) {
        // Rollback reserved stock in case of unhandled error
        for (const reserved of reservedProducts) {
            try {
                await Product.findByIdAndUpdate(reserved.productId, { $inc: { stock: reserved.quantity } });
            } catch (e) {
                console.error('Error rolling back stock:', e.message);
            }
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// Customer order history => /api/v1/orders/me
exports.myOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            orders
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get single order with IDOR protection => /api/v1/order/:id
exports.getSingleOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'No Order found with this ID'
            });
        }

        // Prevent unauthorized customers from viewing another user's order
        if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to view this order record'
            });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin: Get all orders => /api/v1/admin/orders
exports.allOrders = async (req, res, next) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        let totalAmount = 0;
        orders.forEach(order => {
            if (order.orderStatus !== 'Cancelled') {
                totalAmount += order.totalPrice;
            }
        });

        res.status(200).json({
            success: true,
            totalAmount: Number(totalAmount.toFixed(2)),
            orders
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin: Delete order => /api/v1/admin/order/:id
exports.deleteOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'No Order found with this ID'
            });
        }

        // If order was not cancelled, restore inventory upon deletion
        if (order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered') {
            for (const item of order.orderItems) {
                await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
            }
        }

        await Order.findByIdAndDelete(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin: Update fulfillment status => /api/v1/admin/order/:id
exports.updateOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const currentStatus = order.orderStatus;
        const newStatus = req.body.status;

        const allowedStatuses = ['Processing', 'Assembled', 'Delivered', 'Cancelled'];
        if (!allowedStatuses.includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed statuses: ${allowedStatuses.join(', ')}`
            });
        }

        if (currentStatus === 'Delivered') {
            return res.status(400).json({
                success: false,
                message: 'Order has already been marked as Delivered'
            });
        }
        if (currentStatus === 'Cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Order has already been marked as Cancelled'
            });
        }

        // If order is cancelled, restore reserved stock to inventory
        if (newStatus === 'Cancelled') {
            for (const item of order.orderItems) {
                await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
            }
        }

        if (newStatus === 'Delivered') {
            order.deliveredAt = Date.now();
        }

        order.orderStatus = newStatus;
        await order.save();

        res.status(200).json({
            success: true,
            order
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin Metrics: Total orders count
exports.totalOrders = async (req, res, next) => {
    try {
        const totalOrdersCount = await Order.countDocuments();
        res.status(200).json({
            success: true,
            totalOrders: [{ count: totalOrdersCount }]
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin Metrics: Total verified sales
exports.totalSales = async (req, res, next) => {
    try {
        const totalSales = await Order.aggregate([
            {
                $match: {
                    orderStatus: { $ne: 'Cancelled' }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$totalPrice" }
                }
            }
        ]);

        const salesAmount = (totalSales && totalSales.length > 0) ? totalSales[0].totalSales : 0;
        res.status(200).json({
            success: true,
            totalSales: [{ totalSales: salesAmount }]
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin Metrics: Customer sales breakdown
exports.customerSales = async (req, res, next) => {
    try {
        const customerSales = await Order.aggregate([
            {
                $match: {
                    orderStatus: { $ne: 'Cancelled' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDetails'
                },
            },
            { $unwind: "$userDetails" },
            {
                $group: {
                    _id: "$user",
                    name: { $first: "$userDetails.name" },
                    total: { $sum: "$totalPrice" }
                }
            },
            {
                $project: {
                    _id: 0,
                    userDetails: { name: "$name" },
                    total: 1
                }
            },
            { $sort: { total: -1 } }
        ]);

        res.status(200).json({
            success: true,
            customerSales: customerSales || []
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin Metrics: Sales per month
exports.salesPerMonth = async (req, res, next) => {
    try {
        const salesPerMonth = await Order.aggregate([
            {
                $match: {
                    orderStatus: { $ne: 'Cancelled' }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    total: { $sum: "$totalPrice" },
                },
            },
            {
                $addFields: {
                    month: {
                        $let: {
                            vars: {
                                monthsInString: ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
                            },
                            in: {
                                $arrayElemAt: ['$$monthsInString', "$_id.month"]
                            }
                        }
                    }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            {
                $project: {
                    _id: false,
                    month: true,
                    total: true,
                }
            }
        ]);

        res.status(200).json({
            success: true,
            salesPerMonth: salesPerMonth || []
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};