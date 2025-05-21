document.querySelector(".change-photo-btn").addEventListener("click", function () {
    document.getElementById("profileModal").style.display = "flex";
});

document.querySelector(".close").addEventListener("click", function () {
    document.getElementById("profileModal").style.display = "none";
});

function selectPhoto(photoSrc) {
    document.querySelector(".profile-photo").src = "/images/settings/" + photoSrc;

    document.getElementById("profileModal").style.display = "none";

    fetch("/update-profile-photo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
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
