document.querySelector(".change-photo-btn.profile").addEventListener("click", function () {
    document.getElementById("profileModal").style.display = "flex";
});

document.querySelector("#profileModal .close").addEventListener("click", function () {
    document.getElementById("profileModal").style.display = "none";
});

function selectPhoto(photoSrc) {
    document.getElementById("profileModal").style.display = "none";

    const isDefaultAvatar = photoSrc.startsWith("gezicht");
    const avatarPath = isDefaultAvatar ? "/images/settings/" + photoSrc : "/images/shop/" + photoSrc;

    fetch("/update-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: avatarPath })
    })
    .then(res => {
        if (!res.ok) {
            alert("Er is iets misgegaan bij het opslaan van je avatar.");
        } else {
            location.reload();
        }
    })
    .catch(error => {
        console.error("Fout bij verzenden van avatar:", error);
    });
}

document.querySelector(".change-photo-btn.wallpaper").addEventListener("click", function () {
    document.getElementById("wallpaperModal").style.display = "flex";
});

document.querySelector("#wallpaperModal .close-wallpaper").addEventListener("click", function () {
    document.getElementById("wallpaperModal").style.display = "none";
});

function selectWallpaper(photoSrc) {
    document.getElementById("wallpaperModal").style.display = "none";

    const defaultBackgrounds = ["lord-of-the-rings-amazon-studios.png.webp"];
    const fullBackgroundPath = defaultBackgrounds.includes(photoSrc)
        ? "/images/" + photoSrc
        : "/images/shop/" + photoSrc;

    fetch("/update-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ background: fullBackgroundPath })
    })
    .then(res => {
        if (!res.ok) {
            alert("Er is iets misgegaan bij het opslaan van je achtergrond.");
        } else {
            location.reload();
        }
    })
    .catch(error => {
        console.error("Fout bij verzenden van achtergrond:", error);
    });
}
