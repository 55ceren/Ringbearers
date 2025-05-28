import express from "express";
import sessionMiddleware from "./session";
import gameRoutes from "./routers/gameRoutes"; 
import userRoutes from "./routers/accountRoutes";
import shopRoutes from "./routers/shopRoutes";
import { connect, client, login, register } from "./database";
import { ObjectId } from "mongodb"; 
import { secureMiddleware } from "./secureMiddleware";

const app = express();

app.use(sessionMiddleware);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "views");

app.use("/", userRoutes);
app.use("/", gameRoutes);
app.use("/", shopRoutes);


app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("projects", { 
        
    });
});

app.get("/home", secureMiddleware, async (req, res) => {
    try {
        const userId = req.session.user!._id;

        const db = client.db("lotrgame");
        const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

        if (!user) {
            req.session.destroy(() => {});
            return res.redirect("/login");
        }

        res.render("home", {
            username: user.username,
            points: user.points,
            user
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Fout bij ophalen van gegevens.");
    }
});

app.post("/complete-quiz", secureMiddleware, async (req, res) => {
    if (!req.session.user) {
        res.status(401).send("Niet ingelogd");
        return;
    }

    const userId = req.session.user._id;
    const pointsEarned = parseFloat(req.body.points);

    try {
        const db = client.db("lotrgame");
        await db.collection("users").updateOne(
            { _id: new ObjectId(userId) },
            { $inc: { points: pointsEarned } } 
        );
        res.send("Quiz voltooid! Je hebt punten verdiend.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Fout bij bijwerken van je punten.");
    }
});

app.get("/favorites", secureMiddleware, async (req, res) => {
    const db = client.db("lotrgame");

    if (!req.session.user) {
        res.status(401).send("Niet ingelogd");
        return;
    }

    const userId = new ObjectId(req.session.user._id);

    try {
        const favorites = await db.collection("favorites").find({ userId }).toArray();

        console.log("Favorieten gevonden:", favorites);

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

app.post("/favorites", secureMiddleware, async (req, res) => {
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

        console.log("Favoriet toegevoegd of bijgewerkt:", { userId, quoteId, character, movie, dialog });

        res.status(200).send("Toegevoegd aan favorieten");
    } catch (err) {
        console.error("Fout bij toevoegen favoriet:", err);
        res.status(500).send("Toevoegen mislukt");
    }
});

app.post("/blacklist", secureMiddleware, async (req, res) => {
    if (!req.session.user) {
        res.status(401).send("Niet ingelogd");
        return;
    }

    const { quoteId, reason } = req.body;
    const userId = new ObjectId(req.session.user._id); 

    if (!quoteId || !reason) {
        res.status(400).send("Ontbrekende gegevens");
        return;
    }

    const db = client.db("lotrgame");

    type User = {
    _id: ObjectId;
    favoriteQuotes?: string[];
    blacklistedQuotes?: { quoteId: string; reason: string }[];
    };

    try {
        await db.collection("blacklist").updateOne(
            { userId, quoteId },
            { $set: { reason } },
            { upsert: true }
        );

        const user = await db.collection<User>("users").findOne({ _id: userId });

        const alreadyBlacklisted = user?.blacklistedQuotes?.some((q: { quoteId: string }) => q.quoteId === quoteId);

        if (!alreadyBlacklisted) {
            await db.collection<User>("users").updateOne(
            { _id: userId },
            { $push: { blacklistedQuotes: { quoteId, reason } } }
        );

        } else {
            await db.collection("users").updateOne(
                { _id: userId, "blacklistedQuotes.quoteId": quoteId },
                { $set: { "blacklistedQuotes.$.reason": reason } }
            );
        }

        res.status(200).send("Toegevoegd aan blacklist");
    } catch (err) {
        console.error("Fout bij blacklisten:", err);
        res.status(500).send("Blacklisten mislukt");
    }
});

app.get("/scoreboard", secureMiddleware, async (req, res) => {
    const db = client.db("lotrgame");

    try {
        const users = await db.collection("users")
            .find({}, { projection: { username: 1, points: 1, selectedAvatar: 1 } })
            .sort({ points: -1 })
            .toArray();

        res.render("scoreboard", { 
            currentUser: req.session.user,
            users
        });
    } catch (err) {
        console.error("Fout bij ophalen scoreboard:", err);
        res.status(500).send("Fout bij het ophalen van het scorebord.");
    }
});

app.get("/settings", secureMiddleware, async (req, res) => {
    const db = client.db("lotrgame");
    const user = await db.collection("users").findOne({ _id: new ObjectId(req.session.user!._id) });
    if (!user) return res.redirect("/login");
    res.render("settings", { 
        user 
    });
});

app.post("/update-background", secureMiddleware, async (req, res) => {
    if (!req.session.user) {
        res.status(401).send("Niet ingelogd");
        return;
    }

    const userId = req.session.user._id;
    const { background } = req.body;

    if (!background) {
        res.status(400).send("Geen achtergrond opgegeven.");
        return;
    }

    const defaultBackgrounds = [
        "/images/lord-of-the-rings-amazon-studios.png.webp"
    ];

    try {
        const db = client.db("lotrgame");
        const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

        if (!user || ![...user.ownedBackgrounds, ...defaultBackgrounds].includes(background)) {
            res.status(403).send("Je bezit deze achtergrond niet.");
            return;
        }

        await db.collection("users").updateOne(
            { _id: new ObjectId(userId) },
            { $set: { selectedBackground: background } }
        );

        req.session.user.selectedBackground = background;

        res.send("Achtergrond bijgewerkt.");
    } catch (err) {
        console.error("Fout bij bijwerken achtergrond:", err);
        res.status(500).send("Fout bij het bijwerken van de achtergrond.");
    }
});

app.post("/update-avatar", secureMiddleware, async (req, res) => {
    if (!req.session.user) {
        res.status(401).send("Niet ingelogd");
        return;
    }

    const userId = req.session.user._id;
    const { avatar } = req.body;

    if (!avatar) {
        res.status(400).send("Geen avatar opgegeven.");
        return;
    }

    const defaultAvatars = [
        "/images/settings/gezicht1.jpg",
        "/images/settings/gezicht2.jpg",
        "/images/settings/gezicht3.jpg",
        "/images/settings/gezicht4.jpg"
    ];

    try {
        const db = client.db("lotrgame");
        const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

        if (!user) {
            res.status(404).send("Gebruiker niet gevonden.");
            return;
        }

        if (![...user.ownedAvatars, ...defaultAvatars].includes(avatar)) {
            res.status(403).send("Je bezit deze avatar niet.");
            return;
        }

        await db.collection("users").updateOne(
            { _id: new ObjectId(userId) },
            { $set: { selectedAvatar: avatar } }
        );

        req.session.user.selectedAvatar = avatar;

        res.send("Avatar bijgewerkt.");
    } catch (err) {
        console.error("Fout bij bijwerken avatar:", err);
        res.status(500).send("Fout bij het bijwerken van de avatar.");
    }
});

app.use((req, res) => {
    res.status(404).send("404 Not Found");
});

app.listen(3000, async () => {
    await connect();
    console.log("Server is running on port 3000");
});
