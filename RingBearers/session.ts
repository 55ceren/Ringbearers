import session from "express-session";
import connectMongoDBSession from "connect-mongodb-session";
import { MONGODB_URI } from "./database";
import { User } from "./types";
import dotenv from 'dotenv';

dotenv.config();

const MongoDBStore = connectMongoDBSession(session);

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: "sessions",
    databaseName: "lotrgame",
});

declare module "express-session" {
    interface SessionData {
        user?: User;
    }
}

export default session({
    secret: process.env.SESSION_SECRET ?? "my-super-secret-secret",
    store: store,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
});
