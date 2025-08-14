const express = require('express');
const auth = require('../middlewares/auth.middleware');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Post = require('../models/post.models');
const User = require('../models/user.models');
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


// API For Getting All Posts.

router.get("/myposts", auth, async (req, res) => {
    const {page=1, limit=10} = req.query;
    page = parseInt(page);
    limit = parseInt(limit);


    const posts = await Post.find({user: req.user._id}).skip((page - 1) * limit).limit(limit).lean();

    const hasNextPage = posts.length === limit ? true : false;
    res.json({posts, page, limit, hasNextPage});

});

// API For Getting Post On Home Which Is Diplayed.

router.get("/following", auth, async (req, res) => {
    
    let {page = 1, lmit = 10, cursor} = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const user = await User.findById(req.user._id).select('following');

    let query = { user : { $in : user.following } };

    if(cursor){
        query.createdAt = { $lt : new Date(cursor)};
    };

    const posts = await Post.find(query).populate('user', '_id username profileName').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();

    const nextCursor = posts.length > 0 ? posts[posts.length - 1].createdAt : null;
    const hasNextPage = posts.length === limit ? true : false;

    
    res.json({ posts, nextCursor, hasNextPage });



});


module.exports = router;








module.exports = router;