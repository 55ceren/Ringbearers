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
const session_1 = __importDefault(require("./session"));
const gameRoutes_1 = __importDefault(require("./routers/gameRoutes"));
const accountRoutes_1 = __importDefault(require("./routers/accountRoutes"));
const shopRoutes_1 = __importDefault(require("./routers/shopRoutes"));
const favoritesRoutes_1 = __importDefault(require("./routers/favoritesRoutes"));
const blacklistRoutes_1 = __importDefault(require("./routers/blacklistRoutes"));
const database_1 = require("./database");
const mongodb_1 = require("mongodb");
const secureMiddleware_1 = require("./secureMiddleware");
const app = (0, express_1.default)();
app.use(session_1.default);
app.use(express_1.default.json({ limit: "1mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", "views");
app.use("/", accountRoutes_1.default);
app.use("/", favoritesRoutes_1.default);
app.use("/", blacklistRoutes_1.default);
app.use("/", gameRoutes_1.default);
app.use("/", shopRoutes_1.default);
app.use(express_1.default.static("public"));
app.get("/", (req, res) => {
    res.render("projects", {});
});
app.get("/home", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.session.user._id;
        const db = database_1.client.db("lotrgame");
        const user = yield db.collection("users").findOne({ _id: new mongodb_1.ObjectId(userId) });
        if (!user) {
            req.session.destroy(() => { });
            return res.redirect("/login");
        }
        res.render("home", {
            username: user.username,
            points: user.points,
            user
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Fout bij ophalen van gegevens.");
    }
}));
app.post("/complete-quiz", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        res.status(401).send("Niet ingelogd");
        return;
    }
    const userId = req.session.user._id;
    const pointsEarned = parseFloat(req.body.points);
    try {
        const db = database_1.client.db("lotrgame");
        yield db.collection("users").updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $inc: { points: pointsEarned } });
        res.send("Quiz voltooid! Je hebt punten verdiend.");
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Fout bij bijwerken van je punten.");
    }
}));
app.get("/scoreboard", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = database_1.client.db("lotrgame");
    try {
        const users = yield db.collection("users")
            .find({}, { projection: { username: 1, points: 1, selectedAvatar: 1 } })
            .sort({ points: -1 })
            .toArray();
        res.render("scoreboard", {
            currentUser: req.session.user,
            users
        });
    }
    catch (err) {
        console.error("Fout bij ophalen scoreboard:", err);
        res.status(500).send("Fout bij het ophalen van het scorebord.");
    }
}));
app.get("/settings", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = database_1.client.db("lotrgame");
    const user = yield db.collection("users").findOne({ _id: new mongodb_1.ObjectId(req.session.user._id) });
    if (!user)
        return res.redirect("/login");
    res.render("settings", {
        user
    });
}));
app.post("/update-background", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        res.status(401).send("Niet ingelogd");
        return;
    }
    const userId = req.session.user._id;
    const { background } = req.body;
    if (!background) {
        res.status(400).send("Geen achtergrond opgegeven.");
        return;
    }
    const defaultBackgrounds = [
        "/images/lord-of-the-rings-amazon-studios.png.webp"
    ];
    try {
        const db = database_1.client.db("lotrgame");
        const user = yield db.collection("users").findOne({ _id: new mongodb_1.ObjectId(userId) });
        if (!user || ![...user.ownedBackgrounds, ...defaultBackgrounds].includes(background)) {
            res.status(403).send("Je bezit deze achtergrond niet.");
            return;
        }
        yield db.collection("users").updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $set: { selectedBackground: background } });
        req.session.user.selectedBackground = background;
        res.send("Achtergrond bijgewerkt.");
    }
    catch (err) {
        console.error("Fout bij bijwerken achtergrond:", err);
        res.status(500).send("Fout bij het bijwerken van de achtergrond.");
    }
}));
app.post("/update-avatar", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        res.status(401).send("Niet ingelogd");
        return;
    }
    const userId = req.session.user._id;
    const { avatar } = req.body;
    if (!avatar) {
        res.status(400).send("Geen avatar opgegeven.");
        return;
    }
    const defaultAvatars = [
        "/images/settings/gezicht1.jpg",
        "/images/settings/gezicht2.jpg",
        "/images/settings/gezicht3.jpg",
        "/images/settings/gezicht4.jpg"
    ];
    try {
        const db = database_1.client.db("lotrgame");
        const user = yield db.collection("users").findOne({ _id: new mongodb_1.ObjectId(userId) });
        if (!user) {
            res.status(404).send("Gebruiker niet gevonden.");
            return;
        }
        if (![...user.ownedAvatars, ...defaultAvatars].includes(avatar)) {
            res.status(403).send("Je bezit deze avatar niet.");
            return;
        }
        yield db.collection("users").updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $set: { selectedAvatar: avatar } });
        req.session.user.selectedAvatar = avatar;
        res.send("Avatar bijgewerkt.");
    }
    catch (err) {
        console.error("Fout bij bijwerken avatar:", err);
        res.status(500).send("Fout bij het bijwerken van de avatar.");
    }
}));
app.use((req, res) => {
    res.status(404).send("404 Not Found");
});
app.listen(3000, () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, database_1.connect)();
    console.log("Server is running on port 3000");
}));
