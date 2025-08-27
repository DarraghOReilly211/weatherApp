// --- Using Open-Meteo (no API key required) ---
import { cities } from "./cities.js";
console.log("Loaded cities:", cities);

const form = document.querySelector(".top-banner form");
const input = form?.querySelector("input");
const heading = document.querySelector(".heading");
const container = document.querySelector(".container");
const listContainer = document.querySelector(".list-container");
const searchContent = document.querySelector(".search-content");

if (!form || !input || !heading || !container || !listContainer || !searchContent) {
  console.warn("One or more expected DOM elements are missing. Check your HTML structure.");
}

async function geocodeCity(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    city
  )}&count=1&language=en&format=json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status} ${res.statusText}`);
  const data = await res.json();

  if (!data.results || data.results.length === 0) {
    throw new Error(`No results for "${city}"`);
  }

  const r = data.results[0];
  return {
    latitude: r.latitude,
    longitude: r.longitude,
    name: r.name,
    country: r.country,
    admin1: r.admin1 || "",
  };
}

// Fetch current weather for coordinates -> { tempC, weatherCode, timeISO }
async function fetchCurrentWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=celsius&wind_speed_unit=kmh&precipitation_unit=mm`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Forecast failed: ${res.status} ${res.statusText}`);
  const data = await res.json();

  if (!data.current) throw new Error("No current weather field in response");

  return {
    tempC: data.current.temperature_2m,
    weatherCode: data.current.weather_code,
    timeISO: data.current.time,
  };
}

// Map Open-Meteo weather_code -> emoji + label + theme class key
function mapWeatherCodeToIconAndText(code) {
  // Reference: https://open-meteo.com/en/docs#api_form
  if (code === 0) return { icon: "☀️", text: "Clear sky", theme: "sunny" };
  if ([1, 2, 3].includes(code))
    return { icon: "⛅", text: "Mainly clear / Partly cloudy / Overcast", theme: "cloudy" };
  if ([45, 48].includes(code)) return { icon: "🌫️", text: "Fog / Depositing rime fog", theme: "cloudy" };
  if ([51, 53, 55].includes(code)) return { icon: "🌦️", text: "Drizzle", theme: "rainy" };
  if ([56, 57].includes(code)) return { icon: "🌦️", text: "Freezing drizzle", theme: "rainy" };
  if ([61, 63, 65].includes(code)) return { icon: "🌧️", text: "Rain", theme: "rainy" };
  if ([66, 67].includes(code)) return { icon: "🌧️", text: "Freezing rain", theme: "rainy" };
  if ([71, 73, 75].includes(code)) return { icon: "❄️", text: "Snowfall", theme: "snowy" };
  if ([77].includes(code)) return { icon: "🌨️", text: "Snow grains", theme: "snowy" };
  if ([80, 81, 82].includes(code)) return { icon: "🌧️", text: "Rain showers", theme: "rainy" };
  if ([85, 86].includes(code)) return { icon: "❄️", text: "Snow showers", theme: "snowy" };
  if ([95].includes(code)) return { icon: "⛈️", text: "Thunderstorm", theme: "stormy" };
  if ([96, 99].includes(code)) return { icon: "⛈️", text: "Thunderstorm with hail", theme: "stormy" };
  return { icon: "🌤️", text: "Weather", theme: "default" };
}

function renderSingleCity(containerEl, displayName, tempC, weatherCode) {
  const { icon, text, theme } = mapWeatherCodeToIconAndText(weatherCode);

  containerEl.innerHTML = `
    <div class="weather-card">
      <h2>Weather for ${displayName}</h2>
      <div class="weather-inner theme-${theme}">
        <p class="icon">${icon}</p>
        <p>Temperature: ${Math.round(tempC)}°C</p>
        <p>Weather: ${text}</p>
      </div>
    </div>
  `;
}

function buildWeatherCard(displayName, tempC, weatherCode) {
  const { icon, text, theme } = mapWeatherCodeToIconAndText(weatherCode);

  return `
    <div class="weather-card">
      <h2>Weather for ${displayName}</h2>
      <div class="weather-inner theme-${theme}">
        <p class="icon">${icon}</p>
        <p>Temperature: ${Math.round(tempC)}°C</p>
        <p>Weather: ${text}</p>
      </div>
    </div>
  `;
}

async function getCityWeatherDisplay(city) {
  const geo = await geocodeCity(city);
  const displayName = [geo.name, geo.admin1, geo.country].filter(Boolean).join(", ");
  const current = await fetchCurrentWeather(geo.latitude, geo.longitude);
  return { displayName, ...current };
}

// Handle search submit
form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const city = input.value.trim();
  if (!city) return;

  try {
    const { displayName, tempC, weatherCode } = await getCityWeatherDisplay(city);
    if (heading) heading.textContent = `Weather for ${displayName}`;
    if (searchContent) renderSingleCity(searchContent, displayName, tempC, weatherCode);
    if (listContainer) listContainer.innerHTML = "";
  } catch (err) {
    console.error(err);
    if (searchContent) {
      searchContent.innerHTML = `
        <div class="weather-card">
          <div class="weather-inner theme-default">
            <p>Couldn't fetch weather for "${city}". ${err.message}</p>
          </div>
        </div>
      `;
    }
  } finally {
    input.value = "";
  }
});

// Auto-render preset cities on load
(async function renderCityList() {
  if (!Array.isArray(cities) || cities.length === 0 || !listContainer) return;

  try {
    const results = await Promise.allSettled(
      cities.map((c) => getCityWeatherDisplay(String(c).trim()))
    );

    let html = "";
    for (const r of results) {
      if (r.status === "fulfilled") {
        const { displayName, tempC, weatherCode } = r.value;
        html += buildWeatherCard(displayName, tempC, weatherCode);
      } else {
        console.warn("City failed to load:", r.reason);
      }
    }
    listContainer.innerHTML =
      html ||
      `
      <div class="weather-card">
        <div class="weather-inner theme-default">
          <p>Couldn’t load preset cities. Check console for details.</p>
        </div>
      </div>`;
  } catch (err) {
    console.error("Failed to render city list:", err);
    listContainer.innerHTML = `
      <div class="weather-card">
        <div class="weather-inner theme-default">
          <p>Unexpected error while rendering the city list.</p>
          <p><small>${String(err.message || err)}</small></p>
        </div>
      </div>`;
  }
})();
