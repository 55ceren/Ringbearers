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

document.getElementById("quote").innerText = "loading..."; // Aangenamer voor de gebruikers

const apiKey = "0QtkvkcNqsseU-8tvS3o"; // API sleutel kan je ophalen via https://the-one-api.dev/account

const movies = [
    "The Fellowship of the Ring",
    "The Two Towers",
    "The Return of the King"
];

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

        ///////////////////////////////////////////////////////////////////////////////////

        let characterResponse = await fetch("https://the-one-api.dev/v2/character", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${apiKey}`
            }
        });
        let characterData = await characterResponse.json();
        let characters = characterData.docs;

        let character = characters.find(character => character._id === randomQuote.character);

        ///////////////////////////////////////////////////////////////////////////////////

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

        ///////////////////////////////////////////////////////////////////////////////////

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
            leftButtons.forEach(btn => btn.disabled = true); 

            if (button.innerText === character.name) {
                button.style.backgroundColor = "green";
                selectedCharacter = true;
                checkCompletion();
            } else {
                button.style.backgroundColor = "red";
                leftButtons[correctCharacterIndex].style.backgroundColor = "green";
                selectedCharacter = false;

                document.querySelectorAll(".answers").forEach(btn => btn.disabled = true);
                document.getElementById("game-over").style.display = "block";
                document.getElementById("right-answer").style.display = "none";
                document.getElementById("wrong-answer").style.display = "none";
                document.getElementById("background-quiz").style.display = "none";

                setTimeout(() => location.reload(), 2000);
            }
        }

        function handleMovieClick(button) {
            rightButtons.forEach(btn => btn.disabled = true);

            if (button.innerText === movieName) {
                button.style.backgroundColor = "green";
                selectedMovie = true;
                checkCompletion();
            } else {
                button.style.backgroundColor = "red";
                rightButtons.forEach(btn => {
                    if (btn.innerText === movieName) {
                        btn.style.backgroundColor = "green";
                    }
                });
                selectedMovie = false;

                document.querySelectorAll(".answers").forEach(btn => btn.disabled = true);
                document.getElementById("game-over").style.display = "block";
                document.getElementById("right-answer").style.display = "none";
                document.getElementById("wrong-answer").style.display = "none";
                document.getElementById("background-quiz").style.display = "none";

                setTimeout(() => location.reload(), 2000);
            }
        }

        function checkCompletion() {
            if (selectedCharacter !== null && selectedMovie !== null) {
                if (selectedCharacter && selectedMovie) {
                    givePoint(1);
                    document.getElementById("right-answer").style.display = "block";
                    document.getElementById("wrong-answer").style.display = "none";
                    updateProgressBar(10);
                } else {
                    document.getElementById("game-over").style.display = "block";
                    document.getElementById("right-answer").style.display = "none";
                    document.getElementById("wrong-answer").style.display = "none";
                    updateProgressBar(0);
                }

                document.getElementById("background-quiz").style.display = "none";

                document.querySelectorAll(".answers").forEach(button => {
                    button.disabled = true;
                });
            
                setTimeout(() => location.reload(), 2000);
            }
        }

        leftButtons.forEach(button => button.addEventListener("click", () => handleCharacterClick(button)));
        rightButtons.forEach(button => button.addEventListener("click", () => handleMovieClick(button)));

        function updateProgressBar(increment) {
            let progressBar = document.getElementById("progress-bar");
            let currentWidth = parseInt(progressBar.style.width);
            let newWidth = currentWidth + increment;
            progressBar.style.width = `${Math.min(newWidth, 100)}%`;
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

    } catch (error) {
        console.error("Fout bij ophalen:", error);
    }
}

fetchQuoteAndCharacter();