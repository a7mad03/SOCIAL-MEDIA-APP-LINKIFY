const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');

const UserSchema = new mongoose.Schema({
    
    username : {
        type : String,
        unique : true,
        required : true,
        trim : true,
        minlength : 3,
        maxlength : 40
    },

    email : {
        type : String,
        required : true,
        trim : true,
        unique : true,
    },

    password : {
        type : String,
        required : true,
    },

    profileName : {
        type : String,
    },

    bio : {
        type : String,
        maxlength : 200,
        default : '',
    },

    accountStatus : {
        type : String,
        enum : ['active', 'inactive', 'banned'],
        default : 'active',
    },

    isVerfied : {
        type : Boolean,
        default : false,
    },

    isPrivate : {  
        type : Boolean,
        default : false,
    },

    gender : {
        type : String,
        enum : ['male', 'female', 'other'],
    },

    phoneNumber : {
        type : String,
        trim : true,
    }
});


const User = mongoose.model('User', UserSchema);
module.exports = User;