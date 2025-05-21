function givePoint(aantalPunten = 1) {
    fetch("/complete-quiz", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ points: aantalPunten })
    })
    .then(res => res.json())
    .then(data => {
        console.log("Points updated:", data);
    })
    .catch(error => {
        console.error("Error updating points:", error);
    });
}

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
            button1.disabled = true;
            button2.disabled = true;
            button3.disabled = true;

            if (button.innerText === character.name) {
                button.style.backgroundColor = "green";
                backgroundQuiz.style.display = "none";
                rightAnswer.style.display = "flex";
                wrongAnswer.style.display = "none";

                givePoint(1); 

            } else {
                button.style.backgroundColor = "red";

                if (button1.innerText === character.name) {
                    button1.style.backgroundColor = "green";
                } else if (button2.innerText === character.name) {
                    button2.style.backgroundColor = "green";
                } else if (button3.innerText === character.name) {
                    button3.style.backgroundColor = "green";
                }

                backgroundQuiz.style.display = "none";
                rightAnswer.style.display = "none";
                wrongAnswer.style.display = "flex";
            }

            setTimeout(() => {
                location.reload();
            }, 2000);

            let levelUp = document.getElementById("level-up");
            levelUp.innerText = "2/10";  

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

fetchQuoteAndCharacter();
