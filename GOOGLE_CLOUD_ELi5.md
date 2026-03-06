# 🧭 Simplified Google Cloud Setup Guide

Setting up Google Cloud is the "boring" part, but it's the most important! Think of this as getting a "Digital Key" for your supermarket's email system.

## Part 1: The "Digital ID Card" (OAuth Consent)
Google wants to know: "Who is this app, and what is it allowed to do?"

1. **Step**: Choose **External**. 
   - *Why?* This means anyone with a Google account (like your clients) could eventually use it.
2. **Step**: App Name, Support Email, and Developer Email.
   - *Tip*: Just use `Tomar AI Mail` and your personal Gmail for both email spots.
4. **Step: The Scopes (The Permissions)** 🔑
   - Click "Add or Remove Scopes".
   - You need to find and check these TWO:
     - `.../auth/gmail.send` (Allows the app to send emails as you).
     - `.../auth/spreadsheets.readonly` (Allows the app to read your Google Sheet).
   - Click **Save and Continue**.
5. **Step: Test Users (The most important part!)** 📧
   - While the app is "In Testing," Google won't let it work unless you explicitly list your email here.
   - Click **Add Users** and type your personal Gmail address.

## Part 2: The "Key & Lock" (Credentials)
Now we create the actual technical keys.

1. **Step**: Click **Create Credentials** > **OAuth Client ID**.
2. **Step**: Application Type = **Web application**.
3. **Step: Authorized Redirect URIs** 🔗
   - This tells Google where to send the "Digital Key" after you log in.
   - Click **Add URI** and paste this exactly:
     `http://localhost:5000/api/auth/callback`
4. **Step**: Click **Create**.
5. **Step**: You will see a popup with **Client ID** and **Client Secret**.
   - **Copy these immediately!** You need to paste them into your `.env` file.

---

### Still stuck?
If you can take a screenshot of where you are or tell me exactly what the button says, I can tell you exactly which one to click! 
(Since I'm an AI, I can't log into your Google account for you due to security, but I can be your "Co-Pilot" while you do it).
