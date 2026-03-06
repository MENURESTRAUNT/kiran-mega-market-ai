const express = require('express');
const router = express.Router();
const { getAuthUrl, setCredentials } = require('../utils/googleAuth');

// Get the Google Auth URL
router.get('/url', (req, res) => {
    const url = getAuthUrl();
    res.json({ url });
});

// Callback from Google to handle tokens
router.get('/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const tokens = await setCredentials(code);
        // Redirect back to the frontend with tokens in a way the frontend can grab them
        // In a real prod app, you'd use cookies or a secure session
        // For this demo, we can pass them in the URL and the frontend will save to localStorage
        const tokenString = encodeURIComponent(JSON.stringify(tokens));
        res.redirect(`/?tokens=${tokenString}`);
    } catch (error) {
        console.error('[AUTH ERROR]', error);
        res.status(500).send('Authentication failed.');
    }
});

module.exports = router;
