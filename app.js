const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const User = require("./models/user");
const LocalStrategy = require("passport-local");
const userRouter = require("./routes/user.js")
const listingsRouter = require("./routes/listing");
const reviewsRouter = require("./routes/review");

main()
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log("Error connecting to MongoDB", err);
    });

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

const sessionOPtions = {
    secret: "thisshouldbeasecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
    },
};

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use(session(sessionOPtions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.get("/demouser", async (req, res) => {
    let fakeuser = new User({
        email: "abc@gmail.com",
        username: "abc",
    });
    let registeredUser = await User.register(fakeuser, "abc123");
    res.send(registeredUser);
});

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);


// app.get("/testListing", (req, res) => {
//     let sampleListing = new Listing({
//         title: "my new villa",
//         description: "by the beach",
//         price: 1200,
//         location: "Meerut",
//         country: "India"

//     });
//     sampleListing.save()
//         .then((res) => {
//             console.log(res);

//         })
//         .catch((err) => {
//             console.log(err);
//         });
//     res.send("working");

// });

// app.all("*", (req, res, next) => {
//   next(new ExpressError("Page Not Found", 404));
// });

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.render("error.ejs", { err });
    //res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});