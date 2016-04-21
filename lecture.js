
var fs = require('fs');
var path = require('path');
var uuid = require('node-uuid');
var async = require('async');
var express = require('express');
var router = module.exports = express.Router();

var validation = require('./validation');
var dataPath = path.join(__dirname, 'lectures');

var itemViews = [];
(function initItems(next) {
  fs.readdir(dataPath, function(error, files) {
    if(error) return next(error);
    async.map(files, function(file, next) {
      fs.readFile(path.join(dataPath, file), function(error, text) {
        if(error) return next(error);
        data = JSON.parse(text);
        next(null, {
          id: data.id,
          name: data.name,
          updated: Date(data.updated)
        });
      });
    }, function(error, views) {
      if(error) return next(error);
      itemViews = views;
    });
  });
}).call(this, function(error) {
  throw error;
});

router.route('/')
  .get(function(req, res, next) {
    fs.readdir(dataPath, function(error, files) {
      if(error) return next(error);
      res.json({
        success: true,
        lectures: itemViews,
      });
    });
  })
  .post(function(req, res, next) {
    var lecture = req.body;
    var errors = validation(lecture);
    if(errors.length) return res
      .status(400)
      .json({
        success: false,
        errors: errors,
      });
    var key = uuid.v4();
    var filename = key;
    lecture.id = filename;
    lecture.updated = Date.now();
    var filepath = path.join(dataPath, filename);
    fs.writeFile(filepath, JSON.stringify(lecture), function(error) {
      if(error) return next(error);
      res.json({
        success: true,
        id: lecture.id,
      });
      itemViews.push({
        id: lecture.id,
        name: lecture.name,
        updated: lecture.updated,
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
    var lecture = req.body;
    var errors = validation(lecture);
    if(errors.length) return res
      .status(400)
      .json({
        success: false,
        errors: errors,
      });
    try {
      var text = JSON.stringify(lecture);
      fs.writeFileSync(path.join(dataPath, id), text);
      res.json({success: true});
      var itemView = itemViews.filter((x) => x.id === id).pop();
      Object.assign(itemView, {
        id: lecture.id,
        name: lecture.name,
        updated: lecture.updated,
      });
    } catch(error) {
      next(error);
    }
  });

