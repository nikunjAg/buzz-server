const mongoose = require('mongoose');
const cloudinary = require('../utils/cloudinary');

const Post = require('../models/Post');

exports.getPosts = async (req, res, next) => {
  try {
    const { type } = req.query;

    let posts;
    let aggregatedPosts;

    const matchStage = { $match: { isFlagged: true } };
    const matchFriendsAndMyPostsStage = {
      $match: {
        postedBy: {
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
        createdAt: 1,
      },
    };
    const sortStage = {
      $sort: {
        createdAt: -1,
      },
    };

    if (type === 'flagged') {
      if (!req.user.isModerator) {
        const error = new Error();
        error.statusCode = 403;
        error.message = 'You are not authroized to access this resource';

        throw error;
      }

      aggregatedPosts = await Post.aggregate([
        matchStage,
        projectStage,
        sortStage,
      ]);
    } else {
      aggregatedPosts = await Post.aggregate([
        matchFriendsAndMyPostsStage,
        projectStage,
        sortStage,
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

exports.createPost = async (req, res, next) => {
  try {
    const { content, images } = req.body;

    const imageUploadPromises = [];
    if (Array.isArray(images) && images.length > 0) {
      for (let image of images) {
        imageUploadPromises.push(
          cloudinary.uploader.upload(image, {
            upload_preset: 'dev_setup',
          })
        );
      }
    }

    const responses = await Promise.all(imageUploadPromises);
    const public_ids = responses.map((response) => response.public_id);

    const post = new Post({
      content,
      images: public_ids,
      postedBy: req.user._id,
    });

    const savedPost = await post.save();

    return res.json({
      message: 'Post created successfully',
      post: {
        savedPost,
        postedBy: {
          _id: req.user._id,
          name: req.user.name,
          profileImage: req.user.profileImage,
        },
      },
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
          createdAt: 1,
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
