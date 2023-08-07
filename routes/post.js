const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Post = require('../models/post');
const Categories= require('../models/category')
const mongoose = require('mongoose');


module.exports = function (gfs, upload) {
  
    router.get('/', async (req, res) => {
        const user = await User.findOne({ _id: req.session.userId });
        const categories = await Categories.find()
        const posts = await Post.find()
        if (user) {
            res.render('post/index', {headerLayout: 'profile_header', categories: categories, message:''})
        } else {
            res.render('index', {headerLayout: 'header', posts: posts})
        } 
    });
  

    router.get('/success', async (req, res) => {
        const user = await User.findOne({ _id: req.session.userId });
        const categories = await Categories.find()
        if (user) {
            res.render('post/index', {headerLayout: 'profile_header', categories: categories, message: 'File uploaded successfully!'})
        } else {
            res.render('index', {headerLayout: 'header'})
        } 
    });

    router.post('/upload', upload.single('file'), async (req, res) => {
      // Use 'gfs' object to handle file uploads with GridFS
      // 'upload.single('file')' middleware will handle the file upload and save it to GridFS
        const user = await User.findOne({ _id: req.session.userId });
        const categories = await Categories.find()
        if (user) {
            const post = new Post({
                user: user.name,
                userpicID: user.profilePicFileId,
                title: req.body.title,
                description: req.body.description,
                game_name: req.body.game_name,
                fileId: req.file.id
            });

            const increment = 1;
            try {
                // Use the $inc operator to increment the "score" field by the specified amount
                const result = await User.updateOne({ _id: req.session.userId },{ $inc: { num_clips: increment } }
                ) 
            } catch (error) {
                console.error('Error incrementing post count:', error);
                return res.redirect('/');
            }


            try {
                await post.save();
                res.redirect('success');
            } catch (error) {
                console.error('Error uploading file:', error);
                return res.redirect('/');
                
            }
        } else {
            res.render('index', {headerLayout: 'header'})
        } 
      
    });
  

    
    // Return the router
    return router;
  };

  
