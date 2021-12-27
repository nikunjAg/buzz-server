const express = require('express');

const {
  getNotifications,
  acceptNotification,
  declineNotification,
} = require('../controllers/notifications');

const router = express.Router();

router.get('/notifications', getNotifications);

router.post('/notifications/:id/accept', acceptNotification);

router.post('/notifications/:id/decline', declineNotification);

module.exports = router;
