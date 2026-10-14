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
    restoreProduct,
    permanentDeleteProduct,
    getTrashProducts,
    bulkDeleteProducts,
    bulkRestoreProducts,
    getProductReviews,
    createProductReview,
    deleteReview,
    restoreReview,
    permanentDeleteReview,
    getTrashReviews,
    getTrashCounts,
    productSales,
} = require('../controllers/product');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// Trash listings and counts (must be declared before parameterized :id routes)
router.get('/admin/trash/counts', isAuthenticatedUser, authorizeRoles('admin'), getTrashCounts);
router.get('/admin/trash/products', isAuthenticatedUser, authorizeRoles('admin'), getTrashProducts);
router.get('/admin/trash/reviews', isAuthenticatedUser, authorizeRoles('admin'), getTrashReviews);

// Bulk operations
router.delete('/admin/products/bulk', isAuthenticatedUser, authorizeRoles('admin'), bulkDeleteProducts);
router.put('/admin/products/bulk/restore', isAuthenticatedUser, authorizeRoles('admin'), bulkRestoreProducts);

// Admin Product CRUD & restore
router.post('/admin/product/new', isAuthenticatedUser, authorizeRoles('admin'), upload.array('images', 10), newProduct);
router.get('/admin/products', isAuthenticatedUser, authorizeRoles('admin'), getAdminProducts);
router.put('/admin/product/:id', isAuthenticatedUser, authorizeRoles('admin'), upload.array('images', 10), updateProduct);
router.delete('/admin/product/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);
router.put('/admin/product/:id/restore', isAuthenticatedUser, authorizeRoles('admin'), restoreProduct);
router.delete('/admin/product/:id/permanent', isAuthenticatedUser, authorizeRoles('admin'), permanentDeleteProduct);

// Public product routes
router.get('/product/:id', getSingleProduct);
router.get('/products', getProducts);

// Reviews endpoints
router.put('/review', isAuthenticatedUser, createProductReview);
router.get('/reviews', isAuthenticatedUser, getProductReviews);
router.delete('/reviews', isAuthenticatedUser, deleteReview);
router.put('/admin/review/restore', isAuthenticatedUser, authorizeRoles('admin'), restoreReview);
router.delete('/admin/review/permanent', isAuthenticatedUser, authorizeRoles('admin'), permanentDeleteReview);

// Sales metrics
router.get('/admin/product-sales', isAuthenticatedUser, authorizeRoles('admin'), productSales);

module.exports = router;