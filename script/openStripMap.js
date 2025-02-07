document.getElementById('searchButton').addEventListener('click', () => {
    const userInput = document.getElementById('destinationInput').value;
  
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
    }[type] || "Lieu touristique ";
}


function displayActivities(activities) {
    const chatMessages = document.getElementById('chatMessages');

    const messages = [
        `<div class="message bot-message"><p>🌍 Voici quelques activités intéressantes :</p></div>`,
        ...activities.map(a => `
            <div class="message bot-message">
                <p><strong>📍 ${a.name}</strong></p>
                <p><b>Type :</b> ${a.type}</p>
                <a href="${a.mapLink}" target="_blank">📍 Voir sur Google Maps</a>
            </div>
        `)
    ];

    addMessageWithDelay(chatMessages, messages, 600);
}



function addMessageWithDelay(container, messages, delay = 600) {
    let isUserAtBottom = () => {
        return container.scrollHeight - container.scrollTop <= container.clientHeight + 10;
    };

    messages.forEach((msg, index) => {
        setTimeout(() => {
            const messageElement = document.createElement("div");
            messageElement.innerHTML = msg;
            messageElement.classList.add("message");

            container.appendChild(messageElement);

            // Ne force le scroll en bas que si l'utilisateur est déjà en bas
            if (isUserAtBottom()) {
                container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
            }
        }, index * delay);
    });
}




function suggestQuestions(location) {
    const chatMessages = document.getElementById('chatMessages');
    const messages = [
        `<div class="message bot-message"><p>😕 Je n'ai pas trouvé d'activités à <strong>${location}</strong>, mais tu peux essayer :</p></div>`,
        `<div class="message bot-message"><p>📍 "Quels sont les musées à ${location} ?" 🏛</p></div>`,
        `<div class="message bot-message"><p>🌳 "Quels sont les parcs à ${location} ?" 🌿</p></div>`,
        `<div class="message bot-message"><p>🎡 "Quelles attractions visiter à ${location} ?" 🎢</p></div>`
    ];

    addMessageWithDelay(chatMessages, messages, 600);
}

function suggestGeneralQuestions() {
    const chatMessages = document.getElementById('chatMessages');
    const messages = [
        `<div class="message bot-message"><p>🤔 Je peux t'aider à trouver des activités ! Essaye :</p></div>`,
        `<div class="message bot-message"><p>📍 "Que faire à Paris ?" 🏛</p></div>`,
        `<div class="message bot-message"><p>🌿 "Quels sont les lieux touristiques en France ?" 📍</p></div>`,
        `<div class="message bot-message"><p>🎢 "Quels sont les meilleurs parcs à visiter ?" 🎡</p></div>`
    ];

    addMessageWithDelay(chatMessages, messages, 600);
}
