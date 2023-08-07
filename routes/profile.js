const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Post = require('../models/post');
const { GridFSBucket, ObjectId } = require('mongodb');
const { MongoClient } = require('mongodb');
const mongodb = require('mongodb')


module.exports = function (gfs, profilepfp_upload) {
    router.get('/', async (req, res) => {
        const user = await User.findOne({ _id: req.session.userId });
        const posts = await Post.find()
    
        if (user) {
            const posts = await Post.find({user: user.name})
            res.render('profile/profile_template', {user: user, 
                                                 headerLayout: 'profile_header', posts: posts});
        } else {
            res.render('index', {headerLayout: 'header', posts: posts, user: new User()} )
        } 
    });


    router.get('/edit', async (req, res) => {
        res.render('profile/edit/index', {headerLayout: 'profile_header', message: ''})
    });
    
    router.post('/edit', profilepfp_upload.single('file_pfp'), async (req, res) => {
        const user = await User.findOne({ _id: req.session.userId });
        const posts = await Post.find()
        if (user) {
            req.session.userId = user._id;
            if (req.file) {
                const user_filter = {_id: req.session.userId};
                const user_update = {$set: { profilePicFileId: req.file.id} };
    
                const posts_filter = {user: user.name};
                const posts_update = {$set: { userpicID: req.file.id}};

                try {
                    const user_result = await User.updateOne(user_filter, user_update);
                    const posts_result = await Post.updateMany(posts_filter, posts_update);
                    console.log('Document updated successfully');
                    // Do other operations if needed
                  } catch (err) {
                    console.error('Error updating:', err);
                  }
            }

            if (req.body.username) {
                const user_filter = {_id: req.session.userId};
                const user_update = {$set: { name: req.body.username} };
    
                const posts_filter = {user: user.name};
                const posts_update = {$set: {user: req.body.username}};

                try {
                    const user_result = await User.updateOne(user_filter, user_update);
                    const posts_result = await Post.updateMany(posts_filter, posts_update);
                    console.log('Document updated successfully');
                    // Do other operations if needed
                  } catch (err) {
                    console.error('Error updating:', err);
                  }
            }

            if (req.body.bio) {
                const user_filter = {_id: req.session.userId};
                const user_update = {$set: {bio: req.body.bio } };

                try {
                    const user_result = await User.updateOne(user_filter, user_update);
                    console.log('Document updated successfully');
                    // Do other operations if needed
                  } catch (err) {
                    console.error('Error updating:', err);
                  }
            }
              return res.redirect('/profile/edit/success');
        } else {
            res.render('index', {headerLayout: 'header', posts: posts})
        } 


    });
    
    router.get('/edit/success', async (req, res) => {
        const user = await User.findOne({ _id: req.session.userId });
        const posts = await Post.find();


        if (user) {
            const posts = await Post.find({user: user.name})
            res.render('profile/profile_template', {user: user, 
                                                 headerLayout: 'profile_header', posts: posts});
        } else {
            res.render('index', {headerLayout: 'header', posts: posts} )
        } 
    });

    router.get('/pic/:filename', async (req, res) => {
        const filename = req.params.filename;
      
        try {
          const client = await MongoClient.connect('mongodb://localhost:27017', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
          const db = client.db('ClipVortex'); 
      
          // Assuming 'uploads.file' is the name of the GridFS bucket
          const bucket = new mongodb.GridFSBucket(db, { bucketName: 'pfp_uploads' });
      
          // Find the video file by its ObjectId
          const file = await bucket.s._filesCollection.findOne({_id: new ObjectId(filename)});
          
          if (file.length === 0) {
            return res.status(404).send('Image not found.');
          }
          
    
          if (file.contentType.startsWith('image/')) {
            const readStream = bucket.openDownloadStream(new ObjectId(filename));
            readStream.pipe(res)
          } else {
            res.status(404).json({
                error: 'Not an image'
            }) 
          }
          
      
          
        } catch (err) {
          console.error('Error retrieving video:', err);
          res.status(500).send('Internal Server Error');
        }
    });

    
    return router;
}
