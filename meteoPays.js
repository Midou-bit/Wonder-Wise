const API_KEY = "4007c679fc3785d4c42214fc128c8f0a"; 

async function getWeatherByCity() {
    const city = document.getElementById("cityInput").value.trim();
    if (!city) {
        alert("❌ Veuillez entrer une ville !");
        return;
    }

    document.getElementById("weatherResult").innerHTML = "⏳ Chargement...";

    try {
        
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=fr`);
        const data = await response.json();

        if (data.cod === 200) {
            document.getElementById("weatherResult").innerHTML = `
                🌡️ Température : ${data.main.temp}°C<br>
                🌤️ Météo : ${data.weather[0].description}<br>
                💨 Vent : ${data.wind.speed} m/s<br>
                🏙️ Ville : ${data.name}, ${data.sys.country}`;
        } else {
            document.getElementById("weatherResult").innerHTML = "❌ Ville introuvable.";
        }
    } catch (error) {
        console.error("❌ Erreur lors de la récupération de la météo :", error);
        document.getElementById("weatherResult").innerHTML = "❌ Une erreur est survenue.";
    }
}
