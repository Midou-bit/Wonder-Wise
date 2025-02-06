const API_KEY = "bb85921bd3fc41629e97259f175b36f7";
const CITY = "Paris";
const COUNTRY = "FR";
const url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${CITY}&country=${COUNTRY}&key=${API_KEY}`;

async function getWeatherForecast() {
  try {
    const response = await fetch(url);
    const forecastData = await response.json();

    const weatherDiv = document.getElementById("weather");
    weatherDiv.innerHTML = `<h2>Prévisions pour ${CITY}, ${COUNTRY}:</h2>`;
    forecastData.data.forEach((day) => {
      weatherDiv.innerHTML += `<p>Date: ${day.valid_date}, Température: ${day.temp}°C, Description: ${day.weather.description}</p>`;
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données météo:",
      error.message
    );
  }
}

getWeatherForecast();

// Api : https://www.weatherbit.io/api 