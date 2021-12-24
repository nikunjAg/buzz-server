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

    if (req.user._id === id || id === 'me') {
      // User is requesting his own information
      console.log('Hey');
      userId = req.user._id;
    }

    const user = await User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          name: 1,
          email: 1,
          profileImage: 1,
          coverImage: 1,
          isModerator: 1,
          postsCount: { $size: '$posts' },
        },
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

exports.getUserFriends = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;

    const friends = await User.findById(
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
