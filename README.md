# cs50x_final_project

## TL;DR

The refreshed dashboard focuses on surfacing the next confirmed Test and One Day International fixtures so that visitors can quickly understand what elite cricket is coming up next.

### Goals

1. Practise working with a free cricket API feed.
2. Present upcoming Test and ODI matches in a compact, visually rich layout.
3. Make it clear where and when each highlighted match will be played.

Access: https://npnz88.github.io/cs50x_final/

> ℹ️ The project is for educational purposes. Fixture data is retrieved from the free tier of [CricAPI](https://www.cricapi.com/).

## Local development

1. Install dependencies once with `npm install` (only `node-fetch` is required for the fetch script).
2. Create a `.env` file (or export the variable in your shell) with `CRICAPI_KEY=<your_api_key>`.
3. Run `node fetch_cricket.js` to pull the latest fixtures; a JSON snapshot is written to `data/upcoming_matches.json`.
4. Open `index.html` in a browser (or use any static server) to view the dashboard.

If the network call fails or no upcoming fixtures exist for a format, the UI will show a friendly empty state so the page remains informative.
