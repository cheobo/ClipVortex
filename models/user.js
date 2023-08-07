const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    logInStatus: {
        type: Boolean,
        required: true
    },
    profilePicFileId: {
        type: mongoose.Types.ObjectId,
    },
    bio: {
        type: String,
        required: false
    },
    num_clips: {
        type: Number,
        required: true,
        default: 0
    },
    num_likes: {
        type: Number,
        required: true,
        default: 0
    },
    likes: [{
        type: mongoose.Types.ObjectId,
        ref: 'Post',
    }]
});

module.exports = mongoose.model('User', userSchema);