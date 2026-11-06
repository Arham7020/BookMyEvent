const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {sendOTPEmail} = require('../utils/email');


// token generation
const generateToken = (id,role) => {
    return jwt.sign({id,role},process.env.JWT_SECRET,{expiresIn: '7d'});
}


// REGISTER USER

exports.registerUser = async (req , res) => {
    const {name , email , password} = req.body;

    let userExists = await User.findOne({email});
    if (userExists){
        return res.status(400).json({error : 'User Already Exists!'}); 
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password,salt);

    try {
        const user = await User.create({name,email,password:hashPassword,role:'user',isVerified:false});

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`OTP for ${email}: ${otp}`);
        await OTP.create({email,otp,action:'account_verification'});
        await sendOTPEmail(email,otp,'account_verification');

        res.status(201).json({
            message:'user register successfuly , Please check your email for OTP to verify your account',
            email: user.email
        });

    } catch(error) {
        res.status(400).json({error: error.message});
    }
};


// Login User

exports.loginUser = async (req,res) => {
    const {email , password} = req.body;

    let user = await User.findOne({email});
    if(!user){
        return res.status(400).json({error:'invalid credentials , Please signup first'});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        return res.status(400).json({error:'invalid credentials'});
    }

    if(!user.isVerified && user.role == 'user' ){ 
        const otp = Math.floor(100000 + Math.random()* 900000).toString();
        await OTP.deleteMany({email,action:'account_verification'});
        await OTP.create({email,otp,action:'account_verification'});
        await sendOTPEmail(email,otp,'account_verification');

        return res.status(400).json({
            error: 'Account not Verified , A new OTP has been sent to your email'
        });
    }

    res.json({
        message : 'login successful',
        _id : user._id,
        name : user.name,
        email : user.email,
        role : user.role,
        token : generateToken(user._id,user.role)
    });
};


// verify otp

exports.verifyOtp = async(req,res) => {
    const {email,otp} = req.body;
    const otpRecord = await OTP.findOne({email,otp,action:'account_verification'});

    if(!otpRecord){
        return res.status(400).json({error:'Invalid OTP'});
    }

const user = await User.findOneAndUpdate({email},{isVerified:true},{returnDocument:'after'});
await OTP.deleteMany({email, action : 'account_verification'});

    res.json({
        message:'Account verified successfully , You can login in now!',
        _id: user._id,
        name : user.name,
        email : user.email,
        role : user.role,
        token : generateToken(user._id,user.role)   
    });
};