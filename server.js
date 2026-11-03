require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

async function start() {
    await connectDB();
    app.listen(PORT, () => console.log(`TaskFlow server running at http://localhost:${PORT}`));
}

start().catch((error) => {
    console.error('Failed to start server:', error.message);
    process.exitCode = 1;
});
