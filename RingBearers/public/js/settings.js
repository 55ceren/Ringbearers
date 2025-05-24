document.querySelector(".change-photo-btn.profile").addEventListener("click", function () {
    document.getElementById("profileModal").style.display = "flex";
});

document.querySelector("#profileModal .close").addEventListener("click", function () {
    document.getElementById("profileModal").style.display = "none";
});

function selectPhoto(photoSrc) {
    document.querySelector(".profile-photo").src = "/images/settings/" + photoSrc;
    document.getElementById("profileModal").style.display = "none";

    fetch("/update-profile-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo: photoSrc })
    })
    .then(res => {
        if (!res.ok) {
            alert("Er is iets misgegaan bij het opslaan van je profielfoto.");
        }
    })
    .catch(error => {
        console.error("Fout bij verzenden van profielfoto:", error);
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

    fetch("/update-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ background: photoSrc })
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