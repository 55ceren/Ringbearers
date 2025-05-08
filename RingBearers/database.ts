import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config(); 

const uri = process.env.MONGODB_URI!;
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