const express = require("express");

const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync");

const ExpressError = require("../utils/ExpressError");

const { reviewSchema } = require("../schema.js");

const Review = require("../models/review");

const Listing = require("../models/listing");



const validateReview = (req, res, next) => {

    const { error } = reviewSchema.validate(req.body);

    if (error) {

        const msg = error.details.map((el) => el.message).join(",");

        throw new ExpressError(msg, 400);

    } else {

        next();

    }

};



router.post(

    "/",

    validateReview,

    wrapAsync(async (req, res) => {

        let listing = await Listing.findById(req.params.id);

        let newReview = new Review(req.body.review);

        await newReview.save();
        req.flash("success", "new review created");



        if (!listing.reviews) {

            listing.reviews = [];

        }



        listing.reviews.push(newReview);

        await listing.save();

        res.redirect(`/listings/${req.params.id}`);

        //res.send("Creating a new review");

    })

);



//Delete Review

router.delete(

    "/:reviewId",

    wrapAsync(async (req, res) => {

        let { id, reviewId } = req.params;

        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

        await Review.findByIdAndDelete(reviewId);
        req.flash("success", " review deleted");

        res.redirect(`/listings/${id}`);

    })

);



module.exports = router;