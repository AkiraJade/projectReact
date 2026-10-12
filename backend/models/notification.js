const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    order: {
        type: mongoose.Schema.ObjectId,
        ref: 'Order',
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: ['order_confirmation', 'order_status_update', 'password_reset', 'promotional']
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'sent', 'failed'],
        default: 'pending'
    },
    sentAt: {
        type: Date
    },
    error: {
        type: String
    },
    metadata: {
        type: Map,
        of: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
