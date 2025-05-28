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
router.get("/blacklist", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = database_1.client.db("lotrgame");
    if (!req.session.user) {
        res.status(401).send("Niet ingelogd");
        return;
    }
    const userId = new mongodb_1.ObjectId(req.session.user._id);
    console.log("Request body:", req.body);
    try {
        const blacklist = yield db.collection("blacklist").find({ userId }).toArray();
        const quoteIds = blacklist.map(item => item.quoteId);
        const quotes = yield db.collection("quotes").find({ _id: { $in: quoteIds } }).toArray();
        const characterIds = [...new Set(quotes.map(q => q.character))];
        const movieIds = [...new Set(quotes.map(q => q.movie))];
        const apiKey = "0QtkvkcNqsseU-8tvS3o";
        const characterResults = yield Promise.all(characterIds.map(id => fetch(`https://the-one-api.dev/v2/character/${id}`, {
            headers: { Authorization: `Bearer ${apiKey}` }
        }).then(res => res.json())));
        const movieResults = yield Promise.all(movieIds.map(id => fetch(`https://the-one-api.dev/v2/movie/${id}`, {
            headers: { Authorization: `Bearer ${apiKey}` }
        }).then(res => res.json())));
        const charactersMap = Object.fromEntries(characterResults.filter(c => { var _a; return (_a = c.docs) === null || _a === void 0 ? void 0 : _a[0]; }).map(c => [c.docs[0]._id, c.docs[0].name]));
        const moviesMap = Object.fromEntries(movieResults.filter(m => { var _a; return (_a = m.docs) === null || _a === void 0 ? void 0 : _a[0]; }).map(m => [m.docs[0]._id, m.docs[0].name]));
        const enrichedBlacklist = blacklist.map(item => {
            const quote = quotes.find(q => q._id === item.quoteId);
            return {
                quoteId: item.quoteId,
                reason: item.reason,
                dialog: (quote === null || quote === void 0 ? void 0 : quote.dialog) || "[Geen dialog]",
                character: (quote === null || quote === void 0 ? void 0 : quote.character) ? charactersMap[quote.character] : "Onbekend",
                movie: (quote === null || quote === void 0 ? void 0 : quote.movie) ? moviesMap[quote.movie] : "Onbekend"
            };
        });
        res.render("blacklist", { quotes: enrichedBlacklist });
    }
    catch (err) {
        console.error("Fout bij ophalen van blacklist:", err);
        res.status(500).send("Er is iets misgegaan bij het ophalen van je blacklist.");
    }
}));
router.post("/blacklist", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!req.session.user) {
        res.status(401).send("Niet ingelogd");
        return;
    }
    const { quoteId, character, movie, dialog, reason } = req.body;
    const userId = new mongodb_1.ObjectId(req.session.user._id);
    if (!quoteId || !reason || !character || !movie || !dialog) {
        res.status(400).send("Ontbrekende gegevens");
        return;
    }
    const db = database_1.client.db("lotrgame");
    try {
        // Zorg dat quoteId een ObjectId is bij query
        yield db.collection("quotes").updateOne({ _id: new mongodb_1.ObjectId(quoteId) }, { $setOnInsert: { character, movie, dialog } }, { upsert: true });
        yield db.collection("blacklist").updateOne({ userId, quoteId: new mongodb_1.ObjectId(quoteId) }, { $set: { reason } }, { upsert: true });
        const user = yield db.collection("users").findOne({ _id: userId });
        const alreadyBlacklisted = (_a = user === null || user === void 0 ? void 0 : user.blacklistedQuotes) === null || _a === void 0 ? void 0 : _a.some((q) => q.quoteId.toString() === quoteId);
        if (!alreadyBlacklisted) {
            yield db.collection("users").updateOne({ _id: userId }, { $push: { blacklistedQuotes: { quoteId: new mongodb_1.ObjectId(quoteId), reason } } });
        }
        else {
            yield db.collection("users").updateOne({ _id: userId, "blacklistedQuotes.quoteId": new mongodb_1.ObjectId(quoteId) }, { $set: { "blacklistedQuotes.$.reason": reason } });
        }
        res.status(200).send("Toegevoegd aan blacklist");
    }
    catch (err) {
        console.error("Fout bij blacklisten:", err);
        res.status(500).send("Blacklisten mislukt");
    }
}));
router.post("/blacklist/update-reason", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        res.status(401).send("Niet ingelogd");
        return;
    }
    const userId = new mongodb_1.ObjectId(req.session.user._id);
    const { quoteId, reason } = req.body;
    if (!quoteId || typeof reason !== 'string') {
        res.status(400).send("Ongeldige gegevens");
        return;
    }
    const db = database_1.client.db("lotrgame");
    try {
        yield db.collection("blacklist").updateOne({ userId, quoteId }, { $set: { reason } });
        yield db.collection("users").updateOne({ _id: userId, "blacklistedQuotes.quoteId": quoteId }, { $set: { "blacklistedQuotes.$.reason": reason } });
        res.redirect("/blacklist");
    }
    catch (err) {
        console.error("Fout bij updaten reden:", err);
        res.status(500).send("Reden bijwerken mislukt");
    }
}));
router.post("/blacklist/remove", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield db.collection("blacklist").deleteOne({ userId, quoteId });
        yield db.collection("users").updateOne({ _id: userId }, { $pull: { blacklistedQuotes: { quoteId: quoteId } } });
        res.redirect("/blacklist");
    }
    catch (err) {
        console.error("Fout bij verwijderen uit blacklist:", err);
        res.status(500).send("Verwijderen mislukt");
    }
}));
exports.default = router;
