# 🤖 Kiran AI Bulk Email Personalization Agent

A production-ready, AI-powered bulk email automation tool designed for small businesses (initial focus: Supermarket Promotions). This agent leverages OpenAI to transform raw promotional ideas into high-conversion, personalized emails sent via the Gmail API.

## 🚀 Features

- **AI Content Enhancement**: Convert rough notes into professional copy using GPT-4o.
- **Dynamic Personalization**: Automatically pull names from Google Sheets.
- **Anti-Spam Logic**: Built-in rate limiting (5s delay between emails) to meet Gmail best practices.
- **Premium Dashboard**: Cinematic React UI with glassmorphism and real-time campaign tracking.
- **Reporting**: Detailed success/fail breakdown after every campaign.

## 🏗️ System Architecture

- **Frontend**: React + Vite + Tailwind CSS + Framer Motion.
- **Backend**: Node.js (Express) + Bottleneck (Rate Limiting) + Morgan (Logging).
- **APIs**: OpenAI (LLM), Google Sheets (Data extraction), Gmail (Delivery).

## 📂 Project Structure

```text
/
├── client/                 # React Dashboard
│   ├── src/
│   │   ├── App.jsx         # Main Dashboard Logic
│   │   └── index.css       # Tailwind & Custom Styles
├── server/                 # Node.js Backend
│   ├── services/
│   │   ├── aiService.js    # OpenAI Integration
│   │   ├── gmailService.js # Rate-limited Email Dispatch
│   │   └── sheetService.js # Google Sheet Extraction
│   ├── routes/
│   │   └── campaignRoutes.js # API Endpoints
│   └── index.js            # Server entry
├── .env                    # Environment Setup
└── README.md
```

## 🛠️ Setup Instructions

### 1. Google Cloud Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Enable **Gmail API** and **Google Sheets API**.
4. Configure **OAuth Consent Screen** (Test user: your email).
5. Create **OAuth 2.0 Client ID** (Web application).
   - Redirect URI: `http://localhost:5000/api/auth/callback`

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
OPENAI_API_KEY=your_key
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/callback
SHEET_ID=your_spreadsheet_id
```

### 3. Installation & Run
```bash
# Backend
npm install
npm start

# Frontend (Separate terminal)
cd client
npm install
npm run dev
```

## 🛡️ Security
- No hardcoded credentials.
- OAuth2 token-based interaction.
- Anti-spam rate limiting by default.

---
Built as a production-grade startup project for **Kiran Mega Market**.
