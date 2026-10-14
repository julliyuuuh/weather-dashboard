const S = (inner) =>
  `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
const sun = `<circle cx="32" cy="32" r="10"/><path d="M32 8v6M32 50v6M8 32h6M50 32h6M15 15l4 4M45 45l4 4M49 15l-4 4M19 45l-4 4"/>`;
const moon = `<path d="M44 40A18 18 0 0 1 24 14a18 18 0 1 0 20 26z"/>`;
const cloud = `<path d="M18 46a10 10 0 0 1 1-20 14 14 0 0 1 27 4 8 8 0 0 1-2 16z"/>`;
const ICONS = {
  clear: (day) => S(day ? sun : moon),
  partly: (day) =>
    S(
      `<g transform="translate(-6,-8) scale(.7)">${day ? sun : moon}</g><g transform="translate(6,6) scale(.8)">${cloud}</g>`,
    ),
  cloud: () => S(cloud),
  fog: () => S(`<path d="M10 24h44M14 34h36M10 44h44"/>`),
  rain: () => S(cloud + `<path d="M22 52l-3 6M34 52l-3 6M46 52l-3 6"/>`),
  snow: () =>
    S(cloud + `<path d="M22 54v.1M34 54v.1M46 54v.1M28 58v.1M40 58v.1"/>`),
  storm: () => S(cloud + `<path d="M34 44l-6 8h8l-5 8"/>`),
};

const WMO = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Freezing fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  56: "Light freezing drizzle",
  57: "Freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Light rain showers",
  81: "Rain showers",
  82: "Violent rain showers",
  85: "Light snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

function decode(code, day) {
  const label = WMO[code] || "Unknown conditions";
  if (code <= 1) return ["clear", label, day ? "day" : "night"];
  if (code === 2) return ["partly", label, day ? "day" : "night"];
  if (code === 3) return ["cloud", label, day ? "cloud" : "night"];
  if (code <= 48) return ["fog", label, day ? "cloud" : "night"];
  if (code <= 67 || (code >= 80 && code <= 82)) return ["rain", label, "rain"];
  if (code <= 77 || code === 85 || code === 86) return ["snow", label, "snow"];
  return ["storm", label, "storm"];
}

const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );
const out = document.getElementById("out");
let latest = 0;

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok)
    throw new Error(
      `The weather service returned an error (${res.status}). Try again in a moment.`,
    );
  return res.json();
}

async function load(name) {
  const id = ++latest;
  out.innerHTML = '<p class="msg">Loading…</p>';
  try {
    const g = await getJSON(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1`,
    );
    if (!g.results)
      throw new Error(
        `No city found for "${name}". Check the spelling and try again.`,
      );
    const place = g.results[0];
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
      `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,is_day` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`;
    const w = await getJSON(url);
    if (id === latest) render(w, place);
  } catch (e) {
    if (id !== latest) return;
    const msg =
      e instanceof TypeError
        ? "Couldn't reach the weather service. Check your connection."
        : e.message;
    out.innerHTML = `<p class="msg">${esc(msg)}</p>`;
  }
}

function render(w, place) {
  const c = w.current,
    day = c.is_day === 1;
  const [icon, label, theme] = decode(c.weather_code, day);
  document.body.dataset.theme = theme;
  const title = [
    place.name,
    place.admin1 && place.admin1 !== place.name ? place.admin1 : null,
    place.country,
  ]
    .filter(Boolean)
    .map(esc)
    .join(", ");
  const days = w.daily.time
    .map((t, i) => {
      const [ic] = decode(w.daily.weather_code[i], true);
      const dn =
        i === 0
          ? "Today"
          : new Date(t + "T00:00").toLocaleDateString("en", {
              weekday: "short",
            });
      return `<div class="day">${dn}${ICONS[ic](true)}<div>${Math.round(w.daily.temperature_2m_max[i])}°</div><div class="lo">${Math.round(w.daily.temperature_2m_min[i])}°</div></div>`;
    })
    .join("");
  out.innerHTML = `
    <section class="hero">${ICONS[icon](day)}
      <p class="temp">${Math.round(c.temperature_2m)}°</p>
      <p class="city">${title}</p>
      <p class="cond">${label} · Updated ${esc(c.time.slice(11))} local time</p>
    </section>
    <section class="stats">
      <div class="stat"><b>${Math.round(c.wind_speed_10m)} km/h</b><span>Wind</span></div>
      <div class="stat"><b>${Math.round(c.relative_humidity_2m)}%</b><span>Humidity</span></div>
    </section>
    <section class="days" aria-label="5-day forecast">${days}</section>`;
}

document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const v = document.getElementById("q").value.trim();
  if (v) load(v);
});
load("Manila");
