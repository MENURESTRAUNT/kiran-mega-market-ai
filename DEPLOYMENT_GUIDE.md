# 🚀 Step-by-Step Setup Guide (Deployment)

Follow these steps exactly to get your **Kiran AI Mail Agent** live and ready to show to businesses.

## Step 1: Google Cloud Console (The "Brain")
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. **Create Project**: Click the dropdown at the top > "New Project" > Name it `Kiran-AI-Mail`.
3. **Enable APIs**:
   - Go to "APIs & Services" > "Library".
   - Search and Enable: **Gmail API**.
   - Search and Enable: **Google Sheets API**.
4. **OAuth Consent Screen**:
   - Go to "OAuth Consent Screen".
   - Select **External**.
   - App Name: `Kiran AI Mail`.
   - User Support Email: Your email.
   - Developer Contact: Your email.
   - **Scopes**: Add `.../auth/gmail.send` and `.../auth/spreadsheets.readonly`.
   - **Test Users**: Add your own email address (CRITICAL: it won't work otherwise in test mode).
5. **Credentials**:
   - Go to "Credentials" > "Create Credentials" > **OAuth Client ID**.
   - Application Type: **Web application**.
   - Authorized Redirect URIs: `http://localhost:5000/api/auth/callback`.
   - **Copy** your Client ID and Client Secret.

## Step 2: Configure Environment (`.env`)
Go to your project folder and open `.env`. Fill in these values:
- `OPENAI_API_KEY`: Get from [OpenAI Dashboard](https://platform.openai.com/api-keys).
- `GOOGLE_CLIENT_ID`: From Google Cloud (Step 1).
- `GOOGLE_CLIENT_SECRET`: From Google Cloud (Step 1).
- `SHEET_ID`: Open your Google Sheet. The ID is the long string between `/d/` and `/edit` in the URL.

## Step 3: Run the System
1. **Start Backend**:
   - In terminal: `cd /Users/atharvajoshi/[portforlio/kiran-mega-market`
   - Run: `node server/index.js` (Server should say running on 5000).
2. **Start Frontend**:
   - Open a NEW terminal tab.
   - Run: `cd client && npm run dev`.
   - Open the link provided (usually `http://localhost:5173`).

## Step 4: The Selling Demo Flow
1. **Show the Problem**: Tell the business owner, "Normally, you send one boring mass email. With this, we use AI to personalize every single one."
2. **Setup the Sheet**: Show them a Google Sheet with 5 dummy names and emails.
3. **Input Goal**: Type a simple goal like "10% off organic apples this weekend."
4. **Click Analyze**: Let them watch the AI generate the professional subject line and body.
5. **Show Preview**: Show them exactly how it looks for "John" vs "Sarah".
6. **Hit Send**: Once approved, they see the real-time report.
