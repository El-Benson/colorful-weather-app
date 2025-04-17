import {
  getCityCoordinates,
  getWeather,
  getWeatherDescription,
  getBackgroundImage, // ✅ Make sure this is included
} from "./weather-api.js";

const form = document.querySelector("form");
const input = document.querySelector("input");
const infoDiv = document.querySelector(".info");
const body = document.body;
const toggleBtn = document.getElementById("toggleForecast");
const darkModeBtn = document.getElementById("darkModeBtn");

// Load from cache if available
const cached = localStorage.getItem("weatherData");
if (cached) {
  const parsed = JSON.parse(cached);
  displayWeather(parsed, parsed.cityName);
  displayHourlyForecast(parsed);
  updateBackgroundImage(parsed.cityName); // ✅ Show image from cached city
}

// Handle form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = input.value.trim();
  if (!city) return;

  try {
    const { lat, lon } = await getCityCoordinates(city);
    const weatherData = await getWeather(lat, lon);
    weatherData.cityName = city;

    localStorage.setItem("weatherData", JSON.stringify(weatherData));

    displayWeather(weatherData, city);
    displayHourlyForecast(weatherData);
    await updateBackgroundImage(city); // ✅ Background image is updated here
  } catch (error) {
    infoDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
  }
});

function displayWeather(data, city) {
  const { temperature, windspeed, weathercode } = data.current_weather;
  const desc = getWeatherDescription(weathercode);

  infoDiv.innerHTML = `
    <h2>Weather in ${city}</h2>
    <p>${desc}</p>
    <p>🌡 ${temperature}°C</p>
    <p>💨 ${windspeed} m/s</p>
  `;
}

function displayHourlyForecast(data) {
  // Clear old forecast if it exists
  const old = document.querySelector(".weather-details");
  if (old) old.remove();

  const hourlyContainer = document.createElement("div");
  hourlyContainer.className = "weather-details";

  const hours = data.hourly.time.slice(0, 24);
  const temps = data.hourly.temperature_2m;
  const winds = data.hourly.windspeed_10m;
  const codes = data.hourly.weathercode;

  hours.forEach((time, i) => {
    const card = document.createElement("div");
    card.className = "weather-card";

    const hour = new Date(time).getHours();
    const desc = getWeatherDescription(codes[i]);

    card.innerHTML = `
      <h3>${hour}:00</h3>
      <p>${desc}</p>
      <p>🌡 ${temps[i]}°C</p>
      <p>💨 ${winds[i]} m/s</p>
    `;

    hourlyContainer.appendChild(card);
  });

  infoDiv.appendChild(hourlyContainer);
}

// Forecast toggle
toggleBtn.addEventListener("click", () => {
  const forecast = document.querySelector(".weather-details");
  if (forecast) {
    forecast.classList.toggle("hidden");
    toggleBtn.textContent = forecast.classList.contains("hidden")
      ? "Show Forecast"
      : "Hide Forecast";
  }
});

// Dark mode toggle
darkModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// ✅ Clean, non-duplicated background update function
async function updateBackgroundImage(city) {
  try {
    const imageUrl = await getBackgroundImage(city);
    body.style.backgroundImage = `url('${imageUrl}')`;
  } catch (err) {
    console.error("Background update failed:", err.message);
    body.style.backgroundImage = "";
  }
}
