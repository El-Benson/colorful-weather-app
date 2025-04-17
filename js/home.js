import {
  getCityCoordinates,
  getWeather,
  getWeatherDescription,
} from "./weather-api.js";

const form = document.getElementById("searchForm");
const input = document.getElementById("cityInput");
const loader = document.getElementById("loader");
const infoDiv = document.querySelector(".info");
const toggleForecastButton = document.getElementById("toggleForecast");
const darkModeButton = document.getElementById("darkModeBtn");
const forecastSection = document.getElementById("forecastSection");
const forecastDetails = document.getElementById("forecastDetails");

// Loader control
function showLoader() {
  loader.classList.remove("hidden");
}

function hideLoader() {
  loader.classList.add("hidden");
}

// Handle form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = input.value.trim();
  if (!city) return;

  showLoader();

  try {
    const { lat, lon } = await getCityCoordinates(city);
    const weatherData = await getWeather(lat, lon);
    weatherData.cityName = city;
    displayWeather(weatherData, city);
    hideLoader();

    saveCityToLocalStorage(city);
  } catch (error) {
    hideLoader();
    infoDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
  }
});

// Display weather data
function displayWeather(data, city) {
  const { temperature, windspeed, weathercode } = data.current_weather;
  const description = getWeatherDescription(weathercode);

  infoDiv.innerHTML = `
    <h2>Weather in ${city}</h2>
    <p>${description}</p>
    <p>🌡 ${temperature}°C</p>
    <p>💨 ${windspeed} m/s</p>
  `;

  if (data.hourly) {
    renderHourlyForecast(data.hourly);
  }
}

// Render hourly forecast cards
function renderHourlyForecast(hourlyData) {
  forecastDetails.innerHTML = "";

  const hoursToShow = 12;
  for (let i = 0; i < hoursToShow; i++) {
    const time = new Date(hourlyData.time[i]).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const temp = hourlyData.temperature_2m[i];
    const wind = hourlyData.windspeed_10m[i];
    const code = hourlyData.weathercode[i];

    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <h4>${time}</h4>
      <p>🌡️ ${temp}°C</p>
      <p>💨 ${wind} km/h</p>
      <p>☁️ Code: ${code}</p>
    `;
    forecastDetails.appendChild(card);
  }
}

// Toggle forecast section & save state
toggleForecastButton.addEventListener("click", () => {
  const isVisible = !forecastSection.classList.contains("hidden");
  forecastSection.classList.toggle("hidden");
  toggleForecastButton.textContent = isVisible
    ? "Show Forecast"
    : "Hide Forecast";

  saveForecastVisibility(!forecastSection.classList.contains("hidden"));
});

// Toggle dark mode & save state
darkModeButton.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-mode");
  saveDarkModeToLocalStorage(isDark);
});

// Save preferences to localStorage
function saveCityToLocalStorage(cityName) {
  localStorage.setItem("lastCity", cityName);
}

function saveDarkModeToLocalStorage(isDarkMode) {
  localStorage.setItem("darkMode", isDarkMode);
}

function saveForecastVisibility(isVisible) {
  localStorage.setItem("forecastVisible", isVisible);
}

// Restore preferences on page load
window.addEventListener("DOMContentLoaded", async () => {
  const darkMode = localStorage.getItem("darkMode") === "true";
  if (darkMode) document.body.classList.add("dark-mode");

  const forecastVisible = localStorage.getItem("forecastVisible") === "true";
  if (!forecastVisible) {
    forecastSection.classList.add("hidden");
    toggleForecastButton.textContent = "Show Forecast";
  } else {
    forecastSection.classList.remove("hidden");
    toggleForecastButton.textContent = "Hide Forecast";
  }

  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    input.value = lastCity;
    showLoader();
    try {
      const { lat, lon } = await getCityCoordinates(lastCity);
      const weatherData = await getWeather(lat, lon);
      displayWeather(weatherData, lastCity);
    } catch (err) {
      infoDiv.innerHTML = `<p class="error">Error loading saved city: ${err.message}</p>`;
    }
    hideLoader();
  }
});
