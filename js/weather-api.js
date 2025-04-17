// Get city coordinates using Open-Meteo Geocoding API
export async function getCityCoordinates(city) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
  );
  if (!res.ok) throw new Error("Failed to fetch coordinates");

  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("City not found");
  }

  // Return first match { latitude, longitude }
  const { latitude: lat, longitude: lon } = data.results[0];
  return { lat, lon };
}

// Get weather data from Open-Meteo API
export async function getWeather(lat, lon) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,windspeed_10m,weathercode&current_weather=true&timezone=auto`
  );
  if (!res.ok) throw new Error("Failed to fetch weather data");

  return await res.json();
}

// Get weather description based on weather code
export function getWeatherDescription(code) {
  const descriptionMap = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Drizzle: Light",
    53: "Drizzle: Moderate",
    55: "Drizzle: Dense",
    56: "Freezing Drizzle: Light",
    57: "Freezing Drizzle: Dense",
    61: "Rain: Slight",
    63: "Rain: Moderate",
    65: "Rain: Heavy",
    66: "Freezing Rain: Light",
    67: "Freezing Rain: Heavy",
    71: "Snow fall: Slight",
    73: "Snow fall: Moderate",
    75: "Snow fall: Heavy",
    77: "Snow grains",
    80: "Rain showers: Slight",
    81: "Rain showers: Moderate",
    82: "Rain showers: Violent",
    85: "Snow showers: Slight",
    86: "Snow showers: Heavy",
    95: "Thunderstorm: Slight or moderate",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return descriptionMap[code] || "Unknown weather";
}
