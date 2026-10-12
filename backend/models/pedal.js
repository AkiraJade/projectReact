const mongoose = require('mongoose');

const pedalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter pedal name'],
        trim: true
    },
    brand: {
        type: String,
        required: [true, 'Please enter pedal brand'],
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Please enter pedal type'],
        enum: {
            values: ['Flat', 'Clipless', 'Cage'],
            message: 'Please select valid pedal type'
        }
    },
    material: {
        type: String,
        required: [true, 'Please enter pedal material']
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
        required: [true, 'Please enter pedal description']
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

pedalSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Pedal', pedalSchema);
