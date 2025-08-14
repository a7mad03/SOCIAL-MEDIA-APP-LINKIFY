const express = require('express');
const fs = require('fs/promises');
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




// API For Deleting The Posts.
router.delete("/:postId", auth, async (req, res) => {

    const postId = req.params.postId;
    const userId = req.user._id;


    const post = await Post.findById(postId);
    if(!post) return res.status(404).json({ message: "Post not found." });

    if(post.user.toString()!== userId) return res.status(401).json({ message: "Unauthorized." });

    post.media.forEach(async (file) => {
        const filePath = path.join(__dirname, "../uploads/posts", file.name);
        try {
            await fs.unlink(filePath);
        } catch (error) {
            console.error(`Error deleting file ${filePath}`);
        }
    });

    await Post.deleteOne();
    res.json({ message: "Post deleted successfully." });

});

// API For Like And Unlike The Posts.

router.patch("/:postId/like", auth, async (req, res) => {
    postId = req.params.postId;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if(!post) return res.status(404).json({ message: "Post not found." });

    const alreadyLiked = post.likes.includes(userId);

    const updatedPost = await Post.findByIdAndUpdate(postId, alreadyLiked ? { $pull: { likes: userId } } : { $addToSet : { likes : userId } }, { new: true });

    res.json({message: alreadyLiked ? "Post Unliked" : "Post Liked", likes : updatedPost.likes.length });


});

// API For Implementing The Comment Feature.

router.post("/:postId/comment", auth, async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user._id;
    const text = req.body.text;

    if(!text) return res.status(400).json({ message: "Comment text is required." });

    const newComment = {
        user: userId,
        text: text
    };

    const post = await Post.findByIdAndUpdate(postId, { $push: { comments: newComment } }, { new: true });

    res.json({ message: "Comment added successfully", comment: post.comments[post.comments.length - 1]});

});

// API For Adding A Reply To A Comment.

router.post("/:postId/comment/:commentId/reply", auth, async (req, res) => {
    const {postId, commentId} = req.params;
    const userId = req.user._id;
    const text = req.body.text;

    if(!text) return res.status(400).json({ message: "Comment text is required." });

    const newReply = {
        user: userId,
        text: text
    };

    const post = await Post.findOneAndUpdate({_id : postId, "comments._id" : commentId}, { $push: { "comments.$.replies": newReply } }, { new: true });

    const comment = post.comments.id(commentId);

    res.json({ message: "Reply added successfully", reply : comment.replies[comment.replies.length - 1]});


});

// API For Deleting Speacific Comment From The Post.

router.delete("/:postId/comment/:commentId", auth, async (req, res) => {
    const {postId, commentId} = req.params;
    const userId = req.user._id;
    

    const post = await Post.findOneAndUpdate(
        {_id : postId, $or : [
            {user : userId}, {"comments._id": commentIdId, "comments.user": userId}
        ]}, 
        { $pull: { comments: {_id : commentId} } }, 
        { new: true }
    );

    if(!post) return res.status(404).json({ message: "Post or Comment not found." });

    res.status(200).json({ message: "Comment deleted successfully.", comments : post.comments });

});

module.exports = router;
