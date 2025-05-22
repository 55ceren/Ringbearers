let selectedItem = null;

function openConfirmModal(name, price, type, url) {
    selectedItem = { name, price, type, url };
    document.getElementById("modal-item-name").innerText = name;
    document.getElementById("modal-item-price").innerText = `Prijs: ${price} 💎`;
    document.getElementById("confirm-modal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("confirm-modal").classList.add("hidden");
}

async function confirmPurchase() {
    try {
        const res = await fetch("/purchase", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(selectedItem)
        });

        const result = await res.text();
        alert(result);
        if (res.ok) {
            closeModal();
            location.reload();
        }
    } catch (err) {
        console.error(err);
        alert("Fout bij kopen van item.");
    }
}