document.getElementById("quote").innerText = "Loading..."; // Aangenamer voor de gebruikers

const apiKey = "0QtkvkcNqsseU-8tvS3o"; // API sleutel, haal een nieuwe op indien nodig

async function fetchQuoteAndCharacter() {
    try {
        let quoteResponse = await fetch("https://the-one-api.dev/v2/quote", {
            method: "GET",
            headers: { "Authorization": `Bearer ${apiKey}` }
        });
        let quoteData = await quoteResponse.json();
        let randomQuote = quoteData.docs[Math.floor(Math.random() * quoteData.docs.length)];

        let characterResponse = await fetch("https://the-one-api.dev/v2/character", {
            method: "GET",
            headers: { "Authorization": `Bearer ${apiKey}` }
        });
        let characterData = await characterResponse.json();
        let characters = characterData.docs;

        let character = characters.find(c => c._id === randomQuote.character);

        document.getElementById("quote").innerText = `"${randomQuote.dialog}"`;

        let buttons = document.getElementsByClassName("answers");
        let randomButtonIndex = Math.floor(Math.random() * buttons.length);
        buttons[randomButtonIndex].innerText = character.name;

        for (let i = 0; i < buttons.length; i++) {
            if (i !== randomButtonIndex) {
                buttons[i].innerText = characters[Math.floor(Math.random() * characters.length)].name;
            }
        }

        let backgroundQuiz = document.getElementById("background-quiz");
        let wrongAnswer = document.getElementById("wrong-answer");
        let rightAnswer = document.getElementById("right-answer");

        function updateProgressBar(increment) {
            let progressBar = document.getElementById("progress-bar");
            let currentWidth = parseInt(progressBar.style.width) || 0;

            let newWidth = Math.min(currentWidth + increment, 100);
            progressBar.style.width = newWidth + "%";
        }

        function handleButtonClick(button) {
            Array.from(buttons).forEach(btn => btn.disabled = true);

            if (button.innerText === character.name) {
                button.style.backgroundColor = "green";
                rightAnswer.style.display = "flex";
                wrongAnswer.style.display = "none";
            } else {
                button.style.backgroundColor = "red";
                [...buttons].find(b => b.innerText === character.name).style.backgroundColor = "green";
                wrongAnswer.style.display = "flex";
                rightAnswer.style.display = "none";
            }

            backgroundQuiz.style.display = "none";

            setTimeout(() => location.reload(), 2000);

            document.getElementById("level-up").innerText = "2/10";
            updateProgressBar(10);
        }

        Array.from(buttons).forEach(button => {
            button.addEventListener("click", () => handleButtonClick(button));
        });

        let thumbsUp = document.getElementById("thumbs-up");
        let thumbsDown = document.getElementById("thumbs-down");

        thumbsUp.addEventListener("click", function () {
            if (thumbsUp.style.color === "green") {
                thumbsUp.style.color = "white"; 
            } else {
                thumbsUp.style.color = "green";
                thumbsDown.style.color = "white"; 
                alert("Toegevoegd bij favorieten");
            }
        });

        thumbsDown.addEventListener("click", function () {
            if (thumbsDown.style.color === "red") {
                thumbsDown.style.color = "white"; 
            } else {
                thumbsDown.style.color = "red";
                thumbsUp.style.color = "white"; 
                alert("Geblacklisted");
            }
        });

    } catch (error) {
        console.error("Fout bij ophalen:", error);
        document.getElementById("quote").innerText = "Kon geen quote ophalen.";
    }
}

function showLevelUpMessage(level) {
    let levelUpDiv = document.createElement("div");
    levelUpDiv.classList.add("level-up-message");
    levelUpDiv.innerText = `🎉 Gefeliciteerd! Je bent nu Level ${level}!`;

    document.body.appendChild(levelUpDiv);
    setTimeout(() => levelUpDiv.remove(), 3000);
}

fetchQuoteAndCharacter();
