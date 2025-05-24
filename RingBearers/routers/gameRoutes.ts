import express from "express";
import { secureMiddleware } from "../secureMiddleware";

const router = express.Router();

router.get("/10rounds", secureMiddleware, (req, res) => {
    res.render("10rounds", {
        user: req.session.user,
    });
});

router.get("/blitz", secureMiddleware, (req, res) => {
    res.render("blitz", {
        user: req.session.user,
    });
});

router.get("/daily-challenge", secureMiddleware, (req, res) => {
    res.render("daily-challenge", {
        user: req.session.user,
    });
});

router.get("/hard", secureMiddleware, (req, res) => {
    res.render("hard", {
        user: req.session.user,
    });
});

router.get("/sudden-death", secureMiddleware, (req, res) => {
    res.render("sudden-death", {
        user: req.session.user,
    });
});

router.get("/team-battle", secureMiddleware, (req, res) => {
    res.render("team-battle", {
        user: req.session.user,
    });
});

export default router; 