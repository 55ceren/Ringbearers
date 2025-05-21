import express from "express";
import { login, register, client } from "../database";
import { ObjectId } from "mongodb";
import { secureMiddleware } from "../secureMiddleware";

const router = express.Router();

router.get("/login", (req, res) => {
    if (req.session.user){
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

router.post("/login", async (req, res) => {
    if (req.session.user) {
        return res.redirect("/home");
    }

    const username = req.body.username;
    const password = req.body.password;

    try {
        const user = await login(username, password);
        req.session.user = user;
        res.redirect("/home");
    } catch (err: any) {
        res.render("login", { 
            error: err.message,
            registered: false,
            deleted: false
        });
    }
});

router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Fout bij uitloggen.");
        }
        res.redirect("/login");
    });
});

router.post("/delete-account", secureMiddleware, async (req, res) => {
    const userId = req.session.user!._id;

    try {
        const db = client.db("lotrgame");

        await db.collection("users").deleteOne({ _id: new ObjectId(userId) });

        req.session.destroy((err) => {
            if (err) {
                return res.status(500).send("Fout bij uitloggen na verwijderen.");
            }
            res.redirect("/login?deleted=true"); 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Fout bij verwijderen van account.");
    }
});

router.get("/register", (req, res) => {
    if (req.session.user) {
        return res.redirect("/home");
    }
    
    res.render("register", { 
        error: "" 
    });
});

router.post("/register", async (req, res) => {
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
        await register(username, password);
        res.redirect("/login?registered=true");
    } catch (err: any) {
        res.render("register", {
            error: err.message
        });
    }
});

router.post("/update-profile-photo", secureMiddleware, async (req, res) => {
    const userId = req.session.user!._id;
    const photo = req.body.photo;

    const db = client.db("lotrgame");
    await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { profilePhoto: photo } }
    );
    
    req.session.user!.profilePhoto = photo;

    res.sendStatus(200);
});

export default router;