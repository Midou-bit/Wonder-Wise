const express = require("express");
const axios = require("axios");

const app = express();  // ✅ Création de l'instance Express
const PORT = 3000;

// Route API pour récupérer les infos d'un pays
app.get("/pays/:nom", async (req, res) => {
    const pays = req.params.nom;
    const apiUrl = `https://restcountries.com/v3.1/name/${pays}?fullText=true`;

    try {
        const response = await axios.get(apiUrl);
        
        if (!response.data || response.data.length === 0) {
            return res.status(404).json({ message: "Pays non trouvé" });
        }

        const paysData = response.data[0];

        const result = {
            nom: paysData.translations.fra.common || "Non disponible",
            capitale: paysData.capital ? paysData.capital[0] : "Non disponible",
            drapeau: paysData.flags.svg || "Non disponible",
            langue: paysData.languages ? Object.values(paysData.languages).join(", ") : "Non disponible",
            monnaie: paysData.currencies ? Object.values(paysData.currencies)[0].name : "Non disponible",
            continent: paysData.continents ? paysData.continents[0] : "Non disponible",
            population: paysData.population ? paysData.population.toLocaleString() : "Non disponible",
            superficie: paysData.area ? `${paysData.area.toLocaleString()} km²` : "Non disponible",
            code_iso: paysData.cca2 || paysData.cca3 || "Non disponible",
            fuseau_horaire: paysData.timezones ? paysData.timezones[0] : "Non disponible",
            latitude: paysData.latlng ? paysData.latlng[0] : "Non disponible",
            longitude: paysData.latlng ? paysData.latlng[1] : "Non disponible"
        };
        

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des données." });
    }
});

// ✅ Démarrer le serveur Express
app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
