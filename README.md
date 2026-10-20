# Golden Frame — portfolio website

Static website (no build step). Open `index.html` in a browser, or upload the whole folder to any static host (Vercel, Netlify, GitHub Pages, Cloudflare Pages…).

```
golden-frame/
├── index.html           page structure
├── css/styles.css       all styles
├── js/config.js         ← EDIT: Telegram, contacts, projects, gallery
├── js/i18n.js           Russian / English texts
├── js/app.js            site logic (language switch, gallery, form)
├── images/              put your screenshots here
└── telegram-proxy.js    optional Cloudflare Worker (keeps bot token secret)
```

## 1. Connect the consultation form to Telegram
1. In Telegram, talk to **@BotFather** → `/newbot` → copy the **token**.
2. Send any message to your new bot (or add it to a group), then open  
   `https://api.telegram.org/bot<TOKEN>/getUpdates` and copy the `chat` → `id`.
3. Safest: deploy `telegram-proxy.js` as a Cloudflare Worker (instructions inside the file), store `BOT_TOKEN` and `CHAT_ID` as secrets, and put the Worker URL in `endpoint` in `js/config.js`.  
   Quick start: put `botToken` and `chatId` directly in `js/config.js` — but then the token is visible to anyone who views the page source.

The form collects: name, phone number and the project the visitor wants.

## 2. Replace placeholders
In `js/config.js`:
- `email`, `telegram` — your real contacts.
- `repo` for each project — add the repository URL to show a "Repository" button.
- Gallery & covers — save screenshots into `images/` and set `src: "images/your-file.png"`.

## 3. Languages
The visitor's browser language is detected on first visit; the EN / RU switch in the header changes it and the choice is remembered. Edit texts in `js/i18n.js`.
