"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const secureMiddleware_1 = require("../secureMiddleware");
const router = express_1.default.Router();
router.get("/10rounds", secureMiddleware_1.secureMiddleware, (req, res) => {
    res.render("10rounds", {
        user: req.session.user,
    });
});
router.get("/blitz", secureMiddleware_1.secureMiddleware, (req, res) => {
    res.render("blitz", {
        user: req.session.user,
    });
});
router.get("/daily-challenge", secureMiddleware_1.secureMiddleware, (req, res) => {
    res.render("daily-challenge", {
        user: req.session.user,
    });
});
router.get("/hard", secureMiddleware_1.secureMiddleware, (req, res) => {
    res.render("hard", {
        user: req.session.user,
    });
});
router.get("/sudden-death", secureMiddleware_1.secureMiddleware, (req, res) => {
    res.render("sudden-death", {
        user: req.session.user,
    });
});
router.get("/team-battle", secureMiddleware_1.secureMiddleware, (req, res) => {
    res.render("team-battle", {
        user: req.session.user,
    });
});
exports.default = router;
