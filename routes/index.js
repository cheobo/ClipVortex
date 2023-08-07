const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Post = require('../models/post');
const bcrypt = require('bcrypt');
const { GridFSBucket, ObjectId } = require('mongodb');
const { MongoClient } = require('mongodb');
const mongodb = require('mongodb')


// All Users Route
router.get('/', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.session.userId });
        const posts = await Post.find();
        if (user) {
            if (user.logInStatus){
                res.render('index', { name: user.name,
                                    pageTitle: 'User Profile', 
                                    headerLayout: 'profile_header', posts: posts, user: user});
            } else {
                res.render('index', { user: new User(), 
                                    headerLayout: 'header', posts: posts});
            }
        } else {
            res.render('index', { user: new User(), 
                                headerLayout: 'header', posts: posts});
        }
        
        
    } catch (error) {
        console.error('Error finding User:', error);
    }
    
});

// Register Route
router.post('/register', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
        name: req.body.name,
        password: hashedPassword,
        logInStatus: false
    });

    try {
        const count = await User.countDocuments({});
        if (count > 0) {
            const check = await User.findOne({ name: req.body.name });
            if (!check) {
                if (req.body.password === req.body.confirmation_password) {
                    await user.save();
                    res.json({ 
                    registerMessage: 'User Registered' });
                } else {
                    res.json({ 
                        registerMessage: 'Passwords do not match' });
                }
                
            } else {
                res.json({ registerMessage: 'Username Already Used' });
            }
        } else {
            if (req.body.password === req.body.confirmation_password) {
                await user.save();
                res.json({ 
                registerMessage: 'User Registered' });
            } else {
                res.json({ 
                    registerMessage: 'Passwords do not match' });
            }
        }
    } catch (error) {
        console.error('Error registering User:', error);
        res.status(500).json({ registerMessage: 'Error registering User' });
    }
});

const requireAuth = async (req, res, next) => {
    const posts = await Post.find();
    if (req.session.userId) {
      // If the user is authenticated, proceed to the next middleware or route handler
      console.log("Authenticated");
      next();
    } else {
      // If the user is not authenticated, redirect to the login page or show an error message
      res.status(401).render('index', { user: new User(), 
        headerLayout: 'header', posts: posts, message: 'Unauthorized' });
    }
  };


  // Login Success
router.get('/login/success', requireAuth, async (req, res) => {
    try {   
        const user = await User.findOne( {_id: req.session.userId} );
        const posts = await Post.find();
        if (user) {
            // Render the user_dashboard template and pass the user data as an object
            
            res.render('index',{
                name: user.name,
                pageTitle: 'User Profile',
                headerLayout: 'profile_header', 
                posts: posts,
                user: user
                // Add other user data properties if needed
              });
        } else {
            // Handle the case when the user is not found
            res.render('index', { user: new User(), 
                headerLayout: 'header', posts: posts});
            res.status(404).render('index', { user: new User(), 
                headerLayout: 'header', posts: posts, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching User:', error);
        res.status(500).render('index', { user: new User(), 
            headerLayout: 'header', posts: posts, message: 'Error fetching User' });
    }
});

// Login Route
router.post('/login', async(req, res) => {
    try{
        const user = await User.findOne({ name: req.body.login_name })
        const posts = await Post.find();
        if (!user) {
            return res.json({ loginMessage: 'No User found'});
        }

        const isPasswordValid = await bcrypt.compare(req.body.login_password, user.password);

        if (isPasswordValid) {
            req.session.userId = user._id;
            const filter = {_id: req.session.userId};
            const update = {$set: { logInStatus: true } };
            try {
                const result = await User.updateOne(filter, update);
                console.log('Document updated successfully');
                // Do other operations if needed
              } catch (err) {
                console.error('Error updating document:', err);
              }
            return res.json({ loginMessage: 'Login successful',
                                username: user.name, posts: posts});
        } else {
            return res.json({ loginMessage: 'Incorrect password' });
          }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ loginMessage: 'Error registering User' });
    }
});

// Logout Route
router.get('/logout', async(req, res) => {
    try{
        const user = await User.findOne({ _id: req.session.userId })
        const posts = await Post.find();
        
        if (user) {
            const filter = {_id: req.session.userId};
            const update = {$set: { logInStatus: false } };
            try {
                const result = await User.updateOne(filter, update);
                console.log('Document updated successfully');
                // Do other operations if needed
              } catch (err) {
                console.error('Error updating document:', err);
              }
              req.session.destroy((err) => {
                if (err) {
                  console.error('Error destroying session:', err);
                  res.status(500).json({ message: 'Error destroying session' });
                } else {
                    res.render('index', { user: new User(), 
                                        headerLayout: 'header', posts: posts});
                }
              });   
        } else {
            res.render('index', { user: new User(), 
                headerLayout: 'header', posts: posts});
        }
        
    } catch (error) {
        console.error('Error logging out:', error);
    }
});

  // Connection is established, create the GridFSBucket and File model here
  router.get('/video/:filename', async (req, res) => {
    const filename = req.params.filename;
  
    try {
      const client = await MongoClient.connect('mongodb://localhost:27017', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      const db = client.db('ClipVortex'); 
  
      // Assuming 'uploads.file' is the name of the GridFS bucket
      const bucket = new mongodb.GridFSBucket(db, { bucketName: 'uploads' });
  
      // Find the video file by its ObjectId
      const file = await bucket.s._filesCollection.findOne({_id: new ObjectId(filename)});
      
      if (file.length === 0) {
        return res.status(404).send('Video not found.');
      }
      

      if (file.contentType === 'video/mp4') {
        const readStream = bucket.openDownloadStream(new ObjectId(filename));
        readStream.pipe(res)
      } else {
        res.status(404).json({
            error: 'Not a video'
        }) 
      }
      
  
      
    } catch (err) {
      console.error('Error retrieving video:', err);
      res.status(500).send('Internal Server Error');
    }
  });

  router.post('/:postID/like', async (req, res) => {
    const user = await User.findOne({ _id: req.session.userId})
    if (user) {
        const postId = req.params.postID;
        try {
            // Assuming you have a 'Post' model for storing posts in MongoDB
            const post = await Post.findById(postId);
            likedUser = await User.findOne({ name: post.user})
            if (!post) {
            return res.status(404).json({ message: 'Post not found' });
            }

            const userHasLiked = post.likes ? post.likes.indexOf(req.session.userId) !== -1 : false;

            // Determine the action based on the current like status
            if (userHasLiked) {
              // User has liked the post, remove the like (dislike action)
              post.likes = post.likes.filter((likedUserId) => likedUserId.toString() !== req.session.userId);
              user.likes = user.likes.filter((likedPostId) => likedPostId.toString() !== postId)
              post.num_likes -= 1;
              likedUser.num_likes -= 1;
            } else {
              // User has not liked the post yet, add the like
              post.likes.push(req.session.userId);
              user.likes.push(postId);
              post.num_likes += 1;
              likedUser.num_likes += 1;
            }
            // Increment the likes count and save the updated post
            await post.save();
            await user.save();
            await likedUser.save();

            // Respond with the updated likes count
            res.json({ likesCount: post.num_likes, isLiked: userHasLiked});
        } catch (error) {
            console.error('Error updating likes count:', error);
            res.status(500).json({ message: 'Error updating likes count' });
        }
    }
  });

module.exports = router;