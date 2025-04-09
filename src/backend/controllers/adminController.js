const User = require('../models/User');
const Vendor = require('../models/Vendor');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(
            new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
        );
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Create user
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);

    res.status(201).json({
        success: true,
        data: user
    });
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get pending vendors
// @route   GET /api/admin/vendors/pending
// @access  Private/Admin
exports.getPendingVendors = asyncHandler(async (req, res, next) => {
    const vendors = await Vendor.find({ status: 'pending' })
        .populate('user', 'name email');

    res.status(200).json({
        success: true,
        count: vendors.length,
        data: vendors
    });
});

// @desc    Approve vendor
// @route   PUT /api/admin/vendors/:id/approve
// @access  Private/Admin
exports.approveVendor = asyncHandler(async (req, res, next) => {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
        return next(
            new ErrorResponse(`Vendor not found with id of ${req.params.id}`, 404)
        );
    }

    vendor.status = 'approved';
    await vendor.save();

    // Update user role to vendor
    await User.findByIdAndUpdate(vendor.user, { role: 'vendor' });

    res.status(200).json({
        success: true,
        data: vendor
    });
});