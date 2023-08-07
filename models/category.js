const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    picture: {
        data: { type: Buffer, required: true },
        contentType: { type: String, required: true}
    }
});

module.exports = mongoose.model('Categories', categorySchema);