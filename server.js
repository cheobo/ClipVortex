if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const crypto = require('crypto')
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));

app.use(session({
    secret: 'SECRET',
    resave: false,
    saveUninitialized: true,
}));



app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));


mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to Mongoose'));
  
const mongoDriver = mongoose.mongo;
let gfs = Grid(db, mongoDriver);

const storage = new GridFsStorage({
  url: process.env.DATABASE_URL,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads' // This is the name of the GridFS collection
        };
        resolve(fileInfo);
      });
    });
  }
});

const profilepfp_storage = new GridFsStorage({
  url: process.env.DATABASE_URL,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'pfp_uploads' // This is the name of the GridFS collection
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({ storage });
const profilepfp_upload = multer({ storage: profilepfp_storage});
const indexRouter = require('./routes/index');
const categoryRouter = require('./routes/categories');
const profileRouter = require('./routes/profile')(gfs, profilepfp_upload);
const postRouter = require('./routes/post')(gfs, upload);

app.use('/', indexRouter);
app.use('/categories', categoryRouter);
app.use('/profile', profileRouter);
app.use('/post', postRouter);






app.listen(process.env.PORT || 3000);
