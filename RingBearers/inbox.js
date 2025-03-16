document.addEventListener("DOMContentLoaded", function () {
    const invitesList = document.getElementById("invites-list");

    invitesList.addEventListener("click", function (event) {
        if (event.target.classList.contains("accept-btn")) {
            const playerName = event.target.closest("li").querySelector(".invite-sender").innerText;
            
            const confirmed = confirm(`Verbinden met ${playerName}?`);
            if (confirmed) {
                event.target.closest("li").remove();
            }
        } else if (event.target.classList.contains("decline-btn")) {
            event.target.closest("li").remove();
        }
    });
});
