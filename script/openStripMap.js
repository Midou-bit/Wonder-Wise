document.getElementById('searchButton').addEventListener('click', () => {
    const userInput = document.getElementById('destinationInput').value;
    console.log("📥 Message utilisateur reçu :", userInput);
    handleUserMessage(userInput);
});

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


function detectIntent(message) {
    if (/que faire|activités|endroits à visiter|lieux touristiques/i.test(message)) {
        return "activités";
    }
    if (/météo|temps|température|climat|pleuvoir/i.test(message)) {
        return "météo";
    }
    if (/où voyager|meilleurs endroits|destinations|où aller/i.test(message)) {
        return "destinations";
    }
    if (/budget|moins cher|coût|prix|combien coûte/i.test(message)) {
        return "budget";
    }
    if (/sécurité|dangereux|us et coutumes|vaccins|culture/i.test(message)) {
        return "culture";
    }
    return "inconnu";
}

function handleUserMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML += `<div class="message user-message"><p>${message}</p></div>`;

    let intent = detectIntent(message);
    let location = extractLocation(message);

    switch (intent) {
        case "météo":
            chatMessages.innerHTML += `<div class="message bot-message"><p>⛅ Je cherche la météo pour <strong>${location || "une destination"}</strong>...</p></div>`;
            break;
        case "destinations":
            chatMessages.innerHTML += `<div class="message bot-message"><p>✈️ Tu veux voyager ? Essaie "Où partir en été ?" ou "Quels pays visiter en hiver ?"</p></div>`;
            break;
        case "budget":
            chatMessages.innerHTML += `<div class="message bot-message"><p>💰 Pour les budgets réduits, essaie "Où voyager pas cher ?" ou "Quel est le pays le moins cher pour des vacances ?"</p></div>`;
            break;
        case "culture":
            chatMessages.innerHTML += `<div class="message bot-message"><p>🎭 Chaque pays a sa culture unique ! Demande-moi : "Quels sont les us et coutumes au Japon ?"</p></div>`;
            break;
        default:
            if (location) {
                if(chatMessages.innerHTML){
                    chatMessages.innerHTML = "";
                }
                chatMessages.innerHTML += `<div class="message bot-message"><p>🔍 Je cherche des activités à <strong>${location}</strong>...</p></div>`;
                getOSMActivities(location).then(activities => {
                    activities.length > 0 ? displayActivities(activities) : suggestQuestions(location);
                }).catch(error => {
                    console.error("Erreur API :", error);
                    chatMessages.innerHTML += `<div class="message bot-message"><p>⚠ Erreur, réessaie plus tard.</p></div>`;
                });
            } else {
                suggestGeneralQuestions();
            }
    }
}

function extractLocation(message) {
    let match = message.match(/(?:à|en|au|aux)\s([a-zA-ZÀ-ÿ\s]+)/i);
    let location = match ? match[1].trim().toLowerCase().replace("en ", "") : null;
    if (location && corrections[location]) location = corrections[location];
    if (location && countryCities[location]) location = countryCities[location][Math.floor(Math.random() * countryCities[location].length)];
    return location;
}

async function getOSMActivities(location) {
    try {
        const geoData = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`).then(res => res.json());
        if (!geoData.length) return [];

        const { lat, lon } = geoData[0];
        console.log(`🌍 Coordonnées obtenues pour ${location} : ${lat}, ${lon}`);

        const osmData = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(`[out:json];node(around:20000,${lat},${lon})["tourism"];out;`)}`).then(res => res.json());
        
        return osmData.elements?.filter(a => a.tags.name).slice(0, 10).map(a => ({
            name: a.tags.name, type: formatActivityType(a.tags.tourism),
            coordinates: `${a.lat}, ${a.lon}`, mapLink: `https://www.google.com/maps?q=${a.lat},${a.lon}`
        })) || [];
    } catch (error) {
        console.error("❌ Erreur API OpenStreetMap :", error);
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
