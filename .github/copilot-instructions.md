## Repo quick brief

This is a small single-page Weather & Travel Planner web app. It is client-side only (static HTML/CSS/JS) and lives at the repo root. Key files:

- `index.html` — App shell and DOM entry points.
- `styles.css` — Visual styles and layout.
- `main.js` — Application logic: event handling, DOM updates, localStorage-based favorites/history, and integration glue that calls the API module.
- `weather.js` — Encapsulated WeatherAPI class. Exposes a global `weatherAPI` instance and optionally exports `WeatherAPI` for Node environments.
- `README.md` — Project overview and local dev hints.

## Big-picture architecture

- Single-page frontend. No build toolchain or server code. All runtime behavior happens in the browser.
- `main.js` is the UI/controller: it handles events, stores state in `localStorage`, and calls `weatherAPI.getCurrentWeather(city)` and `weatherAPI.getAttractions(city)`.
- `weather.js` is the data/service module responsible for fetching weather and attraction data or returning deterministic mock data when `useMockData` is true. Prefer using mock data for reproducible behavior.

## Useful patterns & conventions (do not invent alternatives)

- UI updates are done by writing HTML strings into container elements (e.g., `weatherData.innerHTML = ...`). When editing `main.js`, preserve this pattern unless you refactor both the renderer and its call-sites.
- Local persistence uses `localStorage` keys: `weatherFavorites`, `searchHistory`, `lastSearch`, `searchAnalytics`, `attractionAnalytics`, `theme`.
- Exposed global helpers: `window.handleSearch`, `window.addFavorite`, `window.removeFavorite`. These are referenced directly from inline attributes in templates (for example `onclick="addFavorite(...)"`). If you rename them, update the call-sites in `main.js` and `index.html` templates.
- Feature flags in `weather.js`: `useMockData` toggles between live API calls and mock data. The module prints which mode is active to the console.

## External integrations & keys

- `weather.js` contains placeholders for OpenWeatherMap and OpenTripMap API keys and base URLs. By default `useMockData = true` to avoid live key usage.
- If you enable live mode, follow the existing pattern: provide `weatherApiKey` and `attractionsApiKey` inside `WeatherAPI` and keep requests consistent with the current endpoints.

## Developer workflows

- Local development: open `index.html` directly in a browser. There is no build step or package manager.
- To test interactions quickly, keep `weather.js` on mock mode. To test live API integration, set `weatherAPI.useMockData = false` in `weather.js` and supply valid keys.

## What AI agents should do (concise)

- When modifying UI templates, update both the HTML fragment in `main.js` and any helper functions that rely on element IDs/classes (e.g., favorite button id `favorite-btn`).
- Preserve `localStorage` key names and semantics. When changing stored object shapes, add a migration path (read old format, transform, and save new format) to avoid breaking user data during updates.
- Use mock data in `weather.js` for unit-like behaviour in automated changes and demos unless the task explicitly requires testing live APIs.

## Code examples to reference

- Call the weather API: `const weather = await weatherAPI.getCurrentWeather(city);`
- Get attractions: `const attractions = await weatherAPI.getAttractions(city);`
- Add favorite (global): `addFavorite(weatherObject)` — defined in `main.js` and referenced inline in templates.

## Files to read first when onboarding

1. `README.md` — project purpose and quick dev steps
2. `index.html` — DOM layout and script order
3. `main.js` — event flows, storage keys, and UI templates
4. `weather.js` — service layer, mock-data behavior, and API key locations

If anything in this file is unclear or you need more detail on tests, CI, or deployment, tell me what area you want expanded and I will iterate.
