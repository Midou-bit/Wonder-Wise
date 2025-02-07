// script.js
const apiKey = '48685015-6081aca7eb1cbdbbed2ea6620';
const slideshow = document.getElementById('background-slideshow');
let currentImageIndex = 0;

// Fonction pour charger les images d'arrière-plan
async function loadImages() {
    const response = await fetch(`https://pixabay.com/api/?key=${apiKey}&q=landscape&image_type=photo&per_page=10`);
    const data = await response.json();
    return data.hits.map(img => img.largeImageURL);
}

// Fonction pour démarrer le diaporama d'images en arrière-plan
async function startSlideshow() {
    const imageUrls = await loadImages();
    
    function showNextImage() {
        const img = new Image();
        img.src = imageUrls[currentImageIndex];
        img.onload = () => {
            slideshow.appendChild(img);
            setTimeout(() => {
                img.style.opacity = 1;
                if (slideshow.children.length > 1) {
                    slideshow.removeChild(slideshow.children[0]);
                }
            }, 50);
        };
        currentImageIndex = (currentImageIndex + 1) % imageUrls.length;
    }

    showNextImage();
    setInterval(showNextImage, 10000);
}

document.addEventListener('DOMContentLoaded', () => {
    const chatbotTrigger = document.querySelector('.chatbot-trigger');
    const chatbotInterface = document.querySelector('.chatbot-interface');
    let isOpen = false;

    chatbotTrigger.addEventListener('click', () => {
        isOpen = !isOpen;
        chatbotInterface.classList.toggle('active');
        chatbotTrigger.style.transform = isOpen ? 
            'scale(1.1) rotate(135deg)' : 
            'scale(1) rotate(0deg)';
    });

    document.querySelectorAll('.blob').forEach(blob => {
        blob.style.animationDelay = `${Math.random() * 20}s`;
    });

    startSlideshow();

    // Ajout du message de bienvenue
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = `
        <div class="message bot-message">
            <p>Bonjour ! Je suis WanderWise, votre guide de voyage intelligent. 🌎</p>
        </div>
    `;

    // Nouvelles fonctionnalités pour le bouton météo
    const weatherButton = document.getElementById('weather-button');
    const weatherChatbot = document.getElementById('weather-chatbot');
    const closeButton = weatherChatbot.querySelector('.close-button');
    const weatherMessage = document.getElementById('weather-message');

    const messages = [
        "Envie de soleil ? Quel pays vous fait rêver aujourd'hui ?",
        "Planifiez votre prochaine escapade ! Entrez un pays pour la météo :",
        "La météo à portée de clic ! Quel pays souhaitez-vous explorer ?",
        "Prêt pour l'aventure ? Découvrez la météo de votre prochaine destination :",
        "Où le ciel est-il clément aujourd'hui ? Indiquez un pays pour le savoir :",
        "Explorez le monde, météo en main ! Quel pays vous intéresse ?",
        "Besoin d'évasion ? Vérifiez la météo de votre pays de rêve :"
    ];

    let messageInterval;

    function setRandomMessage() {
        const randomIndex = Math.floor(Math.random() * messages.length);
        weatherMessage.textContent = messages[randomIndex];
    }

    function startMessageCycle() {
        setRandomMessage();
        messageInterval = setInterval(() => {
            weatherMessage.style.animation = 'none';
            weatherMessage.offsetHeight; // Déclenche un reflow
            weatherMessage.style.animation = null;
            setRandomMessage();
        }, 5000);
    }

    function stopMessageCycle() {
        clearInterval(messageInterval);
    }

    // ✅ Ouvrir le chatbot météo
    weatherButton.addEventListener('click', function() {
        weatherChatbot.style.display = 'block';
        startMessageCycle();
    });

    // ✅ Fermer avec le bouton "X"
    closeButton.addEventListener('click', function() {
        weatherChatbot.style.display = 'none';
        stopMessageCycle();
    });

    // ✅ Fermer en cliquant à l'extérieur
    document.addEventListener('click', function(event) {
        if (
            weatherChatbot.style.display === 'block' && // Vérifie si le chatbot météo est ouvert
            !weatherChatbot.contains(event.target) && // Vérifie si le clic n'est pas à l'intérieur
            !weatherButton.contains(event.target) // Vérifie si le clic n'est pas sur le bouton nuage
        ) {
            weatherChatbot.style.display = 'none';
            stopMessageCycle();
        }
    });
});
