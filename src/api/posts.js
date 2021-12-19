const express = require('express');

const { getPosts } = require('../controllers/posts');
const postApi = require('./post');

const router = express.Router();

router.get('/posts', getPosts);
router.get('/posts/:id', postApi);

module.exports = router;
