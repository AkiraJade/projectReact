const mongoose = require('mongoose');

const frameSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter frame name'],
        trim: true
    },
    brand: {
        type: String,
        required: [true, 'Please enter frame brand'],
        trim: true
    },
    material: {
        type: String,
        required: [true, 'Please enter frame material'],
        enum: {
            values: ['Steel', 'Aluminum', 'Carbon', 'Titanium'],
            message: 'Please select valid frame material'
        }
    },
    sizes: [
        {
            size: {
                type: String,
                required: true
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
            ]
        }
    ],
    description: {
        type: String,
        required: [true, 'Please enter frame description']
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

frameSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Frame', frameSchema);
