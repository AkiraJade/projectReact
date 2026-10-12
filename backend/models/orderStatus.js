const mongoose = require('mongoose');

const orderStatusSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.ObjectId,
        ref: 'Order',
        required: true,
        index: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Assembling', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Cancelled']
    },
    previousStatus: {
        type: String
    },
    updatedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    notes: {
        type: String,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

orderStatusSchema.index({ order: 1, timestamp: -1 });

module.exports = mongoose.model('OrderStatus', orderStatusSchema);
