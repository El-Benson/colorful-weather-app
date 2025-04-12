/* home.js */
const form = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const loader = document.getElementById("loader");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    localStorage.setItem("lastCity", city);
    loader.classList.remove("hidden");
    setTimeout(() => {
      window.location.href = "weather.html";
    }, 1000);
  }
});
