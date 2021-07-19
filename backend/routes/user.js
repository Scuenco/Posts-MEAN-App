const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require('../models/user');

router.post('/signup', (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(createdUser => {
          res.status(201).json({
            message: 'User added successfully',
            result: createdUser
          });
        })
        .catch(err => {
          res.status(500).json({
            //error: err <--standard error message
            // display our own error messages.
            message: "Invalid authentication credentials!"
          });
        });
    });
});

router.post('/login', (req, res, next) => {
let foundUser;
// validate user via email
User.findOne({email: req.body.email})
  .then(user => {
    if (!user) {
      return res.status(401).json({
        message: 'Login failed!'
      });
    }
    // preserve the value of 'user' so we can use in the next '.then'
    foundUser = user;
    // compare password
    return bcrypt.compare(req.body.password, user.password);
  })
  // here we get back the result of that compare operation.
  .then(result => {
    if (!result) {
      return res.status(401).json({
        message: 'Login failed!'
      });
    }
    // here we know we have a valid password, create a new token.
    const token = jwt.sign(
      {email: foundUser.email, userId: foundUser._id},
      'secretsecret', {expiresIn: '1h'}
    );
    // return token here
    res.status(200).json({
      token: token,
      expiresIn: 3600,
      userId: foundUser._id
    });
  })
  .catch(err => {
    return res.status(401).json({
      message: 'Login failed: ' + err
    });
  })
})
module.exports = router;
