# WeatherNow

#project link-"https://alokchaturvedi2005.github.io/weather/"

WeatherNow is a lightweight, responsive weather web app built with Tailwind CSS and the Open-Meteo APIs (no API key required). It provides current weather, a 5-day forecast, local time, recent search history, and simple temperature alerts stored in `localStorage`.

**Files included**
- `index.html` — app markup and layout. :contentReference[oaicite:3]{index=3}  
- `script.js` — application logic, calls Open-Meteo endpoints, localStorage management, UI updates. :contentReference[oaicite:4]{index=4}  
- `style.css` — custom theme backgrounds, animations & responsive tweaks. :contentReference[oaicite:5]{index=5}

---

## Features

- Search any city (uses Open-Meteo geocoding).
- Use browser geolocation to fetch current location weather.
- Toggle temperature unit between Celsius and Fahrenheit (persisted).
- 5-day daily forecast with icons and summary.
- Recent cities list (persisted, up to 6 entries).
- Temperature alert (set a threshold in °C or °F; toasts notify when exceeded).
- Clean UI using Tailwind and small custom CSS themes.

---

## Quick start (run locally)

1. **Download / clone** the project files into a folder so the three files `index.html`, `script.js`, and `style.css` are together.

2. **Serve the folder with a simple HTTP server** (recommended; some browsers block `fetch` on `file://`):
   - Python 3:
     ```bash
     cd path/to/project
     python -m http.server 8000
     # then open http://localhost:8000 in your browser
     ```
   - Or use any static server you prefer (Live Server in VSCode, `http-server` npm package, etc.).

3. **Open** `http://localhost:8000` (or equivalent) in your browser.

> Notes: The app uses the Open-Meteo public endpoints (no key), so you need an internet connection for geocoding and forecast calls.

---

## Usage

- **Search a city**: Type the city name and press `Search`. The first geocoding result is used.
- **Use geolocation**: Click the 📍 button and allow location access.
- **Unit toggle**: Click `°C` / `°F` to switch units. Choice is saved in localStorage.
- **Recent cities**: Click any city from the "Recent Cities" list to re-fetch weather.
- **Temperature alert**: Enter a number, choose unit, and click `Set`. If the fetched temperature exceeds the threshold, a toast alert appears. Clear with `Clear`.

---

## Implementation details

- **APIs used**
  - Geocoding: `https://geocoding-api.open-meteo.com/v1/search?name=<city>`  
  - Forecast: `https://api.open-meteo.com/v1/forecast?...`  
  These endpoints are public and do not require keys (used directly from `script.js`). :contentReference[oaicite:6]{index=6}

- **Persistence**
  - `localStorage` keys:
    - `unit` — `"C"` or `"F"`.
    - `alert` — JSON object `{ value, unit }`.
    - `recent` — array of recent city objects from geocoding.

- **UI**
  - Tailwind CDN is used for quick styling; `style.css` contains custom theme backgrounds and small responsive tweaks. :contentReference[oaicite:7]{index=7}

---

## Troubleshooting & FAQs

- **Blank screen / fetch errors**  
  - Ensure you serve the files via HTTP (browser CORS prevents fetch from `file://`). Use `python -m http.server` or Live Server.
- **Geocoding returns "City not found"**  
  - Try more specific names (e.g., "Paris, FR" or include country).
- **Geolocation denied**  
  - The browser prompts for permission; if denied, the app shows a toast. You can re-enable in browser site settings.
- **Times appear wrong**  
  - The API returns times in ISO; `.toLocaleTimeString()` is used — it will format according to the user's locale/timezone.

---

## Code quality & testing

- The JS is intentionally concise and uses `fetch` + `async/await`. Key functions are modular (toasting, recent history, fetching, mapping weather codes).
- Manual testing checklist:
  - Search multiple cities (verify recent list updates).
  - Toggle units and reload — ensure unit persists and last city updates.
  - Set alert in °F and °C and verify toast behavior.
  - Try geolocation on different devices / browsers.

---

## Security & privacy

- No server-side code; all calls are client-side to Open-Meteo.
- The app stores recent city info and alert settings in localStorage — no data leaves the client beyond the API calls.

---

## Next improvements (suggestions)

- Add better error handling for network failures and show a specific message.
- Support multiple geocoding matches with a small dropdown to select the correct city.
- Add icons from an icon font (or small SVG sprites) for more visual polish.
- Add unit tests (Jest) for functions that transform API responses.
- Accessibility improvements: keyboard navigation, ARIA attributes on interactive controls.

---

## License

MIT — feel free to reuse and modify.

---
