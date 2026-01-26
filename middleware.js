const Listing =require("./models/listing");
const Review =require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema,is} =require("./schema.js");

module.exports.isLoggedIn=(req, res, next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;         
        req.flash("error", "You must be logged in before make any chenges!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of this listings!");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

module.exports.validateListing = (req, res, next) => {
    if (req.file) {
        req.body.listing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }

    const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, msg);
    }
    next();
};



module.exports.validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.massage).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id,reviewId } = req.params;

    const review = await Review.findById(reviewId);
    // if (!listing) {
    //     req.flash("error", "Listing not found!");
    //     return res.redirect("/listings");
    // }

    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You did not created this review!");
        return res.redirect(`/listings/${id}`);
    }

    next();
};