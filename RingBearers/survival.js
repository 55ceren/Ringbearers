document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".answers");
    const homePage = "home.html"; // Verander dit als je een andere homepagina hebt
    let currentQuestionIndex = 0;
    let questions = [];

    // Functie om quizvragen op te halen
    async function fetchQuestions() {
        try {
            const response = await fetch("https://opentdb.com/api.php?amount=10&category=11&type=multiple");
            const data = await response.json();
            questions = data.results;
            loadQuestion(currentQuestionIndex);
        } catch (error) {
            console.error("Error fetching questions: ", error);
            alert("Er is iets mis gegaan bij het ophalen van de vragen.");
        }
    }

    // Functie om de vraag en antwoorden te laden
    function loadQuestion(index) {
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
                        loadQuestion(currentQuestionIndex);
                    } else {
                        alert("Fout antwoord! Game over.");
                        window.location.href = homePage;
                    }
                };
            });
        } else {
            alert("Je hebt alle vragen beantwoord! Terug naar de homepagina.");
            window.location.href = homePage;
        }
    }

    // Shuffle functie voor de antwoorden
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elementen
        }
    }

    // Laad de vragen bij het starten van de game
    fetchQuestions();

    // Terugknop functionaliteit
    function goBack() {
        window.location.href = homePage;
    }
});
