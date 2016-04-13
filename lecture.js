
var fs = require('fs');
var path = require('path');
var express = require('express');
var router = module.exports = express.Router();

var dataPath = path.join(__dirname, 'lectures');

router.route('/')
  .get(function(req, res, next) {
  
  })
  .post(function(req, res, next) {
  
  });

router.route('/:lectureId')
  .get(function(req, res, next) {
    var id = req.params.lectureId;
    try {
      var text = fs.readFileSync(path.join(dataPath, id));
      var json = JSON.parse(text);
      res.json(json);
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

