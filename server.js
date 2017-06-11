var express = require('express');
var handlebars = require('express-handlebars');
var fs = require('fs');
var prettyjson = require('json-beautify');
var app = express();

app.engine('.hbs', handlebars({ extname: '.hbs' }));
app.set('view engine', '.hbs');

function getRandomPatientIdInRange() {
  var min = 1;
  var max = 300000;
  return Math.floor(Math.random() * (max - min) + min);
}

app.get('/', function(req, res) {
  fs.readFile('db', function(err, data) {
    var lines = data.toString('utf-8').split('\n');
    var pid = getRandomPatientIdInRange();
    var str = lines[+pid];
    var obj = JSON.parse(str);
    res.render('index', { data: obj, raw: str });
  });
});

app.listen(3000);
