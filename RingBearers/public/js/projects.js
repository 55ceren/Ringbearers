let photos = Array.from(document.getElementsByClassName("project-photos"));

function setBackground(imageUrl) {
    document.body.style.background = `url('${imageUrl}') no-repeat`;
    document.body.style.backgroundSize = "cover";
}

function resetBackground() {
    document.body.style.background = "";
}

let backgrounds = [
    './images/projects/fifa-background.jpg',
    './images/projects/fornite-background.jpg',
    './images/projects/legomaster-background.webp',
    './images/projects/lotr-background.jpg',
    './images/projects/mtg-background.jpg',
    './images/projects/pokemon-background.jpg'
];

photos.forEach((photo, i) => {
    photo.addEventListener("mouseenter", function() {
        setBackground(backgrounds[i]);
    });

    photo.addEventListener("mouseleave", resetBackground);

    photo.addEventListener("click", function() {
        if (photo !== photos[3]) {
            alert("Deze optie is niet beschikbaar");
        }
    });
});