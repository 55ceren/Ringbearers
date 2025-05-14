function givePoint(aantalPunten = 1) {
    fetch("/complete-quiz", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ points: aantalPunten })
    })
    .then(res => res.text())
    .then(data => console.log("✅ Punt toegekend:", data))
    .catch(err => console.error("❌ Fout bij punten toekennen:", err));
}
