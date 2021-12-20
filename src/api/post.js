const express = require('express');

const {
  getPost,
  likePost,
  dislikePost,
  commentPost,
} = require('../controllers/posts');

const router = express.Router({ mergeParams: true });

// BASE ROUTE = /posts/:id

router.get('/', getPost);

router.post('/likes', likePost);
router.post('/dislikes', dislikePost);
router.post('/comments', commentPost);

module.exports = router;
