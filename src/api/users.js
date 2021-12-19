const express = require('express');

const { getAllUsers } = require('../controllers/users');
const userApi = require('./user');

const router = express.Router();

router.get('/users', getAllUsers);
router.use('/users/:id', userApi);

module.exports = router;
