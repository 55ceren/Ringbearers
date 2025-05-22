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
            points: user.points
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

app.get("/friendlist", secureMiddleware, (req, res) => {
    res.render("friendlist", {
        user: req.session.user 
    });
});

app.get("/inbox", secureMiddleware, (req, res) => {
    res.render("inbox", {
        user: req.session.user 
    });
});

app.get("/scoreboard", secureMiddleware, (req, res) => {
    res.render("scoreboard", {
        user: req.session.user 
    });
});

app.get("/settings", secureMiddleware, (req, res) => {
    res.render("settings", {
        user: req.session.user 
    });
});

app.use((req, res) => {
    res.status(404).send("404 Not Found");
});

app.listen(3000, async () => {
    await connect();
    console.log("Server is running on port 3000");
});
