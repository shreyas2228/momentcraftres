const Vendor = require('../models/Vendor');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const path = require('path');

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Public
exports.getVendors = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Get single vendor
// @route   GET /api/vendors/:id
// @access  Public
exports.getVendor = asyncHandler(async (req, res, next) => {
    const vendor = await Vendor.findById(req.params.id)
        .populate('user', 'name email')
        .populate('bookings');

    if (!vendor) {
        return next(
            new ErrorResponse(`Vendor not found with id of ${req.params.id}`, 404)
        );
    }

    res.status(200).json({
        success: true,
        data: vendor
    });
});

// @desc    Create new vendor
// @route   POST /api/vendors
// @access  Private
exports.createVendor = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.user = req.user.id;

    // Check for existing vendor
    const existingVendor = await Vendor.findOne({ user: req.user.id });

    if (existingVendor) {
        return next(
            new ErrorResponse(`User ${req.user.id} is already a vendor`, 400)
        );
    }

    const vendor = await Vendor.create(req.body);

    // Update user role to vendor
    await User.findByIdAndUpdate(req.user.id, { role: 'vendor' });

    res.status(201).json({
        success: true,
        data: vendor
    });
});

// @desc    Update vendor
// @route   PUT /api/vendors/:id
// @access  Private
exports.updateVendor = asyncHandler(async (req, res, next) => {
    let vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
        return next(
            new ErrorResponse(`Vendor not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is vendor owner or admin
    if (vendor.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update this vendor`,
                401
            )
        );
    }

    vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: vendor
    });
});

// @desc    Delete vendor
// @route   DELETE /api/vendors/:id
// @access  Private
exports.deleteVendor = asyncHandler(async (req, res, next) => {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
        return next(
            new ErrorResponse(`Vendor not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is vendor owner or admin
    if (vendor.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to delete this vendor`,
                401
            )
        );
    }

    await vendor.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Upload photo for vendor
// @route   PUT /api/vendors/:id/photo
// @access  Private
exports.vendorPhotoUpload = asyncHandler(async (req, res, next) => {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
        return next(
            new ErrorResponse(`Vendor not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is vendor owner or admin
    if (vendor.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update this vendor`,
                401
            )
        );
    }

    if (!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 400));
    }

    const file = req.files.file;

    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file`, 400));
    }

    // Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(
            new ErrorResponse(
                `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
                400
            )
        );
    }

    // Create custom filename
    file.name = `photo_${vendor._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse(`Problem with file upload`, 500));
        }

        await Vendor.findByIdAndUpdate(req.params.id, { photo: file.name });

        res.status(200).json({
            success: true,
            data: file.name
        });
    });
});