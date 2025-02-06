// script.js
const apiKey = '7nZykbNhCkkTYJGLZLWPYFZVrOM4gdQBm5hb3Fpar2U';
const slideshow = document.getElementById('background-slideshow');
let currentImageIndex = 0;

async function loadImages() {
    const response = await fetch(`https://api.unsplash.com/photos/random?count=10&query=landscape,travel&client_id=${apiKey}`);
    const images = await response.json();
    return images.map(img => img.urls.regular);
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
    setInterval(showNextImage, 10000); // Change d'image toutes les 10 secondes
}

document.addEventListener('DOMContentLoaded', () => {
    const chatbotTrigger = document.querySelector('.chatbot-trigger');
    const chatbotInterface = document.querySelector('.chatbot-interface');
    let isOpen = false;

    // Animation du chatbot
    chatbotTrigger.addEventListener('click', () => {
        isOpen = !isOpen;
        chatbotInterface.classList.toggle('active');
        chatbotTrigger.style.transform = isOpen ? 
            'scale(1.1) rotate(135deg)' : 
            'scale(1) rotate(0deg)';
    });

    // Animation des blobs
    document.querySelectorAll('.blob').forEach(blob => {
        blob.style.animationDelay = `${Math.random() * 20}s`;
    });

    // Démarrage du diaporama
    startSlideshow();
});
