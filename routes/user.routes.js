const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/user.models');
const auth = require('../middleware/auth.middleware');

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

const generateToken = (data) => {
    return jwt.sign(data, process.env.JWT_SECRET);
}



module.exports = router;