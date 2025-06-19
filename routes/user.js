const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRediredUlr } = require("../middleware.js");

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
})

router.post("/signup", wrapAsync(async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "User was registered!"); // You can combine the messages if you want
            res.redirect("/listings"); // Only one res.redirect
        });
    }
    catch (e) {
        req.flash("error", "User with the same name exists!");
        res.redirect("/listings");
    }
}));


router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login", saveRediredUlr, passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), async (req, res) => {
    req.flash("success", "You are logged in!");
    let redirectUrl = res.locals.redirectUrl || "/listings"
    res.redirect(redirectUrl);


});

router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    })
})

module.exports = router;