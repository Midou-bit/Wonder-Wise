const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Utiliser cors pour toutes les routes
app.use(cors()); 

// Fonction pour supprimer les accents (ex: "Algérie" devient "Algerie")
function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Charger la liste complète des pays au démarrage du serveur
let allCountries = [];

async function loadCountries() {
    try {
        const response = await axios.get("https://restcountries.com/v3.1/all");
        allCountries = response.data;
        console.log("✅ Liste des pays chargée !");
    } catch (error) {
        console.error("❌ Erreur lors du chargement des pays :", error);
    }
}

// Route pour récupérer les infos d'un pays
app.get("/pays/:nom", async (req, res) => {
    let paysCherche = removeAccents(req.params.nom.toLowerCase()); // Supprime les accents et met en minuscule

    // Chercher le pays correspondant dans la liste (sans accents)
    const paysData = allCountries.find(
        (p) => removeAccents(p.translations?.fra?.common.toLowerCase()) === paysCherche
    );

    if (!paysData) {
        return res.status(404).json({ message: "Pays non trouvé" });
    }

    // Construire la réponse avec les données en français
    const result = {
        nom: paysData.translations?.fra?.common || "Non disponible",
        nom_officiel: paysData.translations?.fra?.official || "Non disponible",
        capitale: paysData.capital ? paysData.capital[0] : "Non disponible",
        drapeau: paysData.flags?.svg || "Non disponible",
        langue: paysData.languages ? Object.values(paysData.languages).join(", ") : "Non disponible",
        monnaie: paysData.currencies ? Object.values(paysData.currencies)[0].name : "Non disponible",
        continent: paysData.continents ? paysData.continents[0] : "Non disponible",
        population: paysData.population ? paysData.population.toLocaleString() : "Non disponible",
        superficie: paysData.area ? `${paysData.area.toLocaleString()} km²` : "Non disponible",
        code_iso: paysData.cca2 || paysData.cca3 || "Non disponible",
        fuseau_horaire: paysData.timezones ? paysData.timezones[0] : "Non disponible",
        latitude: paysData.latlng ? paysData.latlng[0] : "Non disponible",
        longitude: paysData.latlng ? paysData.latlng[1] : "Non disponible",
        carte_google: paysData.maps?.googleMaps || "Non disponible",
        carte_osm: paysData.maps?.openStreetMaps || "Non disponible"
    };

    res.json(result);
});

// Charger la liste des pays au démarrage
loadCountries();

app.listen(PORT, () => {
    console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
