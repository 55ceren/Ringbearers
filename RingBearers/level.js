document.getElementById("quote").innerText = "loading..."; // Aangenamer voor de gebruikers

const apiKey = "0QtkvkcNqsseU-8tvS3o"; // API sleutel kan je ophalen via https://the-one-api.dev/account, moest het vervallen

async function fetchQuoteAndCharacter() {
    try {

        let quoteResponse = await fetch("https://the-one-api.dev/v2/quote", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${apiKey}`
            }
        });
        let quoteData = await quoteResponse.json();
        let randomQuote = quoteData.docs[Math.floor(Math.random() * quoteData.docs.length)];

        let characterResponse = await fetch("https://the-one-api.dev/v2/character", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${apiKey}`
            }
        });
        let characterData = await characterResponse.json();
        let characters = characterData.docs;

        let character = characters.find(character => character._id === randomQuote.character);

        document.getElementById("quote").innerText = `"${randomQuote.dialog}"`;

        let buttons = document.getElementsByClassName("answers");
        let randomButtonIndex = Math.floor(Math.random() * buttons.length);
        buttons[randomButtonIndex].innerText = character.name;

        for (let i = 0; i < buttons.length; i++) {
            if (i !== randomButtonIndex) {
                buttons[i].innerText = characters[Math.floor(Math.random() * characters.length)].name;
            }
        }

        let backgroundQuiz = document.getElementById("background-quiz")
        let wrongAnswer = document.getElementById("wrong-answer")
        let rightAnswer = document.getElementById("right-answer")

        function updateProgressBar(increment) {
            let progressBar = document.getElementById("progress-bar");
            let currentWidth = parseInt(progressBar.style.width);
                        
            let newWidth = currentWidth + increment;
            if (newWidth > 100) {
                newWidth = 100;
            }
            
            progressBar.style.width = newWidth + "%";
        }

        let button1 = buttons[0];
        let button2 = buttons[1];
        let button3 = buttons[2];

        function handleButtonClick(button) {
            button1.disabled = true;
            button2.disabled = true;
            button3.disabled = true;

            if (button.innerText === character.name) {
                button.style.backgroundColor = "green";
                backgroundQuiz.style.display = "none";
                rightAnswer.style.display = "flex";
                wrongAnswer.style.display = "none";
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
            levelUp.innerText = "7/10";

            updateProgressBar(10);    
        }

        button1.addEventListener("click", function () {
            handleButtonClick(button1);
        });

        button2.addEventListener("click", function () {
            handleButtonClick(button2);
        });

        button3.addEventListener("click", function () {
            handleButtonClick(button3);
        });

        let thumbsUp = document.getElementById("thumbs-up")
        let thumbsDown = document.getElementById("thumbs-down")
        
        thumbsUp.addEventListener("click", function () {
            alert("Added to favorites")
            thumbsUp.style.color = "green";
            thumbsDown.style.color = "white";
        })

        thumbsDown.addEventListener("click", function () {
            alert("Blacklisted")
            thumbsDown.style.color = "red";
            thumbsUp.style.color = "white";
        })

    } catch (error) {
        console.error("Fout bij ophalen:", error);
    }
}

fetchQuoteAndCharacter();