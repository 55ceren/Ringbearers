import express from "express";
import gameRoutes from "./routers/gameRoutes"; 
import { connect } from "./database"

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use("/games", gameRoutes);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended:true}));

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("projects", { 
        
    });
});

app.get("/inlog", (req, res) => {
    res.render("inlog", {
        error: ""
    });
});  

app.post("/inlog", (req, res) => {
    let username: string = req.body.username;
    let password: string = req.body.password;
    let remember: string = req.body.remember;

    if (!username && !password) {
        return res.render("inlog", { error: "Zowel gebruikersnaam als wachtwoord zijn verplicht." });
    }
    
    if (!username) {
        return res.render("inlog", { error: "Gebruikersnaam is verplicht." });
    }

    if (!password) {
        return res.render("inlog", { error: "Wachtwoord is verplicht." });
    }

    res.redirect("/home");
});

app.get("/home", (req, res) => {
    res.render("home", {

    });
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
