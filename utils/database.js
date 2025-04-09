const mongoose = require('mongoose');
const { MONGODB_URI, OPTIONS } = require('../config/database');

async function connectToDatabase() {
    try {
        await mongoose.connect(MONGODB_URI, OPTIONS);
        console.log('Successfully connected to MongoDB.');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

function disconnectFromDatabase() {
    return mongoose.connection.close();
}

module.exports = {
    connectToDatabase,
    disconnectFromDatabase
};
