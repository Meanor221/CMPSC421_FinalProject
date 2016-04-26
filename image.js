
var fs = require('fs');
var uuid = require('node-uuid');
var path = require('path');
var express = require('express');
var router = module.exports = express.Router();

var multer = require('multer')({
  dest: 'tmp/', 
  limits: {
    // fileSize: 1 * 1024 * 1024, // 1MB
  },
});
var uploadPath = path.join(__dirname, 'images');

router.route('/')
  .post(multer.single('image'), function(req, res, next) {
    var image = req.file;
    if(!image || image.mimetype.indexOf('image') === -1) {
      return next(new Error('Image not provided'));
    }
    var key = uuid.v4();
    var filename = key;
    var filepath = path.join(uploadPath, filename);
    fs.rename(image.path, filepath, function(error) {
      if(error) return next(error);
      res.json({
        success: true,
        id: key,
        path: '/images/'+key,
      });
    });
  });

router.use(express.static(uploadPath));

