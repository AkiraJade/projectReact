const mongoose = require('mongoose');

const customBuildSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'Please enter custom build name'],
        trim: true
    },
    frame: {
        frameId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Frame',
            required: true
        },
        size: {
            type: String,
            required: true
        },
        color: {
            type: String,
            required: true
        }
    },
    wheelset: {
        wheelsetId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Wheelset',
            required: true
        },
        color: {
            type: String,
            required: true
        }
    },
    handlebar: {
        handlebarId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Handlebar',
            required: true
        },
        color: {
            type: String,
            required: true
        }
    },
    saddle: {
        saddleId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Saddle',
            required: true
        },
        color: {
            type: String,
            required: true
        }
    },
    pedal: {
        pedalId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Pedal',
            required: true
        },
        color: {
            type: String,
            required: true
        }
    },
    gearRatio: {
        gearRatioId: {
            type: mongoose.Schema.ObjectId,
            ref: 'GearRatio',
            required: true
        },
        color: {
            type: String,
            required: true
        }
    },
    totalPrice: {
        type: Number,
        required: true,
        min: [0, 'Total price cannot be negative']
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
    isSaved: {
        type: Boolean,
        default: false
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

customBuildSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('CustomBuild', customBuildSchema);
