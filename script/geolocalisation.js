function getLocation() {

    if ("geolocation" in navigator) {

        if (confirm("Voulez-vous autoriser l'accès à votre position ?")) {

            navigator.geolocation.getCurrentPosition(

                (position) => {

                    console.log("✅ Position détectée !");
                    
                    const latitude = position.coords.latitude;
                    Logger.info("✅ Position détectée !"); // Log ajouté ici

                    const longitude = position.coords.longitude;

                    const accuracy = position.coords.accuracy;

                    // Appel à l'API de géocodage inverse de Nominatim
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`)

                        .then(response => response.json())

                        .then(data => {

                            const country = data.address.country || "Non disponible";
                            Logger.info(`📍 Pays détecté : ${data.address.country}`); // Log ajouté ici

                            document.getElementById("output").innerHTML = 
                                `🌍 Latitude : ${latitude}<br>
                                 📍 Longitude : ${longitude}<br>
                                 📏 Précision : ${accuracy} mètres<br>
                                 🏳️ Pays : ${country}`;

                        })

                        .catch(error => {

                            Logger.error("❌ Erreur lors de la récupération du pays :" + error); // Log ajouté ici
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
                    Logger.error("❌ Erreur de géolocalisation :" + error.message); // Log ajouté ici

                    document.getElementById("output").innerHTML = message;

                }

            );

        } else {

            document.getElementById("output").innerHTML = "❌ Vous avez refusé l'accès à la position.";
            Logger.warn("❌ L'utilisateur a refusé l'accès à la position."); // Log ajouté ici

        }

    } else {

        document.getElementById("output").innerHTML = "❌ Géolocalisation non supportée par ce navigateur.";
        Logger.error("❌ Géolocalisation non supportée par ce navigateur."); // Log ajouté ici

    }

}

Logger.info("Le script geolocalisation est chargé et prêt à l'emploi."); // Log ajouté ici
