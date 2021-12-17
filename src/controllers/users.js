const User = require('../models/User');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
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
      userId = req.user._id;
    }

    const user = await User.aggregate([
      { $match: { _id: id } },
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

    res.status(200).json({ message: 'User fetched successfully', user });
  } catch (err) {
    next(err);
  }
};
