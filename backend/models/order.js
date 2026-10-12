const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    referenceNumber: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true
    },
    deliveryMethod: {
        type: String,
        required: true,
        enum: ['delivery', 'pickup'],
        default: 'delivery'
    },
    deliveryAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: function() {
            return this.deliveryMethod === 'delivery';
        }
    },
    pickupDetails: {
        date: {
            type: Date,
            required: function() {
                return this.deliveryMethod === 'pickup';
            }
        },
        timeSlot: {
            type: String,
            required: function() {
                return this.deliveryMethod === 'pickup';
            }
        }
    },
    orderItems: [
        {
            type: {
                type: String,
                required: true,
                enum: ['product', 'customBuild']
            },
            name: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, 'Quantity must be at least 1']
            },
            image: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true,
                min: [0, 'Price cannot be negative']
            },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: function() {
                    return this.type === 'product';
                }
            },
            customBuild: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'CustomBuild',
                required: function() {
                    return this.type === 'customBuild';
                }
            }
        }
    ],
    paymentInfo: {
        method: {
            type: String,
            required: true,
            enum: ['COD', 'GCash', 'PayMaya', 'CreditCard', 'DebitCard']
        },
        id: {
            type: String
        },
        status: {
            type: String,
            required: true,
            default: 'Pending'
        }
    },
    paidAt: {
        type: Date
    },

    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0,
        min: [0, 'Items price cannot be negative']
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0,
        min: [0, 'Tax price cannot be negative']
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0,
        min: [0, 'Shipping price cannot be negative']
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0,
        min: [0, 'Total price cannot be negative']
    },
    orderStatus: {
        type: String,
        required: true,
        enum: ['Pending', 'Assembling', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    statusHistory: [
        {
            status: {
                type: String,
                required: true
            },
            updatedAt: {
                type: Date,
                default: Date.now
            },
            updatedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            notes: {
                type: String
            }
        }
    ],
    deliveredAt: {
        type: Date
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

orderSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Order', orderSchema)