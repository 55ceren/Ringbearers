import { Router } from "express";
import { ObjectId } from "mongodb";
import { secureMiddleware } from "../secureMiddleware";
import { client } from "../database";

const router = Router();

router.get("/blacklist", secureMiddleware, async (req, res) => {
    const db = client.db("lotrgame");

    if (!req.session.user) {
        res.status(401).send("Niet ingelogd");
        return;
    }

    const userId = new ObjectId(req.session.user._id);

    console.log("Request body:", req.body);


    try {
        const blacklist = await db.collection("blacklist").find({ userId }).toArray();
        const quoteIds = blacklist.map(item => item.quoteId);
        const quotes = await db.collection("quotes").find({ _id: { $in: quoteIds } }).toArray();

        const characterIds = [...new Set(quotes.map(q => q.character))];
        const movieIds = [...new Set(quotes.map(q => q.movie))];

        const apiKey = "0QtkvkcNqsseU-8tvS3o";

        const characterResults = await Promise.all(characterIds.map(id =>
            fetch(`https://the-one-api.dev/v2/character/${id}`, {
                headers: { Authorization: `Bearer ${apiKey}` }
            }).then(res => res.json())
        ));

        const movieResults = await Promise.all(movieIds.map(id =>
            fetch(`https://the-one-api.dev/v2/movie/${id}`, {
                headers: { Authorization: `Bearer ${apiKey}` }
            }).then(res => res.json())
        ));

        const charactersMap = Object.fromEntries(
            characterResults.filter(c => c.docs?.[0]).map(c => [c.docs[0]._id, c.docs[0].name])
        );

        const moviesMap = Object.fromEntries(
            movieResults.filter(m => m.docs?.[0]).map(m => [m.docs[0]._id, m.docs[0].name])
        );

        const enrichedBlacklist = blacklist.map(item => {
            const quote = quotes.find(q => q._id === item.quoteId);

            return {
                quoteId: item.quoteId,
                reason: item.reason,
                dialog: quote?.dialog || "[Geen dialog]",
                character: quote?.character ? charactersMap[quote.character] : "Onbekend",
                movie: quote?.movie ? moviesMap[quote.movie] : "Onbekend"
            };
        });

        res.render("blacklist", { quotes: enrichedBlacklist });
    } catch (err) {
        console.error("Fout bij ophalen van blacklist:", err);
        res.status(500).send("Er is iets misgegaan bij het ophalen van je blacklist.");
    }
});

router.post("/blacklist", secureMiddleware, async (req, res) => {
    if (!req.session.user) {
        res.status(401).send("Niet ingelogd");
        return;
    }

    const { quoteId, character, movie, dialog, reason } = req.body;
    const userId = new ObjectId(req.session.user._id);

    if (!quoteId || !reason || !character || !movie || !dialog) {
        res.status(400).send("Ontbrekende gegevens");
        return;
    }

    const db = client.db("lotrgame");

    try {
        // Zorg dat quoteId een ObjectId is bij query
        await db.collection("quotes").updateOne(
            { _id: new ObjectId(quoteId) },
            { $setOnInsert: { character, movie, dialog } },
            { upsert: true }
        );

        await db.collection("blacklist").updateOne(
            { userId, quoteId: new ObjectId(quoteId) },
            { $set: { reason } },
            { upsert: true }
        );

        const user = await db.collection("users").findOne({ _id: userId });

        const alreadyBlacklisted = user?.blacklistedQuotes?.some((q: { quoteId: any }) => q.quoteId.toString() === quoteId);

        if (!alreadyBlacklisted) {
            await db.collection("users").updateOne(
                { _id: userId },
                { $push: { blacklistedQuotes: { quoteId: new ObjectId(quoteId), reason } } } as any
            );
        } else {
            await db.collection("users").updateOne(
                { _id: userId, "blacklistedQuotes.quoteId": new ObjectId(quoteId) },
                { $set: { "blacklistedQuotes.$.reason": reason } }
            );
        }

        res.status(200).send("Toegevoegd aan blacklist");
    } catch (err) {
        console.error("Fout bij blacklisten:", err);
        res.status(500).send("Blacklisten mislukt");
    }
});

router.post("/blacklist/update-reason", secureMiddleware, async (req, res) => {
    if (!req.session.user){
        res.status(401).send("Niet ingelogd");
        return 
    } 

    const userId = new ObjectId(req.session.user._id);
    const { quoteId, reason } = req.body;

    if (!quoteId || typeof reason !== 'string') {
        res.status(400).send("Ongeldige gegevens");
        return
    }

    const db = client.db("lotrgame");

    try {
        await db.collection("blacklist").updateOne(
            { userId, quoteId },
            { $set: { reason } }
        );

        await db.collection("users").updateOne(
            { _id: userId, "blacklistedQuotes.quoteId": quoteId },
            { $set: { "blacklistedQuotes.$.reason": reason } }
        );

        res.redirect("/blacklist");
    } catch (err) {
        console.error("Fout bij updaten reden:", err);
        res.status(500).send("Reden bijwerken mislukt");
    }
});

router.post("/blacklist/remove", secureMiddleware, async (req, res) => {
    if (!req.session.user){
        res.status(401).send("Niet ingelogd");
        return 
    } 

    const userId = new ObjectId(req.session.user._id);
    const { quoteId } = req.body;

    if (!quoteId){
        res.status(400).send("Geen quoteId meegegeven");
        return 
    } 

    const db = client.db("lotrgame");

    try {
        await db.collection("blacklist").deleteOne({ userId, quoteId });

        await db.collection("users").updateOne(
            { _id: userId },
            { $pull: { blacklistedQuotes: { quoteId: quoteId } } } as any
        );

        res.redirect("/blacklist");
    } catch (err) {
        console.error("Fout bij verwijderen uit blacklist:", err);
        res.status(500).send("Verwijderen mislukt");
    }
});

export default router;