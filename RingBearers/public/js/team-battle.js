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

document.addEventListener("DOMContentLoaded", function () {
    const timerAElement = document.getElementById("timerA");
    const timerBElement = document.getElementById("timerB");
    const questionAElement = document.getElementById("questionA");
    const questionBElement = document.getElementById("questionB");

    let currentQuestionIndex = 0;
    let questions = [];
    let timerA, timerB;
    let currentPlayer = 'A'; 

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

    function loadQuestion(player) {
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

   
    if (player === 'A') {
        startTimer('A');
    } else {
        startTimer('B');
    }
    }
    
    function startTimer(player) {
        let timeLeft = 30;
        const timerElement = player === 'A' ? timerAElement : timerBElement;

        const timer = setInterval(function () {
            timeLeft--;
            timerElement.innerText = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timer);
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

        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            loadQuestion(currentPlayer);
        } else {
            alert("Het spel is afgelopen!");
        }
    }

    fetchQuestions();
});


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; 
    }
}
function goBack() {
    window.location.href = "home.html";
}

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