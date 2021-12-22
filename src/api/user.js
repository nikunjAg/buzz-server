const express = require('express');

const {
  getUserDetails,
  getUserFriends,
  getUserSuggestions,
} = require('../controllers/users');

const router = express.Router({ mergeParams: true });

// BASE ROUTE = /users/:id

router.get('/', getUserDetails);
router.get('/friends', getUserFriends);
router.get('/suggestions', getUserSuggestions);

module.exports = router;
