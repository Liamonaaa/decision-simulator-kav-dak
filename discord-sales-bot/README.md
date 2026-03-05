# Discord Sales Bot

Bot built with Node.js + TypeScript + `discord.js` containing `/totalsales`.

## What `/totalsales` does

- Works only in guild text channels.
- Scans only the current channel where the command is used.
- Reads full channel history with pagination (`limit: 100` per request).
- Extracts valid amounts from lines containing `כמה עלה:`.
- Supports numbers with and without commas (example: `3800`, `11,400`, `2,100`).
- Sums multiple valid `כמה עלה:` lines in the same message.
- Ignores malformed entries safely.

Response:

- If sales found:
  - `סך כל המכירות בחדר הזה: ₪X`
  - `מספר המכירות שנספרו: X`
- If none found:
  - `לא נמצאו מכירות בחדר הזה`

## Setup

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:
   - `npm install`
3. Register slash commands:
   - `npm run deploy:commands`
4. Start bot in development:
   - `npm run dev`
5. Or build and run:
   - `npm run build`
   - `npm start`

## Required Bot Permissions

- `View Channel`
- `Read Message History`

## Required Intents

- `Guilds`
- `GuildMessages`
- `MessageContent` (required so fetched messages include content for parsing)
