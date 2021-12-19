const express = require('express');

const { getUserDetails } = require('../controllers/users');

const router = express.Router({ mergeParams: true });

// BASE ROUTE = /users/:id

router.get('/', getUserDetails);

module.exports = router;
