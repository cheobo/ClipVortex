const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    userpicID : {
        type: mongoose.Types.ObjectId,
        required: false
    },
    title: {
        type: String,
        required: true
    },
    game_name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    num_comments: {
        type: Number,
        required: true,
        default: 0
    },
    num_likes: {
        type: Number,
        required: true,
        default: 0
    },
    fileId: {
        type: mongoose.Types.ObjectId,
    },
    likes: [{
        type: mongoose.Types.ObjectId,
        ref: 'User',
    }]
});

module.exports = mongoose.model('Post', postSchema);