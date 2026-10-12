const mongoose = require('mongoose');

const wheelsetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter wheelset name'],
        trim: true
    },
    brand: {
        type: String,
        required: [true, 'Please enter wheelset brand'],
        trim: true
    },
    wheelSize: {
        type: String,
        required: [true, 'Please enter wheel size']
    },
    rimMaterial: {
        type: String,
        required: [true, 'Please enter rim material']
    },
    spokeCount: {
        type: Number,
        required: [true, 'Please enter spoke count']
    },
    colors: [
        {
            color: {
                type: String,
                required: true
            },
            stock: {
                type: Number,
                required: true,
                min: [0, 'Stock cannot be negative'],
                default: 0
            },
            price: {
                type: Number,
                required: true,
                min: [0, 'Price cannot be negative']
            }
        }
    ],
    description: {
        type: String,
        required: [true, 'Please enter wheelset description']
    },
    specifications: {
        type: Map,
        of: String
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    isActive: {
        type: Boolean,
        default: true
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

wheelsetSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Wheelset', wheelsetSchema);
