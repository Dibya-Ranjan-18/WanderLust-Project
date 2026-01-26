const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


const categories = ["Trending", "Rooms", "Iconic Cities", "Luxury", "Budget"];

// ================= SEARCH ROUTE =================
router.get("/search", wrapAsync(async (req, res) => {
    const { q } = req.query;

    if (!q || q.trim() === "") {
        return res.redirect("/listings");
    }

    const listings = await Listing.find({
        $or: [
            { title: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } }
        ]
    });

    res.render("listings/index", { 
        allListings: listings,
        categories,           
        selectedCategory: ""  
    });
}));

// ================= INDEX & CREATE =================
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single("image"), wrapAsync(listingController.createListing));

// ================= NEW =================
router.get("/new", isLoggedIn, listingController.renderNewForm);

// ================= SHOW / UPDATE / DELETE =================
router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner, upload.single("image"), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// ================= EDIT =================
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;
