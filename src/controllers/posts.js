const mongoose = require('mongoose');

const Post = require('../models/Post');

exports.getPosts = async (req, res, next) => {
  try {
    const { type } = req.query;

    let posts;
    let aggregatedPosts;

    const matchStage = { $match: { isFlagged: true } };
    const matchFriendsAndMyPostsStage = {
      $match: {
        _id: {
          $in: [req.user._id, ...req.user.friends],
        },
      },
    };
    const projectStage = {
      $project: {
        content: 1,
        images: 1,
        postedBy: 1,
        isFlagged: 1,
        likes: { $size: '$likes' },
        isLiked: { $in: [req.user._id, '$likes'] },
        dislikes: { $size: '$dislikes' },
        isDisliked: { $in: [req.user._id, '$dislikes'] },
        comments: { $size: '$comments' },
      },
    };

    if (type === 'flagged') {
      if (!req.user.isModerator) {
        const error = new Error();
        error.statusCode = 403;
        error.message = 'You are not authroized to access this resource';

        throw error;
      }

      aggregatedPosts = await Post.aggregate([matchStage, projectStage]);
    } else {
      aggregatedPosts = await Post.aggregate([
        matchFriendsAndMyPostsStage,
        projectStage,
      ]);
    }

    posts = await Post.populate(aggregatedPosts, { path: 'postedBy' });

    return res.json({
      message: 'Posts fetched successfully',
      posts,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const { id: postId } = req.params;

    const [aggregatedPost] = await Post.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(postId) } },
      {
        $project: {
          content: 1,
          images: 1,
          postedBy: 1,
          isFlagged: 1,
          likes: { $size: '$likes' },
          isLiked: { $in: [req.user._id, '$likes'] },
          dislikes: { $size: '$dislikes' },
          isDisliked: { $in: [req.user._id, '$dislikes'] },
          comments: 1,
        },
      },
    ]);

    const post = await Post.populate(aggregatedPost, [
      { path: 'postedBy', select: 'name profileImage' },
      { path: 'comments.postedBy', select: 'name profileImage' },
    ]);

    res.json({
      message: 'Post fetched successfully',
      post,
    });
  } catch (error) {
    next(error);
  }
};
