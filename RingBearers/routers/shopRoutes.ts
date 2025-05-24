import express from "express";
import { client } from "../database";
import { ObjectId } from "mongodb";
import { secureMiddleware } from "../secureMiddleware";

const router = express.Router();

router.get("/shop", secureMiddleware, async (req, res) => {
    const userId = req.session.user!._id;
    const db = client.db("lotrgame");
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

    if (!user) {
        req.session.destroy(() => {});
        return res.redirect("/login");
    }

    res.render("shop", { 
        user 
    });
});

router.post("/purchase", secureMiddleware, async (req, res) => {
    const { name, price, type, url } = req.body;
    const userId = req.session.user!._id;

    const db = client.db("lotrgame");
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

    if (!user){
        res.status(404).send("Gebruiker niet gevonden.");
        return
    } 
    if (user.points < price){
         res.status(400).send("Onvoldoende punten.");
        return
    } 

    const update: any = { $inc: { points: -price } };
    
    if (type === "avatar") {
        if (user.ownedAvatars?.includes(url)){
            res.status(400).send("Item al gekocht.");
            return
        } 
        update.$addToSet = { ownedAvatars: url };
    } else if (type === "background") {
        if (user.ownedBackgrounds?.includes(url)){
            res.status(400).send("Item al gekocht.");
            return
        } 
        update.$addToSet = { ownedBackgrounds: url };
    } else {
        res.status(400).send("Ongeldig itemtype.");
        return
    }

    await db.collection("users").updateOne({ _id: new ObjectId(userId) }, update);
    res.send("Item succesvol gekocht!");
});

router.post("/set-item", secureMiddleware, async (req, res) => {
    const { type, url } = req.body;
    const userId = req.session.user!._id;
    const db = client.db("lotrgame");
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

    if (!user){
        res.status(404).send("Gebruiker niet gevonden.");
        return
    } 

    if (type === "avatar" && user.ownedAvatars?.includes(url)) {
        await db.collection("users").updateOne({ _id: new ObjectId(userId) }, {
            $set: { selectedAvatar: url }
        });
        res.send("Avatar ingesteld!");
        return
    }

    if (type === "background" && user.ownedBackgrounds?.includes(url)) {
        await db.collection("users").updateOne({ _id: new ObjectId(userId) }, {
            $set: { selectedBackground: url }
        });
        res.send("Achtergrond ingesteld!");
        return
    }

    res.status(400).send("Je bezit dit item niet.");
});

export default router;