const express = require('express');

const { getPosts, createPost } = require('../controllers/posts');
const postApi = require('./post');

const router = express.Router();

router.get('/posts', getPosts);

router.post('/posts', createPost);

router.get('/posts/:id', postApi);

module.exports = router;
