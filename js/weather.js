// weather.js
const city = localStorage.getItem("lastCity");
const infoDiv = document.getElementById("weatherInfo");
const bgDiv = document.getElementById("background");

async function getCoordinates(city) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    city
  )}`;
  const geoRes = await fetch(geoUrl);
  if (!geoRes.ok) throw new Error("Error fetching location data");
  const geoData = await geoRes.json();
  if (!geoData.results) throw new Error("City not found");
  const { latitude, longitude } = geoData.results[0];
  return { latitude, longitude };
}

async function getWeather(latitude, longitude) {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
  const weatherRes = await fetch(weatherUrl);
  if (!weatherRes.ok) throw new Error("Error fetching weather data");
  return await weatherRes.json();
}

async function setBackground(city) {
  const unsplashKey = "REPLACE_WITH_YOUR_UNSPLASH_ACCESS_KEY";
  try {
    const imgRes = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
        city
      )}+weather&client_id=${unsplashKey}`
    );
    if (!imgRes.ok) throw new Error("Error fetching background image");
    const imgData = await imgRes.json();
    bgDiv.style.backgroundImage = `url(${imgData.urls.full})`;
  } catch (err) {
    console.warn("Failed to load Unsplash image", err);
  }
}

function displayWeather(data, city) {
  const { temperature, windspeed, weathercode } = data.current_weather;
  const weatherDescription = getWeatherDescription(weathercode);
  const html = `
    <h2>${city}</h2>
    <p><strong>${weatherDescription}</strong></p>
    <p>🌡 Temp: ${temperature}°C</p>
    <p>💨 Wind: ${windspeed} m/s</p>
  `;
  infoDiv.innerHTML = html;
}

function getWeatherDescription(code) {
  const weatherCodes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return weatherCodes[code] || "Unknown weather";
}

async function loadWeather() {
  if (!city) {
    infoDiv.innerHTML =
      "<p>No city found. Please go back and search again.</p>";
    return;
  }
  try {
    const { latitude, longitude } = await getCoordinates(city);
    const weatherData = await getWeather(latitude, longitude);
    displayWeather(weatherData, city);
    setBackground(city);
  } catch (err) {
    infoDiv.innerHTML = `<p>Error: ${err.message}</p>`;
  }
}

loadWeather();
