const express = require('express');

const {
  getPost,
  likePost,
  dislikePost,
  getComments,
  commentPost,
  flagPost,
  verifyPost,
  declinePost,
} = require('../controllers/posts');

const router = express.Router({ mergeParams: true });

// BASE ROUTE = /posts/:id

// Get a post
router.get('/', getPost);

// Like or Dislike a post
router.post('/likes', likePost);
router.post('/dislikes', dislikePost);

// Fetching or adding a comment for a post
router.get('/comments', getComments);
router.post('/comments', commentPost);

// Flagging Post and Moderator APIs
router.post('/flag', flagPost);
router.post('/verify', verifyPost);
router.post('/decline', declinePost);

module.exports = router;
