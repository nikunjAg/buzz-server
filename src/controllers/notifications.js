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
      ({ notifications } = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'notifications.$[el].unread': false,
          },
        },
        {
          arrayFilters: [{ 'el.unread': true }],
          populate: {
            path: 'notifications.from',
          },
        }
      ));
    }

    res.status(200).json({
      message: 'Notifications fetched',
      notifications,
    });
  } catch (err) {
    next(err);
  }
};

exports.acceptNotification = async (req, res, next) => {
  try {
    const { id: notificationId } = req.params;
    const { _id: userId } = req.user;
    const notificationIndex = req.user.notifications.findIndex(
      (notification) => notification._id.toString() === notificationId
    );

    if (notificationIndex === -1) {
      return res.json({
        message: 'No such notification exists',
      });
    }

    const { from: senderId } = req.user.notifications[notificationIndex];

    // pull the notification by id
    // add the friend to user
    const updatedUser = await User.findOneAndUpdate(
      userId,
      {
        $pull: {
          notifications: { _id: notificationId },
          pendingRequests: senderId,
        },
        $push: {
          friends: senderId,
        },
      },
      {
        new: true,
      }
    ).lean();

    // add the friend to sender
    // remove the pending requests from sender
    console.log(senderId);
    await User.findByIdAndUpdate(senderId, {
      $pull: {
        pendingRequests: userId,
      },
      $push: {
        friends: userId,
      },
    });

    return res.json({
      message: 'Friend Added',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

exports.declineNotification = async (req, res, next) => {
  try {
    const { id: notificationId } = req.params;
    const { _id: userId } = req.user;
    const notificationIndex = req.user.notifications.findIndex(
      (notification) => notification._id.toString() === notificationId
    );

    if (notificationIndex === -1) {
      return res.json({
        message: 'No such notification exists',
      });
    }

    const { from: senderId } = req.user.notifications[notificationIndex];

    // pull the notification by id
    // add the friend to user
    const updatedUser = await User.findOneAndUpdate(
      userId,
      {
        $pull: {
          notifications: { _id: notificationId },
          pendingRequests: senderId,
        },
      },
      {
        new: true,
      }
    ).lean();

    // add the friend to sender
    // remove the pending requests from sender
    console.log(senderId);
    await User.findByIdAndUpdate(senderId, {
      $pull: {
        pendingRequests: userId,
      },
    });

    return res.json({
      message: 'Removed Notification',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
