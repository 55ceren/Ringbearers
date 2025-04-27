import express from "express";

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("projects", { 
        
    });
});

app.get("/inlog", (req, res) => {
    res.render("inlog", {

    });
});  

app.get("/home", (req, res) => {
    res.render("home", {

    });
});

app.get("/10rounds", (req, res) => {
    res.render("10rounds", {

    });
});

app.get("/blitz", (req, res) => {
    res.render("blitz", {

    });
});

app.get("/daily-challenge", (req, res) => {
    res.render("daily-challenge", {

    });
});

app.get("/friendlist", (req, res) => {
    res.render("friendlist", {

    });
});

app.get("/hard", (req, res) => {
    res.render("hard", {

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

app.get("/sudden-death", (req, res) => {
    res.render("sudden-death", {

    });
});

app.get("/team-battle", (req, res) => {
    res.render("team-battle", {

    });
});

app.use((req, res) => {
    res.status(404).send("404 Not Found");
});

app.listen(3000, () => {
    console.log("Server is listening on http://localhost:3000")
})
