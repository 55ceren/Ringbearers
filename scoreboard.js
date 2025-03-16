const friends = ["Milad", "Ceren", "Oguzhan", "Sara", "Aymane"]; 

const scoreboard = document.getElementById("scoreboard");

function generateRandomScore() {
    return Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000;
}

friends.forEach(friend => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `${friend} <span>${generateRandomScore()}</span>`;
    scoreboard.appendChild(listItem);
});
