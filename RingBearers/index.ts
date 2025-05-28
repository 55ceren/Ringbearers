import express from "express";
import sessionMiddleware from "./session";
import gameRoutes from "./routers/gameRoutes"; 
import userRoutes from "./routers/accountRoutes";
import shopRoutes from "./routers/shopRoutes";
import favoritesRoutes from "./routers/favoritesRoutes";
import blacklistRoutes from "./routers/blacklistRoutes";
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
app.use("/", favoritesRoutes);
app.use("/", blacklistRoutes);
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
