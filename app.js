const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/ExpressError");
const User = require("./models/user");

// ROUTES
const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");
const bookingRouter = require("./routes/booking"); 

// DATABASE CONNECTION 
const dbUrl = process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dbUrl);
}

main()
    .then(() => {
        console.log("Connected to MongoDB Atlas");
    })
    .catch((err) => {
        console.log("MongoDB Connection Error:", err);
    });

//  CONFIG 
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// SESSION 
const store = MongoStore.create({
    mongoUrl : dbUrl,
    touchAfter : 24 * 3600,
});

store.on("error", (err)=>{
    console.log("Error in mongo session store", err);
});

app.use(session({
    store: store,
    secret: process.env.SECRET || "mysupersecretcode",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    }
}));

app.use(flash());

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({ usernameField: "email" }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//  LOCALS 
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    
    res.locals.cartCount = req.session.cart ? req.session.cart.length : 0; 
    next();
});

// ROUTES 

app.get("/", (req, res) => {
    res.redirect("/listings");
});

// Clears the cart after the user "pays"
app.get("/success", (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in!");
        return res.redirect("/login");
    }
    req.session.cart = []; 
    req.flash("success", "Booking Successful! Your trip is confirmed.");
    res.redirect("/listings");
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/", bookingRouter); 

//  ERRORS 
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message }); 
});

// SERVER 
const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});