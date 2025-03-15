document.querySelector(".change-photo-btn").addEventListener("click", function () {
    document.getElementById("profileModal").style.display = "flex";
});

document.querySelector(".close").addEventListener("click", function () {
    document.getElementById("profileModal").style.display = "none";
});

function selectPhoto(photoSrc) {
    
    document.querySelector(".profile-photo").src = "images/" + photoSrc; 

    document.getElementById("profileModal").style.display = "none"; 
}