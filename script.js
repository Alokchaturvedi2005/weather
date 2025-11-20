// WeatherNow: Single File JS (Open-Meteo API, no key)
const API_GEO = "https://geocoding-api.open-meteo.com/v1/search?name=";
const API_WEATHER = "https://api.open-meteo.com/v1/forecast";

let unit = localStorage.getItem("unit") || "C";
let alertSpec = JSON.parse(localStorage.getItem("alert") || "null");

// DOM refs
const cityInput = document.getElementById("city-input");
const searchForm = document.getElementById("search-form");
const geoBtn = document.getElementById("geo-btn");
const unitToggle = document.getElementById("unit-toggle");
const alertContainer = document.getElementById("alert-container");
const forecastDiv = document.getElementById("forecast");
const recentDiv = document.getElementById("recent-list");
const alertValue = document.getElementById("alert-value");
const alertUnit = document.getElementById("alert-unit");
const setAlertBtn = document.getElementById("set-alert");
const clearAlertBtn = document.getElementById("clear-alert");
const alertInfo = document.getElementById("alert-info");
const clearHistoryBtn = document.getElementById("clear-history");

// Init
document.addEventListener("DOMContentLoaded", () => {
  unitToggle.textContent = unit === "C" ? "°C" : "°F";
  renderRecent();
  if (alertSpec) {
    alertInfo.classList.remove("hidden");
    alertInfo.textContent = `Alert set: ${alertSpec.value}°${alertSpec.unit}`;
  }
  const last = getRecent()[0];
  if (last) fetchWeather(last.latitude, last.longitude, last.name);
});

// EVENTS
searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return toast("Enter city name", "warn");
  const geo = await fetch(`${API_GEO}${encodeURIComponent(city)}`).then(r => r.json());
  if (!geo.results || !geo.results.length) return toast("City not found", "error");
  const g = geo.results[0];
  saveRecent(g);
  fetchWeather(g.latitude, g.longitude, g.name);
});

geoBtn.addEventListener("click", () => {
  if (!navigator.geolocation) return toast("Not supported", "error");
  navigator.geolocation.getCurrentPosition(
    p => fetchWeather(p.coords.latitude, p.coords.longitude, "Your Location"),
    () => toast("Location denied", "error")
  );
});

unitToggle.addEventListener("click", () => {
  unit = unit === "C" ? "F" : "C";
  localStorage.setItem("unit", unit);
  unitToggle.textContent = unit === "C" ? "°C" : "°F";
  const last = getRecent()[0];
  if (last) fetchWeather(last.latitude, last.longitude, last.name);
});

setAlertBtn.addEventListener("click", () => {
  const v = Number(alertValue.value);
  if (!v) return toast("Enter alert temp", "warn");
  alertSpec = { value: v, unit: alertUnit.value };
  localStorage.setItem("alert", JSON.stringify(alertSpec));
  alertInfo.classList.remove("hidden");
  alertInfo.textContent = `Alert set: ${v}°${alertUnit.value}`;
  toast("Alert saved", "info");
});

clearAlertBtn.addEventListener("click", () => {
  alertSpec = null;
  localStorage.removeItem("alert");
  alertInfo.classList.add("hidden");
  alertInfo.textContent = "";
  toast("Alert cleared", "info");
});

clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem("recent");
  recentDiv.innerHTML = "";
  toast("History cleared", "info");
});

recentDiv.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    fetchWeather(e.target.dataset.lat, e.target.dataset.lon, e.target.textContent);
  }
});

// FUNCTIONS
function toast(msg, type = "info", time = 4000) {
  const div = document.createElement("div");
  div.className = `toast p-3 rounded border mb-2 ${type === "error"
    ? "bg-red-50 border-red-200 text-red-700"
    : type === "warn"
    ? "bg-amber-50 border-amber-200 text-amber-700"
    : "bg-white/90 border-slate-200 text-slate-800"}`;
  div.innerHTML = `<div class="flex justify-between items-center">${msg}<button class="ml-3 text-sm">✕</button></div>`;
  alertContainer.prepend(div);
  div.querySelector("button").onclick = () => div.remove();
  setTimeout(() => div.remove(), time);
}

function getRecent() {
  return JSON.parse(localStorage.getItem("recent") || "[]");
}
function saveRecent(g) {
  let arr = getRecent();
  arr = arr.filter(x => x.name !== g.name);
  arr.unshift(g);
  if (arr.length > 6) arr.pop();
  localStorage.setItem("recent", JSON.stringify(arr));
  renderRecent();
}
function renderRecent() {
  const arr = getRecent();
  recentDiv.innerHTML = arr.length
    ? arr.map(x => `<button class="block w-full text-left p-1 hover:bg-slate-100" data-lat="${x.latitude}" data-lon="${x.longitude}">${x.name}</button>`).join("")
    : `<p class="text-slate-500">No recent cities</p>`;
}

async function fetchWeather(lat, lon, name) {
  toast("Fetching weather...", "info", 2000);
  const url = `${API_WEATHER}?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max,precipitation_sum&forecast_days=5&timezone=auto`;
  const res = await fetch(url);
  const data = await res.json();
  renderWeather(data, name);
}

function renderWeather(data, name) {
  const current = data.current_weather;
  const daily = data.daily;

  const map = mapCode(current.weathercode);
  document.getElementById("app-body").className = `theme-${map.theme}`;
  document.getElementById("location-name").textContent = name;
  document.getElementById("weather-desc").textContent = map.desc;
  document.getElementById("current-icon").innerHTML = map.icon;
  const tC = current.temperature;
  const temp = unit === "C" ? tC : (tC * 9/5 + 32).toFixed(1);
  document.getElementById("current-temp").textContent = `${temp}°${unit}`;
  document.getElementById("wind").textContent = `Wind: ${current.windspeed} m/s`;
  document.getElementById("humidity").textContent = `${daily.precipitation_sum[0]}%`;
  document.getElementById("minmax").textContent = `${daily.temperature_2m_min[0]}° / ${daily.temperature_2m_max[0]}°`;
  document.getElementById("local-time").textContent = new Date(current.time).toLocaleTimeString();

  // Forecast
  forecastDiv.innerHTML = "";
  daily.time.forEach((d, i) => {
    const fMap = mapCode(daily.weathercode[i]);
    const min = daily.temperature_2m_min[i];
    const max = daily.temperature_2m_max[i];
    const card = `<div class="flex justify-between items-center bg-slate-50 rounded p-2">
      <div class="flex items-center gap-2">${fMap.icon}<div>
      <div class="font-medium">${new Date(d).toLocaleDateString(undefined, { weekday: "short" })}</div>
      <div class="text-xs text-slate-500">${fMap.desc}</div></div></div>
      <div>${max}°/${min}°</div></div>`;
    forecastDiv.insertAdjacentHTML("beforeend", card);
  });

  checkAlert(current.temperature);
}

function mapCode(code) {
  const c = Number(code);
  if (c === 0) return { desc: "Clear", theme: "sunny", icon: "☀️" };
  if (c <= 2) return { desc: "Mostly clear", theme: "sunny", icon: "🌤️" };
  if (c === 3) return { desc: "Cloudy", theme: "cloudy", icon: "☁️" };
  if (c <= 67) return { desc: "Rain", theme: "rainy", icon: "🌧️" };
  if (c <= 77) return { desc: "Snow", theme: "snow", icon: "❄️" };
  if (c >= 95) return { desc: "Thunder", theme: "storm", icon: "⛈️" };
  return { desc: "—", theme: "cloudy", icon: "🌥️" };
}

function checkAlert(tempC) {
  if (!alertSpec) return;
  const cur = alertSpec.unit === "C" ? tempC : (tempC * 9/5 + 32);
  if (cur >= alertSpec.value)
    toast(`🔥 ${cur.toFixed(1)}°${alertSpec.unit} exceeds your alert!`, "warn", 7000);
}
