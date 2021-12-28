const express = require('express');

const {
  getPosts,
  createPost,
  getFlaggedPosts,
} = require('../controllers/posts');
const postApi = require('./post');

const router = express.Router();

router.get('/posts', getPosts);

router.post('/posts', createPost);

router.get('/posts/flagged', getFlaggedPosts);

router.use('/posts/:id', postApi);

module.exports = router;
