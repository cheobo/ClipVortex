const express = require('express');
const router = express.Router();
const Categories = require('../models/category');
const User = require('../models/user');
const Post = require('../models/post')
const fs = require('fs');
const path = require('path');

function getFileNamesFromFolder(folderPath) {
    const files = fs.readdirSync(folderPath);
    return files;
  }


const folderPath = path.join(__dirname, '../public/categoryimages'); // Replace 'images-folder' with your folder name

const fileNamesList = getFileNamesFromFolder(folderPath);

savePhotosToDatabase(fileNamesList);

function getContentType(fileName) {
    const ext = path.extname(fileName);
    switch (ext.toLowerCase()) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      // Add more cases for other supported image types if needed
      default:
        return 'application/octet-stream'; // Default content type for unknown types
    }
  }
  
  // Function to save the photos to the database
  async function savePhotosToDatabase(fileNamesList) {
    try {
      for (const fileName of fileNamesList) {
        const imageFilePath = path.join(__dirname, '../public/categoryimages', fileName); // Replace 'images-folder' with your folder name
  
        // Read the image file as a Buffer
        const imageData = fs.readFileSync(imageFilePath);
  
        const filename_stringArray = fileName.split("_");
        const getName = filename_stringArray[0];
        let setName = "";
        switch (getName) {
            case 'apexlegends':
                setName = 'Apex Legends'; break;
            case 'csgo':
                setName = 'Counter-Strike: Global Offensive'; break;
            case 'leagueoflegends':
                setName = 'League of Legends'; break;
            case 'overwatch2':
                setName = 'Overwatch 2'; break;
            case 'valorant':
                setName = 'Valorant'; break;
        }
        // Create a new Category document
        const categories = new Categories({
          name: setName,
          picture: {
            data: imageData,
            contentType: getContentType(fileName)
          }
        });

        let check = await Categories.findOne({name : setName});
        // Save the photo to the database
        if (!check) {
            await categories.save();
            console.log(`${fileName} saved successfully.`);
        }
        
        
      }
    } catch (err) {
      console.error('Error saving photos:', err);
    }
  }


// All Categories Route
router.get('/', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.session.userId });
        const categories = await Categories.find();
        if (user) {
            if (user.logInStatus){
                res.render('categories/index', { name: user.name,
                                    pageTitle: 'User Profile', 
                                    headerLayout: 'profile_header', categories: categories, user: user});
            } else {
                res.render('categories/index', { user: new User(), 
                                    headerLayout: 'header', categories: categories});
            }
        } else {
            res.render('categories/index', { user: new User(), 
                                headerLayout: 'header', categories: categories});
        }
        
        
    } catch (error) {
        console.error('Error finding User:', error);
    }
    
});


// New Category Route
router.get('/game/:gamename', async (req, res) => {
    const gamename = decodeURIComponent(req.params.gamename); 
    const posts = await Post.find({game_name: gamename});
    const user = await User.findOne({ _id: req.session.userId });
    const categories = await Categories.find();

    
    if (user) {
        if (user.logInStatus){
            res.render('categories/new', { name: user.name,
                                pageTitle: 'User Profile', 
                                headerLayout: 'profile_header', categories: categories, posts: posts, user: user});
        } else {
            res.render('categories/new', { user: new User(), 
                                headerLayout: 'header', categories: categories, posts: posts});
        }
    } else {
        res.render('categories/new', { user: new User(), 
                            headerLayout: 'header', categories: categories, posts: posts});
    }
});

// Register Route
router.post('/register', async (req, res) => {
    const user = new User({
        name: req.body.name,
        password: req.body.password,
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

const requireAuth = (req, res, next) => {
    if (req.session.userId) {
      // If the user is authenticated, proceed to the next middleware or route handler
      console.log("Authenticated");
      next();
    } else {
      // If the user is not authenticated, redirect to the login page or show an error message
      res.status(401).json({ message: 'Unauthorized' });
    }
  };


  // User Dashboard
router.get('/login/success', requireAuth, async (req, res) => {
    try {   
        const user = await User.findOne( {_id: req.session.userId} );
        if (user) {
            // Render the user_dashboard template and pass the user data as an object
            
            res.render('index',{
                name: user.name,
                pageTitle: 'User Profile',
                headerLayout: 'profile_header'
                // Add other user data properties if needed
              });
        } else {
            // Handle the case when the user is not found
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching User:', error);
        res.status(500).json({ message: 'Error fetching User' });
    }
});

// Login Route
router.post('/login', async(req, res) => {
    try{
        const user = await User.findOne({ name: req.body.login_name })
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
                                username: user.name});
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
                                        headerLayout: 'header'});
                }
              });
        }
        
    } catch (error) {
        console.error('Error logging out:', error);
    }
});


module.exports = router;