const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");


// Add to Cart (Session Based)

router.post("/listings/:id/cart", (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in to book!");
        return res.redirect("/login");
    }
    const { id } = req.params;
    const { booking } = req.body;


    if (!req.session.cart) req.session.cart = [];
    
 
    req.session.cart.push({
        listingId: id,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut
    });

    req.flash("success", "Added to your cart!");
    res.redirect("/cart");
});


// View Cart

router.get("/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "Please login to view your cart");
        return res.redirect("/login");
    }

    if (!req.session.cart || req.session.cart.length === 0) {
        return res.render("listings/cart.ejs", { cartItems: [] });
    }

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