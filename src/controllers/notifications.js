const mongoose = require('mongoose');

const User = require('../models/User');

exports.getNotifications = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const { type } = req.query;

    let notifications = [];

    if (type === 'unread') {
      notifications = await User.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(userId),
            'notifications.unread': true,
          },
        },
        {
          $project: {
            notifications: {
              $filter: {
                input: '$notifications',
                as: 'unread_notifications',
                cond: {
                  $eq: ['$$unread_notifications.unread', true],
                },
              },
            },
          },
        },
      ]);

      notifications = await User.populate(notifications, {
        path: 'notifications.from',
        select: 'name profileImage',
      });
    } else {
      notifications = await User.findById({ _id: userId }, 'notifications');
    }

    res.status(200).json({
      message: 'Notifications fetched',
      notifications,
    });
  } catch (err) {
    next(err);
  }
};
