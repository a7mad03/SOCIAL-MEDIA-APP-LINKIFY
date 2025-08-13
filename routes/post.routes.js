const express = require('express');
const auth = require('../middlewares/auth.middleware');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Post = require('../models/post.models');

const router = express.Router();

// Create Post API Endpoint.
router.post("/", auth, async (req, res) => {
    

});









module.exports = router;