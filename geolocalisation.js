function getLocation() {
    if ("geolocation" in navigator) {
        // Afficher une boîte de dialogue pour informer l'utilisateur
        if (confirm("Voulez-vous autoriser l'accès à votre position ?")) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log("✅ Position détectée !");
                    document.getElementById("output").innerHTML = 
                        `🌍 Latitude : ${position.coords.latitude}<br>
                         📍 Longitude : ${position.coords.longitude}<br>
                         📏 Précision : ${position.coords.accuracy} mètres`;
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
