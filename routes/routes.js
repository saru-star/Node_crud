const express=require('express')
const router=express.Router();
const User=require('../models/users');
//multer used for image upload
const multer=require('multer');
const fs=require('fs')

//image upload
var storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads')
    },
    filename: function(req,file,cb){
        cb(null,file.fieldname+"_"+Date.now()+"_"+file.originalname)

    }
})

//this is a middleware
var upload=multer({
    storage:storage,
}).single("image")//bcoz we use single file each time for uploading.. we have name attribute in image file which is also called as image



//insert an user into db route
router.post('/addUser',upload,(req,res)=>{
    const user=new User({
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        email:req.body.email,
        phone:req.body.phone,
        image:req.file.filename,
    })
    user.save().then((resolve,reject)=>{
        if(reject){
            res.json({message:err.message,type:'danger'})
        }
        else{
            req.session.message={
                type:'success',
                message:'User added successfully'
            };
            res.redirect('/')
        }
    })
    
    
})

//get all users route
router.get('/', async (req,res)=>{
    const data=await User.find().exec()

    if(!data){
        res.json({message:err.message})
    }
    else{
        res.render('index',{
            title:'Home Page',
            users:data,
        })
    }
        
    
})

router.get('/addUser',(req,res)=>{
    res.render('add_user',{title:'Add Users'})
})

//edit an user 
router.get('/edit/:id',async (req,res)=>{
    const id=req.params.id
    const user=await User.findById(id)
            if(user==null){
                res.redirect('/')
            } else{
                res.render('edit_users',{
                    title:'Edit User',
                    user:user,
                })
            }
        
    
})

//update user route
router.post('/update/:id', upload,async (req,res)=>{
    const id=req.params.id
    var new_image=""
    if(req.file){
        new_image=req.file.filename
        try{
            fs.unlinkSync('./uploads/'+req.body.old_image)
        }
        catch(err){
            console.log(err);
        }
    } else{
        new_image=req.body.old_image
    }
    const result=await User.findByIdAndUpdate(id, {
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        email:req.body.email,
        phone:req.body.phone,
        image:new_image
    })
    
    if(!result){
        res.json({message:err.message, type:'danger'})
    } else{
        req.session.message={
            type:'success',
            message:'User Updated Successfully'
        }
        res.redirect('/')
    }
    
})

//delete a user
router.get('/delete/:id', async (req,res)=>{
    const id=req.params.id
    const result= await User.findByIdAndDelete(id)
    if(result.image!=''){
        try{
            fs.unlinkSync('./uploads/'+result.image)
        } catch(err){
            console.log(err)
        }
        
    }
    if(!result){
        res.json({
            message:err.message
        })
    }else {
        req.session.message={
            type:'info',
            message:'user deleted successfully'
        }
        res.redirect('/')
    }
})

module.exports=router;