const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");
const Review = require("./models/review.js");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const listingsRouter=require("./routes/listing.js");
const userRouter=require("./routes/user.js");

const { getMaxListeners } = require("events");

main()
    .then(()=>{
        console.log("connected to db");
    })
    .catch((err)=>{
        console.log(err);
    });

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const sessionOptions={
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized:true,
  cookie: {
    expires: Date.now() + 7*24*60*1000,
    maxAge: 7*24*60*1000,
    httpOnly:true,
  }
};

// app.get("/",(req,res)=>{
//   res.send("hi, iam root");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.success=req.flash("error");
  res.locals.currUser=req.user;
  next();
});


const validateReview=(req,res,next)=>{
  let {error}=reviewSchema.validate(req.body);
    if(error){
      let errMsg=err.details.map((el)=>el.message).join(",");
      throw new ExpressError(400,errMsg);
    }else {
      next();
    }
}

// app.get("/demouser",async(req,res)=>{
//   let fakeUser=new User({
//     email: "student@gmail.com",
//     username: "harsh"
//   });
//   let registeredUser=await User.register(fakeUser,"helloworld");
//   res.send(registeredUser);
// });

app.use("/listings",listingsRouter);
app.use("/",userRouter);



  //Reviews 
  //post route
  app.post("/listings/:id/reviews",validateReview,wrapAsync(async(err,req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
  }));


// app.get("/testListing",async(req,res)=>{
//     let sampleListing=new Listing({
//         title:"my new villa",
//         description:"by the beach",
//         price: 1200,
//         location:"calangutta,goa",
//         country:"india",
//     })
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// })

app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"page not found"));
})

app.use((err,req,res,next)=>{
  let {statusCode=500,message="something went wrong!"}=err;
  res.status(statusCode).render("error.ejs",{message});
  // res.status(statusCode).send(message);
});

app.listen(6060,()=>{
    console.log("server is listening to port 6060");
});