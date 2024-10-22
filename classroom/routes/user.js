const express=require("express");
const router=express.Router();


router.get("/",(req,res)=>{
    res.send("GET for users");
});

//show users
router.get("/:id",(req,res)=>{
    res.send("GET for users id");
});

///post users
router.post("/",(req,res)=>{
    res.send("POST for users");
});

//delete users
router.delete("/:id",(req,res)=>{
    res.send("delete for users id");
});

module.exports=router;