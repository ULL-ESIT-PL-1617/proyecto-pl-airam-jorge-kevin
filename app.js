var express = require('express');
var app = express();

var path = require('path');
var favicon = require('serve-favicon');

var sassMiddleware = require('node-sass-middleware');    

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.set('views', __dirname + '/views')
app.set('view engine', 'pug')

//SASS
app.use(
    sassMiddleware({
        src: __dirname + '/public/stylesheets', 
        dest: __dirname + '/public/stylesheets',
        prefix:  '/stylesheets',
        debug: true // obvious
    })
);

app.get('/', function (req, res) {
  res.render('index', { title : 'Home' }
  )
});

app.get('/test', function (request, response) {
   response.render('test', { title: 'test' });
});

app.listen(app.get('port'), function () {
    console.log("Node app is running at localhost:" + app.get('port'));
});
