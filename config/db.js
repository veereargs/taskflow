const mongoose = require('mongoose');

let connectionPromise;

async function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return mongoose;
    }

    if (!process.env.DB_URL) {
        throw new Error('DB_URL environment variable is required');
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.DB_URL).finally(() => {
            connectionPromise = undefined;
        });
    }

    return connectionPromise;
}

module.exports = connectDB;