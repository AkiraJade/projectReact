const mongoose = require('mongoose');

const gearRatioSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter gear ratio name'],
        trim: true
    },
    chainring: {
        teeth: {
            type: Number,
            required: [true, 'Please enter chainring teeth count']
        },
        boltCircleDiameter: {
            type: String,
            required: [true, 'Please enter BCD']
        }
    },
    cog: {
        teeth: {
            type: Number,
            required: [true, 'Please enter cog teeth count']
        },
        threadType: {
            type: String,
            required: [true, 'Please enter thread type']
        }
    },
    ratio: {
        type: Number,
        required: [true, 'Gear ratio is required']
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
        required: [true, 'Please enter gear ratio description']
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

gearRatioSchema.pre('save', function(next) {
    if (this.chainring.teeth && this.cog.teeth) {
        this.ratio = this.chainring.teeth / this.cog.teeth;
    }
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('GearRatio', gearRatioSchema);
