document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".answers");
    const homePage = "home.html"; 
    let currentQuestionIndex = 0;
    let questions = [];
    let timer;
    let level = 1; // Start op level 1

    async function fetchQuestions() {
        try {
            const response = await fetch("https://opentdb.com/api.php?amount=10&category=11&type=multiple");
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                questions = data.results;
                loadQuestion(currentQuestionIndex);
            } else {
                alert("Kon geen vragen ophalen. Probeer het later opnieuw.");
            }
        } catch (error) {
            console.error("Error fetching questions: ", error);
            alert("Er is iets mis gegaan bij het ophalen van de vragen.");
        }
    }

    function loadQuestion(index) {
        clearInterval(timer);

        if (index < questions.length) {
            const question = questions[index];
            const questionText = question.question;
            const correctAnswer = question.correct_answer;
            const allAnswers = [...question.incorrect_answers, correctAnswer];
            shuffleArray(allAnswers);

            document.getElementById("quote").innerHTML = questionText;

            buttons.forEach((button, i) => {
                button.innerText = allAnswers[i];
                button.onclick = function () {
                    if (this.innerText === correctAnswer) {
                        alert("Goed gedaan! Volgende vraag...");
                        currentQuestionIndex++;
                        if (currentQuestionIndex % 3 === 0) { 
                            level++; 
                            showLevelUpMessage(level);
                        }
                        loadQuestion(currentQuestionIndex);
                    } else {
                        alert("Fout antwoord! Probeer opnieuw.");
                        loadQuestion(currentQuestionIndex);
                    }
                };
            });

            startTimer();
        } else {
            alert("Je hebt alle vragen beantwoord! Terug naar de homepagina.");
            window.location.href = homePage;
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function startTimer() {
        let timeLeft = 30;
        const timerDisplay = document.getElementById("timer");
        const timerBar = document.getElementById("timer-bar");

        timerDisplay.innerHTML = timeLeft;
        timerBar.style.width = "100%"; 
        timerBar.style.backgroundColor = "#4caf50"; 

        timer = setInterval(function () {
            timeLeft--;
            timerDisplay.innerHTML = timeLeft;

            let percentage = (timeLeft / 30) * 100;
            timerBar.style.width = percentage + "%";

            if (timeLeft <= 10) {
                timerBar.style.backgroundColor = "red";
            }

            if (timeLeft <= 0) {
                clearInterval(timer);
                alert("Tijd om! Volgende vraag.");
                currentQuestionIndex++;
                loadQuestion(currentQuestionIndex);
            }
        }, 1000);
    }

    function showLevelUpMessage(level) {
        let levelUpDiv = document.createElement("div");
        levelUpDiv.classList.add("level-up-message");
        levelUpDiv.innerText = `🎉 Gefeliciteerd! Je bent nu Level ${level}!`;

        document.body.appendChild(levelUpDiv);

        setTimeout(() => {
            levelUpDiv.remove();
        }, 3000);
    }

    fetchQuestions();
});

// 🔴 BELANGRIJK: Zet de goBack() functie BUITEN de event listener!
function goBack() {
    window.location.href = "home.html";
}
