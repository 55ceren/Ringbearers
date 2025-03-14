document.getElementById("quote").innerText = "Loading...";

const apiKey = "0QtkvkcNqsseU-8tvS3o"; 

let currentLevel = parseInt(localStorage.getItem("currentLevel")) || 1;
let correctAnswers = parseInt(localStorage.getItem("correctAnswers")) || 0;
let progress = parseInt(localStorage.getItem("progress")) || 0;
let totalRounds = parseInt(localStorage.getItem("totalRounds")) || 0;
let highScore = parseInt(localStorage.getItem("highScore")) || 0;

document.getElementById("level-up").innerText = `${totalRounds}/10`;
document.querySelector(".level-info").innerText = `Level ${currentLevel}`;
document.getElementById("progress-bar").style.width = `${progress}%`;

async function fetchQuestions() {
    try {
        let quoteResponse = await fetch("https://the-one-api.dev/v2/quote", {
            method: "GET",
            headers: { "Authorization": `Bearer ${apiKey}` }
        });
        let quoteData = await quoteResponse.json();

        let characterResponse = await fetch("https://the-one-api.dev/v2/character", {
            method: "GET",
            headers: { "Authorization": `Bearer ${apiKey}` }
        });
        let characterData = await characterResponse.json();

        let quotes = quoteData.docs.filter(q => q.dialog);
        let characters = characterData.docs;

        if (quotes.length < 2 || characters.length === 0) {
            console.error("Niet genoeg vragen beschikbaar.");
            return;
        }

        let selectedQuotes = [];
        while (selectedQuotes.length < 2) {
            let randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            let character = characters.find(c => c._id === randomQuote.character);
            if (character && !selectedQuotes.some(q => q.quote === randomQuote.dialog)) {
                selectedQuotes.push({ quote: randomQuote.dialog, character: character.name });
            }
        }

        setupQuestions(selectedQuotes);
    } catch (error) {
        console.error("Fout bij ophalen van vragen:", error);
        document.getElementById("quote").innerText = "Fout bij laden van de vragen.";
    }
}

function setupQuestions(questions) {
    let buttons = document.getElementsByClassName("answers");
    let currentQuestionIndex = 0;
    let roundPoints = 0;

    function loadQuestion(index) {
        document.getElementById("quote").innerText = `"${questions[index].quote}"`;

        let correctCharacter = questions[index].character;
        let correctIndex = Math.floor(Math.random() * buttons.length);

        for (let i = 0; i < buttons.length; i++) {
            if (i === correctIndex) {
                buttons[i].innerText = correctCharacter;
            } else {
                let randomCharacter;
                do {
                    randomCharacter = questions[Math.floor(Math.random() * questions.length)].character;
                } while (randomCharacter === correctCharacter);
                buttons[i].innerText = randomCharacter;
            }

            buttons[i].style.backgroundColor = "";
            buttons[i].disabled = false;

            buttons[i].onclick = function () {
                if (buttons[i].innerText === correctCharacter) {
                    buttons[i].style.backgroundColor = "green";
                    roundPoints += 0.5;
                } else {
                    buttons[i].style.backgroundColor = "red";
                }

                Array.from(buttons).forEach(btn => btn.disabled = true);
                setTimeout(() => {
                    if (index === 0) {
                        loadQuestion(1);
                    } else {
                        endRound();
                    }
                }, 1500);
            };
        }
    }

    function endRound() {
        correctAnswers += roundPoints;
        totalRounds++;

        document.getElementById("level-up").innerText = `${totalRounds}/10`;

        updateProgressBar(roundPoints * 10);

        if (totalRounds >= 10) {
            endGame();
        } else {
            setTimeout(() => {
                location.reload();
            }, 2000);
        }

        localStorage.setItem("correctAnswers", correctAnswers);
        localStorage.setItem("totalRounds", totalRounds);
        localStorage.setItem("progress", progress);
    }

    loadQuestion(currentQuestionIndex);
}

function updateProgressBar(increment) {
    progress += increment;
    if (progress > 100) progress = 100;
    document.getElementById("progress-bar").style.width = progress + "%";
}

function endGame() {
    let finalScore = correctAnswers;
    if (finalScore > highScore) {
        highScore = finalScore;
        localStorage.setItem("highScore", highScore);
    }

    document.body.innerHTML = `
        <div class="end-screen">
            <h1>Game Over!</h1>
            <p>Je eindscore: ${finalScore} punten</p>
            <p>High Score: ${highScore} punten</p>
            <button onclick="restartGame()">Opnieuw Spelen</button>
        </div>
    `;

    localStorage.setItem("currentLevel", 1);
    localStorage.setItem("correctAnswers", 0);
    localStorage.setItem("progress", 0);
    localStorage.setItem("totalRounds", 0);
}

function restartGame() {
    location.reload();
}

fetchQuestions();
