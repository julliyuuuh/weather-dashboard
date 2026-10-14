# Weather Dashboard

Real-time weather for any city, built with vanilla JavaScript and the [Open-Meteo](https://open-meteo.com) API.

**Live demo:** https://julliyuuuh.github.io/weather-dashboard/

## Features

- Search any city and see its current temperature, wind speed and humidity
- 5-day forecast with daily highs and lows
- Icons drawn as inline SVG, so they stay sharp at any size
- Background shifts with the weather and time of day (clear, cloudy, rain, storm, snow, night)
- Clear error messages for unknown cities and connection problems
- Responsive layout, keyboard-friendly focus styles, and reduced-motion support

## How it works

1. The city name is sent to the Open-Meteo geocoding API, which returns its coordinates.
2. Those coordinates are used to request current conditions and a daily forecast.
3. WMO weather codes from the API are mapped to a label, an icon and a background theme.
4. The page updates without reloading.
   No API key is needed.

## Run it locally

```bash
git clone https://github.com/julliyuuuh/weather-dashboard.git
cd weather-dashboard
```

Then open `index.html` in your browser.

## Project structure

```
weather-dashboard/
├── index.html   # page structure
├── style.css    # layout, themes and styling
└── script.js    # API calls, weather-code mapping and rendering
```

## Built with

- HTML, CSS and JavaScript (no frameworks or build step)
- [Open-Meteo](https://open-meteo.com) weather and geocoding APIs

## Ideas for next steps

- Hourly temperature chart
- °C / °F toggle
- "Use my location" button
- Picker for cities that share a name

## License

MIT. See [LICENSE](LICENSE).

Weather data by [Open-Meteo](https://open-meteo.com).
