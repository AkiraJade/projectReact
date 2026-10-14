const express = require('express');
const router = express.Router();
const upload = require("../utils/multer");

const {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    getUserProfile,
    updateProfile,
    updatePassword,
    allUsers,
    deleteUser,
    restoreUser,
    permanentDeleteUser,
    getTrashUsers,
    getUserDetails,
    updateUser,
    logout,
    getUserAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    socialLogin
} = require('../controllers/auth');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.post('/register', upload.single("avatar"), registerUser);
router.post('/login', loginUser);
router.post('/auth/social-login', socialLogin);

router.post('/password/forgot', forgotPassword);
router.put('/password/reset/:token', resetPassword);

router.get('/me', isAuthenticatedUser, getUserProfile);
router.put('/me/update', isAuthenticatedUser, upload.single("avatar"), updateProfile);
router.put('/password/update', isAuthenticatedUser, updatePassword);

// Saved addresses endpoints
router.route('/me/addresses')
    .get(isAuthenticatedUser, getUserAddresses)
    .post(isAuthenticatedUser, addAddress);

router.route('/me/addresses/:addressId')
    .put(isAuthenticatedUser, updateAddress)
    .delete(isAuthenticatedUser, deleteAddress);

router.put('/me/addresses/:addressId/default', isAuthenticatedUser, setDefaultAddress);

// Admin customer trash & restore (must be before /admin/user/:id)
router.get('/admin/trash/users', isAuthenticatedUser, authorizeRoles('admin'), getTrashUsers);
router.put('/admin/user/:id/restore', isAuthenticatedUser, authorizeRoles('admin'), restoreUser);
router.delete('/admin/user/:id/permanent', isAuthenticatedUser, authorizeRoles('admin'), permanentDeleteUser);

// Admin user management
router.get('/admin/users', isAuthenticatedUser, authorizeRoles('admin'), allUsers);
router.route('/admin/user/:id')
    .get(isAuthenticatedUser, authorizeRoles('admin'), getUserDetails)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser)
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateUser);

router.get('/logout', logout);

module.exports = router;