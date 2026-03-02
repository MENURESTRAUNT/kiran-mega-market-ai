const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

/**
 * Smart local email enhancement — no API required.
 * Analyzes the message and generates professional subject + body.
 */
const enhanceLocally = (rawMessage) => {
    const msg = rawMessage.trim();
    const lower = msg.toLowerCase();

    // Detect discount mentions
    const discountMatch = msg.match(/(\d+)\s*%/);
    const discount = discountMatch ? discountMatch[1] : null;

    // Generate subject line based on content
    let subject;
    if (discount) {
        subject = `🎉 ${discount}% Off Today — Just for You!`;
    } else if (lower.includes('sale') || lower.includes('offer') || lower.includes('deal')) {
        subject = `🛒 Special Offer Inside — Don't Miss Out!`;
    } else if (lower.includes('new') || lower.includes('launch') || lower.includes('arriv')) {
        subject = `✨ New Arrivals Are Here — Come See!`;
    } else if (lower.includes('weekend') || lower.includes('today') || lower.includes('tomor')) {
        subject = `⏰ Limited Time — This Weekend Only!`;
    } else {
        subject = `🌟 A Special Message from Kiran Mega Market`;
    }

    // Generate professional body
    const greeting = `Hi {Name},`;
    const closing = `\nWarm regards,\nKiran Mega Market Team`;

    let body;
    if (discount) {
        body = `${greeting}\n\nWe're excited to bring you an exclusive deal — enjoy ${discount}% off on selected items! ${msg}\n\nThis offer is available for a limited time only, so visit us soon.\n${closing}`;
    } else if (lower.includes('sale') || lower.includes('offer')) {
        body = `${greeting}\n\nWe have a special offer just for you! ${msg}\n\nHurry in while stocks last — we'd love to see you!\n${closing}`;
    } else {
        body = `${greeting}\n\n${msg}\n\nThank you for being a valued customer. We look forward to serving you!\n${closing}`;
    }

    return { subject, body };
};

/**
 * Enhances a raw message for a promotional email.
 * Tries Gemini AI first; falls back to smart local templates.
 * @param {string} rawMessage
 * @returns {Promise<{subject: string, body: string}>}
 */
const enhanceMessage = async (rawMessage) => {
    // Try Gemini if key is configured
    if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('REPLACE')) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

            const prompt = `You are a world-class promotional email copywriter for a supermarket. Transform this raw message into a polished email.

Return ONLY valid JSON (no markdown, no code fences):
{ "subject": "catchy subject under 60 chars", "body": "email body using {Name} placeholder for greeting, max 80 words" }

Raw message: "${rawMessage}"`;

            const result = await model.generateContent(prompt);
            let text = result.response.text().trim()
                .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
            const content = JSON.parse(text);

            if (content.subject && content.body) {
                console.log('[AI] ✅ Enhanced via Gemini');
                return content;
            }
        } catch (err) {
            console.warn('[AI] Gemini unavailable, using local engine:', err.message.slice(0, 80));
        }
    }

    // Fallback to local smart template engine
    console.log('[AI] ✅ Enhanced via local template engine');
    return enhanceLocally(rawMessage);
};

module.exports = { enhanceMessage };
