const existingPlayers = ["Milad", "Ceren", "Oguzhan", "Sara", "Aymane"];
const inviteCooldowns = new Map();

document.getElementById("add-friend-btn").addEventListener("click", function() {
    const friendName = document.getElementById("friend-name").value.trim();
    const message = document.getElementById("friend-message");

    if (!friendName) {
        message.textContent = "Voer een spelersnaam in.";
        message.style.color = "red";
        return;
    }

    const friendList = document.getElementById("friend-list");
    const existingFriend = Array.from(friendList.getElementsByTagName("li")).some(item => item.textContent.includes(friendName));

    const pendingList = document.getElementById("pending-requests");
    const existingRequest = Array.from(pendingList.getElementsByTagName("li")).some(item => item.textContent.includes(friendName));

    if (existingFriend) {
        message.textContent = "Speler is al toegevoegd.";
        message.style.color = "red";
        return;
    }

    if (existingRequest) {
        message.textContent = "Verzoek is al verstuurd naar deze speler.";
        message.style.color = "red";
        return;
    }

    if (!existingPlayers.includes(friendName)) {
        message.textContent = "Speler niet gevonden.";
        message.style.color = "red";
    } else {
        message.textContent = "Vriendschapsverzoek is verstuurd.";
        message.style.color = "green";

        const listItem = document.createElement("li");
        listItem.textContent = friendName;
        pendingList.appendChild(listItem);
    }
});



document.querySelectorAll(".invite-btn").forEach(button => {
    button.addEventListener("click", function() {
        const playerName = this.parentElement.parentElement.textContent.trim();
        if (inviteCooldowns.has(playerName)) {
            alert("Je hebt al eerder een uitnodiging verstuurd naar deze speler.");
            return;
        }
        alert("Speler is uitgenodigd");
        this.disabled = true;
        inviteCooldowns.set(playerName, setTimeout(() => {
            this.disabled = false;
            inviteCooldowns.delete(playerName);
        }, 60000));
    });
});

document.querySelectorAll(".remove-btn").forEach(button => {
    button.addEventListener("click", function() {
        const playerItem = this.closest('li'); 
        const playerName = playerItem.querySelector("span").previousSibling.textContent.trim();  

        if (confirm(`Weet je zeker dat je ${playerName} wil verwijderen uit je vriendenlijst?`)) {
            playerItem.remove(); 
        }
    });
});

