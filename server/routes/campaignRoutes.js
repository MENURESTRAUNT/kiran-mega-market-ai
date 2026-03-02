const express = require('express');
const router = express.Router();
const { getAuthorizedClient } = require('../utils/googleAuth');
const { getSheetData } = require('../services/sheetService');
const { enhanceMessage } = require('../services/aiService');
const { sendEmail } = require('../services/gmailService');
const { google } = require('googleapis');

let currentCampaign = {
    status: 'idle',
    stats: { total: 0, sent: 0, failed: 0, skipped: 0 },
    enhancement: null,
    leads: []
};

// Helper: check if error is auth-related
const isAuthError = (err) => {
    const code = err?.code || err?.status || err?.response?.status;
    return code === 401 || code === 403;
};

// 1. Fetch data and enhance message
router.post('/preview', async (req, res) => {
    const { message, tokens } = req.body;

    if (!tokens || !tokens.access_token) {
        return res.status(401).json({ error: 'NOT_AUTHENTICATED', message: 'Please log in with Google first.' });
    }

    if (!message || message.trim().length < 3) {
        return res.status(400).json({ error: 'Message is too short.' });
    }

    try {
        const auth = getAuthorizedClient(tokens);
        const leads = await getSheetData(auth, process.env.SHEET_ID);

        if (leads.length === 0) {
            return res.status(400).json({ error: 'No valid email contacts found in your Google Sheet.' });
        }

        const enhancement = await enhanceMessage(message);

        currentCampaign = {
            status: 'preview',
            stats: { total: leads.length, sent: 0, failed: 0, skipped: 0 },
            enhancement,
            leads,
            sentEmails: new Set() // duplicate prevention
        };

        const sampleLead = leads[0];
        const sampleName = sampleLead?.name || null;

        res.json({
            leadsCount: leads.length,
            preview: enhancement,
            sample: {
                name: sampleName || 'Valued Customer',
                body: sampleName
                    ? enhancement.body.replace(/{Name}/gi, sampleName)
                    : enhancement.body.replace(/Hi \{Name\},?/gi, 'Hello,')
            }
        });
    } catch (error) {
        console.error('[PREVIEW ERROR]', error.message);
        if (isAuthError(error)) {
            return res.status(401).json({ error: 'NOT_AUTHENTICATED', message: 'Google session expired. Please log in again.' });
        }
        res.status(500).json({ error: error.message });
    }
});

// 2. Start sending
router.post('/send', async (req, res) => {
    const { tokens } = req.body;

    if (!tokens || !tokens.access_token) {
        return res.status(401).json({ error: 'NOT_AUTHENTICATED', message: 'Please log in with Google first.' });
    }

    if (currentCampaign.status !== 'preview') {
        return res.status(400).json({ error: 'No campaign ready to send. Please generate a preview first.' });
    }

    const auth = getAuthorizedClient(tokens);
    const gmail = google.gmail({ version: 'v1', auth });

    currentCampaign.status = 'sending';
    res.json({ message: 'Campaign started', status: 'sending' });

    // Background sending process
    (async () => {
        for (const lead of currentCampaign.leads) {
            // Prevent duplicate sends
            if (currentCampaign.sentEmails.has(lead.email)) {
                currentCampaign.stats.skipped++;
                continue;
            }

            const result = await sendEmail(
                gmail,
                lead.email,
                lead.name,
                currentCampaign.enhancement.subject,
                currentCampaign.enhancement.body
            );

            if (result.status === 'sent') {
                currentCampaign.stats.sent++;
                currentCampaign.sentEmails.add(lead.email);
            } else {
                currentCampaign.stats.failed++;
            }
        }
        currentCampaign.status = 'completed';
        console.log('[CAMPAIGN COMPLETE]', currentCampaign.stats);
    })();
});

// 3. Status report
router.get('/status', (req, res) => {
    res.json({
        status: currentCampaign.status,
        stats: currentCampaign.stats
    });
});

// 4. Reset
router.post('/reset', (req, res) => {
    currentCampaign = {
        status: 'idle',
        stats: { total: 0, sent: 0, failed: 0, skipped: 0 },
        enhancement: null,
        leads: [],
        sentEmails: new Set()
    };
    res.json({ message: 'Campaign reset.' });
});

module.exports = router;
