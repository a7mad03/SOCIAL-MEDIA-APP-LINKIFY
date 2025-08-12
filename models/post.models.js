const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const { type } = require('os');

const postSchema = new mongoose.Schema({
    
    user : {
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'User',
        required : true
    },

    media : [{
        name : {
            type : String,
            required : true
        },
        mediaType : {
            type : String,
            enum : ['image', 'video'],
            required : true
        }
    }],

    caption : {
        type : String,
    },

    likes : [{
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'User'
    }],

    tags : [{
        type : String
    }],

    location : {
        type : String
    }

}, {timestamps : true});


const Post = mongoose.model('Post', UserSchema);
module.exports = Post;