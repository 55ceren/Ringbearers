import express from "express";
import { secureMiddleware } from "../secureMiddleware";

const router = express.Router();

router.get("/10rounds", secureMiddleware, (req, res) => {
    res.render("10rounds", {

    });
});

router.get("/blitz", secureMiddleware, (req, res) => {
    res.render("blitz", {

    });
});

router.get("/daily-challenge", secureMiddleware, (req, res) => {
    res.render("daily-challenge", {

    });
});

router.get("/hard", secureMiddleware, (req, res) => {
    res.render("hard", {

    });
});

router.get("/sudden-death", secureMiddleware, (req, res) => {
    res.render("sudden-death", {

    });
});

router.get("/team-battle", secureMiddleware, (req, res) => {
    res.render("team-battle", {

    });
});

export default router; 