const express = require("express");
const router = express.Router();
const Post = require('../models/post');
const multer = require("multer");
const checkAuth = require('../middleware/check-auth');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};
// Extract incoming files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
});

router.post('', checkAuth,
 multer({storage: storage}).single("image"), (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userId
  });

  post.save().then((createdPost) => {
     res.status(201).json({
      message: 'Post added successfully.',
      post: {
        ...createdPost,
        id: createdPost._id
      }
     });
  // }, (error) => {
  //   console.log("error after save: ", error);
  })
  .catch(error => {
    res.status(500).json({
      message: "Creating a post failed!"
    })
  });
});

router.put('/:id', checkAuth,
// extract image before running function
multer({storage: storage}).single("image"),
(req, res, next) => {
  // default value for image path
  let imagePath = req.body.imagePath;
  if (req.file) {
  // If there's a req.file, it means a new file was uploaded
  const url = req.protocol + '://' + req.get('host');
  imagePath = url + '/images/' + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  });
  Post.updateOne({_id: req.params.id, creator: req.userData.userId }, post).then( result => {
    // if the post was modified
    if (result.nModified > 0) { //how many entries were modified
      res.status(200).json({ message: 'Update successful!'});
    } else {
      res.status(401).json({ message: 'Not Authorized!'});
    }
  })
  .catch(error => {
    res.status(500).json({
      message: "Couldn't update post!"
    })
  });
});

router.get('', (req, res, next) => {
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  const postQuery = Post.find(); //finds ALL results
  let fetchedPosts; //to hold 'documents' info
  //pagination
  if (pageSize && currentPage) {
    postQuery
    .skip(pageSize * (currentPage - 1 ))
    .limit(pageSize);
  }
    postQuery
    .then(documents => {
   fetchedPosts = documents;
    return Post.count(); //counts the results
    })
    .then(count => {
      res.status(200).json({
        message: 'Posts fetched successfully!',
        posts: fetchedPosts,
        maxPosts: count //no of posts we have in DB in total.
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Fetching posts failed!"
      })
    });
});

router.get('/:id', (req, res, next) => {
  Post.findById(req.params.id).then( post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({
        message: 'Post not found!'});
    }
  })
  .catch(error => {
    res.status(500).json({
      message: "Fetching post failed!"
    })
  });
});

router.delete('/:id', checkAuth , (req, res, next) => {
  Post.deleteOne({_id: req.params.id, creator: req.userData.userId }).then( result => {
    console.log(result);
    if (result.deletedCount > 0) { // or result.n > 0 but I prefer to use deletedCount
      res.status(200).json({ message: 'Deletion successful!'});
    } else {
      res.status(401).json({ message: 'Not Authorized!'});
    }
  })
  .catch(error => {
    res.status(500).json({
      message: "Deleting a post failed!"
    })
  });
});

module.exports = router;
