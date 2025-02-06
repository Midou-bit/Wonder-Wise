// openTripMap.js

const API_KEY = '5ae2e3f221c38a28845f05b62ef3b52b63cee12bf745621e2455c25a';
const BASE_URL = 'https://api.opentripmap.com/0.1/en/places';

async function getActivities(country, isForChildren = false) {
  try {
    // Récupérer les coordonnées du pays
    const geoResponse = await fetch(`${BASE_URL}/geoname?name=${country}&apikey=${API_KEY}`);
    const geoData = await geoResponse.json();
    
    if (!geoData.lat || !geoData.lon) {
      throw new Error("Pays non trouvé");
    }

    // Récupérer les activités autour de ces coordonnées
    const radius = 1000000; // 1000 km
    const limit = 50; // Nombre d'activités à récupérer
    const activitiesResponse = await fetch(`${BASE_URL}/radius?radius=${radius}&lon=${geoData.lon}&lat=${geoData.lat}&limit=${limit}&apikey=${API_KEY}`);
    const activitiesData = await activitiesResponse.json();

    // Filtrer les activités pour les enfants si nécessaire
    const filteredActivities = isForChildren 
    ? activitiesData.features.filter(activity => 
        activity.properties.kinds.includes('amusements') || 
        activity.properties.kinds.includes('museums') ||
        activity.properties.kinds.includes('zoos') ||
        activity.properties.kinds.includes('beaches') ||
        activity.properties.kinds.includes('aquariums') ||
        activity.properties.kinds.includes('water_parks') ||
        activity.properties.kinds.includes('theme_parks') ||
        activity.properties.kinds.includes('playgrounds') ||
        activity.properties.kinds.includes('natural_attractions')
      )
    : activitiesData.features;
      
    return filteredActivities.map(activity => ({
      name: activity.properties.name,
      type: activity.properties.kinds,
      coordinates: activity.geometry.coordinates
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des activités:", error);
    return [];
  }
}

function displayActivities(activities) {
    const chatMessages = document.querySelector('.chat-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'bot-message');
    
    if (activities.length === 0) {
      messageElement.innerHTML = "Oh non ! 😔 Je n'ai pas trouvé d'activités pour cette destination. Mais ne vous découragez pas, essayons une autre recherche ensemble ! Que diriez-vous d'explorer un autre endroit magique ? 🌟";
    } else {
      const activitiesList = activities.map(activity => `<li>🎉 ${activity.name} (${activity.type})</li>`).join('');
      messageElement.innerHTML = `
        <p>Youhou ! 🎊 J'ai trouvé des activités incroyables pour vous !</p>
        <p>Préparez-vous à vivre des aventures extraordinaires :</p>
        <ul>${activitiesList}</ul>
        <p>N'hésitez pas à me demander plus de détails sur ces activités passionnantes ! 😊</p>
      `;
    }
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }  

// Exporter les fonctions pour les utiliser dans script.js
export { getActivities, displayActivities }
