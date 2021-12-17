const express = require('express');

const { getNotifications } = require('../controllers/notifications');

const router = express.Router();

router.get('/notifications', getNotifications);

module.exports = router;
