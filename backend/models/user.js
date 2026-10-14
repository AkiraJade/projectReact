const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        maxLength: [30, 'Your name cannot exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        validate: [validator.isEmail, 'Please enter valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minlength: [6, 'Your password must be longer than 6 characters'],
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            default: 'default_avatar'
        },
        url: {
            type: String,
            default: 'https://res.cloudinary.com/dgneiaky7/image/upload/v1788417006/avatars/sycta145jvdzqjukfgxw.png'
        }
    },
    addresses: [
        new mongoose.Schema({
            label: { type: String, trim: true, default: 'Home' },
            recipientName: { type: String, trim: true, required: true },
            phone: { type: String, trim: true, required: true },
            addressLine1: { type: String, trim: true, required: true },
            addressLine2: { type: String, trim: true, default: '' },
            city: { type: String, trim: true, required: true },
            province: { type: String, trim: true, default: '' },
            postalCode: { type: String, trim: true, required: true },
            country: { type: String, trim: true, required: true },
            isDefault: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now }
        })
    ],
    role: {
        type: String,
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'deactivated', 'suspended'],
        default: 'active'
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },
    deletedAt: {
        type: Date,
        default: null
    },
    deletedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
})
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10)
});

userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });
}

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash and set to resetPasswordToken
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // Set token expire time
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000

    return resetToken

}

module.exports = mongoose.model('User', userSchema);