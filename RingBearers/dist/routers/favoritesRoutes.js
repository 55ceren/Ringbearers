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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongodb_1 = require("mongodb");
const secureMiddleware_1 = require("../secureMiddleware");
const database_1 = require("../database");
const router = (0, express_1.Router)();
router.get("/favorites", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = database_1.client.db("lotrgame");
    if (!req.session.user) {
        res.status(401).send("Niet ingelogd");
        return;
    }
    const userId = new mongodb_1.ObjectId(req.session.user._id);
    try {
        const favorites = yield db.collection("favorites").find({ userId }).toArray();
        const characterIds = [...new Set(favorites.map(q => q.character))];
        const movieIds = [...new Set(favorites.map(q => q.movie))];
        const apiKey = "0QtkvkcNqsseU-8tvS3o";
        const characterFetches = characterIds.map(id => fetch(`https://the-one-api.dev/v2/character/${id}`, {
            headers: { Authorization: `Bearer ${apiKey}` }
        }).then(res => res.json()));
        const movieFetches = movieIds.map(id => fetch(`https://the-one-api.dev/v2/movie/${id}`, {
            headers: { Authorization: `Bearer ${apiKey}` }
        }).then(res => res.json()));
        const characterResults = yield Promise.all(characterFetches);
        const movieResults = yield Promise.all(movieFetches);
        const charactersMap = Object.fromEntries(characterResults
            .filter(c => { var _a; return (_a = c.docs) === null || _a === void 0 ? void 0 : _a[0]; })
            .map(c => [c.docs[0]._id, c.docs[0].name]));
        const moviesMap = Object.fromEntries(movieResults
            .filter(m => { var _a; return (_a = m.docs) === null || _a === void 0 ? void 0 : _a[0]; })
            .map(m => [m.docs[0]._id, m.docs[0].name]));
        const quotes = favorites.map(q => (Object.assign(Object.assign({}, q), { character: charactersMap[q.character] || "Onbekend", movie: moviesMap[q.movie] || "Onbekend" })));
        const characterCounts = quotes.reduce((acc, q) => {
            acc[q.character] = (acc[q.character] || 0) + 1;
            return acc;
        }, {});
        res.render("favorites", {
            quotes,
            characterCounts
        });
    }
    catch (err) {
        console.error("Fout bij ophalen van favorieten:", err);
        res.status(500).send("Er is iets misgegaan bij het ophalen van je favorieten.");
    }
}));
router.post("/favorites", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        res.status(401).send("Niet ingelogd");
        return;
    }
    const { quoteId, character, movie, dialog } = req.body;
    const userId = new mongodb_1.ObjectId(req.session.user._id);
    if (!quoteId || !character || !movie || !dialog) {
        res.status(400).send("Ontbrekende gegevens");
        return;
    }
    const db = database_1.client.db("lotrgame");
    try {
        yield db.collection("favorites").updateOne({ userId, quoteId }, { $set: { character, movie, dialog } }, { upsert: true });
        yield db.collection("users").updateOne({ _id: userId }, { $addToSet: { favoriteQuotes: quoteId } });
        res.status(200).send("Toegevoegd aan favorieten");
    }
    catch (err) {
        console.error("Fout bij toevoegen favoriet:", err);
        res.status(500).send("Toevoegen mislukt");
    }
}));
router.post("/favorites/remove", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        res.status(401).send("Niet ingelogd");
        return;
    }
    const userId = new mongodb_1.ObjectId(req.session.user._id);
    const { quoteId } = req.body;
    if (!quoteId) {
        res.status(400).send("Geen quoteId meegegeven");
        return;
    }
    const db = database_1.client.db("lotrgame");
    try {
        yield db.collection("favorites").deleteOne({ userId, quoteId: String(quoteId) });
        yield db.collection("users").updateOne({ _id: userId }, { $pull: { favoriteQuotes: quoteId } });
        res.redirect("/favorites");
    }
    catch (err) {
        console.error("Fout bij verwijderen uit favorites:", err);
        res.status(500).send("Verwijderen mislukt");
    }
}));
router.get("/favorites/export", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        res.status(401).send("Niet ingelogd");
        return;
    }
    const userId = new mongodb_1.ObjectId(req.session.user._id);
    const db = database_1.client.db("lotrgame");
    try {
        const favorites = yield db.collection("favorites").find({ userId }).toArray();
        const quoteIds = favorites.map(f => f.quoteId);
        const quotes = yield db.collection("quotes")
            .find({ _id: { $in: quoteIds } })
            .toArray();
        const textContent = quotes
            .map(q => `"${q.dialog}" - ${q.character || "Onbekend"}`)
            .join("\n");
        res.setHeader("Content-Type", "text/plain");
        res.setHeader("Content-Disposition", "attachment; filename=favorieten.txt");
        res.send(textContent);
    }
    catch (err) {
        console.error("Fout bij exporteren van favorieten:", err);
        res.status(500).send("Export mislukt");
    }
}));
exports.default = router;
