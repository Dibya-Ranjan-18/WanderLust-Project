const Listing= require("../models/listing");
const Review=require("../models/review");

module.exports.createReviews=async (req, res) => {
    const { id } = req.params; 
    const listing = await Listing.findById(id);

    if (!listing) {
        return res.status(404).send("Listing not found");
    }

    const review = new Review(req.body.review);
    review.author=req.user._id;
    listing.reviews.push(review);

    await review.save();
    await listing.save();
    req.flash("success", "New Review Submited !");

    res.redirect(`/listings/${id}`);
};

module.exports.deleteReview=async (req, res) => {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId }
    });

    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted !");
    res.redirect(`/listings/${id}`);
};