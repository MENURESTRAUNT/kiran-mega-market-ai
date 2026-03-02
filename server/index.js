const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const campaignRoutes = require('./routes/campaignRoutes');
const authRoutes = require('./routes/authRoutes');

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/campaign', campaignRoutes);
app.use('/api/auth', authRoutes);
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date() });
});

// Start Server
app.listen(PORT, () => {
    console.log(`[SERVER] Kiran AI Mail Agent running on http://localhost:${PORT}`);
});
