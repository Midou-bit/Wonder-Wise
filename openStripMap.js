document.getElementById('searchButton').addEventListener('click', () => {
    const userInput = document.getElementById('destinationInput').value;
    console.log("Message utilisateur reçu :", userInput);
    handleUserMessage(userInput);
});

//a voir si c'est utile
const countryCities = {
    "france": ["Paris", "Lyon", "Marseille", "Bordeaux", "Toulouse", "Nice"],
    "italie": ["Rome", "Milan", "Venise", "Florence"],
    "espagne": ["Madrid", "Barcelone", "Séville"],
    "allemagne": ["Berlin", "Munich", "Hambourg"]
};

const corrections = {
    "paris": "Paris", "lyon": "Lyon", "marseil": "Marseille",
    "bordaux": "Bordeaux", "toulous": "Toulouse", "londres": "Londres",
    "france": "France", "italie": "Italie", "espagne": "Espagne"
};


function handleUserMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML += `<div class="message user-message"><p>${message}</p></div>`;

    let pays = extractLocation(message);
    console.log(pays);
    
    if (pays) {
        if(chatMessages.innerHTML){
            chatMessages.innerHTML = "";
        }
        chatMessages.innerHTML += `<div class="message bot-message"><p>🔍 Je cherche des activités dans la capitale de <strong>${pays}</strong>...</p></div>`;
        getCountryCapital(pays).then(capital => {
            if (capital) {
                getOSMActivities(capital).then(activities => {
                    activities.length > 0 ? displayActivities(activities) : suggestQuestions(capital);
                }).catch(error => {
                    console.error("Erreur API :", error);
                    chatMessages.innerHTML += `<div class="message bot-message"><p>⚠ Erreur, réessaie plus tard.</p></div>`;
                });
            } else {
                chatMessages.innerHTML += `<div class="message bot-message"><p>⚠ La capitale n'a pas été trouvée pour le pays ${pays}.</p></div>`;
            }
        }).catch(error => {
            console.error("Erreur lors de la récupération de la capitale :", error);
            chatMessages.innerHTML += `<div class="message bot-message"><p>⚠ Erreur, réessaie plus tard.</p></div>`;
        });
    } else {
        suggestGeneralQuestions();
    }
}
async function getCountryCapital(country) {
    try {
        const response = await fetch(`http://localhost:3000/pays/${encodeURIComponent(country)}`);
        if (!response.ok) throw new Error('Pays non trouvé');
        const data = await response.json();
        return data.capitale;
    } catch (error) {
        console.error("Erreur lors de la récupération de la capitale :", error);
        return null;
    }
}

function extractLocation(message) {
    let match = message.match(/(?:à|en)\s([a-zA-ZÀ-ÿ\s]+)/i);
    let location = match ? match[1].trim().toLowerCase().replace("en ", "") : null;
    if (location && corrections[location]) location = corrections[location]; // Corrige les fautes
    if (location && countryCities[location]) location = countryCities[location][Math.floor(Math.random() * countryCities[location].length)]; // Prend une ville
    return location;
}

async function getOSMActivities(location) {
    try {
        const geoData = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`).then(res => res.json());
        if (!geoData.length) return [];

        const { lat, lon } = geoData[0];
        const osmData = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(`[out:json];node(around:20000,${lat},${lon})["tourism"];out;`)}`).then(res => res.json());
        
        return osmData.elements?.filter(a => a.tags.name).slice(0, 10).map(a => ({
            name: a.tags.name, type: formatActivityType(a.tags.tourism),
            coordinates: `${a.lat}, ${a.lon}`, mapLink: `https://www.google.com/maps?q=${a.lat},${a.lon}`
        })) || [];
    } catch (error) {
        console.error("Erreur API :", error);
        return [];
    }
}


function formatActivityType(type) {
    return {
        "museum": "Musée 🏛", "theme_park": "Parc à thème 🎢",
        "zoo": "Zoo 🦁", "aquarium": "Aquarium 🐠",
        "gallery": "Galerie d'art 🎨", "park": "Parc 🌳",
        "attraction": "Attraction 🎡", "viewpoint": "Point de vue 🔭",
        "information": "Point info ℹ️"
    }[type] || "Lieu touristique 📍";
}


function displayActivities(activities) {
    const chatMessages = document.getElementById('chatMessages');
    if(chatMessages){
        chatMessages.innerHTML = "";
    }
    chatMessages.innerHTML += `<div class="message bot-message"><p>🌍 Voici des activités :</p></div>` + 
        activities.map(a => `
            <div class="message bot-message" style="background: #e0f7fa; padding: 10px; border-radius: 10px; margin-bottom: 10px; box-shadow: 2px 2px 5px rgba(0,0,0,0.1);">
                <p><strong>📍 ${a.name}</strong></p>
                <p><b>Type :</b> ${a.type}</p>
                <p><b>📍 Coordonnées :</b> ${a.coordinates}</p>
                <p><a href="${a.mapLink}" target="_blank" style="color: blue; text-decoration: underline;">📍 Voir sur Google Maps</a></p>
            </div>`).join("");
}


function suggestQuestions(location) {
    document.getElementById('chatMessages').innerHTML += `
        <div class="message bot-message">
            <p>😕 Je n'ai pas trouvé d'activités à <strong>${location}</strong>, mais tu peux essayer :</p>
            <ul>
                <li>📍 "Quels sont les musées à ${location} ?" 🏛</li>
                <li>🌳 "Quels sont les parcs à ${location} ?" 🌿</li>
                <li>🎡 "Quelles attractions visiter à ${location} ?" 🎢</li>
            </ul>
        </div>`;
}


function suggestGeneralQuestions() {
    if(document.getElementById('chatMessages').innerHTML){
        document.getElementById('chatMessages').innerHTML = "";
    }
    document.getElementById('chatMessages').innerHTML += `
        <div class="message bot-message">
            <p>🤔 Je ne peux répondre qu'aux questions sur les activités touristiques. Essaye :</p>
            <ul>
                <li>📍 "Que faire à Paris ?" 🏛</li>
                <li>🌿 "Quels sont les lieux touristiques en France ?" 📍</li>
                <li>🎢 "Quels sont les meilleurs parcs à visiter ?" 🎡</li>
            </ul>
        </div>`;
}
