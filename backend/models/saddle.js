const mongoose = require('mongoose');

const saddleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter saddle name'],
        trim: true
    },
    brand: {
        type: String,
        required: [true, 'Please enter saddle brand'],
        trim: true
    },
    material: {
        type: String,
        required: [true, 'Please enter saddle material']
    },
    width: {
        type: String,
        required: [true, 'Please enter saddle width']
    },
    railMaterial: {
        type: String,
        required: [true, 'Please enter rail material']
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
        required: [true, 'Please enter saddle description']
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

saddleSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Saddle', saddleSchema);
