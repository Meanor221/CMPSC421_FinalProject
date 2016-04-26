
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var package = require('./package');

var app = express();

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));

app.use('/lectures', require('./lecture'));
app.use('/images', require('./image'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(function(error, req, res, next) {
  console.log(error.message, error.stack);
  res.status(500).json({
    success: false,
    message: (error && error.message) || error.toString(),
  });
});

var port = 8080;
app.listen(+port);
console.log(package.name, 'listening on', ':'+port);

