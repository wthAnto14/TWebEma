const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/anime_mongo';

async function connectDB() {
    try {
        await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected to MongoDB successfully');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err.message);
        process.exit(1);
    }
}

module.exports = { connectDB, mongoose };
