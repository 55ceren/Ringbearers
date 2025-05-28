document.addEventListener("DOMContentLoaded", function () {
    const timerAElement = document.getElementById("timerA");
    const timerBElement = document.getElementById("timerB");
    const questionAElement = document.getElementById("questionA");
    const questionBElement = document.getElementById("questionB");
    const levelUpElement = document.getElementById("level-up"); 

    let currentQuestionIndex = 0;
    let questions = [];
    let currentPlayer = 'A';
    let timerId = null; 

    let currentRound = 1;  
    const maxRounds = 10; 

    function updateRoundDisplay() {
        if (levelUpElement) {
            levelUpElement.innerText = `${currentRound} / ${maxRounds}`;
        }
    }

    function fetchQuestions() {
        questions = [
            {
                question: "Wie is de auteur van 'The Lord of the Rings'?",
                correct_answer: "J.R.R. Tolkien",
                incorrect_answers: ["George R.R. Martin", "C.S. Lewis", "J.K. Rowling"]
            },
            {
                question: "Wat is de naam van het wapen van Gandalf?",
                correct_answer: "Glamdring",
                incorrect_answers: ["Sting", "Andúril", "Orcrist"]
            },
            {
                question: "Welke van deze rassen hoort NIET bij Middle-earth?",
                correct_answer: "Wookiees",
                incorrect_answers: ["Elfen", "Dwergen", "Hobbits"]
            },
            {
                question: "Wat is de naam van Frodo's huis in de Shire?",
                correct_answer: "Bag End",
                incorrect_answers: ["Rivendell", "Bree", "Minas Tirith"]
            },
            {
                question: "Wie is de koning van Gondor aan het einde van de trilogie?",
                correct_answer: "Aragorn",
                incorrect_answers: ["Boromir", "Faramir", "Denethor"]
            },
            {
                question: "Wat is de naam van het ene ring?",
                correct_answer: "De Ene Ring",
                incorrect_answers: ["De Verloren Ring", "De Machtige Ring", "De Gouden Ring"]
            },
            {
                question: "Wie bracht het bericht naar Frodo dat hij de ring moest vernietigen?",
                correct_answer: "Gandalf",
                incorrect_answers: ["Saruman", "Elrond", "Aragorn"]
            },
            {
                question: "Welke creatuur bewaakte de mijn van Moria?",
                correct_answer: "Balrog",
                incorrect_answers: ["Troll", "Ork", "Drake"]
            },
            {
                question: "Wie redde Frodo en Sam van de Spinnen van Cirith Ungol?",
                correct_answer: "Gollum",
                incorrect_answers: ["Aragorn", "Legolas", "Boromir"]
            },
            {
                question: "Wat is de naam van de tovenaar die Frodo begeleidt?",
                correct_answer: "Gandalf",
                incorrect_answers: ["Radagast", "Saruman", "Alatar"]
            }
        ];

        shuffleArray(questions);
        updateRoundDisplay();
        loadQuestion(currentPlayer);
    }

    function loadQuestion(player) {
        if (timerId !== null) {
            clearInterval(timerId);
            timerId = null;
        }

        let question = questions[currentQuestionIndex];
        const questionText = question.question;
        const correctAnswer = question.correct_answer;
        const allAnswers = [...question.incorrect_answers, correctAnswer];
        shuffleArray(allAnswers);

        if (player === 'A') {
            questionAElement.innerHTML = questionText;
            timerAElement.innerText = 30;
        } else {
            questionBElement.innerHTML = questionText;
            timerBElement.innerText = 30;
        }

        const button1 = document.getElementById("button1");
        const button2 = document.getElementById("button2");
        const button3 = document.getElementById("button3");

        button1.innerText = allAnswers[0];
        button2.innerText = allAnswers[1];
        button3.innerText = allAnswers[2];

        button1.onclick = function () {
            submitAnswer(player, button1.innerText, correctAnswer);
        };
        button2.onclick = function () {
            submitAnswer(player, button2.innerText, correctAnswer);
        };
        button3.onclick = function () {
            submitAnswer(player, button3.innerText, correctAnswer);
        };

        startTimer(player);
    }

    function startTimer(player) {
        let timeLeft = 30;
        const timerElement = player === 'A' ? timerAElement : timerBElement;

        timerId = setInterval(function () {
            timeLeft--;
            timerElement.innerText = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timerId);
                timerId = null;
                alert(`${player === 'A' ? 'Speler A' : 'Speler B'}: Tijd is op!`);
                switchPlayer();
            }
        }, 1000);
    }

    function submitAnswer(player, answer, correctAnswer) {
        const isCorrect = answer === correctAnswer;

        if (isCorrect) {
            alert("Goed antwoord!");
            givePoint(1);
        } else {
            alert("Fout antwoord!");
        }

        switchPlayer();
    }

    function switchPlayer() {
        currentPlayer = currentPlayer === 'A' ? 'B' : 'A';

        if (currentPlayer === 'A') {
            currentRound++;
            updateRoundDisplay();

            if (currentRound > maxRounds) {
                alert("Het spel is afgelopen na 10 rondes!");
                if (timerId !== null) {
                    clearInterval(timerId);
                }
                return; 
            }
        }

        currentQuestionIndex++;

        if (currentQuestionIndex < questions.length) {
            loadQuestion(currentPlayer);
        } else {
            alert("Geen vragen meer beschikbaar!");
        }
    }

    fetchQuestions();

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
});