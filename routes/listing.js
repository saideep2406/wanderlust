const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const Listing=require("../models/listing.js");


const {listingSchema}=require("../schema.js");
const {isLoggedIn}=require("../middleware.js");

const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
      if(error){
        let errMsg=err.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
      }else {
        next();
      }
  }

//index route
router.get("/",wrapAsync( async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  }));

  //new route
  router.get("/new",isLoggedIn,(req,res)=>{
    res.render("listings/new.ejs");
  });

  //show route
  router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
  }));

  //create route
  router.post("/",validateListing,wrapAsync (async(req,res,next)=>{
    const newListing = Listing(req.body.listing);
    await newListing.save();
    req.flash("success","New Listing created");
    res.redirect("/listings");
}));

//edit route
router.get("/:id/edit",isLoggedIn, wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

//update route
router.put("/:id",isLoggedIn,validateListing,wrapAsync(async(req,res)=>{
  let {id}=req.params;
  await Listing.findByIdAndUpdate(id,{...req.body.listing});
  res.redirect(`/listings/${id}`);
}));

//Delete route
router.delete("/:id",isLoggedIn,wrapAsync(async(req,res)=>{
  let {id}=req.params;
  let deletedListing=await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success","Listing Deleted");
  res.redirect("/listings");
}));

module.exports=router;