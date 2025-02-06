const API_KEY = '5ae2e3f221c38a28845f05b62ef3b52b63cee12bf745621e2455c25a';
const BASE_URL = 'https://api.opentripmap.com/0.1/en/places';

async function getActivities(country, isForChildren = false) {
    try {
        const geoResponse = await fetch(`${BASE_URL}/geoname?name=${country}&apikey=${API_KEY}`);
        const geoData = await geoResponse.json();
        
        if (!geoData.lat || !geoData.lon) {
            throw new Error("Pays non trouvé");
        }

        const radius = 1000000; // 1000 km
        const limit = 50;
        const activitiesResponse = await fetch(`${BASE_URL}/radius?radius=${radius}&lon=${geoData.lon}&lat=${geoData.lat}&limit=${limit}&apikey=${API_KEY}`);
        const activitiesData = await activitiesResponse.json();

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

document.getElementById('searchButton').addEventListener('click', async () => {
    const country = document.getElementById('destinationInput').value;
    const activities = await getActivities(country, false); // Change to true if you want activities for children
    displayActivities(activities);
});

function displayActivities(activities) {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = ''; // Clear previous messages

    if (activities.length === 0) {
        chatMessages.innerHTML = '<div class="message bot-message"><p>Aucune activité trouvée.</p></div>';
        return;
    }

    activities.forEach(activity => {
        const activityMessage = `<div class="message bot-message">
                                    <p><strong>Name: ${activity.name}</strong><br>Type: ${activity.type}<br>Coordinates: ${activity.coordinates.join(', ')}</p>
                                 </div>`;
        chatMessages.innerHTML += activityMessage;
    });
}
// Exporter les fonctions pour les utiliser dans script.js
export { getActivities, displayActivities }