const express = require('express');
const {
    getBookings,
    getBooking,
    createBooking,
    updateBooking,
    deleteBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router
    .route('/')
    .get(protect, getBookings)
    .post(protect, authorize('user', 'admin'), createBooking);

router
    .route('/:id')
    .get(protect, getBooking)
    .put(protect, authorize('user', 'vendor', 'admin'), updateBooking)
    .delete(protect, authorize('user', 'admin'), deleteBooking);

module.exports = router;