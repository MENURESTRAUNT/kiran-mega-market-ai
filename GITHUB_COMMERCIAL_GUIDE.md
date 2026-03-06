# 📤 GitHub & Commercial Guide

To sell this as a professional software product, your GitHub repository needs to look elite and secure.

## 1. Pushing to GitHub (The Pro Way)

### Create `.gitignore`
Before you push, make sure your secrets aren't included! Create a `.gitignore` file in the root:
```text
node_modules/
.env
dist/
.DS_Store
client/node_modules/
```

### Initialize and Push
Run these commands in your project root:
1. `git init`
2. `git add .`
3. `git commit -m "Initial release: Tomar AI Mail Agent v1.0"`
4. `git branch -M main`
5. Create a new repository on GitHub.
6. `git remote add origin https://github.com/YOUR_USERNAME/tomar-ai-mail.git`
7. `git push -u origin main`

## 2. Business Packaging Tips
- **The "License"**: Tell the business you provide the software + 1 year of maintenance for a flat fee.
- **Hosting**: You can offer to host it for them on **Render** or **Railway** for a monthly "subscription" fee ($20-$50/mo).
- **Customization**: Offer to tweak the AI prompts specifically for their brand voice for an extra charge.

## 3. Commercial Pitch
> "I've built a private AI agency tool that connects your existing Google Sheets to an AI copywriter. It sends personalized emails that land in the primary inbox, not the promotions tab, because of the anti-spam rate-limiting I've built in."
