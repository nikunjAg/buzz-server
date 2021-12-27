const express = require('express');

const {
  getUserDetails,
  getUserFriends,
  getUserSuggestions,
  postFriendRequest,
} = require('../controllers/users');

const router = express.Router({ mergeParams: true });

// BASE ROUTE = /users/:id

router.get('/', getUserDetails);
router.get('/friends', getUserFriends);
router.post('/friendRequest', postFriendRequest);
router.get('/suggestions', getUserSuggestions);

module.exports = router;
