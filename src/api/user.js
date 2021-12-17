const express = require('express');

const { getUserDetails } = require('../controllers/users');

const router = express.Router();

router.get('/', getUserDetails);

module.exports = router;
