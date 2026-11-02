const Product = require("../models/product");

class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr || {};
    }

    search() {
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,
                $options: 'i'
            }
        } : {};
        this.query = this.query.find({ ...keyword });
        return this;
    }

    filter() {
        const queryCopy = { ...this.queryStr };

        // Removing fields that are handled separately
        const removeFields = ['keyword', 'page', 'limit'];
        removeFields.forEach(el => delete queryCopy[el]);

        let priceFilter = {};
        if (queryCopy['price[gte]'] !== undefined || queryCopy['price[lte]'] !== undefined) {
            priceFilter.price = {};
            if (queryCopy['price[gte]'] !== undefined) {
                priceFilter.price.$gte = Number(queryCopy['price[gte]']);
            }
            if (queryCopy['price[lte]'] !== undefined) {
                priceFilter.price.$lte = Number(queryCopy['price[lte]']);
            }
            delete queryCopy['price[gte]'];
            delete queryCopy['price[lte]'];
        } else if (queryCopy.price && typeof queryCopy.price === 'object') {
            priceFilter.price = {};
            if (queryCopy.price.gte !== undefined) {
                priceFilter.price.$gte = Number(queryCopy.price.gte);
            }
            if (queryCopy.price.lte !== undefined) {
                priceFilter.price.$lte = Number(queryCopy.price.lte);
            }
            delete queryCopy.price;
        }

        this.query = this.query.find({ ...queryCopy, ...priceFilter });
        return this;
    }

    pagination(resPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resPerPage * (currentPage - 1);

        this.query = this.query.limit(resPerPage).skip(skip);
        return this;
    }
}

module.exports = APIFeatures;
