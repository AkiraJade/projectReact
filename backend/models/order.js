const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    referenceNumber: {
        type: String,
        unique: true,
        sparse: true,
        default: function() {
            return 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true
    },
    shippingInfo: {
        address: { type: String },
        city: { type: String },
        phoneNo: { type: String },
        postalCode: { type: String },
        country: { type: String }
    },
    deliveryMethod: {
        type: String,
        enum: ['delivery', 'pickup'],
        default: 'delivery'
    },
    deliveryAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    },
    pickupDetails: {
        date: {
            type: Date
        },
        timeSlot: {
            type: String
        }
    },
    orderItems: [
        {
            type: {
                type: String,
                enum: ['product', 'customBuild'],
                default: 'product'
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
        enum: ['Pending', 'Processing', 'Assembling', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Processing'
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

orderSchema.pre('save', function() {
    this.updatedAt = Date.now();
    
});

module.exports = mongoose.model('Order', orderSchema)