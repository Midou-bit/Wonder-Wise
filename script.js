// script.js
const apiKey = '48685015-6081aca7eb1cbdbbed2ea6620';
const slideshow = document.getElementById('background-slideshow');
let currentImageIndex = 0;

async function loadImages() {
    const response = await fetch(`https://pixabay.com/api/?key=${apiKey}&q=landscape&image_type=photo&per_page=10`);
    const data = await response.json();
    return data.hits.map(img => img.largeImageURL);
}

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
});
