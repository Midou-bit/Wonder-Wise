const API_KEY = "4007c679fc3785d4c42214fc128c8f0a"; 

async function getWeatherByLocation() {
    const location = document.getElementById("weather-input").value.trim();
    if (!location) {
        alert("❌ Veuillez entrer un pays ou une ville !");
        return;
    }

    document.getElementById("weatherResult").innerHTML = "⏳ Chargement...";

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric&lang=fr`);
        const data = await response.json();

        if (data.cod === 200) {
            document.getElementById("weatherResult").innerHTML = `
            <br>
                🌡️ Température : ${data.main.temp}°C<br>
                🌤️ Météo : ${data.weather[0].description}<br>
                💨 Vent : ${data.wind.speed} m/s<br>
                🏙️ Ville ou Pays : ${data.name}, ${data.sys.country}`;
        } else {
            document.getElementById("weatherResult").innerHTML = "❌ Localisation introuvable.";
        }
    } catch (error) {
        console.error("❌ Erreur lors de la récupération de la météo :", error);
        document.getElementById("weatherResult").innerHTML = "❌ Une erreur est survenue.";
    }
}

// Assurez-vous d'ajouter un écouteur d'événements pour le bouton de soumission
document.getElementById("weather-submit").addEventListener("click", getWeatherByLocation);