function getLocation() {
    if ("geolocation" in navigator) {
        if (confirm("Voulez-vous autoriser l'accès à votre position ?")) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log("✅ Position détectée !");
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    const accuracy = position.coords.accuracy;

                    // Appel à l'API de géocodage inverse de Nominatim
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`)
                        .then(response => response.json())
                        .then(data => {
                            const country = data.address.country || "Non disponible";
                            document.getElementById("output").innerHTML = 
                                `🌍 Latitude : ${latitude}<br>
                                 📍 Longitude : ${longitude}<br>
                                 📏 Précision : ${accuracy} mètres<br>
                                 🏳️ Pays : ${country}`;
                        })
                        .catch(error => {
                            console.error("❌ Erreur lors de la récupération du pays :", error);
                            document.getElementById("output").innerHTML = "❌ Erreur lors de la récupération du pays.";
                        });
                },
                (error) => {
                    let message = "";
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            message = "❌ L'utilisateur a refusé l'accès à la géolocalisation.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            message = "❌ La position n'est pas disponible.";
                            break;
                        case error.TIMEOUT:
                            message = "❌ La demande de localisation a expiré.";
                            break;
                        default:
                            message = "❌ Une erreur inconnue est survenue.";
                            break;
                    }
                    console.error("❌ Erreur de géolocalisation :", error.message);
                    document.getElementById("output").innerHTML = message;
                }
            );
        } else {
            document.getElementById("output").innerHTML = "❌ Vous avez refusé l'accès à la position.";
        }
    } else {
        document.getElementById("output").innerHTML = "❌ Géolocalisation non supportée par ce navigateur.";
    }
}