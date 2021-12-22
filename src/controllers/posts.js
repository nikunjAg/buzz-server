const mongoose = require('mongoose');
const cloudinary = require('../utils/cloudinary');

const User = require('../models/User');
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
    req.user = await User.findOneAndUpdate(
      { _id: req.user._id },
      {
        $push: {
          posts: savedPost._id,
        },
      },
      { new: true }
    );

    return res.json({
      message: 'Post created successfully',
      post: {
        ...savedPost._doc,
        likes: savedPost._doc.likes.length,
        dislikes: savedPost._doc.dislikes.length,
        comments: savedPost._doc.comments.length,
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
          comments: { $size: '$comments' },
          createdAt: 1,
        },
      },
    ]);

    const post = await Post.populate(aggregatedPost, [
      { path: 'postedBy', select: 'name profileImage' },
    ]);

    res.json({
      message: 'Post fetched successfully',
      post,
    });
  } catch (error) {
    next(error);
  }
};

exports.likePost = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const { _id: userId } = req.user;

    const post = await Post.findById(postId);
    let likedAdded;

    if (post.dislikes.includes(userId)) {
      post.dislikes = post.dislikes.filter(
        (dislikedBy) => dislikedBy.toString() !== userId.toString()
      );
    }

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(
        (likedBy) => likedBy.toString() !== userId.toString()
      );
    } else {
      post.likes = [...post.likes, userId];
      likedAdded = true;
    }

    const updatedPost = await post.save();

    res.json({
      message: `Like ${likedAdded ? 'Added' : 'Removed'}`,
      likes: updatedPost.likes.length,
      dislikes: updatedPost.dislikes.length,
      updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

exports.dislikePost = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const { _id: userId } = req.user;

    const post = await Post.findById(postId);
    let dislikeAdded;

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(
        (likedBy) => likedBy.toString() !== userId.toString()
      );
    }

    if (post.dislikes.includes(userId)) {
      post.dislikes = post.dislikes.filter(
        (dislikedBy) => dislikedBy.toString() !== userId.toString()
      );
    } else {
      post.dislikes = [...post.dislikes, userId];
      dislikeAdded = true;
    }

    const updatedPost = await post.save();

    res.json({
      message: `Dislike ${dislikeAdded ? 'Added' : 'Removed'}`,
      likes: updatedPost.likes.length,
      dislikes: updatedPost.dislikes.length,
      updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

exports.commentPost = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { id: postId } = req.params;
    const { _id: userId } = req.user;

    const post = await Post.findById(postId);
    post.comments = [
      ...post.comments,
      {
        content,
        postedBy: userId,
      },
    ];

    const savedPost = await post.save();

    res.json({
      message: 'Commented successfully',
      comments: savedPost.comments.length,
      post: savedPost,
    });
  } catch (error) {
    next(error);
  }
};
