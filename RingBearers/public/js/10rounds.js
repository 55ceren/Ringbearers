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

document.getElementById("quote").innerText = "loading...";

const apiKey = "0QtkvkcNqsseU-8tvS3o";

const movies = [
    "The Fellowship of the Ring",
    "The Two Towers",
    "The Return of the King"
];

let currentRound = parseInt(sessionStorage.getItem("currentRound")) || 1;
if (currentRound === 1) {
    sessionStorage.setItem("roundScore", 0);
}

async function fetchQuoteAndCharacter() {
    let savedRound = parseInt(sessionStorage.getItem("currentRound")) || 1;
    if (savedRound > 10) {
        sessionStorage.setItem("currentRound", 1);
    }

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
        if (!character || !character.name) {
            character = { name: "Onbekend" };
        }

        let movieResponse = await fetch("https://the-one-api.dev/v2/movie", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${apiKey}`
            }
        });
        let movieData = await movieResponse.json();
        let apiMovies = movieData.docs;

        let movie = apiMovies.find(movie => randomQuote.movie === movie._id);
        let movieName = movie ? movie.name : "Movie not found";

        document.getElementById("quote").innerText = randomQuote.dialog;

        let leftButtons = document.querySelectorAll("#buttons-left .answers");
        let rightButtons = document.querySelectorAll("#buttons-right .answers");

        let correctCharacterIndex = Math.floor(Math.random() * leftButtons.length);
        leftButtons[correctCharacterIndex].innerText = character.name;

        for (let i = 0; i < leftButtons.length; i++) {
            if (i !== correctCharacterIndex) {
                leftButtons[i].innerText = characters[Math.floor(Math.random() * characters.length)].name;
            }
        }

        rightButtons[0].innerText = movies[0];
        rightButtons[1].innerText = movies[1];
        rightButtons[2].innerText = movies[2];

        let selectedCharacter = null;
        let selectedMovie = null;

        function handleCharacterClick(button) {
            leftButtons.forEach(button => button.disabled = true);

            if (button.innerText === character.name) {
                button.style.backgroundColor = "green";
                selectedCharacter = true;
            } else {
                button.style.backgroundColor = "red";
                leftButtons[correctCharacterIndex].style.backgroundColor = "green";
                selectedCharacter = false;
            }
            checkCompletion();
        }

        function handleMovieClick(button) {
            rightButtons.forEach(button => button.disabled = true);

            if (button.innerText === movieName) {
                button.style.backgroundColor = "green";
                selectedMovie = true;
            } else {
                button.style.backgroundColor = "red";
                rightButtons.forEach(button => {
                    if (button.innerText === movieName) {
                        button.style.backgroundColor = "green";
                    }
                });
                selectedMovie = false;
            }
            checkCompletion();
        }

        function checkCompletion() {
            if (selectedCharacter !== null && selectedMovie !== null) {
                let points = 0;

                if (selectedCharacter && selectedMovie) {
                    points = 1;
                    document.getElementById("right-answer").style.display = "block";
                    document.getElementById("wrong-answer").style.display = "none";
                } else if (selectedCharacter || selectedMovie) {
                    points = 0.5;
                    document.getElementById("wrong-answer").style.display = "block";
                    document.getElementById("right-answer").style.display = "none";
                } else {
                    points = 0;
                    document.getElementById("wrong-answer").style.display = "block";
                    document.getElementById("right-answer").style.display = "none";
                }

                if (points > 0) {
                    givePoint(points);
                }

                document.getElementById("background-quiz").style.display = "none";

                let currentRound = parseInt(sessionStorage.getItem("currentRound")) || 1;
                currentRound += 1;
                sessionStorage.setItem("currentRound", currentRound);

                let currentScore = parseFloat(sessionStorage.getItem("roundScore")) || 0;
                currentScore += points;
                sessionStorage.setItem("roundScore", currentScore);

                if (currentRound > 10) {
                    document.getElementById("level-up").innerText = `10/10`;

                    const totalScore = sessionStorage.getItem("roundScore") || 0;
                    const scoreDiv = document.getElementById("final-score");
                    scoreDiv.style.display = "flex";
                    document.getElementById("final-points").innerText = `Je behaalde ${totalScore} punten!`;

                    let highScore = localStorage.getItem("highScore") || 0;
                    if (parseFloat(totalScore) > parseFloat(highScore)) {
                        localStorage.setItem("highScore", totalScore);
                        highScore = totalScore;
                    }
                    document.getElementById("high-score").innerText = `High score: ${highScore}`;

                    document.getElementById("quote").style.display = "none";
                    document.getElementById("buttons").style.display = "none";
                    document.getElementById("progress-bar").style.width = `100%`;

                    sessionStorage.removeItem("currentRound");
                    sessionStorage.removeItem("roundScore");
                } else {

                    document.getElementById("level-up").innerText = `${currentRound}/10`;
                    updateProgressBar(currentRound);
                    setTimeout(() => location.reload(), 2000);
                }
            }
        }

        leftButtons.forEach(button => button.addEventListener("click", () => handleCharacterClick(button)));
        rightButtons.forEach(button => button.addEventListener("click", () => handleMovieClick(button)));

        function updateProgressBar(currentRound) {
            let progressBar = document.getElementById("progress-bar");
            let percentage = Math.min((currentRound - 1) * 10, 100);
            progressBar.style.width = `${percentage}%`;
        }

        let thumbsUp = document.getElementById("thumbs-up");
        let thumbsDown = document.getElementById("thumbs-down");

        thumbsUp.addEventListener("click", async function () {
            if (thumbsUp.style.color === "green") {
                thumbsUp.style.color = "white";
            } else {
                thumbsUp.style.color = "green";
                thumbsDown.style.color = "white";
                
                const data = {
                    quoteId: randomQuote._id,
                    character: character._id,
                    movie: randomQuote.movie,
                    dialog: randomQuote.dialog
                };

                try {
                    const response = await fetch("/favorites", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(data)
                    });

                    if (response.ok) {
                        alert("Toegevoegd bij favorieten");
                    } else {
                        alert("Kon favoriet niet toevoegen");
                    }
                } catch (error) {
                    console.error("Fout bij toevoegen favoriet:", error);
                    alert("Fout bij toevoegen favoriet");
                }
            }
        });

        thumbsDown.addEventListener("click", async function () {
            if (thumbsDown.style.color === "red") {
                thumbsDown.style.color = "white";
            } else {
                thumbsDown.style.color = "red";
                thumbsUp.style.color = "white";
                
                const data = {
                    quoteId: randomQuote._id,
                    reason: "User blacklisted this quote" 
                };

                try {
                    const response = await fetch("/blacklist", {   
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(data)
                    });

                    if (response.ok) {
                        alert("Quote geblacklist");
                    } else {
                        alert("Kon quote niet blacklisten");
                    }
                } catch (error) {
                    console.error("Fout bij blacklisten:", error);
                    alert("Fout bij blacklisten");
                }
            }
        });

            } catch (error) {
                console.error("Fout bij ophalen:", error);
            }
        }

fetchQuoteAndCharacter();