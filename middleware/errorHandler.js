module.exports = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Something went wrong';
    console.error(`[ERROR] ${statusCode}: ${err.message}`);
    res.status(statusCode).json({ success: false, error: message });
};