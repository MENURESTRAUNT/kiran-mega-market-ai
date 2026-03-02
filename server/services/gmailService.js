const { google } = require('googleapis');

/**
 * Encodes an email into base64url format for Gmail API.
 */
const createEncodedEmail = (to, name, subject, body) => {
    // Personalize: replace {Name} placeholder
    let personalizedBody = body;
    if (name && name.trim()) {
        personalizedBody = body.replace(/\{Name\}/gi, name.trim());
    } else {
        personalizedBody = body
            .replace(/Hi \{Name\},?/gi, 'Hello,')
            .replace(/Dear \{Name\},?/gi, 'Hello,')
            .replace(/\{Name\}/gi, 'Valued Customer');
    }

    const emailLines = [
        `To: ${to}`,
        `Subject: ${subject}`,
        'Content-Type: text/plain; charset="UTF-8"',
        'MIME-Version: 1.0',
        '',
        personalizedBody
    ];

    const raw = emailLines.join('\r\n');
    return Buffer.from(raw).toString('base64url');
};

/**
 * Sends a personalized email via Gmail API with a delay between sends.
 */
const sendEmail = async (gmail, to, name, subject, body) => {
    const encodedEmail = createEncodedEmail(to, name, subject, body);

    try {
        // 3-second delay between emails (anti-spam throttle)
        await new Promise(resolve => setTimeout(resolve, 3000));

        await gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw: encodedEmail }
        });

        console.log(`[GMAIL] ✅ Sent to ${to}`);
        return { email: to, status: 'sent' };
    } catch (error) {
        console.error(`[GMAIL] ❌ Failed to send to ${to}:`, error.message);
        return { email: to, status: 'failed', error: error.message };
    }
};

module.exports = { sendEmail };
