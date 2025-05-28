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
exports.client = exports.MONGODB_URI = void 0;
exports.loadLotrDataIfEmpty = loadLotrDataIfEmpty;
exports.connect = connect;
exports.login = login;
exports.register = register;
const mongodb_1 = require("mongodb");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const uri = process.env.MONGODB_URI;
exports.MONGODB_URI = uri;
exports.client = new mongodb_1.MongoClient(uri);
const apiKey = process.env.LOTR_API_KEY;
function exit() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.client.close();
            console.log("Disconnected from database");
        }
        catch (error) {
            console.error(error);
        }
        process.exit(0);
    });
}
function loadLotrDataIfEmpty() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = exports.client.db("lotrgame");
        const quotesCollection = db.collection("quotes");
        const charactersCollection = db.collection("characters");
        const quoteCount = yield quotesCollection.countDocuments();
        const characterCount = yield charactersCollection.countDocuments();
        if (quoteCount === 0) {
            console.log("Quotes-collectie is leeg, ophalen van API...");
            const quoteRes = yield fetch("https://the-one-api.dev/v2/quote", {
                headers: { "Authorization": `Bearer ${apiKey}` }
            });
            const quoteData = yield quoteRes.json();
            yield quotesCollection.insertMany(quoteData.docs);
            console.log(`${quoteData.docs.length} quotes opgeslagen.`);
        }
        if (characterCount === 0) {
            console.log("Characters-collectie is leeg, ophalen van API...");
            const charRes = yield fetch("https://the-one-api.dev/v2/character", {
                headers: { "Authorization": `Bearer ${apiKey}` }
            });
            const characterData = yield charRes.json();
            yield charactersCollection.insertMany(characterData.docs);
            console.log(`${characterData.docs.length} characters opgeslagen.`);
        }
    });
}
function connect() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.client.connect();
            console.log("Connected to database");
            yield loadLotrDataIfEmpty();
            process.on("SIGINT", exit);
        }
        catch (error) {
            console.error(error);
        }
    });
}
function login(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!username || !password) {
            throw new Error("Gebruikersnaam en wachtwoord zijn verplicht.");
        }
        const db = exports.client.db("lotrgame");
        const user = yield db.collection("users").findOne({ username });
        if (!user) {
            throw new Error("Gebruiker niet gevonden.");
        }
        const match = yield bcrypt_1.default.compare(password, user.password);
        if (!match) {
            throw new Error("Onjuist wachtwoord.");
        }
        return {
            _id: user._id.toString(),
            username: user.username,
            points: user.points,
            profilePhoto: user.profilePhoto || "gezicht1.jpg"
        };
    });
}
function register(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const db = exports.client.db("lotrgame");
        const existingUser = yield db.collection("users").findOne({ username });
        if (existingUser) {
            throw new Error("Gebruikersnaam is al in gebruik.");
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        yield db.collection("users").insertOne({
            username,
            password: hashedPassword,
            points: 0,
            ownedAvatars: [],
            ownedBackgrounds: [],
            selectedAvatar: "",
            selectedBackground: ""
        });
    });
}
