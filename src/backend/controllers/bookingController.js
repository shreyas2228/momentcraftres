const Booking = require('../models/Booking');
const Vendor = require('../models/Vendor');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = asyncHandler(async (req, res, next) => {
    if (req.user.role === 'vendor') {
        const bookings = await Booking.find({ vendor: req.user.vendorId })
            .populate('user', 'name email')
            .populate('vendor', 'businessName serviceType');
        return res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    }

    // For users and admins
    const bookings = await Booking.find({ user: req.user.id })
        .populate('vendor', 'businessName serviceType');

    res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings
    });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = asyncHandler(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id)
        .populate('user', 'name email')
        .populate('vendor', 'businessName serviceType');

    if (!booking) {
        return next(
            new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is booking owner, vendor or admin
    if (
        booking.user._id.toString() !== req.user.id &&
        booking.vendor._id.toString() !== req.user.vendorId &&
        req.user.role !== 'admin'
    ) {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to access this booking`,
                401
            )
        );
    }

    res.status(200).json({
        success: true,
        data: booking
    });
});

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.user = req.user.id;

    // Check if vendor exists
    const vendor = await Vendor.findById(req.body.vendor);

    if (!vendor) {
        return next(
            new ErrorResponse(`Vendor not found with id of ${req.body.vendor}`, 404)
        );
    }

    // Check if vendor is approved
    if (vendor.status !== 'approved') {
        return next(
            new ErrorResponse(`Vendor ${vendor.businessName} is not approved`, 400)
        );
    }

    const booking = await Booking.create(req.body);

    res.status(201).json({
        success: true,
        data: booking
    });
});

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = asyncHandler(async (req, res, next) => {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
        return next(
            new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is booking owner, vendor or admin
    if (
        booking.user.toString() !== req.user.id &&
        booking.vendor.toString() !== req.user.vendorId &&
        req.user.role !== 'admin'
    ) {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update this booking`,
                401
            )
        );
    }

    // Vendor can only update status
    if (req.user.role === 'vendor') {
        if (Object.keys(req.body).length !== 1 || !req.body.status) {
            return next(
                new ErrorResponse(`Vendors can only update booking status`, 400)
            );
        }
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: booking
    });
});

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.deleteBooking = asyncHandler(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        return next(
            new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is booking owner or admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to delete this booking`,
                401
            )
        );
    }

    await booking.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});