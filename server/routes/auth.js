const router = require('express').Router();
const User = require('../../database/Schema/Users.js');
const bcrypt = require('bcryptjs')
const Joi = require('joi');


//Validation for user registration

const schema = Joi.object({
    userName :Joi.string().min(6).required(),
    email: Joi.string().min(6).required().email(),
    password : Joi.string().min(6).required(),
    phoneNumber : Joi.number().required(),
    specialNeed : Joi.boolean().required(),
    imgUrl : Joi.string().min(6).required()
})

router.post('/add',async(req,res,next)=>{
     //check if user already exist
    const emailExist = await User.findOne({email: req.body.email});
    if(emailExist) return res.status(400).send('Email already exists')

try{
     //hash password
    const salt = await bcrypt.genSalt(10)  
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

      const newUser = new User ({
       userName: req.body.userName,
       email:req.body.email,
       password:hashedPassword,
       phoneNumber:req.body.phoneNumber,
       specialNeed :req.body.specialNeed,
       imgUrl :req.body.imgUrl 
    });
    
        const {error} = await schema.validateAsync(req.body)
        const savedUser = await newUser.save()
        res.send(savedUser)
    }catch(error){
        if(error.isJoi === true) res.status(400).send(error.details[0].message)
        next(error)
    }
  });

  //Validation for user login

  
const loginschema = Joi.object({
    email: Joi.string().min(6).required().email(),
    password : Joi.string().min(6).required(),
})

router.post('/login',async(req,res,next)=>{
     //check if user already exist
    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send('Email or password is wrong')

     //check password 
     const validPass = await bcrypt.compare(req.body.password, user.password)
     if(!validPass) return res.status(400).send('password not valid')

try{
        const {error} = await loginschema.validateAsync(req.body)
        res.send("Logged in")
    }catch(error){
        if(error.isJoi === true) res.status(400).send(error.details[0].message)
        next(error)
    }
  });







module.exports = router;