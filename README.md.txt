# MCO Phase 3
# Group 23 (ClipVortex)

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Dependencies](#dependencies)
- [App Instructions](#instructions)

## Installation
[Installation instructions]
To download the dependencies, run: 
$ npm install 

## Usage
To run this project, run it locally using npm:

$ npm run start

## Dependencies
  "dependencies": {
    "bcrypt": "^5.1.0",
    "body-parser": "^1.20.2",
    "cookie-parser": "^1.4.6",
    "dotenv": "^16.3.1",
    "ejs": "^3.1.9",
    "express": "^4.18.2",
    "express-ejs-layouts": "^2.5.1",
    "express-session": "^1.17.3",
    "gridfs-stream": "^1.1.1",
    "method-override": "^3.0.0",
    "mongodb": "^5.7.0",
    "mongoose": "^7.4.0",
    "multer": "^1.4.4",
    "multer-gridfs-storage": "^5.0.2",
    "passport": "^0.6.0",
    "passport-local": "^1.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }

## App Instructions
The website is a website where users can upload their gaming clips online.
It has multiple features including:
- Register
    A user cannot register a username that is already used
    There will also be a confirmation password to confirm the registration
- Login
    There are already users registered in the database. The following are their user informations:
    username: cheobo    pw: user1
    username: eggnog    pw: user2
    username: Ixei      pw: user3
    username: kobbongpw pw: user4
    username: Zerkaa    pw: user5
    username: user6     pw: user6 (Test User)
- Logout
- Make a post
    A user can upload a clip using the Post a Clip option on top after logging in. The 
    user will be given 4 fields to be filled up which are:
        - the .mp4 file
        - Title of the clip
        - Which game (Apex Legends, Counter-Strike:Global Offensive, League of Legends, Overwatch 2, or Valorant)
            - These are the only supported games for this version of the application. More can be added in future updates.
        - Description of the clip
- View Profile
    Users can also view their own profiles, and it shows how many likes they received and the number of clips posted.
    This section will also display the clips posted by the user.
- Update Profile
    The user can update the informations in their profile by going to My Profile and pressing Edit Profile beside their profile picture.
    Inside this the user will have options to change their profile picture (by uploading an image file), username, or bio.
- Categories
    The categories will have 5 different games for now which are Apex Legends, Counter-Strike:Global Offensive, League of Legends, Overwatch 2, or Valorant.
    When a game is clicked, the posts under that game will be shown.
- Liking posts
    Users will also have the ability to like posts from other users, as well as their own posts.

NOTE: The uploading of files will take some time since it takes time to upload the chunks for that file, especially for video files. Please wait for about 5 minutes until the successful message is displayed.
