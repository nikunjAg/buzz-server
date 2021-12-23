const express = require('express');

const {
  getPost,
  likePost,
  dislikePost,
  getComments,
  commentPost,
  getFlaggedPosts,
  flagPost,
  verifyPost,
} = require('../controllers/posts');

const router = express.Router({ mergeParams: true });

// BASE ROUTE = /posts/:id

router.get('/', getPost);

router.post('/likes', likePost);

router.post('/dislikes', dislikePost);

router.get('/comments', getComments);
router.post('/comments', commentPost);

router.get('/flagged', getFlaggedPosts);
router.post('/flagged', flagPost);

router.post('/verify', verifyPost);

module.exports = router;
