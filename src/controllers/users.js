const mongoose = require('mongoose');
const User = require('../models/User');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().lean();
    res.json({
      message: 'Users fetched',
      users,
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    let userId = id;
    const projectFields = {
      name: 1,
      email: 1,
      profileImage: 1,
      coverImage: 1,
      isModerator: 1,
      postsCount: { $size: '$posts' },
    };

    if (req.user._id === id || id === 'me') {
      // User is requesting his own information
      userId = req.user._id;
      projectFields.friends = 1;
      projectFields.pendingRequests = 1;
    } else {
      projectFields.friendsCount = { $size: '$friends' };
    }

    const user = await User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(userId) } },
      {
        $project: projectFields,
      },
    ]);

    res.status(200).json({
      message: 'User fetched successfully',
      user: user[0],
    });
  } catch (err) {
    next(err);
  }
};

exports.searchUsers = async (req, res, next) => {
  try {
    const { name } = req.query;
    console.log(name);
    const users = await User.find(
      {
        name: {
          $regex: new RegExp(name, 'i'),
        },
      },
      'name profileImage'
    )
      .limit(5)
      .lean();

    res.json({
      message: 'Users fetched successfully',
      users,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserFriends = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;

    const { friends } = await User.findById(
      userId,
      { friends: 1 },
      {
        populate: {
          path: 'friends',
          select: 'name profileImage',
        },
      }
    ).lean();

    res.json({
      message: 'User Friends fetched',
      friends,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserSuggestions = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;

    const suggestions = await User.find(
      { _id: { $ne: userId } },
      {
        name: 1,
        profileImage: 1,
      }
    ).lean();

    res.json({
      message: 'User Friends fetched',
      suggestions,
    });
  } catch (error) {
    next(error);
  }
};

exports.postFriendRequest = async (req, res, next) => {
  try {
    const { _id: senderId } = req.user;
    const { id: receiverId } = req.params;

    if (req.user.friends.includes(receiverId)) {
      return res.json({
        message: 'Already a friend',
      });
    }

    if (req.user.pendingRequests.includes(receiverId)) {
      return res.json({
        message: 'Already sent a friend request',
      });
    }

    req.user = await User.findByIdAndUpdate(
      senderId,
      {
        $push: {
          pendingRequests: receiverId,
        },
      },
      { new: true }
    );

    await User.findOneAndUpdate(
      { _id: receiverId },
      {
        $push: {
          notifications: {
            from: senderId,
            $position: 0,
          },
        },
      }
    );

    return res.json({
      message: 'Request sent successfully',
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};
