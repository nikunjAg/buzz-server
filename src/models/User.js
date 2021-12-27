const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    googleId: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    pendingRequests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    notifications: [
      {
        from: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        unread: {
          type: Boolean,
          default: true,
        },
      },
    ],
    isModerator: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
