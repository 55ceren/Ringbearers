document.addEventListener("DOMContentLoaded", function () {
    const timerAElement = document.getElementById("timerA");
    const timerBElement = document.getElementById("timerB");
    const questionAElement = document.getElementById("questionA");
    const questionBElement = document.getElementById("questionB");

    let currentQuestionIndex = 0;
    let questions = [];
    let timerA, timerB;
    let currentPlayer = 'A'; // A begint het spel

    // Vragen ophalen
    async function fetchQuestions() {
        try {
            const response = await fetch("https://opentdb.com/api.php?amount=10&category=11&type=multiple");
            const data = await response.json();
            questions = data.results;
            loadQuestion(currentPlayer);
        } catch (error) {
            console.error("Error fetching questions: ", error);
            alert("Er is iets mis gegaan bij het ophalen van de vragen.");
        }
    }

    // Laad de vraag voor de actieve speler
    function loadQuestion(player) {
    let question = questions[currentQuestionIndex];
    const questionText = question.question;
    const correctAnswer = question.correct_answer;
    const allAnswers = [...question.incorrect_answers, correctAnswer];
    shuffleArray(allAnswers);

    // Vraag weergeven voor de actieve speler
    if (player === 'A') {
        questionAElement.innerHTML = questionText;
        timerAElement.innerText = 30;
    } else {
        questionBElement.innerHTML = questionText;
        timerBElement.innerText = 30;
    }

    // Zet de antwoorden op de knoppen
    const button1 = document.getElementById("button1");
    const button2 = document.getElementById("button2");
    const button3 = document.getElementById("button3");

    button1.innerText = allAnswers[0];  // Zet het eerste antwoord
    button2.innerText = allAnswers[1];  // Zet het tweede antwoord
    button3.innerText = allAnswers[2];  // Zet het derde antwoord

    // Voeg een klik handler toe voor elk antwoord
    button1.onclick = function () {
        submitAnswer(player, button1.innerText, correctAnswer); // Antwoord indienen voor button1
    };
    button2.onclick = function () {
        submitAnswer(player, button2.innerText, correctAnswer); // Antwoord indienen voor button2
    };
    button3.onclick = function () {
        submitAnswer(player, button3.innerText, correctAnswer); // Antwoord indienen voor button3
    };

    // Start de timer voor de actieve speler
    if (player === 'A') {
        startTimer('A');
    } else {
        startTimer('B');
    }
    }


    // Timer voor elke speler
    function startTimer(player) {
        let timeLeft = 30;
        const timerElement = player === 'A' ? timerAElement : timerBElement;

        const timer = setInterval(function () {
            timeLeft--;
            timerElement.innerText = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timer);
                alert(`${player === 'A' ? 'Speler A' : 'Speler B'}: Tijd is op!`);
                switchPlayer(); // Wissel van speler
            }
        }, 1000);
    }

    // Functie om antwoorden in te dienen
    function submitAnswer(player, answer, correctAnswer) {
        const isCorrect = answer === correctAnswer;
        alert(isCorrect ? "Goed antwoord!" : "Fout antwoord!");
        switchPlayer(); // Wissel van speler na antwoord
    }

    // Wissel van speler na elk antwoord
    function switchPlayer() {
        // Beurt wisselen
        currentPlayer = currentPlayer === 'A' ? 'B' : 'A';

        // Volgende vraag voor beide spelers
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            loadQuestion(currentPlayer);
        } else {
            alert("Het spel is afgelopen!");
        }
    }

    // Vragen ophalen bij het laden van de pagina
    fetchQuestions();
});

// Shuffle functie om antwoorden door elkaar te halen
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elementen
    }
}
