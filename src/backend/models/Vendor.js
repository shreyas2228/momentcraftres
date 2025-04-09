const mongoose = require('mongoose');
const User = require('./User');

const VendorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    businessName: {
        type: String,
        required: [true, 'Please add your business name']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    serviceType: {
        type: String,
        required: [true, 'Please select a service type'],
        enum: [
            'photographer',
            'caterer',
            'event-planner',
            'venue',
            'decorator',
            'entertainment',
            'other'
        ]
    },
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Please use a valid URL with HTTP or HTTPS'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    pricing: [{
        packageName: String,
        price: Number,
        description: String
    }],
    portfolioImages: [String],
    rating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating must not be more than 5']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Cascade delete bookings when a vendor is deleted
VendorSchema.pre('remove', async function(next) {
    await this.model('Booking').deleteMany({ vendor: this._id });
    next();
});

module.exports = mongoose.model('Vendor', VendorSchema);