const express = require('express');
const {
    getVendors,
    getVendor,
    createVendor,
    updateVendor,
    deleteVendor,
    vendorPhotoUpload
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router
    .route('/')
    .get(getVendors)
    .post(protect, authorize('user', 'admin'), createVendor);

router
    .route('/:id')
    .get(getVendor)
    .put(protect, authorize('vendor', 'admin'), updateVendor)
    .delete(protect, authorize('vendor', 'admin'), deleteVendor);

router
    .route('/:id/photo')
    .put(protect, authorize('vendor', 'admin'), vendorPhotoUpload);

module.exports = router;