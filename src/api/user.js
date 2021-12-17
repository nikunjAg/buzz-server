const express = require('express');

const { getUserDetails } = require('../controllers/users');

const router = express.Router({ mergeParams: true });

router.get('/', getUserDetails);

module.exports = router;
