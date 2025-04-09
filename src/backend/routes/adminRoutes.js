const express = require('express');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getPendingVendors,
    approveVendor
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin protected routes
router.use(protect);
router.use(authorize('admin'));

router
    .route('/users')
    .get(getUsers)
    .post(createUser);

router
    .route('/users/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

router
    .route('/vendors/pending')
    .get(getPendingVendors);

router
    .route('/vendors/:id/approve')
    .put(approveVendor);

module.exports = router;