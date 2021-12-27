const express = require('express');

const { getAllUsers, searchUsers } = require('../controllers/users');
const userApi = require('./user');

const router = express.Router();

router.get('/users', getAllUsers);
router.get('/users/search', searchUsers);
router.use('/users/:id', userApi);

module.exports = router;
