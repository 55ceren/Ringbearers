import { Router } from "express";
import { ObjectId } from "mongodb";
import { secureMiddleware } from "../secureMiddleware";
import { client } from "../database";

const router = Router();

router.get("/favorites", secureMiddleware, async (req, res) => {
    const db = client.db("lotrgame");

    if (!req.session.user) {
        res.status(401).send("Niet ingelogd");
        return;
    }

    const userId = new ObjectId(req.session.user._id);

    try {
        const favorites = await db.collection("favorites").find({ userId }).toArray();

        const characterIds = [...new Set(favorites.map(q => q.character))];
        const movieIds = [...new Set(favorites.map(q => q.movie))];

        const apiKey = "0QtkvkcNqsseU-8tvS3o";
        
        const characterFetches = characterIds.map(id =>
            fetch(`https://the-one-api.dev/v2/character/${id}`, {
                headers: { Authorization: `Bearer ${apiKey}` }
            }).then(res => res.json())
        );

        const movieFetches = movieIds.map(id =>
            fetch(`https://the-one-api.dev/v2/movie/${id}`, {
                headers: { Authorization: `Bearer ${apiKey}` }
            }).then(res => res.json())
        );

        const characterResults = await Promise.all(characterFetches);
        const movieResults = await Promise.all(movieFetches);

        const charactersMap = Object.fromEntries(
            characterResults
                .filter(c => c.docs?.[0])
                .map(c => [c.docs[0]._id, c.docs[0].name])
        );

        const moviesMap = Object.fromEntries(
            movieResults
                .filter(m => m.docs?.[0])
                .map(m => [m.docs[0]._id, m.docs[0].name])
        );
        
        const quotes = favorites.map(q => ({
            ...q,
            character: charactersMap[q.character] || "Onbekend",
            movie: moviesMap[q.movie] || "Onbekend"
        }));

        const characterCounts = quotes.reduce((acc, q) => {
            acc[q.character] = (acc[q.character] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        res.render("favorites", {
            quotes,
            characterCounts
        });
    } catch (err) {
        console.error("Fout bij ophalen van favorieten:", err);
        res.status(500).send("Er is iets misgegaan bij het ophalen van je favorieten.");
    }
});

router.post("/favorites", secureMiddleware, async (req, res) => {
    if (!req.session.user) {
        res.status(401).send("Niet ingelogd");
        return;
    }

    const { quoteId, character, movie, dialog } = req.body;
    const userId = new ObjectId(req.session.user._id);

    if (!quoteId || !character || !movie || !dialog) {
        res.status(400).send("Ontbrekende gegevens");
        return;
    }

    const db = client.db("lotrgame");

    try {
        await db.collection("favorites").updateOne(
            { userId, quoteId },
            { $set: { character, movie, dialog } },
            { upsert: true }
        );

        await db.collection("users").updateOne(
            { _id: userId },
            { $addToSet: { favoriteQuotes: quoteId } }
        );

        res.status(200).send("Toegevoegd aan favorieten");
    } catch (err) {
        console.error("Fout bij toevoegen favoriet:", err);
        res.status(500).send("Toevoegen mislukt");
    }
});

router.post("/favorites/remove", secureMiddleware, async (req, res) => {
    if (!req.session.user) {
        res.status(401).send("Niet ingelogd");
        return;
    }

    const userId = new ObjectId(req.session.user._id);
    const { quoteId } = req.body;

    if (!quoteId) {
        res.status(400).send("Geen quoteId meegegeven");
        return;
    }

    const db = client.db("lotrgame");

    try {
        await db.collection("favorites").deleteOne({ userId, quoteId: String(quoteId) });

        await db.collection("users").updateOne(
            { _id: userId },
            { $pull: { favoriteQuotes: quoteId } }
        );

        res.redirect("/favorites");
    } catch (err) {
        console.error("Fout bij verwijderen uit favorites:", err);
        res.status(500).send("Verwijderen mislukt");
    }
});

router.get("/favorites/export", secureMiddleware, async (req, res) => {
    if (!req.session.user) {
        res.status(401).send("Niet ingelogd");
        return;
    }

    const userId = new ObjectId(req.session.user._id);
    const db = client.db("lotrgame");

    try {
        const favorites = await db.collection("favorites").find({ userId }).toArray();
        const quoteIds = favorites.map(f => f.quoteId);

        const quotes = await db.collection("quotes")
            .find({ _id: { $in: quoteIds } })
            .toArray();

        const textContent = quotes
            .map(q => `"${q.dialog}" - ${q.character || "Onbekend"}`)
            .join("\n");

        res.setHeader("Content-Type", "text/plain");
        res.setHeader("Content-Disposition", "attachment; filename=favorieten.txt");
        res.send(textContent);
    } catch (err) {
        console.error("Fout bij exporteren van favorieten:", err);
        res.status(500).send("Export mislukt");
    }
});

export default router;