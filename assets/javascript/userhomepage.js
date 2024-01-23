
document.addEventListener("DOMContentLoaded", function () {
    let carouselIds = ['carouselExampleControls', 'bottomCarousel', 'bottom2Carousel'];

    carouselIds.forEach(carouselId => {
        let myCarousel = document.getElementById(carouselId);

        myCarousel.addEventListener('slide.bs.carousel', function (event) {
            let textColors = ["#3498db", "#e74c3c", "#2ecc71", "#f1c40f", "#e91e63", "#ecf0f1"];
            let randomIndex = Math.floor(Math.random() * textColors.length);
            let taglineElement = myCarousel.querySelector('.carousel-caption');
            taglineElement.style.color = textColors[randomIndex];
        });
    });
});




