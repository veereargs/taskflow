require('dotenv').config();
    const express = require('express');
    const path = require('path');
    const cors = require('cors');
    const helmet = require('helmet');
    const morgan = require('morgan');
    const connectDB = require('./config/db');
    const authRoutes = require('./routes/authRoutes');
    const taskRoutes = require('./routes/taskRoutes');
    const errorHandler = require('./middleware/errorHandler');

    const app = express();
    connectDB();

    app.use(helmet());
    app.use(cors());
    app.use(morgan('dev'));
    app.use(express.json());
    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    });

    app.use('/api/auth', authRoutes);
    app.use('/api/tasks', taskRoutes);

    app.use((req, res) => res.status(404).json({ success: false, error: 'Route not found' }));
    app.use(errorHandler);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`TaskFlow server running at http://localhost:${PORT}`));