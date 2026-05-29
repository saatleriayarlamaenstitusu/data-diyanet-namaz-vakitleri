# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo does

Scrapes daily prayer times (namaz vakitleri) for all 81 Turkish cities from the Diyanet website and stores them as JSON files in `data/namaz/`. A GitHub Actions cron job runs `node index.js` every 4 days to refresh the data and commits it back to the repo.

## Commands

```bash
npm install       # install dependencies
node index.js     # run the scraper (hits Diyanet website for all 81 cities)
```

No test suite exists (`npm test` exits with an error by default).

## Architecture

The entry point `index.js` simply calls `scrapers/namaz/diyanet.js`.

**`scrapers/namaz/diyanet.js`** — the core scraper:
- Iterates all 81 cities from `urls.js` (`CITIES` object keyed by Turkish plate number 1–81)
- Fetches each city's prayer page from Diyanet, parses HTML with `node-html-parser`, extracts the monthly prayer table (`#vakit-bottom-wrapper #tab-1 tbody tr`)
- Diyanet returns ~31 days of forward data per city per scrape
- `writeFile()` merges new data into the existing JSON via `Object.assign({}, existing, data)` then prunes any date keys older than 5 days before today (UTC), keeping the file at ~36 entries (5 past + today + ~30 future)

**`data/namaz/<plate>.json`** — one file per city, keyed by `YYYY-MM-DD`:
```json
{
  "2026-05-29": { "imsak": "03:35", "gunes": "05:29", "ogle": "13:06", "ikindi": "17:05", "aksam": "20:34", "yatsi": "22:20" }
}
```

**`urls.js`** — exports `CITIES` (plate → `{name, slug, diyanetId}`) and `DIYANET_BASE_URL`. City URLs are constructed as `DIYANET_BASE_URL + diyanetId + "/" + slug + "-icin-namaz-vakti"`.

**`utils.js`** — exports `fetchAsync` and `fetchRetry` (3 attempts, 1.5s delay between retries). Uses Node's built-in `fetch` (not `node-fetch`; that dependency appears unused).

## GitHub Actions

`.github/workflows/diyanet.yml` schedules scrapes at `0 8 */4 * *` (08:00 UTC every 4 days). After running, it commits and pushes using `mikeal/publish-to-github-action`, which requires `BRANCH_NAME` set in repo secrets.
