const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");

// ==========================================
// 1. Add to Cart (Session Based)
// ==========================================
router.post("/listings/:id/cart", (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in to book!");
        return res.redirect("/login");
    }
    const { id } = req.params;
    const { booking } = req.body;

    // Initialize cart if it doesn't exist
    if (!req.session.cart) req.session.cart = [];
    
    // Push booking details into the session
    req.session.cart.push({
        listingId: id,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut
    });

    req.flash("success", "Added to your cart!");
    res.redirect("/cart");
});

// ==========================================
// 2. View Cart
// ==========================================
router.get("/cart", async (req, res) => {
    // Ensure user is logged in to view their cart
    if (!req.isAuthenticated()) {
        req.flash("error", "Please login to view your cart");
        return res.redirect("/login");
    }

    // If cart is empty, render empty state
    if (!req.session.cart || req.session.cart.length === 0) {
        return res.render("listings/cart.ejs", { cartItems: [] });
    }

    // Populate full listing details for items stored in session
    let cartItems = [];
    for (let item of req.session.cart) {
        let listing = await Listing.findById(item.listingId);
        if (listing) {
            cartItems.push({ ...item, listing });
        }
    }
    res.render("listings/cart.ejs", { cartItems });
});

module.exports = router;