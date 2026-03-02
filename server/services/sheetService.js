const { google } = require('googleapis');

/**
 * Fetches data from the Google Sheet.
 * @param {object} authClient - Authorized OAuth2 client.
 * @param {string} spreadsheetId - The ID of the sheet.
 */
const getSheetData = async (authClient, spreadsheetId) => {
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'A:Z',
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            throw new Error('No data found in Google Sheet.');
        }

        // Auto-detect: if first row looks like headers (no @ in col A), use them
        // Otherwise treat col A as email, col B as name directly (no headers)
        const firstCell = (rows[0][0] || '').toLowerCase().trim();
        const hasHeaders = !firstCell.includes('@');

        let emailIndex = 0;
        let nameIndex = 1;
        let dataRows = rows;

        if (hasHeaders) {
            const headers = rows[0].map(h => h.toLowerCase().trim());
            emailIndex = headers.findIndex(h => h.includes('email'));
            nameIndex = headers.findIndex(h => h.includes('name'));
            if (emailIndex === -1) {
                throw new Error('No email column found in headers. Make sure a column contains the word "email".');
            }
            dataRows = rows.slice(1); // Skip header row
        }

        return dataRows
            .filter(row => row[emailIndex] && row[emailIndex].includes('@'))
            .map(row => ({
                email: row[emailIndex].trim(),
                name: nameIndex !== -1 && row[nameIndex] ? row[nameIndex].trim() : null
            }));

    } catch (error) {
        console.error('[SHEET SERVICE ERROR]', error);
        throw error;
    }
};

module.exports = { getSheetData };
