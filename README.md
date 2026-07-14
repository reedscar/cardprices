# Baseball Card Tracker (starter scaffold)

React frontend + a Vercel serverless function that proxies eBay's Browse API
(so your eBay Client Secret never touches the browser).

## What's here

```
├── src/
│   ├── App.jsx        ← main UI, calls /api/ebay-cards
│   └── main.jsx        ← React entry point
├── api/
│   └── ebay-cards.js   ← serverless function, holds the eBay secret
├── index.html
├── vite.config.js
├── package.json
└── .env.local.example  ← copy to .env.local and fill in real values
```

## Setup

1. **Get eBay API credentials**
   - Sign up at https://developer.ebay.com
   - Create an application to get a Client ID and Client Secret

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install the Vercel CLI** (lets you run the serverless function locally)
   ```bash
   npm install -g vercel
   ```

4. **Set up your secrets**
   ```bash
   cp .env.local.example .env.local
   ```
   Then fill in your real `EBAY_CLIENT_ID` and `EBAY_CLIENT_SECRET`.

5. **Run locally**
   ```bash
   vercel dev
   ```
   This runs both the React app and the `/api` function together, exactly
   like production. (Plain `npm run dev` only runs the frontend — the
   `/api/ebay-cards` calls will fail without `vercel dev` or a deployed
   backend, since Vite alone doesn't run serverless functions.)

6. **Deploy**
   ```bash
   vercel
   ```
   Then add `EBAY_CLIENT_ID` and `EBAY_CLIENT_SECRET` in the Vercel
   dashboard under Settings → Environment Variables (the CLI will prompt
   you too on first deploy).

## Next steps (not built yet)

- Swap the plain "search" call for real "daily most popular card" logic —
  e.g. track a fixed list of known cards' price/watch trends over time
  (see notes from planning conversation on why eBay's raw "sold" data
  isn't easily accessible via public API).
- Add MLB Stats API calls (`https://statsapi.mlb.com`, no auth needed) to
  pull the matched player's recent stats for comparison.
- Add a database (Postgres via Vercel Postgres, or Supabase) to store daily
  snapshots so you can chart trends over time instead of just today's data.
- Add a scheduled job (Vercel Cron, or GitHub Actions on a schedule) to run
  the daily fetch automatically instead of only on-demand.
