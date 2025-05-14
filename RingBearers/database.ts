import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { User } from "./types";

dotenv.config(); 

const uri = process.env.MONGODB_URI!;
export const MONGODB_URI = uri;
export const client = new MongoClient(uri);

const apiKey = process.env.LOTR_API_KEY;

async function exit() {
    try {
        await client.close();
        console.log("Disconnected from database");
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
}

export async function loadLotrDataIfEmpty() {
    const db = client.db("lotrgame");
    const quotesCollection = db.collection("quotes");
    const charactersCollection = db.collection("characters");

    const quoteCount = await quotesCollection.countDocuments();
    const characterCount = await charactersCollection.countDocuments();

    if (quoteCount === 0) {
        console.log("Quotes-collectie is leeg, ophalen van API...");
        const quoteRes = await fetch("https://the-one-api.dev/v2/quote", {
            headers: { "Authorization": `Bearer ${apiKey}` }
        });
        const quoteData = await quoteRes.json();
        await quotesCollection.insertMany(quoteData.docs);
        console.log(`${quoteData.docs.length} quotes opgeslagen.`);
    }

    if (characterCount === 0) {
        console.log("Characters-collectie is leeg, ophalen van API...");
        const charRes = await fetch("https://the-one-api.dev/v2/character", {
            headers: { "Authorization": `Bearer ${apiKey}` }
        });
        const characterData = await charRes.json();
        await charactersCollection.insertMany(characterData.docs);
        console.log(`${characterData.docs.length} characters opgeslagen.`);
    }
}

export async function connect() {
    try {
        await client.connect();        
        console.log("Connected to database");

        await loadLotrDataIfEmpty();

        process.on("SIGINT", exit);
    } catch (error) {
        console.error(error);
    }
}

export async function login(username: string, password: string): Promise<User> {
    if (!username || !password) {
        throw new Error("Gebruikersnaam en wachtwoord zijn verplicht.");
    }

    const db = client.db("lotrgame");
    const user = await db.collection("users").findOne({ username });

    if (!user) {
        throw new Error("Gebruiker niet gevonden.");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        throw new Error("Onjuist wachtwoord.");
    }

    return {
        _id: user._id.toString(),
        username: user.username,
        points: user.points
    };
}

export async function register(username: string, password: string): Promise<void> {
    if (!username || !password) {
        throw new Error("Gebruikersnaam en wachtwoord zijn verplicht.");
    }

    const db = client.db("lotrgame");
    const existingUser = await db.collection("users").findOne({ username });

    if (existingUser) {
        throw new Error("Gebruikersnaam bestaat al.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection("users").insertOne({
        username,
        password: hashedPassword,
        points: 0
    });
}