const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./src/backend/routes/bookingRoutes');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mc-copy2', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Auth routes
app.use('/auth', authRoutes);

app.use('/api/bookings', bookingRoutes); // Add booking routes
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});