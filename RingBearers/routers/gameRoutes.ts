import express from "express";

const router = express.Router();

router.get("/10rounds", (req, res) => {
    res.render("10rounds", {

    });
});

router.get("/blitz", (req, res) => {
    res.render("blitz", {

    });
});

router.get("/daily-challenge", (req, res) => {
    res.render("daily-challenge", {

    });
});

router.get("/hard", (req, res) => {
    res.render("hard", {

    });
});

router.get("/sudden-death", (req, res) => {
    res.render("sudden-death", {

    });
});

router.get("/team-battle", (req, res) => {
    res.render("team-battle", {

    });
});

export default router; 