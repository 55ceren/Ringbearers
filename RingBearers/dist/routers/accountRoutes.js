"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../database");
const mongodb_1 = require("mongodb");
const secureMiddleware_1 = require("../secureMiddleware");
const router = express_1.default.Router();
router.get("/login", (req, res) => {
    if (req.session.user) {
        return res.redirect("/home");
    }
    const registered = req.query.registered === "true";
    const deleted = req.query.deleted === "true";
    res.render("login", {
        error: "",
        registered,
        deleted
    });
});
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.session.user) {
        return res.redirect("/home");
    }
    const username = req.body.username;
    const password = req.body.password;
    try {
        const user = yield (0, database_1.login)(username, password);
        req.session.user = user;
        res.redirect("/home");
    }
    catch (err) {
        res.render("login", {
            error: err.message,
            registered: false,
            deleted: false
        });
    }
}));
router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Fout bij uitloggen.");
        }
        res.redirect("/login");
    });
});
router.post("/delete-account", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.session.user._id;
    try {
        const db = database_1.client.db("lotrgame");
        yield db.collection("users").deleteOne({ _id: new mongodb_1.ObjectId(userId) });
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).send("Fout bij uitloggen na verwijderen.");
            }
            res.redirect("/login?deleted=true");
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Fout bij verwijderen van account.");
    }
}));
router.get("/register", (req, res) => {
    if (req.session.user) {
        return res.redirect("/home");
    }
    res.render("register", {
        error: ""
    });
});
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.session.user) {
        return res.redirect("/home");
    }
    const username = req.body.username;
    const password = req.body.password;
    const confirmPassword = req.body["confirm-password"];
    if (!username || !password || !confirmPassword) {
        return res.render("register", {
            error: "Vul alle velden in."
        });
    }
    if (password !== confirmPassword) {
        return res.render("register", {
            error: "Wachtwoorden komen niet overeen."
        });
    }
    try {
        yield (0, database_1.register)(username, password);
        res.redirect("/login?registered=true");
    }
    catch (err) {
        res.render("register", {
            error: err.message
        });
    }
}));
router.post("/update-profile-photo", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.session.user._id;
    const photo = req.body.photo;
    const db = database_1.client.db("lotrgame");
    yield db.collection("users").updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $set: { profilePhoto: photo } });
    req.session.user.profilePhoto = photo;
    res.sendStatus(200);
}));
exports.default = router;
