
var path = require('path');
var express = require('express');
var router = module.exports = express.Router();

var multer = require('multer');
var uploadPath = path.join(__dirname, 'images');

// router.use(multer({}));

router.route('/')
  .post(function(req, res, next) {
  
  });

router.use(express.static(uploadPath));

