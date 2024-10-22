const express=require("express");
const router=express.Router();


//posts
//index
router.get("/",(req,res)=>{
    res.send("GET for posts");
});

//show users
router.get("/:id",(req,res)=>{
    res.send("GET for posts id");
});

///post users
router.post("/",(req,res)=>{
    res.send("POST for posts");
});

//delete users
router.delete("/:id",(req,res)=>{
    res.send("delete for posts id");
});

module.exports=router;