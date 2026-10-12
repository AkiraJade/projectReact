const mongoose = require('mongoose');

const handlebarSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter handlebar name'],
        trim: true
    },
    brand: {
        type: String,
        required: [true, 'Please enter handlebar brand'],
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Please enter handlebar type'],
        enum: {
            values: ['Drop', 'Flat', 'Bullhorn', 'Track', 'Riser'],
            message: 'Please select valid handlebar type'
        }
    },
    width: {
        type: String,
        required: [true, 'Please enter handlebar width']
    },
    clampDiameter: {
        type: String,
        required: [true, 'Please enter clamp diameter']
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
        required: [true, 'Please enter handlebar description']
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

handlebarSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Handlebar', handlebarSchema);
