const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
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
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
app.use('/api/campaign', campaignRoutes);
app.use('/api/auth', authRoutes);
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date() });
});

// Serve frontend in production
const distPath = path.join(__dirname, '../client/dist');
app.use(express.static(distPath));

// Fallback for SPA routing
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// Start Server
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`[SERVER] Tomar AI Mail Agent running on http://localhost:${PORT}`);
    });
}
module.exports = app;
