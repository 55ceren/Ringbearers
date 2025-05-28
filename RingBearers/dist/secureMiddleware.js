"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.secureMiddleware = secureMiddleware;
function secureMiddleware(req, res, next) {
    if (req.session.user) {
        res.locals.user = req.session.user;
        next();
    }
    else {
        res.redirect("/login");
    }
}
