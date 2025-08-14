const express = require('express');
const auth = require('../middlewares/auth.middleware');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Post = require('../models/post.models');
const multer = require('multer');
const path = require('path');
const postUpload = require('../config/multer.upload');
const router = express.Router();


// Create Post API Endpoint.
router.post("/", auth, postUpload.array("media", 10), async (req, res) => {
    
    if(req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Please upload at least one media file." });
    }

    const {caption, tags, location} = req.body;

    const media = req.files.map(file => {

        return {
            name : file.filename,
            mediaType : file.mimetype.startsWith('image/')? 'image' : 'video',

        }

    });
    
    const newPost = new Post({
        user: req.user.id,
        caption,
        tags,
        location,
        media
    });

    await newPost.save();

    return res.status(201).json({message: "Post created successfully", post : newPost});

});


module.exports = router;








module.exports = router;