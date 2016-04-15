
var fs = require('fs');
var path = require('path');
var uuid = require('node-uuid');
var express = require('express');
var router = module.exports = express.Router();

var dataPath = path.join(__dirname, 'lectures');

router.route('/')
  .get(function(req, res, next) {
    fs.readdir(dataPath, function(error, files) {
      if(error) return next(error);
      res.json({
        success: true,
        lectures: files,
      });
    });
  })
  .post(function(req, res, next) {
    var lecture = req.body;
    var key = uuid.v4();
    var filename = key;
    var filepath = path.join(dataPath, filename);
    fs.writeFile(filepath, JSON.stringify(lecture), function(error) {
      if(error) return next(error);
      res.json({
        success: true,
        id: filename,
      });
    });
  });

router.route('/:lectureId')
  .get(function(req, res, next) {
    var id = req.params.lectureId;
    try {
      var text = fs.readFileSync(path.join(dataPath, id));
      var json = JSON.parse(text);
      res.json({
        success: true,
        lecture: json,
      });
    } catch(error) {
      next(error);
    }
  })
  .put(function(req, res, next) {
    var id = req.params.lectureId;
    try {
      var text = JSON.stringify(req.body);
      fs.writeFileSync(path.join(dataPath, id), text);
      res.json({success: true});
    } catch(error) {
      next(error);
    }
  });

