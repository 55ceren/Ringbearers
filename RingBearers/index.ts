import express from "express";
import sessionMiddleware from "./session";
import gameRoutes from "./routers/gameRoutes"; 
import { connect, client, login, register } from "./database";
import { ObjectId } from "mongodb"; 

const app = express();

app.use(sessionMiddleware);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "views");

app.use("/", gameRoutes);

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("projects", { 
        
    });
});

app.get("/home", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/inlog");
    }

    try {
        const db = client.db("lotrgame");
        const user = await db.collection("users").findOne({ _id: new ObjectId(req.session.user._id) });

        if (!user) {
            req.session.destroy(() => {});
            return res.redirect("/inlog");
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


app.get("/inlog", (req, res) => {
    res.render("inlog", { error: "" });
});

app.post("/inlog", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const user = await login(username, password);
        req.session.user = user;
        res.redirect("/home");
    } catch (err: any) {
        res.render("inlog", { 
            error: err.message 
        });
    }
});

app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Fout bij uitloggen.");
        }
        res.redirect("/inlog");
    });
});

app.get("/register", (req, res) => {
    res.render("register", { 
        error: "" 
    });
});

app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    try {
        await register(username, password);
        res.redirect("/inlog");
    } catch (err: any) {
        res.render("register", { error: err.message });
    }
});

app.post("/complete-quiz", async (req, res) => {
    if (!req.session.user) {
        res.status(401).send("Niet ingelogd");
        return;
    }

    const userId = req.session.user._id;
    const pointsEarned = parseInt(req.body.points);

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

app.get("/friendlist", (req, res) => {
    res.render("friendlist", {

    });
});

app.get("/inbox", (req, res) => {
    res.render("inbox", {

    });
});

app.get("/scoreboard", (req, res) => {
    res.render("scoreboard", {

    });
});

app.get("/settings", (req, res) => {
    res.render("settings", {

    });
});

app.get("/shop", (req, res) => {
    res.render("shop", {

    });
});

app.use((req, res) => {
    res.status(404).send("404 Not Found");
});

app.listen(3000, async () => {
    await connect();
    console.log("Server is running on port 3000");
});
