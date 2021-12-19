const express = require('express');

const { getPost } = require('../controllers/posts');
const router = express.Router({ mergeParams: true });

// BASE ROUTE = /posts/:id

router.get('/', getPost);

module.exports = router;
