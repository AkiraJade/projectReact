const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    label: {
        type: String,
        trim: true,
        default: 'Home'
    },
    recipientName: {
        type: String,
        trim: true,
        required: [true, 'Please enter recipient name']
    },
    phone: {
        type: String,
        trim: true,
        required: [true, 'Please enter contact phone number']
    },
    addressLine1: {
        type: String,
        trim: true,
        required: [true, 'Please enter address line 1']
    },
    addressLine2: {
        type: String,
        trim: true,
        default: ''
    },
    city: {
        type: String,
        trim: true,
        required: [true, 'Please enter city']
    },
    province: {
        type: String,
        trim: true,
        default: ''
    },
    postalCode: {
        type: String,
        trim: true,
        required: [true, 'Please enter postal code']
    },
    country: {
        type: String,
        trim: true,
        required: [true, 'Please select country']
    },
    isDefault: {
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

addressSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Address', addressSchema);
