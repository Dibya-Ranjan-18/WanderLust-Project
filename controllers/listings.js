const Listing = require("../models/listing");

// INDEX 
module.exports.index = async (req, res) => {
    const { category } = req.query;
    let allListings;

    if (category && category !== "") {
        allListings = await Listing.find({ category });
    } else {
        allListings = await Listing.find({});
    }

    res.render("listings/index.ejs", { allListings, selectedCategory: category || "" });
};

// NEW FORM 
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// SHOW
module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};

//  CREATE 
module.exports.createListing = async (req, res) => {
    const { listing: listingData } = req.body;

   
    listingData.image = req.file
        ? { url: req.file.path, filename: req.file.filename }
        : { url: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353", filename: "listingimage" };

    listingData.owner = req.user._id;

    
    const validCategories = ["Trending", "Rooms", "Iconic Cities", "Luxury", "Budget"];
    if (!listingData.category || !validCategories.includes(listingData.category)) {
        listingData.category = "Trending"; 
    }

    const newListing = new Listing(listingData);
    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

//  EDIT FORM 
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }

    const originalImageUrl = listing.image?.url?.replace("/upload", "/upload/w_250") || "";

    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

//  UPDATE
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const { listing: listingData } = req.body;

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }

    
    listing.title = listingData.title || listing.title;
    listing.description = listingData.description || listing.description;
    listing.price = listingData.price || listing.price;
    listing.country = listingData.country || listing.country;
    listing.location = listingData.location || listing.location;

    
    const validCategories = ["Trending", "Rooms", "Iconic Cities", "Luxury", "Budget"];
    if (listingData.category && validCategories.includes(listingData.category)) {
        listing.category = listingData.category;
    } else if (!listing.category) {
        listing.category = "Trending"; 
    }

    
    if (req.file) {
        listing.image = { url: req.file.path, filename: req.file.filename };
    }

    await listing.save(); 

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

// DELETE
module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};
