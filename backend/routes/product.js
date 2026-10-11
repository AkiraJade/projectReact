const express = require('express');
const router = express.Router();
const upload = require("../utils/multer");

const {
    newProduct,
    getSingleProduct,
    getProducts,
    getAdminProducts,

    updateProduct,
    deleteProduct,
    getProductReviews,
    createProductReview,
    deleteReview,
    productSales,

} = require('../controllers/product');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth')

// router.post('/admin/product/new', upload.array('images', 10), newProduct);
router.post('/admin/product/new', isAuthenticatedUser, authorizeRoles('admin'), upload.array('images', 10), newProduct);
router.get('/product/:id', getSingleProduct);
router.get('/admin/products', isAuthenticatedUser, authorizeRoles('admin'), getAdminProducts);

router.put('/admin/product/:id', isAuthenticatedUser, authorizeRoles('admin'), upload.array('images', 10), updateProduct);
router.delete('/admin/product/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);

router.get('/products', getProducts);

router.put('/review', isAuthenticatedUser, createProductReview);
router.get('/reviews', isAuthenticatedUser, getProductReviews);
router.delete('/reviews', isAuthenticatedUser, authorizeRoles('admin'), deleteReview);
router.get('/admin/product-sales', isAuthenticatedUser, authorizeRoles('admin'), productSales);
module.exports = router;