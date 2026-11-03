const app = require('./app');
const connectDB = require('./config/db');

module.exports = async (req, res) => {
    try {
        await connectDB();
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        return res.status(503).json({ success: false, error: 'Database unavailable' });
    }

    return app(req, res);
};
