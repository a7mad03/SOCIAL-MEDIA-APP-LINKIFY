const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/user.models');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

router.post("/", async (req, res) => {

    // Assuming User is a Mongoose model.
    const { username, email, password } = req.body;

    if(!username ||!email ||!password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    // Logic For, User Avaliable In DataBase Or Not.
    const user = await User.findOne({
        $or: [
            { username },
            { email }
        ]
    })

    if(user) {
        return res.status(400).json({ message: "Username or Email already exists." });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const newUser = new User({
        username,
        email,
        password : hashedPass
    })

    await newUser.save();
    const token = generateToken({
        _id : newUser._id,
        username : newUser.username
    });

    res.status(201).json(token);
    console.log("User Created Successfully");
});

router.post("/login", async (req, res) => {

    const { username, password } = req.body;
    
    if(!username || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const user = await User.findOne({ username });
    if(!user){
        return res.status(404).json({ message: "User not found." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if(!validPassword){
        return res.status(401).json({ message: "Invalid Password." });
    }
    const token = generateToken({
        _id : user._id,
        username : user.username
    });

    res.json(token);
    console.log("User Logged In Successfully");

});

router.get("/", auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if(!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
});


// API For Resetting Password
router.post("/request-password-reset", async (req, res) => {
    
    const { email } = req.body;
    if(!email) return res.status(400).json({ message: "Email is required." });

    let user = await User.findOne({ email : email });
    if(!user) return res.status(404).json({ message: "User not found." });

    const resetToken = jwt.sign({ _id : user._id }, process.env.JWT_KEY, { expiresIn : "1h" });

    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000;
    await user.save();
    
    // Send Email with Reset Token .
    
    res.json({ message : "Password reset token sent to your email.", resetToken : resetToken });

});

// This API For Resetting Password And Save New Password.
router.post("/reset-password", async (req, res) => {
    
    const {resetToken, newPassword} = req.body;

    // Step-1 : Verify the token.

    const decodedUser = jwt.verify(resetToken, process.env.JWT_KEY);
    let user = await User.findById(decodedUser._id);
    
    if(!user || user.resetToken !== resetToken || user.resetTokenExpires <= Date.now()) return res.status(404).json({ message: "Invalid Or Expired Token !!!!" });

    // Step-2 : If token is valid, then update the password.

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();
    res.json({ message : "Password reset successfully." });


});

const generateToken = (data) => {
    return jwt.sign(data, process.env.JWT_SECRET);
}



module.exports = router;