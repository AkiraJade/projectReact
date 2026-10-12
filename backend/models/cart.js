const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['product', 'customBuild']
    },
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: function() {
            return this.type === 'product';
        }
    },
    customBuild: {
        type: mongoose.Schema.ObjectId,
        ref: 'CustomBuild',
        required: function() {
            return this.type === 'customBuild';
        }
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
        default: 1
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    items: [cartItemSchema],
    subtotal: {
        type: Number,
        required: true,
        default: 0.0,
        min: [0, 'Subtotal cannot be negative']
    },
    tax: {
        type: Number,
        required: true,
        default: 0.0,
        min: [0, 'Tax cannot be negative']
    },
    shipping: {
        type: Number,
        required: true,
        default: 0.0,
        min: [0, 'Shipping cannot be negative']
    },
    total: {
        type: Number,
        required: true,
        default: 0.0,
        min: [0, 'Total cannot be negative']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

cartSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Cart', cartSchema);
