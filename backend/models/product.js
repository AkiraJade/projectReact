const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
        maxLength: [100, 'Product name cannot exceed 100 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        min: [0, 'Product price cannot be negative'],
        max: [999999, 'Product price exceeds limit'],
        default: 0.0
    },
    slug: {
        type: String,
        sparse: true,
        trim: true,
        lowercase: true
    },
    sku: {
        type: String,
        sparse: true,
        trim: true,
        uppercase: true
    },
    description: {
        type: String,
        required: [true, 'Please enter product description'],
    },
    specifications: {
        type: Map,
        of: String
    },
    ratings: {
        type: Number,
        default: 0
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
            },
        }
    ],
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: [true, 'Please select category for this product']
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    seller: {
        type: String,
        required: [true, 'Please enter product seller']
    },
    stock: {
        type: Number,
        required: [true, 'Please enter product stock'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    avgRating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be negative'],
        max: [5, 'Rating cannot exceed 5']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

productSchema.pre('save', function () {
    if (!this.slug && this.name) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (!this.sku && this._id) {
        this.sku = 'DSNV-' + this._id.toString().slice(-6).toUpperCase();
    }
});

module.exports = mongoose.model('Product', productSchema);