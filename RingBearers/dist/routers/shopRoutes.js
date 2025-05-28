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
router.get("/shop", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.session.user._id;
    const db = database_1.client.db("lotrgame");
    const user = yield db.collection("users").findOne({ _id: new mongodb_1.ObjectId(userId) });
    if (!user) {
        req.session.destroy(() => { });
        return res.redirect("/login");
    }
    res.render("shop", {
        user
    });
}));
router.post("/purchase", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { name, price, type, url } = req.body;
    const userId = req.session.user._id;
    const db = database_1.client.db("lotrgame");
    const user = yield db.collection("users").findOne({ _id: new mongodb_1.ObjectId(userId) });
    if (!user) {
        res.status(404).send("Gebruiker niet gevonden.");
        return;
    }
    if (user.points < price) {
        res.status(400).send("Onvoldoende punten.");
        return;
    }
    const update = { $inc: { points: -price } };
    if (type === "avatar") {
        if ((_a = user.ownedAvatars) === null || _a === void 0 ? void 0 : _a.includes(url)) {
            res.status(400).send("Item al gekocht.");
            return;
        }
        update.$addToSet = { ownedAvatars: url };
    }
    else if (type === "background") {
        if ((_b = user.ownedBackgrounds) === null || _b === void 0 ? void 0 : _b.includes(url)) {
            res.status(400).send("Item al gekocht.");
            return;
        }
        update.$addToSet = { ownedBackgrounds: url };
    }
    else {
        res.status(400).send("Ongeldig itemtype.");
        return;
    }
    yield db.collection("users").updateOne({ _id: new mongodb_1.ObjectId(userId) }, update);
    res.send("Item succesvol gekocht!");
}));
router.post("/set-item", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { type, url } = req.body;
    const userId = req.session.user._id;
    const db = database_1.client.db("lotrgame");
    const user = yield db.collection("users").findOne({ _id: new mongodb_1.ObjectId(userId) });
    if (!user) {
        res.status(404).send("Gebruiker niet gevonden.");
        return;
    }
    if (type === "avatar" && ((_a = user.ownedAvatars) === null || _a === void 0 ? void 0 : _a.includes(url))) {
        yield db.collection("users").updateOne({ _id: new mongodb_1.ObjectId(userId) }, {
            $set: { selectedAvatar: url }
        });
        res.send("Avatar ingesteld!");
        return;
    }
    if (type === "background" && ((_b = user.ownedBackgrounds) === null || _b === void 0 ? void 0 : _b.includes(url))) {
        yield db.collection("users").updateOne({ _id: new mongodb_1.ObjectId(userId) }, {
            $set: { selectedBackground: url }
        });
        res.send("Achtergrond ingesteld!");
        return;
    }
    res.status(400).send("Je bezit dit item niet.");
}));
exports.default = router;
