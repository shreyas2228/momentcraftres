const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    vendor: {
        type: mongoose.Schema.ObjectId,
        ref: 'Vendor',
        required: true
    },
    serviceType: {
        type: String,
        required: [true, 'Please select a service type']
    },
    eventDate: {
        type: Date,
        required: [true, 'Please add an event date']
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    guests: {
        type: Number,
        required: [true, 'Please add number of guests']
    },
    specialRequests: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'partial', 'paid'],
        default: 'unpaid'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate bookings for same vendor and date
BookingSchema.index({ vendor: 1, eventDate: 1 }, { unique: true });

module.exports = mongoose.model('Booking', BookingSchema);