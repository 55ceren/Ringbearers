import express from "express";
import path from "path";

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.get("/", (req, res) => {
    res.render("index", { 
        title: "Welkom bij mijn site!"
    });
});

app.listen(3000, () => {
    console.log("Server is listening on http://localhost:3000")
})
